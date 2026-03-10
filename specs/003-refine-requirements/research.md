# Phase 0: Research — EPlugger 后端技术选型

**Feature**: 003-refine-requirements | **Date**: 2025-03-09

## 目标

为 EPlugger 后端选定技术栈与依赖，支撑登录、打卡、圈子、积分、消息等能力，并与现有前端（React + Vite）通过 REST API 对接。

## 技术选型结论

| 领域 | 选型 | 说明 |
|------|------|------|
| Web 框架 | **Spring Boot 3.x** | REST API、安全、数据访问一体化；生态成熟。 |
| 语言与运行时 | Java 17 或 21 (LTS) | 企业常见、Spring Boot 3.x 支持良好。 |
| 安全与认证 | Spring Security + JWT | 无状态认证；登录态由前端携带 Token，后端校验。 |
| 数据访问 | Spring Data JPA | 与关系型模型匹配；可配合 Flyway/Liquibase 做迁移。 |
| **关系型数据库** | **MySQL** | 选用 MySQL；支持事务与索引，与 Spring Data JPA 兼容良好。 |
| 文件存储 | 本地目录 或 对象存储 (OSS/S3) | 佐证/图片上传；小规模可先本地，后续迁 OSS。 |
| API 契约 | OpenAPI 3.0 | 与前端 types 对齐；可生成客户端或 Mock。 |
| 测试 | JUnit 5 + Spring Boot Test + MockMvc/TestRestTemplate | 单元与集成测试；契约测试可选（OpenAPI 驱动）。 |

## 风险与依赖

- **组织架构与 SSO**：可见范围（全公司/本部门）与 SSO 协议依赖企业侧提供；本期接口预留字段与 SSO 回调入口。
- **积分/勋章规则**：具体数值与策略由业务定义；后端提供配置或规则引擎扩展点。
- **性能**：列表分页、索引设计在 data-model 与实现中落实；满足 spec 成功标准（如 3 秒内反馈）。

## 与宪章一致性

- 代码质量：模块与 API 边界清晰，Lint/格式化纳入 CI。
- 测试：核心逻辑与 REST 契约具备可自动化测试。
- 安全与合规：最小必要数据、接口权限与审计约定在设计与实现中体现。
