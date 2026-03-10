# EPlugger 后端

Spring Boot + MySQL。本地跑通步骤见下。

## 1. 前置

- JDK 17+
- Maven
- MySQL 8.0+ 已启动，并已创建库 `eplugger`：

```sql
CREATE DATABASE IF NOT EXISTS eplugger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

若使用单独用户（推荐）：

```sql
CREATE USER 'eplugger'@'localhost' IDENTIFIED BY '你的密码';
GRANT ALL ON eplugger.* TO 'eplugger'@'localhost';
FLUSH PRIVILEGES;
```

## 2. 配置数据库连接

默认使用 **root** 连接 `localhost:3306/eplugger`，密码通过环境变量传入（不写进配置文件）。

**root 有密码时**（推荐本地开发）：在 PowerShell 里先设密码再启动：

```powershell
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="你的root密码"
```

（用户名默认已是 root，可只设 `SPRING_DATASOURCE_PASSWORD`。）

**root 无密码**：无需设置，直接启动即可。

## 3. 启动

在项目根目录 `backend/` 下执行（二选一）。

**方式 A（推荐，避免 Nexus 缺包）：**

PowerShell 下须给 `-D` 参数加引号，否则会被 PowerShell 截断：

```powershell
cd backend
mvn compile exec:java "-Dexec.mainClass=com.eplugger.EpluggerApplication"
```

**方式 B（若公司 Nexus 已包含 Spring Boot 插件依赖）：**

```powershell
cd backend
mvn spring-boot:run
```

看到日志里出现 `Started EpluggerApplication` 且无报错即表示启动成功。

## 4. 验证跑通

- 浏览器或 curl 访问：`http://localhost:8080/api/health`
- 返回 `{"status":"ok","service":"eplugger-backend"}` 即表示应用与数据库已跑通。

（首次启动会执行 Flyway 迁移；若连接 MySQL 失败会在启动时报错。）

## 5. 登录与测试用户

- 认证接口：`POST /api/auth/login`（body: `phone`, `password`）、`GET /api/auth/me`、`POST /api/auth/refresh`。
- 非 prod 环境下，若库中无用户会自动创建**测试用户**：手机号 `13800138000`，密码 `123456`。前端可用该账号登录。

## 6. 常见问题

- **Could not find artifact ... spring-boot-buildpack-platform**  
  使用方式 A：`mvn compile exec:java -Dexec.mainClass=com.eplugger.EpluggerApplication`。

- **Access denied for user**  
  检查 MySQL 用户名、密码，以及是否已对 `eplugger` 库授权。

- **Unknown database 'eplugger'**  
  先在 MySQL 中执行 `CREATE DATABASE eplugger;`。

- **前端对接**  
  前端需配置 `VITE_API_BASE_URL=http://localhost:8080`（或复制 `.env.example` 为 `.env` 后修改）。
