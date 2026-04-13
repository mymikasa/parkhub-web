# Phase 3: 表格与复杂交互切片 — 详细实施计划

## 当前状态总结

Phase 1 & 2 已完成：认证闭环、Dashboard 布局、停车场管理完整 CRUD、9 个共享组件、API 客户端、MSW handlers。

**Phase 3 缺口：**
- `DataTable` 组件不存在（`@tanstack/react-table` 已安装但未使用）
- 出入记录页、设备管理页均为 placeholder
- 无出入记录/设备相关的 types、contracts、services、mock data、handlers、components

---

## 任务分解（6 个子任务，建议顺序执行）

### 任务 1：DataTable 通用组件

**文件：** `src/components/shared/data-table.tsx`

**目标：** 基于 `@tanstack/react-table` 构建可复用的通用表格组件，供出入记录和设备管理两个页面共用（以及后续 Phase 4 的租户管理页）。

**Props 设计：**
```ts
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  emptyMessage?: string
  className?: string
}
```

**特性：**
- 接收 `ColumnDef<T>[]` 和 `data: T[]`，完全受控（分页/筛选由页面管理）
- 内部使用 `useReactTable` + `flexRender`
- 表头固定、行 hover 高亮
- 内置加载态（覆盖 table 行区域）、空态
- 分页复用已有 `Pagination` 组件，显示 "显示 X-Y 条，共 Z 条"
- 行样式支持自定义（异常行高亮通过 `getRowClassName?: (row: T) => string`）
- 本阶段不内建排序逻辑，只保留后续接入 tanstack sorting state 的扩展点

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/components/shared/data-table.tsx` | 新建 |
| `src/tests/components/shared/data-table.test.tsx` | 新建 |

---

### 任务 2：出入记录 — 类型、契约与服务层

**2a. 类型定义**

**文件：** `src/types/index.ts`（追加）

```ts
type RecordType = "entry" | "exit"
type RecordStatus = "normal" | "paid" | "entry_no_exit" | "exit_no_entry" | "recognition_failed"
type ExceptionType = "entry_no_exit" | "exit_no_entry" | "recognition_failed"

interface EntryExitRecord {
  id: string
  plateNumber: string
  parkingLotId: string
  parkingLotName: string
  laneName: string
  type: RecordType
  status: RecordStatus
  fee: number | null
  time: string           // ISO datetime
  imageUrl?: string
  deviceSerialNumber?: string
}

interface RecordSummary {
  totalExceptions: number
  entryNoExit: number
  exitNoEntry: number
  recognitionFailed: number
}

interface RecordFilters {
  dateFrom?: string
  dateTo?: string
  plateNumber?: string
  parkingLotId?: string
  type?: RecordType
  status?: RecordStatus | "exception"
  page?: number
  pageSize?: number
}

interface ExceptionHandleRequest {
  plateNumber: string
  remark?: string
}
```

**2b. Zod 契约**

**文件：** `src/lib/api/contracts.ts`（追加）

- `exceptionHandleSchema`: `{ plateNumber: z.string().min(1), remark: z.string().optional() }`

**2c. 服务层**

**文件：** `src/lib/api/records.ts`（新建）

```ts
export const recordService = {
  list(filters?: RecordFilters): Promise<PaginatedResponse<EntryExitRecord>>
  // GET /api/records?page=&pageSize=&dateFrom=&dateTo=&plateNumber=&parkingLotId=&type=&status=

  getSummary(): Promise<RecordSummary>
  // GET /api/records/summary

  getById(id: string): Promise<EntryExitRecord>
  // GET /api/records/:id

  handleException(id: string, data: ExceptionHandleRequest): Promise<EntryExitRecord>
  // PATCH /api/records/:id/exception

  export(filters?: RecordFilters): Promise<void>
  // 由 service 内部封装下载流程；页面不直接拼 URL 或调用 window.open
}
```

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/types/index.ts` | 追加 ~30 行类型 |
| `src/lib/api/contracts.ts` | 追加 exceptionHandleSchema |
| `src/lib/api/records.ts` | 新建 |
| `src/tests/lib/api/records.test.ts` | 新建（需配合 MSW server） |

---

### 任务 3：出入记录 — Mock 数据与 Handlers

**3a. Mock 数据**

