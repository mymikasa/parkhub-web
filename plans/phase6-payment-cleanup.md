# Phase 6: C 端与收尾 — 详细实施计划

## 当前状态总结

Phase 1-5 已完成：认证闭环、Dashboard 布局、7 个后台业务页面（租户管理、停车场管理、设备管理、出入记录、计费规则、实时监控、操作员工作台）均已实现，含完整的 types / contracts / services / mock data / handlers / components / tests。

**Phase 6 缺口：**

- C 端缴费页 `src/app/(payment)/pay/page.tsx` 为 placeholder（10 行）
- 无 `(payment)/layout.tsx` 移动端布局
- 无 Payment 相关 types、service、mock data、handlers、components
- 无支付成功态、离场倒计时提醒交互
- 未完成响应式验证、无障碍基础检查
- 缺少 payment 相关测试；monitor / operator handler 未在 scenarios.ts 导出

**本 phase 覆盖 User Stories：**

- #42: 车主查看停车费用明细
- #43: 车主通过微信/支付宝扫码缴费
- #44: 缴费成功后看到 15 分钟出场提醒

---

## 任务分解（6 个子任务，建议顺序执行）

### 任务 1：缴费 — 类型、契约与服务层

**1a. 类型定义**

**文件：** `src/types/index.ts`（追加）

```ts
type PaymentMethod = "wechat" | "alipay"
type PaymentStatus = "pending" | "paid" | "expired"

interface PaymentOrder {
  id: string
  plateNumber: string
  parkingLotName: string
  entryLane: string
  vehicleImage?: string
  vehicleType: string              // "临时车" | "月卡车" | ...
  entryTime: string                // ISO datetime
  currentTime: string              // ISO datetime
  duration: string                 // "5小时02分钟"
  freeDuration: string             // "15分钟"
  billableDuration: string         // "4小时47分钟 → 5小时"
  unitPrice: number
  totalFee: number
  status: PaymentStatus
}

interface PaymentRequest {
  orderId: string
  method: PaymentMethod
}

interface PaymentResult {
  orderId: string
  plateNumber: string
  amount: number
  method: PaymentMethod
  paidAt: string
  departureDeadline: string        // ISO datetime，支付后 +15min
}

interface PaymentStatusResponse {
  orderId: string
  status: PaymentStatus
  paidAt?: string
  departureDeadline?: string
}
```

**1b. Zod 契约**

**文件：** `src/lib/api/contracts.ts`（追加）

- `paymentSchema`: orderId（min 1）、method（enum "wechat" | "alipay"）

**1c. 服务层**

**文件：** `src/lib/api/payment.ts`（新建）

```ts
export const paymentService = {
  getOrder(plateNumber: string): Promise<PaymentOrder>
  // GET /api/payment/orders/:id  (id = plateNumber，mock 阶段用 plateNumber 做查询标识)

  pay(data: PaymentRequest): Promise<PaymentResult>
  // POST /api/payment/pay

  getStatus(orderId: string): Promise<PaymentStatusResponse>
  // GET /api/payment/pay/:id/status
}
```

**涉及文件：**

| 文件 | 操作 |
|------|------|
| `src/types/index.ts` | 追加 ~20 行类型 |
| `src/lib/api/contracts.ts` | 追加 paymentSchema |
| `src/lib/api/payment.ts` | 新建 |
| `src/tests/lib/api/payment.test.ts` | 新建（MSW server 集成测试） |
| `src/tests/lib/api/payment-contracts.test.ts` | 新建（Zod schema 验证） |

---

### 任务 2：缴费 — Mock 数据与 Handlers

**2a. Mock 数据**

**文件：** `src/mocks/data/payment.ts`（新建）

- 生成 3-5 条 mock 订单数据，覆盖不同车牌、车场
- 默认订单（用于演示）：车牌 "沪A·88888"，停车场 "万科翡翠滨江地下停车场"，入场 09:30，费用 ¥40.00
- 至少 1 条已支付（paid）状态订单
- Helper 函数：`getOrderByPlate`, `getOrderById`, `getPaymentStatus`
- 费用计算与 billing mock 逻辑一致（复用计费规则参数）

