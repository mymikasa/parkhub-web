# Phase 2: 第一个业务切片 — 停车场管理

## 概述

落地停车场管理页完整交互闭环，同时补齐 PRD 要求的共享组件（StatCard、Modal、Pagination）。本阶段打通"页面 → 服务 → API 客户端 → MSW Mock"全链路，为后续 Phase 3-6 建立范式。

本方案中的 `/api/*` 路径是前端 contract facade，不要求与真实后端物理地址完全一致：

- MSW 必须严格实现这套 facade contract
- 若真实后端路径不同，优先通过 `apiClient` base URL、rewrite、proxy 或 BFF 转发适配
- 若真实后端返回字段略有差异，优先在 `src/lib/api/parking-lots.ts` 的 service / adapter 层映射
- 若真实后端需要多接口聚合或结构差异很大，再由 BFF 层统一整形

**设计稿参考**: `design-pages/parking-lot.html`

---

## Task 1: 停车场业务类型与契约

**目标**: 定义停车场领域全部 TypeScript 类型、facade contract 和 Zod schema。

**文件**:
- `src/types/index.ts` — 新增 ParkingLot、ParkingLotSummary、Lane、LaneDevice、DeviceOption 等业务类型
- `src/lib/api/contracts.ts` — 新增 createParkingLotSchema、updateParkingLotSchema、updateLanesSchema

**实现要点**:

在 `src/types/index.ts` 中新增：

```typescript
export type ParkingLotStatus = "operating" | "suspended";
export type ParkingLotType = "underground" | "ground" | "mechanical";
export type LaneType = "entry" | "exit";
export type DeviceOnlineStatus = "online" | "offline";

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  type: ParkingLotType;
  status: ParkingLotStatus;
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
  usageRate: number;
  entryCount: number;
  exitCount: number;
  laneCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingLotSummary {
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
  laneCount: number;
}

export interface Lane {
  id: string;
  parkingLotId: string;
  name: string;
  type: LaneType;
  device?: LaneDevice;
}

export interface LaneDevice {
  id: string;
  name: string;
  status: DeviceOnlineStatus;
  lastHeartbeat?: string;
}

export interface DeviceOption {
  id: string;
  name: string;
  status: DeviceOnlineStatus;
  laneType?: LaneType;
}

export interface LaneConfigResponse {
  lanes: Lane[];
  availableDevices: DeviceOption[];
}

export interface CreateParkingLotRequest {
  name: string;
  address: string;
  totalSpots: number;
  type?: ParkingLotType;
}

export interface UpdateParkingLotRequest {
  name?: string;
  address?: string;
  totalSpots?: number;
  type?: ParkingLotType;
  status?: ParkingLotStatus;
}

export interface UpdateLanesRequest {
  lanes: Array<{
    id?: string;
    name: string;
    type: LaneType;
    deviceId?: string;
  }>;
}
```

在 `src/lib/api/contracts.ts` 中新增 zod schema：

```typescript
export const createParkingLotSchema = z.object({
  name: z.string().min(1, "请输入车场名称"),
  address: z.string().min(1, "请输入车场地址"),
  totalSpots: z.coerce.number().int().positive("总车位数必须大于0"),
  type: z.enum(["underground", "ground", "mechanical"]).optional(),
});

export const updateParkingLotSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  totalSpots: z.coerce.number().int().positive().optional(),
  type: z.enum(["underground", "ground", "mechanical"]).optional(),
  status: z.enum(["operating", "suspended"]).optional(),
});
```

**验收**: 类型无编译错误，schema 可正确校验合法/非法输入。

---

## Task 2: 停车场 Mock 数据

**目标**: 为停车场模块准备丰富的 mock 数据集。

**文件**:
- `src/mocks/data/parking-lots.ts` — 新建

**实现要点**:

遵循 `src/mocks/data/users.ts` 的简洁风格。创建：

1. **`mockParkingLots`**: 4-6 个停车场对象数组，覆盖不同状态和占用率：
   - 万科翡翠滨江地下停车场 (operating, usageRate ~80%, amber)
   - 万科广场商业停车场 (operating, usageRate ~92%, red)
   - 万科城市花园停车场 (operating, usageRate ~55%, green)
   - 万科翡翠别墅区停车场 (suspended, usageRate 0%)
   - 可额外加 1-2 个以覆盖分页场景

