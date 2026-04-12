# Phase 1: 工程骨架与认证闭环

## 概述

将空仓库从 9 个静态 HTML 设计稿转变为可运行的 Next.js 应用，具备完整认证闭环、会话管理、路由守卫和 Dashboard 布局。

---

## Task 1: 项目脚手架搭建

- `pnpm create next-app` 初始化 Next.js App Router + TypeScript + Tailwind + ESLint
- shadcn/ui 初始化
- 安装核心依赖: msw, react-hook-form, @hookform/resolvers, zod, @tanstack/react-table, lucide-react
- 安装开发依赖: vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- 设计稿色板映射为 Tailwind CSS variables (brand-*, surface-*)

## Task 2: 目录结构与占位页面

建立完整 `src/` 目录结构，所有后台页面创建占位页。

## Task 3: 类型契约与 API 客户端

- types/index.ts + lib/api/contracts.ts — Auth, API response, Pagination 类型
- lib/api/client.ts — 基于 fetch 的 typed client
- lib/api/auth.ts — Auth 服务层

## Task 4: MSW 基础设施与认证 Mock

- mocks/browser.ts — setupWorker 配置
- mocks/data/users.ts — 演示用户数据
- mocks/handlers/auth.ts — 认证相关 handlers
- RootLayout 中条件性启动 MSW

## Task 5: Session 存储与认证上下文

- lib/session/storage.ts — localStorage/sessionStorage 持久化
- contexts/auth-context.tsx — AuthProvider + useAuth
- lib/session/guards.ts — 路由守卫工具

## Task 6: 登录页高保真还原

- 品牌展示区 + 表单区
- 账号密码表单 + 手机号验证码表单 + 第三方登录
- react-hook-form + zod 校验
- 密码明文/密文切换、记住登录状态

## Task 7: OAuth mock 页面

- (auth)/oauth/[provider]/page.tsx — mock 授权确认 UI

## Task 8: 路由守卫中间件

- src/middleware.ts — 保护后台路由，未登录重定向

## Task 9: Dashboard Layout 与导航

- Sidebar + TopBar + AppShell
- 导航分组 + 用户信息 + 退出按钮

## Task 10: 全局共享组件

- PageHeader, LoadingSkeleton, EmptyState, ErrorState, StatusBadge

## Task 11: Vitest 配置与基础测试

- 测试覆盖: session storage, auth service, MSW handlers, 登录表单, 共享组件

## 验收标准

- `pnpm dev` 启动正常，`/login` 高保真还原
- 三种登录方式均可用，登录后跳转后台
- 退出/未登录/记住登录状态均工作正常
- Dashboard 侧边栏导航可切换占位页
- `pnpm test` 全部通过
- `pnpm build` 无 TypeScript 错误
