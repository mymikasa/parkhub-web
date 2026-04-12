# ParkHub 前端落地 PRD

## Problem Statement

`pages/` 目录下有 9 个静态 HTML 设计稿，覆盖智慧停车管理平台后台与 C 端缴费页。当前仓库尚未搭建 Next.js 工程，也没有可复用的组件、数据层、认证机制和测试体系。

本项目目标不是只做一套“能演示的静态壳子”，而是交付一套可持续演进的前端骨架：

- 基于设计稿完成高保真还原
- 所有页面具备完整 mock 交互，而非仅静态展示
- 数据层、类型、接口调用边界清晰，后续切换真实后端时尽量不改页面组件
- 认证、路由守卫、错误态、空态、加载态具备基础工程质量

## Product Goal

- 将 9 个设计稿页面落地为可运行的 Next.js App Router 应用
- 建立统一的布局系统、组件抽象和页面路由
- 建立“页面 -> 应用服务 -> API 客户端”的前端分层
- 使用完整 mock API 和 mock 数据覆盖核心交互流程
- 以一个超级账号串联全部后台页面，保证产品演示和开发联调路径简单

## Non-Goals

- 不实现真实后端、数据库、短信、支付或第三方 OAuth 集成
- 不在本阶段引入正式 RBAC 权限系统
- 不追求 SSR 优先或 BFF 复杂编排，核心目标是稳定前端架构和后续接后端的低成本迁移

## Solution

使用 Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui 搭建工程。整体采用“前端页面消费统一 API 契约”的方案：

- 页面和业务组件不直接依赖 mock 数据
- 所有业务读写都通过 `src/lib/api` 中的 typed client / service 完成
- 开发和测试环境由 MSW 拦截 `/api/*` 请求返回 mock 数据
- 后续接真实后端时，优先替换 API base URL、请求适配和字段映射层，而不是改页面组件

认证采用完整 mock 闭环：

- 支持账号密码登录
- 支持手机号验证码登录
- 支持微信/QQ 第三方登录的 mock 重定向与回跳
- 支持“记住登录状态”
- 支持路由守卫与登录态恢复

后台默认只有一个超级账号。业务上的“超级管理员 / 租户管理员 / 运维 / 运营 / 前线操作员”只作为页面语义和场景标签存在，不做真实权限隔离；该账号可访问全部后台模块，便于演示和开发。

## 设计稿总览

| 页面文件 | 核心功能 | 布局类型 |
|---------|---------|---------|
| login.html | 账号/手机号登录、第三方登录 | 独立（无侧边栏） |
| tenant-management.html | 租户 CRUD、统计卡片、分页表格 | Dashboard |
| parking-lot.html | 停车场卡片网格、车道/闸机配置 | Dashboard |
| device-management.html | 设备表格、在线状态、远程控制 | Dashboard |
| billing-rules.html | 计费规则配置、费用模拟计算器 | Dashboard |
| realtime-monitor.html | 实时大屏、KPI 卡片、事件流、占用率 | Dashboard |
| entry-exit-records.html | 出入记录查询、异常处理 | Dashboard |
| operator-workspace.html | 操作员快捷操作、异常队列、车辆查询 | Dashboard |
| payment.html | C 端缴费页 | 独立（移动端） |

## Demo Account Strategy

- 后台仅提供一个超级账号用于演示全部模块
- 登录成功后默认进入 `/tenant-management`
- 顶部用户信息固定展示超级账号身份
- 不做页面级拦截差异，只在文案和数据语义上保留不同业务角色视角
- C 端缴费页无需登录，可通过独立路由直接访问

建议在 mock 中固定一组演示凭据：

- 账号密码登录：`admin@parkhub.test` / `ParkHub123`
- 手机号登录：`13800000000` + 固定验证码 `123456`
- 微信 / QQ 登录：点击后进入 mock 授权确认页，再回跳到后台首页

## User Stories

### 认证

1. As a 平台用户, I want 通过账号密码登录系统, so that 我可以访问管理后台
2. As a 平台用户, I want 通过手机号 + 验证码登录系统, so that 我可以免密码快速登录
3. As a 平台用户, I want 切换密码明文/密文显示, so that 我可以确认输入的密码是否正确
4. As a 平台用户, I want 勾选"记住登录状态", so that 下次访问无需重新登录
5. As a 平台用户, I want 通过微信/QQ第三方登录, so that 我可以使用已有账号快速登录

