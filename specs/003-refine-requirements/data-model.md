# Phase 1: Data Model — EPlugger 领域模型与持久化摘要

**Feature**: 003-refine-requirements | **Date**: 2025-03-09

**持久化目标**：**MySQL**，通过 Spring Data JPA 实体与（推荐）Flyway/Liquibase 迁移脚本建表。

## 领域实体（与 spec 关键实体一致）

| 实体 | 说明 | 主要属性示例 |
|------|------|-----------------------------|
| 用户 (User) | 员工身份与基础信息 | id, 手机号, 姓名, 头像, 部门, 岗位, 密码/SSO 标识 |
| 运动打卡记录 (CheckInRecord) | 运动类型、时长/距离/卡路里、强度、佐证 | userId, sportTypeId, duration, distance, intensity, attachments[], checkedInAt, points |
| 正向打卡记录 (PositiveRecord) | 行为分类、描述、@提及、佐证 | userId, categoryId, description, mentions[], evidences[], points |
| 动态 (Post) | 圈子动态 | authorId, content(text/images/video), visibility, topics[], mentions[], likesCount, commentsCount, createdAt |
| 评论 (Comment) | 动态下的评论与二级回复 | postId, authorId, content, parentId, likesCount, createdAt |
| 积分与等级 | 用户积分与等级进度 | userId, totalEarned, totalUsed, available, level, levelProgress |
| 勋章 (Medal) | 勋章类型与获得关系 | userId, medalType, obtainedAt |
| 消息/通知 (Notification) | 点赞/评论/@ | userId, type, relatedPostId, relatedUserId, read, createdAt |
| 积分商品与订单 | 商城与兑换 | Product(id, name, pointsCost, ...), Order(userId, productId, points, status, createdAt) |

## 持久化要点（MySQL）

- **用户**：密码需加密存储；支持手机号+密码、手机号+验证码、SSO 关联；表与索引需支持按手机号/SSO 标识查询。
- **打卡**：佐证为 URL 列表，对应文件存储中的对象；运动/正向打卡可分表或统一设计，按时间与用户建索引。
- **动态与评论**：可见范围、话题、@ 可为关联表或 JSON 字段（MySQL 5.7+ JSON 类型）；需索引支持按维度筛选与分页（如 `created_at`、`author_id`、可见范围）。
- **积分**：积分变动流水表 + 用户积分汇总表；等级由累计积分或独立进度计算，不随可用积分减少而降级；事务与唯一约束保证一致性。
- **消息**：独立通知表，按 `user_id`、`read`、`created_at` 建索引，便于「我的消息」分页查询。
- **字符集**：建议库与表使用 `utf8mb4`，排序规则 `utf8mb4_unicode_ci`，以正确存储 Emoji 与多语言。

## 与前端类型对齐

后端 API 的请求/响应 DTO 应与 `frontend/src/types/` 中 `User`、`Post`、`Comment`、`CheckInRecord`、`PositiveRecord`、`UserPoints`、`Medal`、`PointsRecord` 等保持一致或可映射，以便前端替换 Mock 时最小改动。