**2b. MSW Handlers**

**文件：** `src/mocks/handlers/payment.ts`（新建）

| Endpoint | 行为 |
|----------|------|
| `GET /api/payment/orders/:plateNumber` | 返回对应车牌的缴费订单（默认 pending） |
| `POST /api/payment/pay` | 模拟支付：更新订单为 paid，返回 PaymentResult（含 departureDeadline = now + 15min），延迟 2s 模拟支付处理 |
| `GET /api/payment/pay/:id/status` | 查询支付状态，返回 PaymentStatusResponse |

**mock 支付逻辑：**
- 接收 orderId + method
- 查找订单，验证为 pending 状态
- 更新状态为 paid，记录 paidAt
- 计算 departureDeadline = paidAt + 15min
- 返回 PaymentResult

**2c. 注册 Handlers**

**文件：** `src/mocks/browser.ts`（追加 `...paymentHandlers`）
**文件：** `src/mocks/scenarios.ts`（追加 payment + monitor + operator re-export）

**涉及文件：**

| 文件 | 操作 |
|------|------|
| `src/mocks/data/payment.ts` | 新建 |
| `src/mocks/handlers/payment.ts` | 新建 |
| `src/mocks/browser.ts` | 追加 |
| `src/mocks/scenarios.ts` | 追加 payment + 补齐 monitor + operator |
| `src/tests/mocks/handlers/payment.test.ts` | 新建 |

---

### 任务 3：缴费 — 移动端布局与页面组件

**3a. 移动端布局**

**文件：** `src/app/(payment)/layout.tsx`（新建）

- 不包含 Sidebar、AuthGuard
- 仅提供 `max-w-md mx-auto min-h-screen bg-white` 容器
- 确保 MSW Provider 在此布局下可用（已在根布局注入）

**3b. 页面组件**

**文件：** `src/app/(payment)/pay/page.tsx`（重写）

**页面结构（对照设计稿 `design-pages/payment.html`）：**

```
PaymentLayout (max-w-md, mobile-first)
├── Hero Header (brand-900 → brand-600 渐变)
│   ├── 装饰圆圈（bg-white/5）
│   ├── 停车图标（frosted-glass box）
│   ├── 标题 "停车缴费"
│   └── 停车场名称（blue-200/80）
├── Content Area (px-5, -mt-4)
│   ├── VehicleInfoCard
│   │   ├── 标签 "车辆信息" + "临时车"
│   │   ├── 车辆缩略图 (w-20 h-14)
│   │   ├── 车牌号 (font-mono text-2xl font-bold)
│   │   └── 入口信息 "1号入口入场"
│   ├── DurationCard
│   │   ├── 2 列网格: 入场时间 (gray-50) | 当前时间 (brand-50)
│   │   └── 已停时长 (brand-600 高亮数字)
│   ├── FeeBreakdownCard
│   │   ├── 费用明细列表 (停车时长 / 免费时长 / 计费时长 / 单价)
│   │   ├── "计费规则" 链接按钮
│   │   └── 应付金额 (text-3xl font-bold text-brand-600)
│   ├── PaymentButtons
│   │   ├── 微信支付按钮 (绿色渐变)
│   │   └── 支付宝按钮 (蓝色渐变)
│   └── FooterNotice ("请在15分钟内离场")
├── PaymentLoadingModal (支付中全屏遮罩 + spinner)
└── PaymentSuccessModal
    ├── 成功动画 (scale pop-in + pulse-ring)
    ├── "支付成功" 标题
    ├── 订单摘要 (车牌 / 金额 / 支付方式)
    ├── 离场提醒 (amber-50 框, 15分钟倒计时)
    └── "完成" 按钮
```

**状态管理（页面内 useState）：**

- `order: PaymentOrder | null`
- `loading / error`
- `paying: boolean` — 支付进行中
- `paymentResult: PaymentResult | null` — 支付成功结果
- `showSuccess: boolean` — 成功弹窗
- `countdown: number` — 离场倒计时（秒）
- `ruleModalOpen: boolean` — 计费规则说明弹窗
- `method: PaymentMethod | null` — 当前选择的支付方式