2. **`getParkingLotSummary()`**: 从当前停车场数据动态汇总统计，避免创建/编辑后统计变旧

3. **`mockLanes`**: 按 parkingLotId 索引的 lane 数据，每个停车场 2-6 个 lane，部分设备离线

4. **`mockLaneDevices`**: 可绑定设备数据源，覆盖在线 / 离线设备，供出入口配置弹窗选择

5. **辅助函数**: `getParkingLotById(id)`, `getParkingLotSummary()`, `getLaneConfigByParkingLotId(lotId)`

**验收**: 数据结构完整，与 Task 1 类型一致。

---

## Task 3: 停车场 API 服务层

**目标**: 封装停车场全部 API 调用。

**文件**:
- `src/lib/api/parking-lots.ts` — 新建

**实现要点**:

遵循 `src/lib/api/auth.ts` 的服务对象模式，并在这里承载 facade contract 到真实后端 / BFF 的适配职责：

```typescript
import { apiClient } from "./client";
import type {
  ParkingLot,
  ParkingLotSummary,
  Lane,
  LaneConfigResponse,
  CreateParkingLotRequest,
  UpdateParkingLotRequest,
  UpdateLanesRequest,
  PaginatedResponse,
} from "@/types";

export const parkingLotService = {
  getSummary(): Promise<ParkingLotSummary> {
    return apiClient.get("/api/parking-lots/summary");
  },

  list(params?: { page?: number; pageSize?: number; keyword?: string }): Promise<PaginatedResponse<ParkingLot>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    if (params?.keyword) query.set("keyword", params.keyword);
    const qs = query.toString();
    return apiClient.get(`/api/parking-lots${qs ? `?${qs}` : ""}`);
  },

  create(data: CreateParkingLotRequest): Promise<ParkingLot> {
    return apiClient.post("/api/parking-lots", data);
  },

  update(id: string, data: UpdateParkingLotRequest): Promise<ParkingLot> {
    return apiClient.patch(`/api/parking-lots/${id}`, data);
  },

  getLaneConfig(parkingLotId: string): Promise<LaneConfigResponse> {
    return apiClient.get(`/api/parking-lots/${parkingLotId}/lanes`);
  },

  updateLanes(parkingLotId: string, data: UpdateLanesRequest): Promise<Lane[]> {
    return apiClient.put(`/api/parking-lots/${parkingLotId}/lanes`, data);
  },
};
```

**验收**: 接口签名与 PRD facade contract 对齐，列表返回分页结构，TypeScript 无编译错误。

---

## Task 4: 停车场 MSW Handlers

**目标**: 实现停车场全部 Mock API 处理器。

**文件**:
- `src/mocks/handlers/parking-lots.ts` — 新建

**实现要点**:

遵循 `src/mocks/handlers/auth.ts` 的风格（http + delay + HttpResponse.json）。实现的接口：

| Method | Path | 行为 |
|--------|------|------|
| GET | `/api/parking-lots/summary` | 返回聚合统计，按当前内存数据动态计算，300ms delay |
| GET | `/api/parking-lots` | 支持分页参数和 keyword 搜索过滤，返回分页结构，300ms delay |
| POST | `/api/parking-lots` | 创建停车场（生成新 ID + mock 数据），600ms delay |
| PATCH | `/api/parking-lots/:id` | 更新停车场信息，300ms delay |
| GET | `/api/parking-lots/:id/lanes` | 按 ID 返回 `{ lanes, availableDevices }`，200ms delay |
| PUT | `/api/parking-lots/:id/lanes` | 更新车道配置，600ms delay |

所有 handler 从 `src/mocks/data/parking-lots.ts` 读取数据。PUT lanes 支持新增和修改（根据有无 id 区分）。MSW 返回的结构必须遵循 facade contract，即使未来真实后端路径或返回字段不同，也由 service / adapter 或 BFF 吸收差异。

**验收**: 各 handler 可正确匹配路径、解析参数、返回格式化响应。

---

## Task 5: 注册停车场 Handlers 到 MSW Worker

**目标**: 将停车场 handlers 注入 MSW runtime。

**文件**:
- `src/mocks/browser.ts` — 修改，导入并注册 parkingLotHandlers
- `src/mocks/scenarios.ts` — 修改，re-export parkingLotHandlers

