# Phase 4: 配置与主数据切片 — 详细实施计划

## 当前状态总结

Phase 1-2 已完成，Phase 3 方案已明确：认证闭环、Dashboard 布局、停车场管理 CRUD、共享组件、API 客户端和多组 MSW handlers 已就绪；租户管理页与计费规则页当前仍为 placeholder。

**Phase 4 缺口：**
- 租户管理页、计费规则页均为 placeholder
- 无 Tenant / BillingRule 相关 types、contracts、services、mock data、handlers、components

---

## 任务分解（6 个子任务，建议顺序执行）

### 任务 1：租户管理 — 类型、契约与服务层

**1a. 类型定义**

**文件：** `src/types/index.ts`（追加）

```ts
type TenantStatus = "active" | "frozen"

interface Tenant {
  id: string
  companyName: string
  description?: string
  creditCode?: string
  contactPerson: string
  contactPhone: string
  adminEmail?: string
  remark?: string
  parkingLotCount: number
  status: TenantStatus
  createdAt: string
  updatedAt: string
}

interface TenantSummary {
  total: number
  active: number
  frozen: number
  totalParkingLots: number
  avgParkingLotsPerTenant: number
}

interface TenantFilters {
  page?: number
  pageSize?: number
  keyword?: string
  status?: TenantStatus
}

interface CreateTenantRequest {
  companyName: string
  description?: string
  creditCode?: string
  contactPerson: string
  contactPhone: string
  adminEmail?: string
  remark?: string
}

interface UpdateTenantRequest {
  companyName?: string
  description?: string
  creditCode?: string
  contactPerson?: string
  contactPhone?: string
  adminEmail?: string
  remark?: string
}
```

**1b. Zod 契约**

**文件：** `src/lib/api/contracts.ts`（追加）

- `createTenantSchema`: companyName（min 1）、description?、contactPerson（min 1）、contactPhone（手机号正则）、creditCode?、adminEmail?（email）、remark?
- `updateTenantSchema`: 所有字段 optional

**1c. 服务层**

**文件：** `src/lib/api/tenants.ts`（新建）

```ts
export const tenantService = {
  getSummary(): Promise<TenantSummary>
  // GET /api/tenants/summary

  list(filters?: TenantFilters): Promise<PaginatedResponse<Tenant>>
  // GET /api/tenants?page=&pageSize=&keyword=&status=

  create(data: CreateTenantRequest): Promise<Tenant>
  // POST /api/tenants

  update(id: string, data: UpdateTenantRequest): Promise<Tenant>
  // PATCH /api/tenants/:id

  freeze(id: string): Promise<Tenant>
  // POST /api/tenants/:id/freeze

  unfreeze(id: string): Promise<Tenant>
  // POST /api/tenants/:id/unfreeze

  getParkingLots(id: string): Promise<ParkingLot[]>
  // GET /api/tenants/:id/parking-lots
}
```

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/types/index.ts` | 追加 ~25 行类型 |
| `src/lib/api/contracts.ts` | 追加 createTenantSchema + updateTenantSchema |
| `src/lib/api/tenants.ts` | 新建 |
| `src/tests/lib/api/tenants.test.ts` | 新建（MSW server 集成测试） |
| `src/tests/lib/api/tenants-contracts.test.ts` | 新建（Zod schema 验证） |

---

### 任务 2：租户管理 — Mock 数据与 Handlers

**2a. Mock 数据**

**文件：** `src/mocks/data/tenants.ts`（新建）

- 生成 ~20 条 mock 租户数据，覆盖 active 和 frozen 两种状态
- 公司名称使用真实的物业管理公司名称（万科物业、绿城物业、恒大金碧物业、华润物业、龙湖智慧服务等）
- 每条租户补齐 description，供列表双行信息展示
- 每条租户有不同的 parkingLotCount（5-35 之间）
- 至少 2-3 条 frozen 状态
- 每条租户含完整联系人信息、手机号、信用代码
- 新增显式映射数据源：`tenantParkingLotMap: Record<TenantId, ParkingLotId[]>`
- Helper 函数：`getTenantById`, `getTenantSummary`, `getParkingLotsByTenantId`

**2b. MSW Handlers**

**文件：** `src/mocks/handlers/tenants.ts`（新建）

| Endpoint | 行为 |
|----------|------|
| `GET /api/tenants` | 支持 page/pageSize/keyword/status 筛选 + 分页 |
| `GET /api/tenants/summary` | 从 mock 数据统计 total/active/frozen/totalParkingLots |
| `POST /api/tenants` | 创建新租户（自动生成 ID、默认 active、填充 createdAt） |
| `PATCH /api/tenants/:id` | 更新租户字段 |
| `POST /api/tenants/:id/freeze` | 校验租户存在且为 active → 改为 frozen |
| `POST /api/tenants/:id/unfreeze` | 校验租户存在且为 frozen → 改为 active |
| `GET /api/tenants/:id/parking-lots` | 基于 `tenantParkingLotMap` 返回该租户关联的停车场列表，不在 handler 内临时生成映射 |

**2c. 注册 Handlers**

**文件：** `src/mocks/browser.ts`（追加 `...tenantHandlers`）
**文件：** `src/mocks/scenarios.ts`（追加 re-export）

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/mocks/data/tenants.ts` | 新建 |
| `src/mocks/handlers/tenants.ts` | 新建 |
| `src/mocks/browser.ts` | 追加 |
| `src/mocks/scenarios.ts` | 追加 |
| `src/tests/mocks/handlers/tenants.test.ts` | 新建 |