**文件：** `src/mocks/data/records.ts`（新建）

- 生成 ~30 条 mock 出入记录，覆盖所有 5 种 status
- 至少 3 个不同停车场（复用 parking-lots mock data 中的停车场名称）
- 5 条异常记录（3 条有入无出、1 条有出无入、1 条识别失败）
- 日期集中在近 3 天，时间随机分布
- 导出 helper：`getRecordById`, `getRecordSummary`

**3b. MSW Handlers**

**文件：** `src/mocks/handlers/records.ts`（新建）

| Endpoint | 行为 |
|----------|------|
| `GET /api/records` | 支持 page/pageSize/dateFrom/dateTo/plateNumber/parkingLotId/type/status 筛选 + 分页 |
| `GET /api/records/summary` | 从 mock 数据统计异常数 |
| `GET /api/records/:id` | 返回单条记录详情 |
| `PATCH /api/records/:id/exception` | 验证记录存在且为异常状态 → 更新 plateNumber + status → 返回更新后记录 |
| `GET /api/records/export` | 返回 mock 导出内容；页面通过 `recordService.export(filters)` 触发下载，不直接感知 URL |

**3c. 注册 Handlers**

**文件：** `src/mocks/browser.ts`（追加 `...recordHandlers`）
**文件：** `src/mocks/scenarios.ts`（追加 re-export）

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/mocks/data/records.ts` | 新建 |
| `src/mocks/handlers/records.ts` | 新建 |
| `src/mocks/browser.ts` | 追加 |
| `src/mocks/scenarios.ts` | 追加 |
| `src/tests/mocks/handlers/records.test.ts` | 新建 |

---

### 任务 4：出入记录 — 页面与组件

**4a. 页面组件**

**文件：** `src/app/(dashboard)/entry-exit-records/page.tsx`（重写，当前为 placeholder）

**页面结构（对照设计稿）：**

```
PageHeader (标题: "出入记录", 操作区: [导出按钮])
├── 筛选栏 (FilterBar)
│   ├── 时间范围 (dateFrom + dateTo)
│   ├── 车牌搜索 (SearchInput)
│   ├── 车场下拉 (select)
│   ├── 类型下拉 (入场/出场)
│   ├── 状态下拉 (正常/异常)
│   ├── 查询按钮
│   └── 重置按钮
├── 异常告警横幅 (条件渲染: summary.totalExceptions > 0)
├── DataTable
│   └── columns: 时间 | 车牌号 | 车场 | 出入口 | 类型 | 费用 | 状态 | 操作
├── Pagination
├── DetailModal (查看详情 + 抓拍图片)
└── ExceptionModal (补录车牌 + 备注)
```

**状态管理（页面内 useState）：**
- `filters: RecordFilters` — 当前筛选条件
- `records: EntryExitRecord[]` / `total: number` / `page: number`
- `summary: RecordSummary | null`
- `loading / error` 状态
- `detailOpen / selectedRecord` — 详情弹窗
- `exceptionOpen / selectedException` — 异常处理弹窗

**数据流：**
- `useEffect` 依赖 filters + page → `recordService.list(filters)`
- 独立 `useEffect` → `recordService.getSummary()`
- 处理异常后 → 刷新 list + summary

**4b. 业务组件**

| 文件 | 组件 | 职责 |
|------|------|------|
| `src/components/entry-exit-records/record-filter-bar.tsx` | `RecordFilterBar` | 筛选栏：日期范围、车牌搜索、3 个下拉、查询/重置 |
| `src/components/entry-exit-records/record-columns.tsx` | 导出 `columns` | `ColumnDef<EntryExitRecord>[]`：时间（双行）、车牌（mono+异常色）、类型 badge、费用、状态 badge、操作按钮 |
| `src/components/entry-exit-records/exception-alert.tsx` | `ExceptionAlert` | 琥珀色告警卡片："发现 N 条异常记录需要处理" + "查看异常 →" |
| `src/components/entry-exit-records/record-detail-modal.tsx` | `RecordDetailModal` | 复用 `Modal`（max-w-2xl）：抓拍图 + 6 个字段 grid |
| `src/components/entry-exit-records/exception-handle-modal.tsx` | `ExceptionHandleModal` | 复用 `Modal`（max-w-md）：异常类型提示 + 车牌输入 + 备注textarea |

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/app/(dashboard)/entry-exit-records/page.tsx` | 重写 |
| `src/components/entry-exit-records/record-filter-bar.tsx` | 新建 |
| `src/components/entry-exit-records/record-columns.tsx` | 新建 |
| `src/components/entry-exit-records/exception-alert.tsx` | 新建 |
| `src/components/entry-exit-records/record-detail-modal.tsx` | 新建 |
| `src/components/entry-exit-records/exception-handle-modal.tsx` | 新建 |

