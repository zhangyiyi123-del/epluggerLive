# Phase 1: Quickstart — 本地运行与企微应用配置

**Feature**: 005-wecom-integration | **Date**: 2025-03-12

005 与 003/004 为同一系统，前后端结构不变。本地运行方式与 **003-refine-requirements**、**004-remaining-detail-features** 的 quickstart 一致；本节仅补充**企业微信自建应用**配置与回调说明。

## 前置要求（与 003 一致）

- Node.js 18+（前端）
- Java 17 或 21，Maven 或 Gradle（后端）
- MySQL 8.0+（后端）

## 前端与后端启动（同 003/004）

- **前端**：`cd frontend && npm install && npm run dev`；配置 `VITE_API_BASE_URL=http://localhost:8080`。
- **后端**：`cd backend && mvn spring-boot:run`（或 Gradle）；配置 MySQL、JWT 等（同 003）。

## 企业微信自建应用配置（用于企微工作台登录）

1. **创建自建应用**  
   企业管理员登录 [企业微信管理后台](https://work.weixin.qq.com/) → 应用管理 → 自建 → 创建应用，记录 **AgentId**、**Secret**；企业信息中记录 **CorpID**。

2. **配置可信域名**  
   在自建应用「网页授权及 JS-SDK」中配置 **可信域名**（如 `your-domain.com` 或本地开发时使用内网穿透域名，如 `xxx.ngrok.io`），且授权回调的 `redirect_uri` 必须落在该域名下。

3. **配置回调地址**  
   - 前端需提供一条「企微授权回调」路由（如 `/wecom-callback`），完整 redirect_uri 示例：`https://your-domain.com/wecom-callback`（与可信域名一致）。  
   - 该页从 URL 取 `code`、`state` 后调用后端 `POST /api/auth/wecom/login`，成功后写入 token 并跳转首页。

4. **后端配置**  
   在 `application.yml` 或环境中配置企微相关（不提交敏感信息到版本库）：  
   - `wecom.corp-id`：企业 CorpID  
   - `wecom.agent-id`：自建应用 AgentId  
   - `wecom.secret`：自建应用 Secret  
   - 可选：`wecom.redirect-uri` 用于后端校验或生成授权链接

## 005 对接后

- **登录页**：前端做运行环境检测；在企微内置浏览器内则跳转企微授权链接，授权后进入回调页并用 code 调 `POST /api/auth/wecom/login` 换取 JWT；非企微环境直接展示手机号+密码/验证码登录。
- **业务接口**：无变更，仍使用现有 JWT；企微登录与手机号登录签发同一形态 JWT。

详细后端与前端启动步骤、环境变量见 [003 quickstart](../003-refine-requirements/quickstart.md) 或 [004 quickstart](../004-remaining-detail-features/quickstart.md)。