---

### 任务 3：租户管理 — 页面与组件

**3a. 页面组件**

**文件：** `src/app/(dashboard)/tenant-management/page.tsx`（重写，当前为 placeholder）

**页面结构（对照设计稿）：**

```
PageHeader (标题: "租户管理", 操作区: [搜索框, "新建租户"按钮])
├── StatCards 4 列
│   ├── 总租户数 (+12% 较上月)
│   ├── 正常运营 (占比 94.9%)
│   ├── 已冻结 (欠费或违规)
│   └── 接入车场 (平均 2.1 个/租户)
├── 表格卡片
│   ├── 工具栏: "租户列表" label + Tab 切换(全部/正常/冻结) + "共 N 条记录"
│   ├── DataTable
│   │   └── columns: 租户信息(头像+名称+描述) | 联系人(姓名+电话) | 车场数(圆形badge) | 状态(正常/冻结badge) | 创建时间 | 操作(编辑/查看车场/冻结或解冻)
│   └── Pagination
└── CreateTenantModal / ViewParkingLotsModal
```

**状态管理（页面内 useState）：**
- `tenants: Tenant[]` / `total: number` / `page: number`
- `summary: TenantSummary | null`
- `statusFilter: TenantStatus | undefined`（Tab 切换驱动）
- `keyword: string`（搜索）
- `loading / error`
- `createOpen` — 创建弹窗
- `viewLotsOpen / selectedTenant` — 查看停车场弹窗

**数据流：**
- `useEffect` 依赖 page + keyword + statusFilter → `tenantService.list()`
- 独立 `useEffect` → `tenantService.getSummary()`
- Tab 切换（全部/正常/冻结）→ 设置 statusFilter + page=1 → 触发刷新
- 创建/冻结/解冻后 → 刷新 list + summary

**3b. 业务组件**

| 文件 | 组件 | 职责 |
|------|------|------|
| `src/components/tenant-management/tenant-columns.tsx` | 导出 `columns` | `ColumnDef<Tenant>[]`：租户信息（头像gradient+名称+描述双行）、联系人（姓名+电话双行）、车场数（圆形 blue badge）、状态 badge（正常=绿+glow，冻结=红+glow）、创建时间、操作按钮组（编辑/查看车场/冻结或解冻） |
| `src/components/tenant-management/create-tenant-modal.tsx` | `CreateTenantModal` | 复用 `Modal`（max-w-lg）：公司名称、企业描述、信用代码、联系人+电话（双列）、管理员邮箱、备注 textarea；react-hook-form + zod |
| `src/components/tenant-management/edit-tenant-modal.tsx` | `EditTenantModal` | 复用 `Modal`（max-w-lg）：同 create 但预填数据 |
| `src/components/tenant-management/view-parking-lots-modal.tsx` | `ViewParkingLotsModal` | 复用 `Modal`（max-w-2xl）：展示租户关联停车场列表，可复用 ParkingLotCard 简化版或简单表格 |