**实现要点**:

```typescript
// browser.ts
import { parkingLotHandlers } from "./handlers/parking-lots";
export const worker = setupWorker(...authHandlers, ...parkingLotHandlers);
```

```typescript
// scenarios.ts
export { authHandlers } from "./handlers/auth";
export { parkingLotHandlers } from "./handlers/parking-lots";
```

**验收**: `pnpm dev` 后在浏览器 DevTools Network 中可看到 `/api/parking-lots` 请求被 MSW 拦截。

---

## Task 6: StatCard 共享组件

**目标**: 实现可复用的统计卡片组件。

**文件**:
- `src/components/shared/stat-card.tsx` — 新建

**设计规范** (参考 `parking-lot.html` 第 148-195 行)：

```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass?: string;
  iconTextClass?: string;
  valueColorClass?: string;
  className?: string;
}
```

视觉还原要点：
- 白底圆角卡片 (`bg-white rounded-xl p-5 border border-surface-border`)
- 左侧 label + value，右侧图标容器 (`w-12 h-12 rounded-xl`)
- card-hover 效果 (`hover:translate-y-[-2px] hover:shadow-lg`)
- 数值用 `text-2xl font-bold`

**验收**: 组件可复用，传入不同 props 渲染不同统计卡片，与设计稿一致。

---

## Task 7: Modal 共享组件

**目标**: 实现可复用的模态框组件。

**文件**:
- `src/components/shared/modal.tsx` — 新建

**设计规范** (参考 `parking-lot.html` 第 449-497 行)：

```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
}
```

视觉还原要点：
- `fixed inset-0 z-50` 全屏覆盖
- `bg-black/40 backdrop-blur-sm` 遮罩层
- 居中白色面板 (`bg-white rounded-2xl shadow-2xl`)
- 顶部标题栏 + 关闭按钮
- 内容区域 `p-6`
- 底部 footer 栏 `border-t px-6 py-4`
- 打开时 `document.body.style.overflow = "hidden"`，关闭时恢复
- 按 ESC 关闭

**验收**: 开关流畅，ESC 关闭正常，内容/footer slot 正确渲染。

---

## Task 8: Pagination 共享组件

**目标**: 实现可复用的分页控件。

**文件**:
- `src/components/shared/pagination.tsx` — 新建

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}
```

实现要点：
- 上一页/下一页按钮（禁用态处理）
- 页码按钮（当前页高亮 brand 色）
- 超过 7 页时使用省略号折叠
- 每个按钮 `h-8 w-8 rounded-lg` 尺寸

**验收**: 翻页回调正确，边界态（第1页/最后页）禁用逻辑正确。

---

## Task 9: SearchInput 共享组件

**目标**: 实现带搜索图标的输入框组件。

**文件**:
- `src/components/shared/search-input.tsx` — 新建

```typescript
interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
```

设计规范 (参考 `parking-lot.html` 第 136-138 行)：
- `w-64 h-10 pl-10 pr-4 rounded-lg border border-gray-200`
- 左侧搜索图标
- `focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10`

**验收**: 搜索输入、清空、聚焦样式均正确。

---

## Task 10: ParkingLotCard 业务组件

**目标**: 实现单个停车场卡片组件。

**文件**:
- `src/components/parking-lot/parking-lot-card.tsx` — 新建

**设计规范** (参考 `parking-lot.html` 第 201-260 行)：

```typescript
interface ParkingLotCardProps {
  lot: ParkingLot;
  onEdit: (lot: ParkingLot) => void;
  onConfigureLanes: (lot: ParkingLot) => void;
}
```

视觉还原要点：
- 白底卡片 (`bg-white rounded-xl border overflow-hidden`)
- 顶部：渐变色图标 + 名称/地址 + StatusBadge（运营中/暂停运营）
- 中部：3 列 mini stat grid（总车位/剩余/出入口）
- 占用率进度条：绿色(<70%) / 黄色(70-90%) / 红色(>90%)，带 glow 效果
- 底部 footer：入口/出口数量 + "配置出入口" / "编辑" 操作链接
- card-hover 动画

占用率颜色映射逻辑：
```typescript
function getUsageColor(rate: number) {
  if (rate >= 90) return { bar: "bg-red-500", glow: "glow-danger", text: "text-red-600" };
  if (rate >= 70) return { bar: "bg-amber-500", glow: "glow-warning", text: "text-amber-600" };
  return { bar: "bg-emerald-500", glow: "glow-normal", text: "text-emerald-600" };
}
```

需要在 `globals.css` 中补充 glow 工具类：
```css
.glow-normal { box-shadow: 0 0 8px rgba(34, 197, 94, 0.3); }
.glow-warning { box-shadow: 0 0 8px rgba(245, 158, 11, 0.3); }
.glow-danger { box-shadow: 0 0 8px rgba(239, 68, 68, 0.3); }
```

**验收**: 卡片渲染与设计稿一致，占用率颜色随数据动态变化。

---

## Task 11: CreateParkingLotModal 业务组件

**目标**: 实现新建停车场弹窗。

**文件**:
- `src/components/parking-lot/create-parking-lot-modal.tsx` — 新建

**设计规范** (参考 `parking-lot.html` 第 449-490 行)：

使用 Modal + react-hook-form + zodResolver(createParkingLotSchema)：

表单字段：
- 车场名称（必填，text input）
- 车场地址（必填，text input）
- 总车位数（必填，number input）
- 车场类型（选填，select：地下停车场/地面停车场/立体车库）

Props：
```typescript
interface CreateParkingLotModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

