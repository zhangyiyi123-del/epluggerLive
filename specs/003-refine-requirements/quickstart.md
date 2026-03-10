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

默认开发服务器地址见 Vite 输出（如 `http://localhost:5173`）。对接后端时在 `frontend/` 下创建 `.env`（可复制 `frontend/.env.example` 若有），设置：

- `VITE_API_BASE_URL=http://localhost:8080`

登录态由 JWT 驱动（仅支持密码登录；测试用户 13800138000 / 123456，见后端 README）。

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

## 环境变量（可选）

| 变量 | 说明 | 默认 |
|------|------|------|
| `VITE_API_BASE_URL` | 前端请求的后端基地址 | `http://localhost:8080` |
| `JWT_SECRET` | 后端 JWT 签名密钥（至少 32 字节） | 开发用默认值见 application.yml |
| `JWT_EXPIRATION_MS` | Token 有效期（毫秒） | 86400000 |
| `SPRING_DATASOURCE_USERNAME` | MySQL 用户名 | root |
| `SPRING_DATASOURCE_PASSWORD` | MySQL 密码 | 见 application.yml 或必填 |
| `CORS_ALLOWED_ORIGINS` | 允许的跨域来源 | http://localhost:5173,http://localhost:3000 |
| `UPLOAD_DIR` | 上传文件存储目录 | ./upload |

## 验证后端 + 前端对接

1. **后端**：`cd backend` → `mvn compile exec:java "-Dexec.mainClass=com.eplugger.EpluggerApplication"`，确认无报错且日志出现 `Started EpluggerApplication`。
2. **健康检查**：`curl http://localhost:8080/api/health` 返回 `{"status":"ok",...}`。
3. **前端**：`cd frontend` → `npm install` → `npm run dev`，浏览器打开前端地址，使用 13800138000 / 123456 登录；能进入首页且请求带 JWT 即表示对接正常。

## 安全与鉴权

- **鉴权**：除 `GET /api/health`、`/api/auth/**`、`/api/uploads/**` 外，所有 ` /api/**` 接口均需在请求头携带有效 JWT：`Authorization: Bearer <token>`；未带或无效返回 401。
- **日志**：实现中不得在日志中输出密码、Token 等敏感信息；仅记录必要业务与错误码。

## 详细配置

- **MySQL**：库名、账号、端口及连接参数见 `backend/src/main/resources/application.yml`；建议使用 Flyway 管理表结构，与 `data-model.md` 一致。
- JWT 密钥、文件上传路径等以 `application.yml` 及上表环境变量为准；部署前需在计划或运维文档中明确。