**设计稿要点：**
- 租户头像：40x40 rounded-lg，gradient 背景（每条不同颜色），显示公司名首字
- 状态 badge：正常=emerald pill + green glow + 脉冲小圆点；冻结=red pill + red glow + 红色小圆点
- Tab 切换样式：bg-gray-100 圆角容器 + p-0.5，active 为白底 shadow + text-gray-900
- 冻结按钮：gray-400 → hover red-50 + icon red-500；解冻按钮：gray-400 → hover emerald-50 + icon emerald-500

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/app/(dashboard)/tenant-management/page.tsx` | 重写 |
| `src/components/tenant-management/tenant-columns.tsx` | 新建 |
| `src/components/tenant-management/create-tenant-modal.tsx` | 新建 |
| `src/components/tenant-management/edit-tenant-modal.tsx` | 新建 |
| `src/components/tenant-management/view-parking-lots-modal.tsx` | 新建 |

---

### 任务 4：计费规则 — 类型、契约与服务层

**4a. 类型定义**

**文件：** `src/types/index.ts`（追加）

```ts
type BillingCycle = "hourly" | "half_hourly"

interface BillingRule {
  id: string
  parkingLotId: string
  parkingLotName: string
  freeDurationMinutes: number        // 免费时长（分钟）
  unitPrice: number                   // 计费单价（元/单位时长）
  dailyCap: number | null             // 每日封顶（null 表示不限）
  billingCycle: BillingCycle          // 按小时 / 按半小时
  enabled: boolean
  updatedAt: string
}

interface BillingLotOption {
  id: string
  name: string
  status: ParkingLotStatus
  hasRule: boolean
}

interface BillingRuleListParams {
  parkingLotId?: string
}

interface UpdateBillingRuleRequest {
  freeDurationMinutes?: number
  unitPrice?: number
  dailyCap?: number | null
  billingCycle?: BillingCycle
}

interface CalculateFeeRequest {
  parkingLotId: string
  entryTime: string                   // ISO datetime
  exitTime: string                    // ISO datetime
}

interface CalculateFeeResult {
  duration: string                    // "5小时0分钟"
  freeDuration: string                // "15分钟"
  billableDuration: string            // "4小时45分钟 → 5小时"
  unitPrice: number
  totalFee: number
}
```

**4b. Zod 契约**

**文件：** `src/lib/api/contracts.ts`（追加）

- `updateBillingRuleSchema`: freeDurationMinutes（coerce number, 0-120）、unitPrice（coerce number, 0.5-50, step 0.5）、dailyCap（coerce number, nullable）、billingCycle（enum）
- `calculateFeeSchema`: parkingLotId（min 1）、entryTime（min 1）、exitTime（min 1）

**4c. 服务层**

**文件：** `src/lib/api/billing.ts`（新建）

```ts
export const billingService = {
  list(params?: BillingRuleListParams): Promise<BillingRule[]>
  // GET /api/billing-rules?parkingLotId=

  update(id: string, data: UpdateBillingRuleRequest): Promise<BillingRule>
  // PUT /api/billing-rules/:id

  calculate(data: CalculateFeeRequest): Promise<CalculateFeeResult>
  // POST /api/billing-rules/calculate
}
```

**依赖约束：**

- Billing domain 不新增独立的停车场 options contract
- 左侧停车场选择器和计算器中的车场下拉统一复用 `parkingLotService.list()` 获取车场基础数据
- 页面层负责将 `parkingLotService.list()` 返回的停车场与 `billingService.list()` 返回的规则进行 join，形成 `BillingLotOption[]`

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/types/index.ts` | 追加 ~20 行类型 |
| `src/lib/api/contracts.ts` | 追加 updateBillingRuleSchema + calculateFeeSchema |
| `src/lib/api/billing.ts` | 新建 |
| `src/tests/lib/api/billing.test.ts` | 新建（MSW server 集成测试） |
| `src/tests/lib/api/billing-contracts.test.ts` | 新建（Zod schema 验证） |

---

### 任务 5：计费规则 — Mock 数据、Handlers、页面与组件

**5a. Mock 数据**

**文件：** `src/mocks/data/billing.ts`（新建）

- 为已有 3 个 operating 状态停车场各生成一条计费规则
- suspended 车场无计费规则
- 默认规则：freeDuration=15min, unitPrice=8元/h, dailyCap=64元, cycle=hourly
- 不同车场有差异化参数（如万科广场: freeDuration=30, unitPrice=10, dailyCap=80）
- Helper：`getBillingRuleByParkingLotId`, `getBillingRules`, 费用计算逻辑
- 计费规则数据只表示“规则本身”；左侧停车场选择列表所需的全部停车场视图由页面组合 `parkingLotService.list()` + `billingService.list()` 生成

**5b. MSW Handlers**

**文件：** `src/mocks/handlers/billing.ts`（新建）

