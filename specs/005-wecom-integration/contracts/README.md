# API Contracts — 005-wecom-integration

本期新增**企业微信登录**相关接口，与现有 003 认证体系（JWT）一致；业务接口无变更。

## 005 相关接口范围

| 能力 | 方法/路径 | 说明 |
|------|-----------|------|
| **企微 code 换 JWT** | **POST /api/auth/wecom/login** | 请求体：`code`（企微授权回调得到的 code）、`state`（可选，防 CSRF 校验）。后端用 code 向企微换取 userid/姓名，创建或绑定 User 后签发 JWT，响应与现有登录一致（如 `token`、`user`）。 |
| **企微授权链接（可选由后端提供）** | **GET /api/auth/wecom/auth-url** | 可选：后端根据配置的 corpid、agentid、redirect_uri 生成企微 OAuth2 授权链接并返回，前端跳转；若前端自拼链接则可不提供此接口。 |

## 请求/响应约定（摘要）

### POST /api/auth/wecom/login

- **请求体**（JSON）  
  - `code`（必填，string）：企微授权回调 URL 中的 code 参数。  
  - `state`（可选，string）：发起授权时携带的 state，后端可校验与会话/缓存一致以防 CSRF。

- **响应**（200）  
  - 与现有 `POST /api/auth/login` 响应格式一致，例如：  
    `{ "token": "<JWT>", "user": { "id", "name", "avatar", "department", "position" } }`  
  - 前端将 token 写入 localStorage（与现有登录一致），并跳转首页。

- **错误**（4xx）  
  - 400：code 无效、已使用或企微返回错误；响应体 `{ "code": "BAD_REQUEST", "message": "授权失败，请重试" }` 等用户可读文案。  
  - 401：企微未返回有效用户身份等；`message` 明确提示，不暴露技术堆栈。

### 前端回调页与流程

- 企微授权后重定向到前端配置的 `redirect_uri`，例如：  
  `https://your-app/wecom-callback?code=CODE&state=STATE`  
- 前端该页（或登录页）从 URL 取出 `code`、`state`，调用 `POST /api/auth/wecom/login`，成功后写入 token 并跳转首页；失败则展示 `message` 并可重试或引导使用手机号登录。

## 契约格式

- 具体请求/响应体可与 003 的 `contracts/` 或 `openapi.yaml` 对齐；本期在 003 认证基础上增加上述路径即可。
- 前端 `api/auth.ts`（或等价）增加 `wecomLogin(code: string, state?: string)`，响应类型与现有 `LoginResponse` 一致。