### 租户管理

6. As a 超级管理员, I want 查看所有租户列表及统计概览, so that 我可以了解平台运营概况
7. As a 超级管理员, I want 按状态（全部/活跃/冻结）筛选租户, so that 我可以快速定位目标租户
8. As a 超级管理员, I want 搜索租户, so that 我可以按名称快速查找
9. As a 超级管理员, I want 创建新租户并填写企业信息, so that 新客户可以接入平台
10. As a 超级管理员, I want 编辑/冻结/解冻租户, so that 我可以管理租户生命周期
11. As a 超级管理员, I want 查看租户下的停车场列表, so that 我可以了解租户资源

### 停车场管理

12. As a 租户管理员, I want 查看当前租户所有停车场的统计概览, so that 我可以掌握整体运营数据
13. As a 租户管理员, I want 以卡片形式浏览所有停车场, so that 我可以直观看到各场占用情况
14. As a 租户管理员, I want 创建新停车场并配置基本信息, so that 新车场可以接入管理
15. As a 租户管理员, I want 配置停车场的出入口及绑定设备, so that 车辆可以正常进出
16. As a 租户管理员, I want 看到占用率颜色变化（绿/黄/红）, so that 我可以快速判断拥挤程度

### 设备管理

17. As a 运维人员, I want 查看设备统计（总数/在线/离线/日吞吐量）, so that 我可以评估设备健康度
18. As a 运维人员, I want 按状态和停车场筛选设备, so that 我可以快速定位目标设备
19. As a 运维人员, I want 注册新设备到指定停车场和车道, so that 设备可以投入使用
20. As a 运维人员, I want 远程控制道闸（抬杆/落杆）, so that 我可以处理现场异常
21. As a 运维人员, I want 看到离线设备告警横幅, so that 我可以及时处理故障

### 计费规则

22. As a 租户管理员, I want 从左侧列表选择停车场, so that 我可以管理该车场的计费规则
23. As a 租户管理员, I want 查看/编辑免费时长、单价、每日封顶金额, so that 我可以灵活配置收费标准
24. As a 租户管理员, I want 通过滑块和数字输入双控件调整参数, so that 我可以精确或快速设置
25. As a 租户管理员, I want 设置"不限封顶"开关, so that 24小时最大收费可灵活控制
26. As a 租户管理员, I want 切换计费周期（按小时/按半小时）, so that 收费粒度可调整
27. As a 租户管理员, I want 使用费用模拟计算器预估停车费, so that 我可以验证计费规则是否合理

### 实时监控

28. As a 运营人员, I want 查看今日 KPI（进场/出场/在场/收入）, so that 我可以掌握实时运营数据
29. As a 运营人员, I want 查看实时进出事件流, so that 我可以监控车辆动态
30. As a 运营人员, I want 查看各停车场占用率进度条, so that 我可以评估各场饱和度
31. As a 运营人员, I want 查看长时间停放告警列表, so that 我可以关注异常滞留车辆
32. As a 运营人员, I want 看到实时时钟和在线状态指示, so that 我可以确认系统运行正常

### 出入记录

33. As a 运营人员, I want 按日期/车牌/车场/类型/状态多条件查询出入记录, so that 我可以精准定位目标记录
34. As a 运营人员, I want 看到未处理异常数量告警, so that 我不会遗漏待处理事项
35. As a 运营人员, I want 查看记录详情（含抓拍图片）, so that 我可以核实进出信息
36. As a 运营人员, I want 处理异常记录（修正车牌/备注）, so that 我可以修正识别错误
37. As a 运营人员, I want 导出记录数据, so that 我可以离线分析或存档

### 操作员工作台

38. As a 前线操作员, I want 快速执行手动抬杆/手动收费/车牌更正/异常处理, so that 我可以应对现场突发状况
39. As a 前线操作员, I want 查看异常队列并逐条处理, so that 我可以有序解决识别失败等问题
40. As a 前线操作员, I want 按车牌查询在场车辆及预估费用, so that 我可以快速回答车主疑问
41. As a 前线操作员, I want 在侧边栏看到实时事件推送, so that 我可以及时掌握动态

