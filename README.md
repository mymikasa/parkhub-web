# ParkHub Web

智慧停车管理平台 — 前端应用。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.2.3 |
| UI 库 | React | 19.2.4 |
| 语言 | TypeScript (strict) | 5 |
| 样式 | Tailwind CSS | 4 |
| 表单 | TanStack Form + Zod | 1.29 / 3.24 |
| 表格 | TanStack Table | 8.20 |
| 图标 | Lucide React | 0.468 |
| 弹窗 | Radix UI Dialog | — |
| API Mock | Mock Service Worker (MSW) | 2.7 |
| 测试 | Vitest + Testing Library | 3 / 16 |
| 包管理 | pnpm | — |

## 目录结构

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局 (QueryProvider, AuthProvider, MSW)
│   ├── page.tsx                  # 首页 → 重定向到登录
│   ├── (auth)/
│   │   ├── login/page.tsx        # 登录页
│   │   └── oauth/[provider]/     # OAuth 回调
│   ├── (dashboard)/
│   │   ├── layout.tsx            # 仪表盘布局 (侧边栏 + 路由守卫)
│   │   ├── billing-rules/        # 计费规则配置
│   │   ├── device-management/    # 设备管理
│   │   ├── entry-exit-records/   # 出入记录
│   │   ├── operator-workspace/   # 运营工作台
│   │   ├── parking-lot/          # 停车场管理
│   │   ├── realtime-monitor/     # 实时监控
│   │   └── tenant-management/    # 租户管理
│   └── (payment)/
│       └── pay/page.tsx          # C 端缴费页
│
├── components/                   # 组件 (按业务模块组织)
│   ├── shared/                   # 通用组件 (Modal, DataTable, StatCard…)
│   ├── layout/                   # 布局组件 (Sidebar, AuthGuard, QueryProvider…)
│   ├── login/                    # 登录表单
│   ├── parking-lot/              # 停车场相关
│   ├── device-management/        # 设备相关
│   ├── tenant-management/        # 租户相关
│   ├── billing-rules/            # 计费相关
│   ├── entry-exit-records/       # 出入记录相关
│   ├── realtime-monitor/         # 监控相关
│   ├── operator-workspace/       # 运营台相关
│   └── payment/                  # 缴费相关
│
├── hooks/                        # TanStack Query hooks
│   ├── use-parking-lots.ts
│   ├── use-devices.ts
│   ├── use-tenants.ts
│   ├── use-billing.ts
│   ├── use-monitor.ts
│   ├── use-operator.ts
│   ├── use-records.ts
│   └── use-payment.ts
│
├── stores/                       # 全局状态 (预留)
│
├── contexts/
│   └── auth-context.tsx          # 认证上下文
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # HTTP 客户端 (fetch 封装)
│   │   ├── http-client.ts        # hey-api 客户端 (拦截器)
│   │   ├── contracts.ts          # Zod Schema + 类型导出
│   │   ├── case.ts               # camelCase ↔ snake_case 转换
│   │   ├── auth.ts               # 认证 API
│   │   ├── parking-lots.ts       # 停车场 API
│   │   ├── devices.ts            # 设备 API
│   │   ├── tenants.ts            # 租户 API
│   │   ├── billing.ts            # 计费 API
│   │   ├── monitor.ts            # 监控 API
│   │   ├── operator.ts           # 运营台 API
│   │   ├── records.ts            # 出入记录 API
│   │   └── payment.ts            # 缴费 API
│   ├── session/
│   │   ├── storage.ts            # Session 存取
│   │   └── guards.ts             # Session 校验
│   ├── constants.ts              # 常量 & 路由表
│   └── utils.ts                  # cn() 等工具函数
│
├── types/
│   └── index.ts                  # 全局类型定义
│
├── mocks/                        # MSW Mock 层
│   ├── browser.ts                # MSW Worker 初始化
│   ├── data/                     # Mock 数据
│   └── handlers/                 # Mock 请求处理器
│
└── tests/                        # 测试
    ├── setup.ts
    ├── components/               # 组件测试
    ├── lib/api/                  # API 层测试
    ├── lib/session/              # Session 测试
    └── mocks/handlers/           # Mock Handler 测试