交互流程：
1. 打开弹窗 → 重置表单
2. 填写 → 实时校验
3. 提交 → 调用 `parkingLotService.create()` → 成功后 `onSuccess()` + 关闭弹窗
4. 失败 → 显示错误信息
5. 提交中 → 按钮显示 loading spinner

**验收**: 创建成功后弹窗关闭，外层列表刷新。校验错误正确展示。

---

## Task 12: EditParkingLotModal 业务组件

**目标**: 实现编辑停车场弹窗。

**文件**:
- `src/components/parking-lot/edit-parking-lot-modal.tsx` — 新建

与 CreateParkingLotModal 类似，区别：
- 预填充现有停车场数据
- 可额外修改状态（运营中/暂停运营）
- 调用 `parkingLotService.update(id, data)`

```typescript
interface EditParkingLotModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parkingLot: ParkingLot | null;
}
```

**验收**: 编辑后数据更新，列表刷新。

---

## Task 13: LaneConfigModal 业务组件

**目标**: 实现出入口（车道）配置弹窗。

**文件**:
- `src/components/parking-lot/lane-config-modal.tsx` — 新建

**设计规范** (参考 `parking-lot.html` 第 492-597 行)：

```typescript
interface LaneConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parkingLot: ParkingLot | null;
}
```

弹窗内容：
- 标题："出入口配置" + 副标题：车场名称
- "添加出入口"按钮
- Lane 列表：每行显示图标(entry绿/exit蓝) + 名称 + 设备信息 + 在线状态
- 离线设备用红色边框 + 红色设备状态文字
- 编辑按钮（可修改 lane 名称和绑定设备）
- 保存调用 `parkingLotService.updateLanes(id, data)`

打开时加载 `parkingLotService.getLaneConfig(id)` 获取 `{ lanes, availableDevices }`。

**验收**: 可查看车道列表，添加/编辑/保存车道配置，离线状态正确展示。

---

## Task 14: 停车场管理页面组装

**目标**: 将所有停车场组件组装为完整页面。

**文件**:
- `src/app/(dashboard)/parking-lot/page.tsx` — 重写

**实现要点**:

页面结构：
```
<main>
  <header> ← PageHeader(title, description, actions=[SearchInput + 新建车场按钮])
  
  <section> ← 统计卡片 grid (4 列)
    StatCard x 4 (总车位数/剩余车位/在场车辆/出入口数)
  
  <section> ← 车场列表 grid (2 列)
    loading → LoadingSkeleton variant="card"
    error → ErrorState with retry
    empty → EmptyState with "新建车场" action
    data → ParkingLotCard x N
  
  <footer> ← Pagination (if totalPages > 1)
  
  <CreateParkingLotModal />
  <EditParkingLotModal />
  <LaneConfigModal />
</main>
```

数据获取模式：
- 使用 `useEffect` + `useState` 在组件挂载时并行加载 summary 和 list
- 统计接口使用 `parkingLotService.getSummary()`，列表接口使用 `parkingLotService.list()`
- 搜索防抖 300ms
- 创建/编辑/配置成功后刷新列表和统计数据
- 分页切换时重新请求列表