**数据流：**

- URL query param `plate` → `paymentService.getOrder(plate)` → 填充 order
- 点击微信/支付宝按钮 → `setPaying(true)` → `paymentService.pay({ orderId, method })` → 2s mock 延迟 → 成功后 `setPaymentResult` + `setShowSuccess(true)`
- 成功弹窗展示后启动 `setInterval` 倒计时（从 15:00 递减）
- 倒计时结束或点击"完成" → 清理计时器，展示"已超时"或返回初始状态
- 无 `plate` 参数 → 展示空态 / 输入车牌查询

**3c. 业务组件**

| 文件 | 组件 | 职责 |
|------|------|------|
| `src/components/payment/hero-header.tsx` | `HeroHeader` | 渐变头部：装饰圆圈 + 停车图标 + 标题 + 停车场名称 |
| `src/components/payment/vehicle-info-card.tsx` | `VehicleInfoCard` | 车辆信息卡片：缩略图 + 车牌号 + 入口信息 + 车辆类型标签 |
| `src/components/payment/duration-card.tsx` | `DurationCard` | 停车时长卡片：入场/当前时间双列 + 已停时长高亮 |
| `src/components/payment/fee-breakdown-card.tsx` | `FeeBreakdownCard` | 费用明细卡片：明细列表 + 应付金额 + "计费规则"按钮 |
| `src/components/payment/payment-buttons.tsx` | `PaymentButtons` | 支付按钮组：微信（绿色渐变）+ 支付宝（蓝色渐变），接收 loading 和 onClick |
| `src/components/payment/payment-loading-modal.tsx` | `PaymentLoadingModal` | 支付中全屏遮罩：spinner + "正在支付中..." |
| `src/components/payment/payment-success-modal.tsx` | `PaymentSuccessModal` | 支付成功弹窗：成功动画 + 订单摘要 + 离场倒计时提醒 + "完成"按钮 |
| `src/components/payment/rule-info-modal.tsx` | `RuleInfoModal` | 计费规则说明弹窗：展示当前车场的计费规则概要 |

**设计稿要点：**

- 卡片：`rounded-2xl` + `card-shadow`（`box-shadow: 0 4px 20px -2px rgba(0,0,0,0.08)`）
- 入场动画：`fade-in`（translateY(10px) → 0, stagger delay 0/0.1s/0.2s/0.3s）
- 微信按钮：`linear-gradient(135deg, #07c160, #06ad56)` + hover shadow
- 支付宝按钮：`linear-gradient(135deg, #1677ff, #0958d9)` + hover shadow
- 成功图标：`success-animation`（scale 0→1.2→1 pop-in）+ `pulse-ring`（emerald-500 扩散环）
- 离场提醒：amber-50 背景 + amber-500 图标 + amber-800 文字 + amber-600 副文字
- 应付金额：`text-3xl font-bold text-brand-600`，整数和小数分开两个 span

**涉及文件：**

| 文件 | 操作 |
|------|------|
| `src/app/(payment)/layout.tsx` | 新建 |
| `src/app/(payment)/pay/page.tsx` | 重写 |
| `src/components/payment/hero-header.tsx` | 新建 |
| `src/components/payment/vehicle-info-card.tsx` | 新建 |
| `src/components/payment/duration-card.tsx` | 新建 |
| `src/components/payment/fee-breakdown-card.tsx` | 新建 |
| `src/components/payment/payment-buttons.tsx` | 新建 |
| `src/components/payment/payment-loading-modal.tsx` | 新建 |
| `src/components/payment/payment-success-modal.tsx` | 新建 |
| `src/components/payment/rule-info-modal.tsx` | 新建 |
| `src/app/globals.css` | 追加 payment 相关动画（fade-in / success-pop / pulse-ring） |

---

### 任务 4：响应式验证与无障碍基础检查

**4a. 响应式验证**

逐一检查 9 个页面在不同宽度下的表现：

