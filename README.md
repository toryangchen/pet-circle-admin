# Pet Circle Admin

`pet-circle-admin` 是「宠友圈」运营管理后台，服务于内容审核、已上线内容管理和用户信息查看。

当前技术栈：

- React 19 + TypeScript
- Vite
- Ant Design
- React Router
- Axios
- Vitest + Testing Library

## 已实现页面

- `/login`：管理员登录
- `/reviews`：待审核内容列表
- `/reviews/:postId`：审核详情
- `/online`：已上线内容列表
- `/online/:postId`：已上线内容详情/下架入口
- `/users`：用户列表
- `/users/:userId`：用户详情

## 已实现能力

- 管理员登录态本地存储
- 请求自动携带 `Authorization: Bearer <token>`
- 401 后自动清理登录态
- 受保护后台布局
- 待审核列表分页与筛选
- 内容详情查看
- 审核通过
- 审核拒绝并填写原因
- 已上线内容下架
- 用户列表与用户详情
- 页面级测试覆盖登录、审核流程等关键路径

## 本地启动

1. 启动后端服务

```bash
cd ../pet-circle-server
npm run start:dev
```

2. 启动后台前端

```bash
npm install
npm run dev
```

默认后端 API 地址为 `http://127.0.0.1:3000/api`。如需连接其他环境，设置环境变量：

```bash
VITE_API_BASE_URL=https://your-api-host/api npm run dev
```

## 常用命令

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

## 接口依赖

管理后台依赖 `pet-circle-server` 的 admin API：

- `POST /api/admin/auth/login`
- `POST /api/admin/reviews/pending`
- `POST /api/admin/reviews/:postId`
- `POST /api/admin/reviews/:postId/approve`
- `POST /api/admin/reviews/:postId/reject`
- `POST /api/admin/reviews/:postId/offline`
- `POST /api/admin/posts/online`
- `POST /api/admin/users`
- `POST /api/admin/users/:id`
