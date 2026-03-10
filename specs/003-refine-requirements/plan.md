# Implementation Plan: EPlugger 需求完善（前端已有，后端 Spring Boot + MySQL）

**Branch**: `003-refine-requirements` | **Date**: 2025-03-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-refine-requirements/spec.md`

## Summary

实现 EPlugger 正向激励社区完整业务能力：登录与访问控制、运动打卡、正向行为打卡、圈子社交、积分体系、个人中心。**前端已存在**（React 18 + TypeScript + Vite，Mock 数据），本期以**后端 Spring Boot + MySQL** 提供 REST API 与持久化，替换前端 Mock，使六大用户故事可端到端验收。

## Technical Context

### Frontend（已存在，仅对接 API）

| 项 | 选型 |
|----|------|
| **Language/Version** | TypeScript 5.x，React 18 |
| **Primary Dependencies** | Vite，React Router DOM v6，Lucide React |
| **Storage** | 无服务端存储；登录态当前 localStorage，后续可改为 JWT |
| **Testing** | 待补充（Vitest/Jest + 组件/集成测试） |
| **Target Platform** | 移动端 Web（浏览器） |
| **Project Type** | SPA（Single Page Application） |
| **Constraints** | 与宪章一致：Lint/格式化、设计系统复用、关键路径性能预算、分页/按需加载 |

### Backend（本期新建）

| 项 | 选型 |
|----|------|
| **Framework** | **Spring Boot 3.x**（Web、安全、数据访问一体化） |
| **Language/Version** | Java 17 或 21（LTS） |
| **Primary Dependencies** | Spring Web（REST），Spring Security + JWT，Spring Data JPA，MySQL 驱动 |
| **Storage** | **MySQL**（关系型数据库）；文件/对象存储用于图片与佐证（本地磁盘或 OSS/S3） |
| **Testing** | JUnit 5，Spring Boot Test，MockMvc/TestRestTemplate；契约测试（如 OpenAPI 驱动） |
| **Target Platform** | Linux 服务器（容器化部署优先） |
| **Project Type** | Web 服务（REST API） |
| **Performance Goals** | 列表接口 p95 &lt; 500ms；登录/打卡/发布/兑换等写操作 p95 &lt; 1s；满足 SC-004（3 秒内界面反映） |
| **Constraints** | 无状态服务；认证采用 JWT；与宪章一致：核心逻辑与契约有自动化测试、接口权限与审计约定 |
| **Scale/Scope** | 企业内使用，用户量级千～万；实体：用户、运动/正向打卡、动态、评论、积分/等级/勋章、消息、商品/订单 |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 宪章原则 | 符合性 |
|----------|--------|
| **一、代码质量** | 后端 Java 模块与 API 边界清晰；命名与目录可维护；Lint/格式化通过。 |
| **二、测试标准** | 核心业务逻辑与 REST 契约具备可自动化测试；契约变更同步测试。 |
| **三、用户体验一致性** | 前端已按现有设计系统实现；后端仅提供数据与接口，不改变交互模式。 |
| **四、性能要求** | 列表分页、接口超时与重试策略在计划与实现中落实；满足成功标准中的时间指标。 |
| **附加约束** | 前端技术栈与现有 `frontend` 一致；安全与合规：最小必要数据、接口权限与审计约定。 |

**结论**：无违反项，无需填写 Complexity Tracking。

## Project Structure

### Documentation (this feature)

```text
specs/003-refine-requirements/
├── plan.md              # 本文件
├── research.md          # Phase 0：技术选型与风险摘要
├── data-model.md        # Phase 1：领域模型与表结构摘要
├── quickstart.md        # Phase 1：后端与前端本地运行说明
├── contracts/           # Phase 1：API 契约（OpenAPI 或等价）
└── tasks.md             # Phase 2：由 /speckit.tasks 生成
```

### Source Code (repository root)

```text
frontend/                    # 已存在，本期仅改 API 对接
├── src/
│   ├── components/          # 打卡、圈子、积分、正向等组件
│   ├── pages/               # 页面组件
│   ├── types/               # TS 类型与 Mock（逐步替换为 API 类型）
│   └── ...
├── package.json
└── ...

backend/                     # 本期新建，Spring Boot + MySQL
├── src/
│   └── main/
│       ├── java/
│       │   └── com/eplugger/   # 或项目约定包名
│       │       ├── EpluggerApplication.java
│       │       ├── config/      # 安全、CORS、JWT、DataSource 等
│       │       ├── domain/     # JPA 实体与聚合
│       │       ├── repository/ # Spring Data JPA Repository
│       │       ├── service/    # 业务逻辑
│       │       ├── web/        # REST 控制器、DTO、异常处理
│       │       └── security/   # 认证、权限、审计
│       └── resources/
│           ├── application.yml # 含 MySQL 连接、JWT、文件上传等
│           └── db/migration/   # Flyway/Liquibase 迁移脚本（推荐）
└── pom.xml 或 build.gradle    # Spring Boot + MySQL 依赖
└── src/test/
    ├── java/
    │   ├── contract/       # 契约测试（可选）
    │   ├── integration/    # 集成测试
    │   └── unit/           # 单元测试
    └── resources/
```

**Structure Decision**: 采用「前端 + 后端」分离结构。`frontend/` 已存在且技术栈符合宪章；`backend/` 新建 **Spring Boot** 服务，持久化使用 **MySQL**，与前端通过 REST + JWT 对接，便于独立部署与测试。

## Phases Overview

| Phase | 产出 | 说明 |
|-------|------|------|
| **Phase 0** | research.md | 后端技术选型（Java 版本、框架、DB、存储）、风险与依赖。 |
| **Phase 1** | data-model.md, quickstart.md, contracts/ | 领域模型与表结构；本地启动步骤；API 契约（与前端 types 对齐）。 |
| **Phase 2** | tasks.md | 由 `/speckit.tasks` 根据本计划与 spec 拆解可执行任务。 |

## Implementation Notes

- **API 契约**：后端接口需与前端现有 `frontend/src/types/` 中的类型与 Mock 调用方式对齐（如用户、打卡、动态、评论、积分、勋章、消息、商城），便于前端将 `MOCK_*` 替换为真实请求。
- **认证**：先实现密码登录与验证码登录（含手机号校验）；SSO 入口预留接口或配置，由企业侧协议与端点后续对接。
- **图片/佐证**：上传接口返回 URL；存储方案在 research.md 中确定（本地目录或 OSS/S3）。
- **数据库**：**MySQL**；表结构由 JPA 实体或 Flyway/Liquibase 迁移定义，与 data-model.md 一致。
- **数据与权限**：仅员工单角色；可见范围（全公司/本部门等）依赖组织架构数据来源，在 data-model 与接口中预留字段。

## Complexity Tracking

无需填写（Constitution Check 无违反项）。