| Endpoint | 行为 |
|----------|------|
| `GET /api/billing-rules` | 返回计费规则列表，支持 parkingLotId 筛选 |
| `PUT /api/billing-rules/:id` | 更新规则字段，校验 freeDuration/unitPrice/dailyCap 范围 |
| `POST /api/billing-rules/calculate` | 根据 entryTime/exitTime 和对应车场规则计算费用，返回详细计费明细 |

**费用计算 mock 逻辑：**
- 计算停车总分钟数
- 扣减免费时长
- 按 billingCycle 换算为计费单位数（向上取整）
- 单价 × 单位数 = 基础费用
- 若 dailyCap 不为 null，限制单日上限
- 跨日则分段计算

注册到 `browser.ts` 和 `scenarios.ts`。

**5c. 页面组件**

**文件：** `src/app/(dashboard)/billing-rules/page.tsx`（重写）

**页面结构（对照设计稿）：**

```
PageHeader (标题: "计费规则配置", 操作区: ["费用计算器"按钮])
├── Split-Panel (grid-cols-12 gap-6)
│   ├── Left Panel (col-span-4)
│   │   └── 停车场选择列表
│   │       └── 可点击 rule-card（active=蓝色边框+勾选图标，suspended=灰化）
│   └── Right Panel (col-span-8, space-y-6)
│       ├── 当前规则展示卡
│       │   ├── 3 个指标卡片: 免费时长 | 计费单价 | 每日封顶
│       │   └── 计费规则说明框（4 条说明）
│       └── 编辑规则表单卡
│           ├── 免费时长: 滑块 + 数字输入（双向同步，0-120 分钟）
│           ├── 计费单价: 滑块 + 数字输入（双向同步，1-50 元，step 0.5）
│           ├── 每日封顶: 滑块 + 数字输入（双向同步，0-500 元）+ "不设封顶" checkbox
│           ├── 计费周期: Radio 卡片选择（按小时 / 按半小时）
│           └── 操作: [重置] [保存规则]
└── CalculatorModal
    ├── 停车场选择 + 入场时间 + 出场时间
    ├── 计算结果: 停车时长 / 免费时长 / 计费时长 / 单价 / 应付金额
    └── "重新计算" 按钮
```

**状态管理（页面内 useState）：**
- `billingRules: BillingRule[]` — 所有规则
- `parkingLots: ParkingLot[]` — 通过 `parkingLotService.list({ page: 1, pageSize: 100 })` 获取的车场基础数据
- `billingLotOptions: BillingLotOption[]` — 页面组合后的左侧 selector 数据
- `selectedLotId: string | null` — 当前选中停车场
- `editForm: { freeDuration, unitPrice, dailyCap, noLimit, billingCycle }` — 编辑表单
- `loading / error / saving`
- `calculatorOpen` — 计算器弹窗
- `calcResult: CalculateFeeResult | null`

**数据流：**
- 初始加载 → 并行执行 `parkingLotService.list({ page: 1, pageSize: 100 })` + `billingService.list()`
- 页面将停车场基础数据与计费规则 join 成 `billingLotOptions`
- 选中停车场 → 若存在规则则展示对应规则 + 填充编辑表单；若为 suspended 或无规则则展示禁用/空状态
- 编辑表单变更 → 仅更新本地 state（滑块/输入双向同步）
- 保存 → `billingService.update(ruleId, form)` → 刷新规则列表并重新 join selector 数据
- 计算器 → `billingService.calculate()` → 展示结果

**5d. 业务组件**

| 文件 | 组件 | 职责 |
|------|------|------|
| `src/components/billing-rules/parking-lot-selector.tsx` | `ParkingLotSelector` | 左侧面板：接收 `BillingLotOption[]`，展示全部停车场，active 态高亮，suspended 灰化，点击选中 |
| `src/components/billing-rules/rule-display.tsx` | `RuleDisplay` | 当前规则展示：3 个指标卡片（免费时长/单价/封顶）+ 规则说明框 |
| `src/components/billing-rules/rule-edit-form.tsx` | `RuleEditForm` | 编辑表单：每个参数含 label + 数字输入 + range slider（双向同步）、封顶 checkbox、计费周期 radio 卡片 |
| `src/components/billing-rules/calculator-modal.tsx` | `CalculatorModal` | 复用 `Modal`（max-w-md）：停车场选择（复用 `BillingLotOption[]`）、入场/出场时间、计算结果展示（5 行明细） |