### C端缴费

42. As a 车主, I want 在手机上查看停车费用明细, so that 我可以了解收费依据
43. As a 车主, I want 通过微信/支付宝扫码缴费, so that 我可以便捷完成支付
44. As a 车主, I want 缴费成功后看到15分钟出场提醒, so that 我可以及时驶离

## Implementation Decisions

### 技术栈

- **框架**: Next.js 14+ App Router, TypeScript strict mode
- **样式**: Tailwind CSS + CSS Variables
- **组件**: shadcn/ui + 设计稿定制组件
- **状态管理**: React Context 仅承载全局会话和少量全局筛选状态
- **数据请求**: 统一使用 `src/lib/api` 中的 typed fetch client + service layer
- **Mock**: MSW 在 `development` 和测试环境拦截 `/api/*` 请求
- **表单**: react-hook-form + zod
- **表格**: tanstack-table 用于复杂列表页
- **测试**: Vitest + React Testing Library

### 数据与分层原则

为确保后续可无缝接后端，页面层必须依赖稳定的前端接口，而不是直接读写 mock 数据：

1. 页面组件只调用 `services`
2. `services` 负责业务语义封装和参数整理
3. `api client` 负责请求、响应解析、错误归一化
4. `types/contracts` 负责请求与响应类型
5. `mocks/handlers` 仅实现同一套 API contract

结论：

- 不把核心 CRUD 建立在 Server Actions 上
- 不让页面组件直接 import mock JSON
- 后续接真实后端时，页面层原则上零改动，主要替换请求地址、鉴权注入和字段映射

### 认证与会话设计

- 登录态使用浏览器可持久化存储保存 mock session
- `remember me = true` 时使用长期持久化；否则使用会话级持久化
- 根布局初始化时恢复 session，并拉取当前用户信息
- 通过 `middleware` 或 dashboard layout 中的守卫逻辑保护后台路由
- 未登录访问后台时统一跳转 `/login`
- 登录成功后统一跳转 `/tenant-management`
- 退出登录后清理会话并返回 `/login`

第三方登录 mock 规则：

- 点击微信 / QQ 登录后进入本地 mock 授权页
- 用户确认授权后生成 session 并回跳后台
- 不接入真实 OAuth provider，但前端路由结构预留 callback 形式

