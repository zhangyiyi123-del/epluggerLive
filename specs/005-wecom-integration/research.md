# Phase 0：企业微信对接研究与决策

**Feature**: 005-wecom-integration  
**Date**: 2025-03-12

## 1. 企微自建应用网页授权流程

### Decision

采用企业微信官方「构造网页授权链接」+「获取用户登录身份」流程：前端在企微内置浏览器内跳转至企微 OAuth2 授权链接，授权后重定向回易普圈并携带 `code` 与 `state`；后端用 `code` 换取 access_token（若未缓存）后调用「获取用户登录身份」得到成员 userid 等信息，再创建/绑定用户并签发 JWT。

### Rationale

- 与 spec 一致：易普圈为企业**自建应用**，使用企业 corpid + 自建应用 secret。
- 自建应用可用 `snsapi_base` 静默授权获取 userid，无需用户点击确认，体验更好；首期不申请敏感信息，故不采用 `snsapi_privateinfo`。
- 官方文档路径：构造网页授权链接（如 developer.work.weixin.qq.com/document/path/91120）、获取用户登录身份（如 path/98176）。

### Alternatives considered

- 第三方/服务商应用：需 suite_id、suite_secret 及多企业授权，与「仅本企业」不符，不采用。
- 仅前端持有 code 调易普圈后端「用 code 换 JWT」：采用；code 一次性且仅后端持有 secret，由后端统一换 userid 再签发 JWT，安全且与现有 JWT 体系一致。

---

## 2. 授权链接与回调安全

### Decision

- **redirect_uri**：必须与企微后台「应用可信域名」一致，且由后端或前端配置为易普圈前端地址（如 `https://your-domain/wecom-callback` 或 SPA 的登录回调路由），并在后端校验 redirect_uri 白名单，防止授权劫持。
- **state**：由前端或后端生成随机 state（如 UUID），授权回调时校验与发起时一致，防止 CSRF。
- **code**：仅在后端使用，不向前端业务页面暴露；前端回调页仅负责将 URL 中的 code/state 提交给后端（如 POST 到 `/api/auth/wecom/login`），由后端完成换 userid 与签发 JWT 后重定向到首页并写入 JWT（如 hash 或 cookie），或返回 JSON 供前端写入 localStorage。

### Rationale

企业微信要求 redirect_uri 与可信域名一致；state 防跨站请求伪造；code 一次性且敏感，仅后端与企微服务端通信使用。

### Alternatives considered

- 前端直接拿 code 调易普圈后端：采用；若由前端先调企微再拿 userid 会暴露 secret，故必须后端用 code 换 userid。

---

## 3. 前端运行环境检测

### Decision

采用 **User-Agent 检测** 为主、可选 **企微 JS-SDK** 为辅的方式判断是否在企微内置浏览器内：当 UA 包含企业微信相关标识（如 `wxwork`、`MicroMessenger` 且为企业微信）时，视为企微环境，走企微授权登录；否则直接展示手机号登录页，不发起企微授权请求。

### Rationale

- UA 检测无需引入额外 SDK，实现简单，与 spec「仅在企微内置浏览器内走企微授权」一致。
- 企微 JS-SDK 可提供更精确的环境与能力（如 jssdk 鉴权），可在后续需要时再引入；首期以 UA 为主即可满足「非企微环境直接手机号登录」的验收。

### Alternatives considered

- 仅用 JS-SDK：依赖企微 jssdk 加载与配置，首期略重；可后续增强。
- 不检测、任何环境都先跳企微授权：会导致在浏览器打开时无效跳转再回退，体验差，不采用。

---

## 4. 用户创建与绑定（首期）

### Decision

首期仅使用企微返回的 **userid**（及姓名等非敏感信息）创建或关联用户：后端用 code 换取「获取用户登录身份」返回的 userid、姓名等；若 `User` 表中已存在 `wecom_corp_id + wecom_user_id` 则视为已绑定用户并签发 JWT；若不存在则自动创建新用户并写入 wecom_corp_id、wecom_user_id、name 等，再签发 JWT。不申请企微手机号等敏感信息；后续若需账号合并再单独申请敏感信息接口。

### Rationale

与 spec 澄清一致：首期仅用 userid/姓名自动建号与绑定，不申请手机号；满足「首次从企微进入即用」且无需管理员预配置。

### Alternatives considered

- 首期即申请手机号用于与现有用户匹配：增加合规与审批成本，spec 已选「暂不需要」，不采用。

---

## 5. 依赖与风险

| 依赖 | 说明 |
|------|------|
| 企微自建应用已创建 | 企业管理员在企微后台创建自建应用、配置可信域名与回调地址、获取 agentid 与 secret。 |
| 易普圈后端可访问企微 API | 后端需能访问 `open.weixin.qq.com` 等企微域名，用于获取 token 与用户身份。 |
| redirect_uri 与可信域名一致 | 回调 URL 的域名必须在企微应用「可信域名」中，否则授权会失败。 |

| 风险 | 缓解 |
|------|------|
| code 被窃取重放 | code 一次性、短有效期；后端仅接受一次用 code 换 userid，换后即失效。 |
| state 未校验 | 后端或前端在回调时校验 state 与发起时一致，防 CSRF。 |
| UA 伪造 | 仅用于「是否走企微授权」的分流，不用于安全鉴权；最终身份由企微 code→userid 与后端 JWT 保证。 |