**设计稿要点：**
- Range slider 自定义样式：track 8px 高度灰色圆角，thumb 24px 白色圆形蓝色边框
- 数字输入与滑块双向绑定：`oninput` 互相同步
- "不设封顶" checkbox 勾选后 → dailyCap 设为 null + 禁用滑块和输入
- 计费周期：两个 radio 卡片（选中=蓝色边框+蓝色图标，未选=灰色边框）
- 停车场卡片选中态：蓝色 2px border + `box-shadow: 0 0 0 3px rgba(59,130,246,0.1)` + 右侧蓝色勾选图标
- 计算结果：应付金额为 2xl bold brand-600 蓝色大字

**涉及文件：**
| 文件 | 操作 |
|------|------|
| `src/mocks/data/billing.ts` | 新建 |
| `src/mocks/handlers/billing.ts` | 新建 |
| `src/mocks/browser.ts` | 追加 |
| `src/mocks/scenarios.ts` | 追加 |
| `src/app/(dashboard)/billing-rules/page.tsx` | 重写 |
| `src/components/billing-rules/parking-lot-selector.tsx` | 新建 |
| `src/components/billing-rules/rule-display.tsx` | 新建 |
| `src/components/billing-rules/rule-edit-form.tsx` | 新建 |
| `src/components/billing-rules/calculator-modal.tsx` | 新建 |
| `src/tests/mocks/handlers/billing.test.ts` | 新建 |

---

### 任务 6：测试补齐

**测试清单：**

| 测试文件 | 覆盖内容 |
|----------|----------|
| `src/tests/lib/api/tenants.test.ts` | tenantService 7 个方法通过 MSW server（list 筛选/分页、create、update、freeze、unfreeze、getParkingLots、summary） |
| `src/tests/lib/api/tenants-contracts.test.ts` | createTenantSchema + updateTenantSchema 验证（必填校验、手机号正则、email 格式） |
| `src/tests/mocks/handlers/tenants.test.ts` | tenants handlers 筛选/分页/创建/更新/冻结/解冻/查看车场 |
| `src/tests/lib/api/billing.test.ts` | billingService 3 个方法通过 MSW server |
| `src/tests/lib/api/billing-contracts.test.ts` | updateBillingRuleSchema + calculateFeeSchema 验证 |
| `src/tests/mocks/handlers/billing.test.ts` | billing handlers 列表/更新/费用计算（含边界值：免费时长内、跨日、封顶） |

---

## 文件总览

| 操作 | 文件数 | 文件列表 |
|------|--------|----------|
| **新建** | 16 | tenants service, billing service, tenants mock data, billing mock data, tenants handlers, billing handlers, 4 个 tenant-management 组件, 4 个 billing-rules 组件, 6 个测试文件 |
| **修改** | 4 | `types/index.ts`, `contracts.ts`, `mocks/browser.ts`, `mocks/scenarios.ts` |
| **重写** | 2 | 两个 placeholder page.tsx |
| **不变** | — | 已有共享组件、DataTable、API client、布局、认证系统均不改；计费页复用停车场 facade，不新增重复 options contract |

---

## 执行顺序与依赖关系

```
任务 1 (租户管理 types/contracts/service) ← 可与任务 4 并行
  ↓
任务 2 (租户管理 mock data/handlers)       ← 可与任务 5a-5b 并行
  ↓
任务 3 (租户管理页面+组件)                  ← 依赖 DataTable（Phase 3 已完成）
  ↓
任务 4 (计费规则 types/contracts/service)
  ↓
任务 5 (计费规则 mock+页面+组件)
  ↓
任务 6 (测试补齐)
```

**并行机会：**
- 任务 1 & 任务 4（两个 domain 的类型/契约/服务层）完全独立，可并行
- 任务 2 & 任务 5a-5b（两个 domain 的 mock 层）完全独立，可并行
- 任务 3 & 任务 5c-5d（两个页面组件）互不依赖，可并行（前提是各自 mock 层已就绪）

**关键依赖：**
- 任务 3 的 DataTable 复用依赖 Phase 3 已完成的 `DataTable` 组件 ✓
- 任务 5 的停车场列表依赖 Phase 2 已完成的 parking-lots mock data ✓
- 租户查看车场依赖 `tenantParkingLotMap` 与 parking-lots mock data 的稳定映射
- 计费规则页的停车场选择器需复用 `parkingLotService.list()` 获取车场基础数据，并与 `billingService.list()` 进行 join