| 页面 | 验证点 |
|------|--------|
| 登录页 | 居中卡片在 320-1920 宽度可正常显示 |
| Dashboard 7 页 | 侧边栏在 <1024 折叠为 hamburger menu；表格在 <768 水平滚动 |
| C 端缴费 | max-w-md 容器在 320-428 宽度无溢出；按钮不溢出 |

**需要做的事：**

- 检查 Sidebar 组件是否需要响应式折叠逻辑（<1024 隐藏侧边栏 + hamburger toggle）
- 检查 DataTable 在窄屏是否有 `overflow-x-auto`
- 缴费页测试 320px / 375px / 428px 三个断点

**具体改动（按需）：**

| 文件 | 改动 |
|------|------|
| `src/app/(dashboard)/layout.tsx` | 添加响应式侧边栏逻辑：lg 以上固定展开，以下隐藏 + hamburger 按钮 |
| `src/components/layout/sidebar.tsx` | 添加移动端抽屉模式（fixed + overlay） |
| `src/components/shared/data-table.tsx` | 确认 `overflow-x-auto` wrapper |
| `src/app/(payment)/pay/page.tsx` | 确认 320px 无溢出 |

**4b. 无障碍基础检查**

对所有页面做以下基础检查和修正：

| 检查项 | 修正方式 |
|--------|----------|
| 所有图片有 `alt` 文本 | `<img alt="车辆照片">` 或 `role="img" aria-label="..."` |
| 按钮和链接有可读文本 | 纯图标按钮添加 `aria-label` |
| 表单输入有 `label` 关联 | 使用 `<label htmlFor>` 或 `aria-labelledby` |
| 模态框 focus trap | 复用 Modal 组件确保 Esc 关闭 + focus trap |
| 颜色对比度 | 文字/背景对比度 >= 4.5:1（gray-400 on white 约为 3.1:1 → 升级为 gray-500） |
| 页面有 `<main>` landmark | Dashboard layout 和 Payment layout 确保包含 `<main>` |
| 键盘导航 | Tab 序列合理，可聚焦元素有 focus-visible 样式 |

**涉及文件：**

| 文件 | 操作 |
|------|------|
| `src/app/(dashboard)/layout.tsx` | 添加响应式侧边栏 + `<main>` landmark |
| `src/components/layout/sidebar.tsx` | 添加移动端抽屉 + aria 属性 |
| `src/components/shared/modal.tsx` | 确认 focus trap + aria-modal |
| 各页面组件 | 添加 aria-label / alt / label（按需微调） |
| `src/app/globals.css` | 添加 `focus-visible` ring 样式 |

---

### 任务 5：测试补齐

**5a. Payment 测试**

| 测试文件 | 覆盖内容 |
|----------|----------|
| `src/tests/lib/api/payment.test.ts` | paymentService 3 个方法通过 MSW server（getOrder、pay、getStatus） |
| `src/tests/lib/api/payment-contracts.test.ts` | paymentSchema 验证（必填、method enum） |
| `src/tests/mocks/handlers/payment.test.ts` | payment handlers：查询订单、mock 支付（含 2s 延迟验证）、状态查询、已支付订单不可重复支付 |

**5b. 缴费组件测试**

| 测试文件 | 覆盖内容 |
|----------|----------|
| `src/tests/components/payment/payment-buttons.test.tsx` | 微信/支付宝按钮渲染和点击回调 |
| `src/tests/components/payment/payment-success-modal.test.tsx` | 成功弹窗渲染、倒计时显示、"完成"按钮关闭 |
| `src/tests/components/payment/fee-breakdown-card.test.tsx` | 费用明细展示、金额格式化 |

**5c. 补齐已有模块 handler 测试**

| 测试文件 | 覆盖内容 |
|----------|----------|
| `src/tests/mocks/handlers/monitor.test.ts` | monitor handlers：realtime 数据、events 流 |
| `src/tests/mocks/handlers/operator.test.ts` | operator handlers：events、exceptions、actions |

**涉及文件：**

