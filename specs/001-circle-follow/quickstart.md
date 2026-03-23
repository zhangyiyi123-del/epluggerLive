# Phase 1: Quickstart — 本地运行（与 004 一致）

**Feature**: 001-circle-follow | **Date**: 2026-03-23

001 与 004 为同一系统，前后端结构不变。本地运行方式与 **004-remaining-detail-features** 的 [quickstart.md](../004-remaining-detail-features/quickstart.md) 一致。

## 前置要求

- Node.js 18+（前端）
- Java 17 或 21，Maven 或 Gradle（后端）
- MySQL 8.0+（后端）

## 前端

```bash
cd frontend
npm install
npm run dev
```

开发服务器地址见 Vite 输出（如 `http://localhost:5173`）。对接后端时配置：

- `VITE_API_BASE_URL=http://localhost:8080`

## 后端

```bash
cd backend
mvn spring-boot:run
# 或
./gradlew bootRun
```

默认端口 8080。需配置 MySQL 连接、JWT、文件上传等（同 004）。

## 001 相关新增内容

### 数据库迁移

后端启动时，Spring Boot（JPA `ddl-auto`）会自动创建 `user_follow` 表。若使用手动迁移工具（Flyway/Liquibase），新增以下脚本：

```sql
CREATE TABLE IF NOT EXISTS user_follow (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  follower_id BIGINT NOT NULL,
  followee_id BIGINT NOT NULL,
  created_at  DATETIME(6) NOT NULL,
  UNIQUE KEY uq_follower_followee (follower_id, followee_id),
  CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES user(id),
  CONSTRAINT fk_follow_followee FOREIGN KEY (followee_id) REFERENCES user(id)
);
```

### 关注功能对接后验证

1. **关注用户**：在圈子列表中找到他人动态，点击"关注"按钮 → 按钮变为"已关注"，调用 `POST /api/follow/{userId}` 返回 200。
2. **已关注用户列表**：切换至"关注"标签 → 标签行下方横向列表展示已关注用户头像与姓名，调用 `GET /api/follow/following` 返回用户数组。
3. **关注流动态**："关注"标签下动态列表仅显示已关注用户的动态（`GET /api/posts?filter=following`）；若无关注用户，则显示空状态。
4. **取消关注**：点击"已关注"按钮 → 按钮变回"关注"，横向列表移除该用户，调用 `DELETE /api/follow/{userId}` 返回 200。

详细步骤与环境变量见 [004 quickstart](../004-remaining-detail-features/quickstart.md)。
