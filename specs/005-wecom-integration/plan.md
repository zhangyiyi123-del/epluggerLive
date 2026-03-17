# Implementation Plan: 易普圈与企业微信工作台对接

**Branch**: `005-wecom-integration` | **Date**: 2025-03-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/005-wecom-integration/spec.md`。技术栈与 **003-refine-requirements/plan.md** 保持一致。

## Summary

在现有易普圈（前端 React + 后端 Spring Boot + MySQL，JWT 登录）基础上，增加**企业微信工作台**登录入口：员工从企微工作台打开易普圈时，通过企微自建应用网页授权完成身份校验，后端用 code 换取成员 userid/姓名、自动创建或关联用户并签发 JWT，实现免密登录。非企微环境保留手机号+密码/验证码登录；前端做运行环境检测，仅在企微内置浏览器内走企微授权。首期不申请企微手机号等敏感信息。

## Technical Context

与 **003-refine-requirements** 及 **004-remaining-detail-features** 保持一致，本期不引入新技术栈；仅增加企微 HTTP 调用与前端环境检测逻辑。

### Frontend（已存在，本期扩展）

| 项 | 选型 |
|----|------|
| **Language/Version** | TypeScript 5.x，React 18 |
| **Primary Dependencies** | Vite，React Router DOM v6，Lucide React |
| **Storage** | 登录态 localStorage + JWT |
| **Testing** | 待补充（Vitest/Jest + 组件/集成测试） |
| **Target Platform** | 移动端 Web（浏览器、企微内置浏览器） |
| **Project Type** | SPA |
| **Constraints** | 与宪章一致；本期增加运行环境检测（UA 或企微 JS-SDK）、登录入口分流（企微授权 vs 手机号） |

### Backend（与 003 同一服务，本期扩展）

| 项 | 选型 |
|----|------|
| **Framework** | Spring Boot 3.x |
| **Language/Version** | Java 17 或 21（LTS） |
| **Primary Dependencies** | Spring Web（REST），Spring Security + JWT，Spring Data JPA，MySQL 驱动；本期增加企微 API 调用（HTTP 客户端，如 RestTemplate/WebClient） |
| **Storage** | MySQL；用户表增加企微 corpid、userid 等绑定字段（见 data-model.md） |
| **Testing** | JUnit 5，Spring Boot Test，MockMvc/TestRestTemplate；企微登录流程可单元/集成测试 |
| **Target Platform** | Linux 服务器（容器化部署优先） |
| **Project Type** | Web 服务（REST API） |
| **Performance Goals** | 企微授权通过后 5 秒内进入首页（SC-001）；code 换 JWT 接口 p95 &lt; 2s |
| **Constraints** | 无状态；JWT 认证不变；企微自建应用（corpid + 自建 secret）；redirect_uri/state 校验防劫持 |
| **Scale/Scope** | 与 003 一致，企业内千～万级用户；本期新增企微登录入口与用户绑定表扩展 |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 宪章原则 | 符合性 |
|----------|--------|
| **一、代码质量** | 后端企微登录模块与现有 Auth/User 边界清晰；前端登录入口与环境检测可维护；Lint/格式化通过。 |
| **二、测试标准** | 企微 code 换用户身份与 JWT 签发逻辑具备可自动化测试；契约与 003 风格一致。 |
| **三、用户体验一致性** | 企微内免密、非企微手机号登录，错误提示明确，不暴露技术堆栈。 |
| **四、性能要求** | 企微授权与 code 换 JWT 满足 SC-001（5 秒内进入首页）；接口超时与重试在实现中落实。 |
| **附加约束** | 技术栈与 003 一致；安全：redirect_uri/state 校验、不向前端暴露 code；最小必要数据（首期不申请企微手机号）。 |

**结论**：无违反项，无需填写 Complexity Tracking。

## Project Structure

### Documentation (this feature)

```text
specs/005-wecom-integration/
├── plan.md              # 本文件
├── research.md          # Phase 0：企微自建应用授权流程与安全、前端环境检测
├── data-model.md        # Phase 1：用户表企微绑定字段与流程
├── quickstart.md        # Phase 1：本地运行与企微应用配置说明
├── contracts/           # Phase 1：企微登录回调/用 code 换 JWT 的 API 契约
└── tasks.md             # Phase 2：由 /speckit.tasks 生成
```

### Source Code (repository root)

与 003/004 相同；本期仅扩展以下路径：

```text
frontend/
├── src/
│   ├── api/             # 增加企微登录相关（如 getWecomAuthUrl、exchangeCodeForToken）
│   ├── pages/           # 登录页：环境检测 + 分流（企微授权跳转 vs 手机号表单）
│   └── ...

backend/
├── src/main/java/com/eplugger/
│   ├── config/          # 可增加企微 corpid、agentid、secret 等配置（或 application.yml）
│   ├── domain/          # User 实体增加 wecomCorpId、wecomUserId 等（见 data-model）
│   ├── repository/      # UserRepository 已有，可增加 findByWecomCorpIdAndWecomUserId
│   ├── service/         # 新增或扩展：WecomAuthService（换 code、创建/绑定用户、签发 JWT）
│   ├── web/             # 新增：企微登录回调或 GET/POST 用 code 换 JWT 的端点
│   └── security/        # 现有 JWT 过滤不变；新登录入口签发同一形态 JWT
└── src/main/resources/
    └── db/migration/    # Flyway：user 表增加企微绑定字段（若尚未存在）
```

**Structure Decision**：沿用现有「前端 + 后端」分离结构。企微对接为**新增登录入口**，与现有手机号登录并存；业务接口仍仅依赖 JWT，无需改动。

## Phases Overview

| Phase | 产出 | 说明 |
|-------|------|------|
| **Phase 0** | research.md | 企微自建应用网页授权与「获取访问用户身份」流程、redirect_uri/state 安全、前端环境检测方式（UA vs JS-SDK）。 |
| **Phase 1** | data-model.md, contracts/, quickstart.md | 用户表企微绑定字段；用 code 换 JWT 的 API 契约；本地与企微应用配置步骤。 |
| **Phase 2** | tasks.md | 由 `/speckit.tasks` 根据本计划与 spec 拆解可执行任务。 |

## Implementation Notes

- **企微自建应用**：使用企业 corpid + 自建应用 secret；授权链接与「获取访问用户身份」接口以企微自建应用文档为准（如构造 OAuth2 授权 URL、code 一次性、redirect_uri 白名单）。
- **用户绑定**：首次从企微进入时，仅凭 userid/姓名自动创建用户并写入 wecom_corp_id、wecom_user_id 等绑定字段；首期不申请手机号等敏感信息。
- **安全**：后端校验 redirect_uri 与 state，防止授权劫持；前端不向用户展示 code；JWT 签发与现有密码登录一致，业务接口无变更。
- **前端环境检测**：仅在判定为企微内置浏览器时跳转企微授权；非企微环境直接展示手机号登录页，不发起企微授权请求。
- **非企微登录**：保留现有手机号+密码/验证码登录（FR-004），与企微登录并存。

## Complexity Tracking

无需填写（Constitution Check 无违反项）。