| 文件 | 操作 |
|------|------|
| `src/tests/lib/api/payment.test.ts` | 新建 |
| `src/tests/lib/api/payment-contracts.test.ts` | 新建 |
| `src/tests/mocks/handlers/payment.test.ts` | 新建 |
| `src/tests/components/payment/payment-buttons.test.tsx` | 新建 |
| `src/tests/components/payment/payment-success-modal.test.tsx` | 新建 |
| `src/tests/components/payment/fee-breakdown-card.test.tsx` | 新建 |
| `src/tests/mocks/handlers/monitor.test.ts` | 新建 |
| `src/tests/mocks/handlers/operator.test.ts` | 新建 |

---

### 任务 6：验收检查与收尾

**6a. 全局验收清单**

按 PRD "Delivery Scope and Acceptance" 逐项检查：

- [ ] 9 个设计稿页面均完成路由落地
- [ ] 所有主操作具备完整交互闭环
- [ ] 所有列表页具备加载态、空态、错误态
- [ ] 后台未登录不可访问，刷新后可恢复登录态
- [ ] 所有数据均来自统一 API 契约，无页面硬编码业务 JSON
- [ ] `pnpm test` 通过

**6b. 页面级验收**

| 页面 | 验收标准 |
|------|----------|
| C 端缴费 | 订单详情正确展示 / 支付发起（微信 + 支付宝）/ 支付成功态动画 / 15 分钟离场倒计时提醒 / 无 plate 参数时展示空态 |

**6c. 收尾项**

| 项 | 操作 |
|----|------|
| scenarios.ts | 补齐 monitor / operator / payment 导出 |
| globals.css | 确认 payment 动画 keyframes 已注册 |
| types/index.ts | 确认无遗漏类型 |
| 清理 placeholder | 确认所有 page.tsx 均非 placeholder |
| pnpm test | 全量测试通过 |
| pnpm build | 构建无错误 |

---

## 文件总览

| 操作 | 文件数 | 文件列表 |
|------|--------|----------|
| **新建** | ~22 | payment service, payment mock data, payment handlers, payment layout, 8 个 payment components, 8 个测试文件, 2 个补齐 handler 测试 |
| **修改** | ~6 | `types/index.ts`, `contracts.ts`, `mocks/browser.ts`, `mocks/scenarios.ts`, `globals.css`, `(dashboard)/layout.tsx` |
| **重写** | 1 | `(payment)/pay/page.tsx` |
| **不变** | — | 已有 7 个后台业务页面、共享组件、API client、认证系统均不改 |

---

## 执行顺序与依赖关系

```
任务 1 (payment types/contracts/service)
  ↓
任务 2 (payment mock data/handlers)
  ↓
任务 3 (payment layout + 页面 + 组件)
  ↓
任务 4 (响应式验证 + 无障碍)  ← 可与任务 5 并行
  ↓
任务 5 (测试补齐)
  ↓
任务 6 (验收检查与收尾)
```

**并行机会：**

- 任务 4（响应式/无障碍）与任务 5（测试）完全独立，可并行
- 任务 5a/5b（payment 测试）与 5c（补齐已有模块测试）可并行编写

**关键依赖：**

- 任务 3 依赖任务 1+2 的 service 和 mock 层就绪
- 任务 4 的响应式改动依赖 Sidebar 组件稳定（Phase 1 已完成）
- 任务 6 依赖所有前置任务完成

---

## 关键设计决策

### 缴费页无 AuthGuard

C 端缴费页为公开页面，无需登录。`(payment)` route group 不包裹 AuthGuard，与 `(dashboard)` 完全隔离。

### 订单查询用 plateNumber

PRD 定义 `GET /api/payment/orders/:id`，mock 阶段用 `plateNumber` 作为 `:id` 参数（因为无真实后端订单系统）。页面通过 URL query `?plate=沪A·88888` 获取车牌，调用 service 查询。后续接真实后端时，替换为真实订单 ID 或扫码后的订单标识。

### 离场倒计时

支付成功后启动 15 分钟倒计时（`setInterval` 每秒递减），在成功弹窗的 amber 提醒框中展示 `MM:SS` 格式。倒计时归零后展示"已超时，将重新计费"提示。

### 动画复用

`fade-in`、`success-pop`、`pulse-ring` 动画注册在 `globals.css` 中，组件通过 Tailwind `animate-*` 或直接 className 引用。