---

### 任务 5：设备管理 — 完整垂直切片（类型→Mock→服务→页面）

**5a. 类型定义**

**文件：** `src/types/index.ts`（追加）

```ts
type DeviceType = "integrated" | "camera_only" | "barrier_only"

interface Device {
  id: string
  serialNumber: string
  name: string
  type: DeviceType
  status: DeviceOnlineStatus      // "online" | "offline" (已有)
  parkingLotId: string
  parkingLotName: string
  laneName: string
  laneType: LaneType              // "entry" | "exit"
  lastHeartbeat: string | null
  todayTraffic: number | null
}

interface DeviceSummary {
  total: number
  online: number
  offline: number
  todayTraffic: number
  onlineRate: number
}

interface DeviceFilters {
  page?: number
  pageSize?: number
  status?: DeviceOnlineStatus
  parkingLotId?: string
  keyword?: string
}

interface RegisterDeviceRequest {
  serialNumber: string
  parkingLotId: string
  laneId: string
  type: DeviceType
}

interface DeviceCommandRequest {
  action: "up" | "down"
}
```

**5b. Zod 契约**

**文件：** `src/lib/api/contracts.ts`（追加）

- `registerDeviceSchema`: serialNumber（min 1）、parkingLotId、laneId、type（enum）

**5c. 服务层**

**文件：** `src/lib/api/devices.ts`（新建）

```ts
export const deviceService = {
  getSummary(): Promise<DeviceSummary>
  // GET /api/devices/summary

  list(filters?: DeviceFilters): Promise<PaginatedResponse<Device>>
  // GET /api/devices?page=&pageSize=&status=&parkingLotId=&keyword=

  register(data: RegisterDeviceRequest): Promise<Device>

  sendCommand(id: string, data: DeviceCommandRequest): Promise<{ success: boolean; message: string }>
}
```

**5d. Mock 数据**

**文件：** `src/mocks/data/devices.ts`（新建）

- 扩展已有 `mockLaneDevices`（15 台设备），补充 parkingLotId、parkingLotName、laneName、laneType、todayTraffic 等字段
- 4 台离线设备（与设计稿一致）
- Helper 函数：`getDeviceById`, `getDeviceSummary`
- 设备数据源直接复用 Phase 2 已有的 `mockLaneDevices` / `mockLanes` / `mockParkingLots`，避免重复定义设备与车道绑定关系

**5e. MSW Handlers**

**文件：** `src/mocks/handlers/devices.ts`（新建）

| Endpoint | 行为 |
|----------|------|
| `GET /api/devices/summary` | 返回设备总数、在线数、离线数、今日通行、在线率 |
| `GET /api/devices` | 支持 status/parkingLotId/keyword 筛选 + 分页 |
| `POST /api/devices` | 注册新设备（校验 serialNumber 唯一） |
| `POST /api/devices/:id/command` | 校验设备在线 → 返回 `{ success: true, message }`；离线返回 400 |

注册到 `browser.ts` 和 `scenarios.ts`。

**5f. 页面与组件**

**文件：** `src/app/(dashboard)/device-management/page.tsx`（重写）

**页面结构（对照设计稿）：**
```
PageHeader (标题: "设备管理", 操作区: [搜索框, 注册设备按钮])
├── StatCards 4 列: 设备总数 | 在线设备(绿) | 离线设备(红) | 今日通行
├── 离线告警横幅 (条件渲染: summary.offline > 0)
├── 表格卡片
│   ├── 工具栏: Tab 切换(全部/在线/离线) + 车场下拉
│   ├── DataTable
│   │   └── columns: 设备信息 | 所属车场/出入口 | 状态(pulse dot) | 最后心跳 | 今日通行 | 操作(抬杆)
│   └── Pagination
├── RegisterDeviceModal
└── RemoteControlModal
```

