# Phase 1: Quickstart — 本地运行（与 003 一致）

**Feature**: 004-remaining-detail-features | **Date**: 2025-03-12

004 与 003 为同一系统，前后端结构不变。本地运行方式与 **003-refine-requirements** 的 [quickstart.md](../003-refine-requirements/quickstart.md) 一致。

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

默认端口 8080。需配置 MySQL 连接、JWT、文件上传等（同 003）。

## 004 相关对接后

- **首页**：前端 HomePage 调用 `GET /api/home`（或等价聚合/多接口）替换当前 Mock，展示今日/本周进度、个人统计、最近 3 条打卡、热门动态。
- **圈子**：CommunityPage 的 `getPosts` 增加 `keyword` 参数，与 `filter` 组合请求 `GET /api/posts`。
- **@**：发布动态与正向打卡已传 `mentionUserIds`；后端确保创建 @ 通知；我的消息中 @ 通知可跳转至对应动态/打卡。
- **运动月度统计**：打卡页该区块请求 `GET /api/checkin/exercise/monthly-summary?month=yyyy-MM` 并展示。

详细步骤与环境变量见 [003 quickstart](../003-refine-requirements/quickstart.md)。
