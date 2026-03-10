# Phase 1: Quickstart — 本地运行 EPlugger 前端与后端

**Feature**: 003-refine-requirements | **Date**: 2025-03-09

## 前置要求

- Node.js 18+（前端）
- Java 17 或 21，Maven 或 Gradle（后端，Spring Boot 项目）
- **MySQL** 8.0+（后端持久化，本地或 Docker 启动均可）

## 前端（已存在）

```bash
cd frontend
npm install
npm run dev
```

默认开发服务器地址见 Vite 输出（如 `http://localhost:5173`）。对接后端时在项目根目录创建 `.env`（可复制 `frontend/.env.example`），设置 `VITE_API_BASE_URL=http://localhost:8080`。登录态由 JWT 驱动（仅支持密码登录，测试用户 13800138000 / 123456）。

## 后端（本期新建，Spring Boot + MySQL）

```bash
cd backend
# Maven（推荐）
mvn spring-boot:run

# 若报错 Could not find artifact ... spring-boot-buildpack-platform（公司 Nexus 缺包），改用（PowerShell 下 -D 需加引号）：
mvn compile exec:java "-Dexec.mainClass=com.eplugger.EpluggerApplication"

# 或 Gradle
./gradlew bootRun
```

默认端口常见为 `8080`。需在 `application.yml` 中配置 **MySQL** 连接、JWT 及文件上传等；首次运行前确保 MySQL 已启动并执行数据库迁移（如 Flyway）。示例配置：

```yaml
# application.yml 示例（MySQL）
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/eplugger?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: eplugger
    password: ${DB_PASSWORD:your_password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate   # 生产建议 validate；开发可用 update 或配合 Flyway
    database-platform: org.hibernate.dialect.MySQLDialect
```

## 对接后

- 前端将 `MOCK_*` 替换为对 `VITE_API_BASE_URL` 的请求（如 `/api/auth/login`、`/api/checkin`、`/api/posts` 等）。
- 登录成功后后端返回 JWT；前端在请求头携带（如 `Authorization: Bearer <token>`）。

## 详细配置

- **MySQL**：库名、账号、端口及连接参数见 `application.yml`；建议使用 Flyway 管理表结构，与 `data-model.md` 一致。
- JWT 密钥、文件上传路径、SSO 回调等以 `backend/src/main/resources/application.yml` 及环境变量为准；部署前需在计划或运维文档中明确。