**验收**:
- 页面加载显示 skeleton → 数据返回后渲染卡片
- 搜索可过滤车场
- 新建车场弹窗工作正常，创建后列表刷新
- 编辑车场弹窗工作正常
- 配置出入口弹窗工作正常
- 分页切换正常
- 错误态和空态正确展示

---

## Task 15: 样式补齐

**目标**: 补充设计稿中的自定义 CSS 效果。

**文件**:
- `src/app/globals.css` — 追加样式

**实现要点**:

在 `@theme inline` 块之后补充：

```css
.card-hover {
  transition: all 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  transition: width 0.3s ease;
}

.glow-normal { box-shadow: 0 0 8px rgba(34, 197, 94, 0.3); }
.glow-warning { box-shadow: 0 0 8px rgba(245, 158, 11, 0.3); }
.glow-danger { box-shadow: 0 0 8px rgba(239, 68, 68, 0.3); }
```

**验收**: 卡片 hover 效果、进度条动画、glow 效果与设计稿一致。

---

## Task 16: 单元测试

**目标**: 覆盖 Phase 2 新增的核心模块。

**文件**:
- `src/tests/lib/api/parking-lots.test.ts` — parkingLotService 单元测试
- `src/tests/mocks/handlers/parking-lots.test.ts` — MSW handler 请求/响应测试
- `src/tests/components/shared/stat-card.test.tsx` — StatCard 渲染测试
- `src/tests/components/shared/modal.test.tsx` — Modal 开关/ESC 测试
- `src/tests/components/shared/pagination.test.tsx` — Pagination 翻页/边界测试

**测试重点**:
- parkingLotService: 验证各方法调用正确的 HTTP method 和 path
- parkingLotService: 验证 facade contract 的分页结构和 adapter 映射
- MSW handlers: 使用 msw 的 `setupServer` 验证各端点的响应格式和错误处理
- StatCard: 渲染 label/value/icon，自定义颜色
- Modal: open/close 状态切换，ESC 关闭，点击遮罩关闭
- Pagination: 翻页回调，首尾页禁用态

**验收**: `pnpm test` 全部通过，覆盖核心交互路径。

---

## 执行顺序依赖图

```
Task 1 (类型)
  ├── Task 2 (Mock 数据)
  │     └── Task 4 (MSW Handlers) → Task 5 (注册)
  └── Task 3 (API 服务)

Task 6 (StatCard) ─────────────────┐
Task 7 (Modal)   ──────────────────┤
Task 8 (Pagination) ───────────────┤
Task 9 (SearchInput) ──────────────┤
Task 10 (ParkingLotCard) ──────────┼→ Task 14 (页面组装)
Task 11 (CreateModal) ─────────────┤
Task 12 (EditModal) ───────────────┤
Task 13 (LaneConfigModal) ─────────┘

Task 15 (样式) — 可并行
Task 16 (测试) — 最后执行
```

建议按以下批次顺序执行：

1. **Batch A** (基础层): Task 1 → Task 2 → Task 3 + Task 4 并行 → Task 5
2. **Batch B** (共享组件): Task 6 + Task 7 + Task 8 + Task 9 并行
3. **Batch C** (业务组件): Task 10 + Task 11 + Task 12 + Task 13 并行（依赖 Batch A + B）
4. **Batch D** (页面组装): Task 14 + Task 15
5. **Batch E** (测试): Task 16

---

## Phase 2 验收标准

- [ ] `pnpm dev` 启动正常，登录后进入 `/parking-lot` 展示完整停车场管理页
- [ ] 统计卡片展示 4 项 KPI，数据来自 API
- [ ] 停车场卡片网格展示，占用率颜色随数据动态变化
- [ ] 搜索框可过滤车场名称
- [ ] 新建车场弹窗：表单校验 → 提交 → 列表刷新
- [ ] 编辑车场弹窗：预填充 → 修改 → 列表刷新
- [ ] 出入口配置弹窗：查看车道 → 添加/编辑 → 保存
- [ ] 加载态、空态、错误态均正确展示
- [ ] 分页控件工作正常（当车场数 > pageSize 时）
- [ ] `pnpm test` 全部通过
- [ ] `pnpm build` 无 TypeScript 错误
