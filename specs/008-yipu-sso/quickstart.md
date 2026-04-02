# Quickstart: 本地联调 epWorkApp SSO（易普圈）

## 1. 配置项（后端 `application.yml` / 环境变量）

| 配置键（建议） | 说明 |
|----------------|------|
| `app.epwork.sso.secret` | 与 epWorkApp `external.jump.secret` **相同**（仅环境变量注入） |
| `app.sso.frontend-callback-url` | 登录成功后 302 目标，如 `http://localhost:5173/sso/callback` |
| `app.sso.frontend-error-url` | （可选）验签失败时跳转 |
| `app.sso.allowed-source-cidrs` | （可选）来源 IP/CIDR 列表，空则跳过 |

已有 `app.jwt.secret` 继续用于 **易普圈自有 JWT**，与 epWorkApp 外链 secret **不是同一个**。

## 2. 数据库

执行 Flyway 迁移（实现任务中添加）创建：

- `epwork_sso_nonce`
- `epwork_sso_exchange_code`

## 3. Spring Security

在 `SecurityConfig` 中 **permitAll**：

- `/sso/**`（仅落地与静态错误页若需要）
- `POST /api/auth/sso/exchange`

其余 `/api/**` 仍为 JWT 保护。

## 4. 前端

1. 增加路由 **`/sso/callback`**：读取 `code`，`POST /api/auth/sso/exchange`，成功后 `setStoredToken`（`frontend/src/api/client.ts`）。
2. 开发环境：Vite `server.proxy` 已代理 `/api` 时，确保浏览器访问的 **落地 URL** 指向后端 host（由 epWorkApp 配置 `target-url`），例如 `http://localhost:8080/sso/login?token=...`。

## 5. 生成测试 token（无 epWorkApp 时）

按对接指南用同一 secret 构造 payload + HMAC-SHA256，拼成 `base64url(payload).base64url(sig)`。**不要**将完整 token 写入日志或提交仓库。

## 6. 验收顺序（与指南第 8 节对齐）

1. 有效 token → 302 → exchange → `GET /api/auth/me` 返回用户。
2. 过期 / 篡改 / 第二次相同 nonce → 拒绝。
3. 日志中搜索不到完整外链 token。

## 7. 「当前用户」API

- 轻量：`GET /api/auth/me` → `UserMeResponse`
- 个人中心：`GET /api/users/me` → `UserProfileDto`（统计字段依赖业务数据）

与密码登录成功后行为一致。