**业务组件：**

| 文件 | 组件 | 职责 |
|------|------|------|
| `src/components/device-management/device-columns.tsx` | 导出 `columns` | `ColumnDef<Device>[]`：设备信息（图标+序列号+类型）、位置（双行）、状态 badge（在线 pulse 动画）、心跳、通行数、操作按钮 |
| `src/components/device-management/register-device-modal.tsx` | `RegisterDeviceModal` | 复用 `Modal`：序列号、停车场下拉（复用 `parkingLotService.list()`）、出入口下拉（复用 `parkingLotService.getLaneConfig()` 联动）、设备类型下拉 |
| `src/components/device-management/remote-control-modal.tsx` | `RemoteControlModal` | 复用 `Modal`（max-w-sm）：设备信息展示 + 抬杆/落杆两个大按钮 |
| `src/components/device-management/offline-alert.tsx` | `OfflineAlert` | 红色告警卡片："N 台设备离线超过15分钟" |

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/types/index.ts` | 追加 ~30 行类型 |
| `src/lib/api/contracts.ts` | 追加 registerDeviceSchema |
| `src/lib/api/devices.ts` | 新建 |
| `src/mocks/data/devices.ts` | 新建 |
| `src/mocks/handlers/devices.ts` | 新建 |
| `src/mocks/browser.ts` | 追加 |
| `src/mocks/scenarios.ts` | 追加 |
| `src/app/(dashboard)/device-management/page.tsx` | 重写 |
| `src/components/device-management/device-columns.tsx` | 新建 |
| `src/components/device-management/register-device-modal.tsx` | 新建 |
| `src/components/device-management/remote-control-modal.tsx` | 新建 |
| `src/components/device-management/offline-alert.tsx` | 新建 |
| `src/tests/lib/api/devices.test.ts` | 新建 |
| `src/tests/mocks/handlers/devices.test.ts` | 新建 |

---

### 任务 6：测试补齐

**测试清单：**

| 测试文件 | 覆盖内容 |
|----------|----------|
| `src/tests/components/shared/data-table.test.tsx` | 渲染行/列、空态、加载态、分页联动、自定义行样式 |
| `src/tests/lib/api/records.test.ts` | recordService 5 个方法通过 MSW server |
| `src/tests/lib/api/devices.test.ts` | deviceService 4 个方法通过 MSW server |
| `src/tests/mocks/handlers/records.test.ts` | records handlers 筛选/分页/异常处理/导出 |
| `src/tests/mocks/handlers/devices.test.ts` | devices handlers 筛选/注册/远程控制/离线校验 |
| `src/tests/lib/api/records-contracts.test.ts` | exceptionHandleSchema 验证 |
| `src/tests/lib/api/devices-contracts.test.ts` | registerDeviceSchema 验证 |

---

## 文件总览

| 操作 | 文件数 | 文件列表 |
|------|--------|----------|
| **新建** | 19 | DataTable, records service, devices service, records mock data, devices mock data, records handlers, devices handlers, 5 个 entry-exit-records 组件, 4 个 device-management 组件, 7 个测试文件 |
| **修改** | 4 | `types/index.ts`, `contracts.ts`, `mocks/browser.ts`, `mocks/scenarios.ts` |
| **重写** | 2 | 两个 placeholder page.tsx |
| **不变** | — | 已有共享组件、API client、布局、认证系统均不改；设备注册弹窗复用停车场 facade，不新增重复 options contract |

---

## 执行顺序与依赖关系

```
任务 1 (DataTable 通用组件)
  ↓
任务 2 (出入记录 types/contracts/service)  ← 可与任务 5a-5c 并行
  ↓
任务 3 (出入记录 mock data/handlers)       ← 可与任务 5d-5e 并行
  ↓
任务 4 (出入记录页面+组件)
  ↓
任务 5 (设备管理完整切片)                   ← 依赖任务 1 的 DataTable
  ↓
任务 6 (测试补齐)
```

任务 2 和任务 5a-5c（类型/契约/服务层）无依赖关系，可并行编写。但任务 4 和任务 5f（页面组件）都依赖任务 1 的 DataTable。