### 目录结构

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── oauth/[provider]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── tenant-management/page.tsx
│   │   ├── parking-lot/page.tsx
│   │   ├── device-management/page.tsx
│   │   ├── billing-rules/page.tsx
│   │   ├── realtime-monitor/page.tsx
│   │   ├── entry-exit-records/page.tsx
│   │   └── operator-workspace/page.tsx
│   ├── (payment)/
│   │   └── pay/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── shared/
│   ├── login/
│   ├── tenant-management/
│   ├── parking-lot/
│   ├── device-management/
│   ├── billing-rules/
│   ├── realtime-monitor/
│   ├── entry-exit-records/
│   ├── operator-workspace/
│   └── payment/
├── contexts/
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── contracts.ts
│   │   ├── auth.ts
│   │   ├── tenants.ts
│   │   ├── parking-lots.ts
│   │   ├── devices.ts
│   │   ├── billing.ts
│   │   ├── monitor.ts
│   │   ├── records.ts
│   │   ├── operator.ts
│   │   └── payment.ts
│   ├── session/
│   │   ├── storage.ts
│   │   └── guards.ts
│   ├── utils.ts
│   └── constants.ts
├── mocks/
│   ├── handlers/
│   ├── data/
│   ├── browser.ts
│   └── scenarios.ts
└── types/
```

### 路由规划

| 路由 | 页面 | 布局 |
|------|------|------|
| `/login` | 登录页 | 无侧边栏 |
| `/oauth/wechat` | 微信授权 mock 页 | 无侧边栏 |
| `/oauth/qq` | QQ 授权 mock 页 | 无侧边栏 |
| `/tenant-management` | 租户管理 | Dashboard |
| `/parking-lot` | 停车场管理 | Dashboard |
| `/device-management` | 设备管理 | Dashboard |
| `/billing-rules` | 计费规则 | Dashboard |
| `/realtime-monitor` | 实时监控 | Dashboard |
| `/entry-exit-records` | 出入记录 | Dashboard |
| `/operator-workspace` | 操作员工作台 | Dashboard |
| `/pay` | C 端缴费 | 独立移动布局 |

### 共享组件抽象

1. **AppShell**: 侧边栏 + 顶栏布局骨架
2. **Sidebar**: 固定左侧导航与用户信息
3. **PageHeader**: 页面标题、副标题、操作区
4. **StatCard**: 统计卡片
5. **DataTable**: 支持筛选、排序、分页的通用表格
6. **StatusBadge**: 状态标签
7. **Modal**: 通用模态框
8. **Pagination**: 分页控件
9. **SearchInput**: 搜索输入框
10. **EmptyState**: 空数据展示
11. **ErrorState**: 错误展示与重试
12. **LoadingSkeleton**: 列表和卡片骨架屏

### MSW Mock API 设计

按 RESTful 风格定义前后端契约。所有页面交互必须落在下表接口范围内：

| Method | Path | 描述 |
|--------|------|------|
| POST | `/api/auth/login` | 账号密码登录 |
| POST | `/api/auth/sms/send` | 发送验证码 |
| POST | `/api/auth/sms/login` | 手机验证码登录 |
| GET | `/api/auth/oauth/:provider` | 获取第三方登录 mock 跳转信息 |
| POST | `/api/auth/oauth/:provider/callback` | 第三方登录回跳换取 session |
| GET | `/api/auth/me` | 获取当前登录用户 |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/tenants` | 租户列表、搜索、状态筛选、分页 |
| POST | `/api/tenants` | 创建租户 |
| PATCH | `/api/tenants/:id` | 更新租户 |
| POST | `/api/tenants/:id/freeze` | 冻结租户 |
| POST | `/api/tenants/:id/unfreeze` | 解冻租户 |
| GET | `/api/tenants/:id/parking-lots` | 查看租户下停车场 |
| GET | `/api/parking-lots` | 停车场列表、统计 |
| POST | `/api/parking-lots` | 创建停车场 |
| PATCH | `/api/parking-lots/:id` | 更新停车场基本信息 |
| PUT | `/api/parking-lots/:id/lanes` | 更新车道与设备绑定 |
| GET | `/api/devices` | 设备列表、筛选、分页 |
| POST | `/api/devices` | 注册设备 |
| POST | `/api/devices/:id/command` | 远程控制指令 |
| GET | `/api/billing-rules` | 按停车场查询计费规则 |
| PUT | `/api/billing-rules/:id` | 更新计费规则 |
| POST | `/api/billing-rules/calculate` | 费用模拟计算 |
| GET | `/api/monitor/realtime` | 实时大盘数据 |
| GET | `/api/monitor/events` | 实时事件流 |
| GET | `/api/records` | 出入记录列表、筛选、分页 |
| GET | `/api/records/summary` | 异常数量统计 |
| GET | `/api/records/:id` | 出入记录详情与抓拍图 |
| PATCH | `/api/records/:id/exception` | 处理异常 |
| GET | `/api/records/export` | 导出记录 |
| GET | `/api/operator/events` | 操作员事件流 |
| GET | `/api/operator/exceptions` | 异常队列 |
| POST | `/api/operator/actions/lift-barrier` | 手动抬杆 |
| POST | `/api/operator/actions/manual-charge` | 手动收费 |
| POST | `/api/operator/actions/correct-plate` | 车牌更正 |
| GET | `/api/operator/vehicles/search` | 在场车辆与预估费用查询 |
| GET | `/api/payment/orders/:id` | 缴费单详情 |
| POST | `/api/payment/pay` | 发起 mock 支付 |
| GET | `/api/payment/pay/:id/status` | 查询支付状态 |

## Delivery Scope and Acceptance

### 全局验收标准