```

## 页面与功能

| 路由 | 页面 | 功能 |
|------|------|------|
| `/login` | 登录 | 账号密码登录、手机验证码登录、OAuth 三方登录 |
| `/tenant-management` | 租户管理 | 租户 CRUD、冻结/解冻、关联停车场查看 |
| `/parking-lot` | 停车场管理 | 停车场 CRUD、出入口车道配置 |
| `/device-management` | 设备管理 | 设备注册/绑定/解绑、批量操作、远程控制 |
| `/billing-rules` | 计费规则 | 按车场配置计费规则、费用计算器 |
| `/realtime-monitor` | 实时监控 | KPI 大屏、事件流、占用率面板、超时告警 (10s 轮询) |
| `/entry-exit-records` | 出入记录 | 筛选/导出记录、异常处理、详情查看 |
| `/operator-workspace` | 运营工作台 | 手动抬杆/收费/补录、异常队列、车辆搜索 (10s 轮询) |
| `/pay` | C 端缴费 | 车辆信息、费用明细、微信/支付宝支付 |

## 数据流

```
页面组件
  │
  ├── useXxx() hooks (TanStack Query)     ← 数据获取、缓存、轮询
  │     └── xxxService.xxx()              ← API 调用
  │           └── client / fetch          ← HTTP 请求
  │                 ├── camelCase 转换     ← 请求/响应自动转换
  │                 ├── Auth 拦截器        ← 自动注入 Bearer Token
  │                 └── Token 刷新         ← 401 自动刷新重试
  │
  ├── useForm (TanStack Form)             ← 表单状态管理
  │     └── zodSchema                     ← 表单校验
  │
  └── AuthContext                         ← 全局认证状态

Next.js Rewrites (开发代理):
  /identity/*  → localhost:9080/identity/*
  /tenant/*    → localhost:9080/tenant/*
  /parking/*   → localhost:9080/parking/*
  /api/v1/*    → localhost:9080/api/v1/*
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | API 基础 URL | 空 (走代理) |
| `API_PROXY_TARGET` | 后端代理目标 | `http://localhost:9080` |
| `API_PROXY_PRESERVE_SERVICE_PREFIX` | 保留服务前缀 | `true` |
| `NEXT_PUBLIC_ENABLE_MOCK` | 启用 MSW Mock | `false` |
| `NEXT_PUBLIC_MOCK_MODULES` | Mock 哪些模块 | 空 (全部) |

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test

# 监听模式测试
pnpm test:watch

# 代码检查
pnpm lint
```

## 测试

- **30 个测试文件，195 个测试用例**
- 覆盖：组件渲染、API 层、Zod Schema 校验、Session 存储、MSW Handler 行为
- 框架：Vitest 3 + @testing-library/react + happy-dom

## API 服务层

每个业务域一个 Service 模块 + 一个 TanStack Query hook 文件：

| 模块 | Service | Hook | 说明 |
|------|---------|------|------|
| 停车场 | `parking-lots.ts` | `use-parking-lots.ts` | CRUD、车道配置 |
| 设备 | `devices.ts` | `use-devices.ts` | 注册、绑定、批量操作、远程控制 |
| 租户 | `tenants.ts` | `use-tenants.ts` | CRUD、冻结/解冻 |
| 计费 | `billing.ts` | `use-billing.ts` | 规则配置、费用计算 |
| 监控 | `monitor.ts` | `use-monitor.ts` | 实时数据 (10s 自动刷新) |
| 运营台 | `operator.ts` | `use-operator.ts` | 事件、异常、操作 (10s 自动刷新) |
| 记录 | `records.ts` | `use-records.ts` | 列表、导出、异常处理 |
| 缴费 | `payment.ts` | `use-payment.ts` | 订单查询、支付 |
| 认证 | `auth.ts` | — | 登录、刷新、登出 |

## 组件库

### 通用组件 (`components/shared/`)

| 组件 | 说明 |
|------|------|
| `Modal` | 基于 Radix UI Dialog 的模态框 |
| `DataTable` | 基于 TanStack Table 的数据表格，支持排序、选择、分页 |
| `Pagination` | 分页控件 |
| `SearchInput` | 搜索输入框 |
| `StatCard` | 统计卡片 |
| `StatusBadge` | 状态标签 |
| `PageHeader` | 页面头部 (标题 + 操作按钮) |
| `LoadingSkeleton` | 加载骨架屏 |
| `EmptyState` | 空状态提示 |
| `ErrorState` | 错误状态提示 |

### 设计规范

- **颜色体系**：品牌色 `brand-600` (#2563eb) 为主色，灰阶 + 语义色 (emerald/red/amber) 为辅
- **圆角**：`rounded-lg` (8px) / `rounded-xl` (12px) / `rounded-2xl` (16px)
- **间距**：页面 padding `p-6`~`p-8`，卡片间距 `gap-4`~`gap-6`
- **阴影**：`shadow-sm` / `shadow-2xl`
- **动画**：Tailwind `animate-spin`、`animate-pulse`、`transition-all`

## 后端微服务

| 服务 | 前缀 | 说明 |
|------|------|------|
| Identity | `/identity/v1/` | 认证、用户管理 |
| Tenant | `/tenant/v1/` | 租户管理 |
| Parking | `/parking/v1/` | 停车场、设备、计费、记录 |
| Payment | `/api/v1/` | 支付 |
