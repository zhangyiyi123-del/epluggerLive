# API Contracts: epWorkApp SSO（易普圈侧）

本目录描述 **易普圈后端** 为承接 epWorkApp 跳转而暴露的接口；与《我的易普 SSO 对接指南》中 **epWorkApp 对外跳转接口**（`/api/external/jump/*`）互为上下游，**不在此重复**对方接口定义。

## 文件

- [openapi-sso.yaml](./openapi-sso.yaml)：机器可读契约（OpenAPI 3.0）。

## 与现有认证 API 的关系

- **不变**：`GET /api/auth/me`、`POST /api/auth/login`、`POST /api/auth/refresh` — 行为与响应模型保持现有实现。
- **新增**：`POST /api/auth/sso/exchange` — 响应体与登录成功一致（`LoginResponse`：`token` + 用户信息）。
- **新增**：浏览器入口 `GET /sso/login` — 非 JSON，返回 **302** 至前端回调页（详见 YAML 说明）。

## 前端依赖

- 回调路径：`/sso/callback`（SPA 路由），查询参数 `code`；调用 exchange 后写入 `ep_token`（与 `frontend/src/api/client.ts` 一致）。