- 9 个设计稿页面均完成路由落地
- 所有主操作具备完整交互闭环：打开表单、输入、校验、提交、成功反馈、列表刷新
- 所有列表页具备加载态、空态、错误态
- 后台未登录不可访问，刷新后可恢复登录态
- 所有数据均来自统一 API 契约，不允许页面硬编码业务 JSON
- `pnpm test` 至少覆盖共享组件、登录流程、核心 service、核心 mock handlers

### 页面级最低验收标准

| 页面 | 最低验收标准 |
|------|-------------|
| 登录页 | 支持账号密码、手机验证码、第三方登录 mock、记住登录状态、错误提示 |
| 租户管理 | 支持列表、搜索、状态筛选、分页、创建、编辑、冻结/解冻、查看租户停车场 |
| 停车场管理 | 支持统计卡片、卡片列表、创建停车场、车道设备配置、占用率颜色反馈 |
| 设备管理 | 支持列表筛选、分页、注册设备、远程控制、离线告警 |
| 计费规则 | 支持按车场切换、规则编辑、双控件输入、封顶开关、费用计算 |
| 实时监控 | 支持 KPI、事件流、占用率、长停告警、时钟和在线状态 |
| 出入记录 | 支持多条件筛选、异常数提示、详情弹窗、异常处理、导出 |
| 操作员工作台 | 支持快捷操作、异常队列、车牌搜索、预估费用、事件流侧栏 |
| C 端缴费 | 支持订单详情、支付发起、成功态、15 分钟离场提醒 |

## Vertical Slice Plan

### Phase 1: 工程骨架与认证闭环

- 初始化 Next.js、Tailwind、shadcn/ui、Vitest、MSW
- 建立 `src/lib/api`、`types/contracts`、`mocks/handlers` 基础结构
- 完成登录页与 OAuth mock 页
- 完成 session 存储、登录态恢复、路由守卫
- 完成 dashboard layout、导航、全局 loading/error/empty 组件

### Phase 2: 第一个业务切片

- 落地停车场管理页
- 完成 StatCard、PageHeader、StatusBadge、Modal、Pagination
- 打通停车场列表、创建、车道配置完整交互

### Phase 3: 表格与复杂交互切片

- 落地出入记录页
- 落地设备管理页
- 完成 DataTable、筛选栏、详情与操作弹窗
- 打通分页、筛选、远程控制、异常处理、导出

### Phase 4: 配置与主数据切片

- 落地租户管理页
- 落地计费规则页
- 打通 CRUD、冻结/解冻、规则编辑、费用模拟

### Phase 5: 实时页面切片

- 落地实时监控页
- 落地操作员工作台
- 使用轮询模拟实时刷新

### Phase 6: C 端与收尾

- 落地 C 端缴费页
- 完成支付成功态与离场提醒
- 完成响应式验证、无障碍基础检查和测试补齐

## Testing Decisions

- **测试框架**: Vitest + React Testing Library
- **组件测试重点**: AppShell、StatCard、DataTable、Modal、StatusBadge、Pagination、ErrorState、LoadingSkeleton
- **流程测试重点**: 登录与登出、记住登录状态、路由守卫、停车场创建、出入记录异常处理、支付成功态
- **服务层测试**: `src/lib/api` 请求封装、参数拼装、错误归一化
- **MSW handler 测试**: 每类 handler 的请求/响应与异常分支
- **不测试**: 纯视觉还原细节、第三方库内部实现
- **良好测试标准**: 测试用户行为和业务结果，不测试内部 state 细节

## Out of Scope

- 真实后端 API 和数据库
- 真实支付集成（微信 / 支付宝）
- 真实短信发送
- 真实第三方 OAuth 对接
- 正式 RBAC 权限系统
- WebSocket 实时推送
- 国际化（i18n）
- PWA / 离线支持
- E2E 测试
- CI/CD 流水线
- 部署配置

## Further Notes

- 设计稿中的统一色板应映射为 CSS variables，避免颜色常量散落在组件中
- `payment.html` 为独立移动端页面，不复用后台侧边栏布局
- 实时监控和操作员工作台前期使用 `setInterval` 或轮询 hook 模拟实时性
- 如果未来后端接口字段与 mock contract 不一致，优先在 `service` 或映射层收口，不直接改页面组件
