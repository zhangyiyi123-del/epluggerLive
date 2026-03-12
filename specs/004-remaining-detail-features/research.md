# Phase 0: Research — 004 接口扩展与复用决策

**Feature**: 004-remaining-detail-features | **Date**: 2025-03-12

## 目标

本期不引入新技术栈，与 003 保持一致（前端 React 18 + TypeScript + Vite，后端 Spring Boot + MySQL）。针对「首页、圈子筛选+检索、@、运动月度统计」四类未完成细节，确定接口形态与复用 003 的决策，消除 NEEDS CLARIFICATION。

## 技术栈结论

| 领域 | 决策 | 说明 |
|------|------|------|
| 前端 | 与 003 一致 | React 18、TypeScript、Vite、现有 api/ 与 types/ |
| 后端 | 与 003 一致 | Spring Boot 3.x、Java 17/21、Spring Data JPA、MySQL |
| 认证 | 与 003 一致 | JWT；前端请求头携带 Token |

无新技术选型，无需额外依赖调研。

## 接口形态与决策

### 1. 首页聚合

- **Decision**：后端提供 **GET /api/home**（或等价聚合端点），返回：今日/本周打卡进度、个人统计（累计积分、连续打卡天数、本周排名）、最近 3 条打卡记录、热门动态列表（条数由后端或产品约定，如 5 条）。
- **Rationale**：单次请求减少首屏请求数，满足 SC-001（3 秒内展示）；热门由后端按规则计算，与 spec 澄清一致。
- **Alternatives**：按区块拆成多个 GET（/api/checkin/progress、/api/points/me、/api/checkin/recent、/api/posts/hot）— 采用聚合可简化前端与首屏耗时。

### 2. 热门动态规则

- **Decision**：热门列表由后端按「点赞、评论、时间」等规则计算（具体权重或排序由后端/产品配置），前端仅展示；与圈子页「热门」筛选可共用后端逻辑或独立接口。
- **Rationale**：与 spec 澄清「后端按规则返回，前端仅展示」一致；避免前端二次排序或拉全量。

### 3. 圈子筛选与检索组合

- **Decision**：**GET /api/posts** 在现有 `filter`、`page`、`size` 基础上增加 **keyword** 查询参数；当 keyword 非空时，列表同时满足当前 filter 与关键词匹配（内容或作者）；后端接口需同时支持筛选维度与关键词。
- **Rationale**：与 spec 澄清「筛选与检索可组合」一致；与现有 frontend `getPosts(filter, page, size)` 扩展为 `getPosts(filter, keyword?, page, size)` 对齐。
- **Alternatives**：检索单独端点再在内存组合— 不利于分页与一致性，不采用。

### 4. @ 提及与通知

- **Decision**：发布动态（POST /api/posts）与正向打卡（POST /api/checkin/positive）已支持 `mentionUserIds`；后端在创建时写入 @ 关系，并创建类型为「@」的通知（与 003 消息/通知模型一致）；评论中本期不支持新建 @，仅展示已有 @。
- **Rationale**：003 已有 Notification 与 Post/PositiveRecord 的 mention 设计；本期仅确保「创建时写通知」与「我的消息」列表及跳转正确，无新存储模型。

### 5. 运动月度统计

- **Decision**：后端提供 **GET /api/checkin/exercise/monthly-summary?month=yyyy-MM**，返回该月运动次数、总时长、总距离、总卡路里等汇总；与运动历史记录口径一致（含是否含删除、时区由后端统一）。
- **Rationale**：打卡页已有入口，前端对该区块请求该接口即可；汇总与历史记录一致，由后端单点保证。

## 风险与依赖

- **首页聚合**：若单接口体量过大，可拆为多请求并由前端并行请求，仍以满足 3s 为首要目标。
- **检索**：关键词匹配范围（仅正文 / 含评论 / 作者名）与分词策略由后端实现，前端仅传 keyword。
- **@**：被 @ 用户不存在或已失效时，后端返回明确错误；已存 @ 在对方不可见时的展示降级同 spec 边界与异常。

## 与宪章一致性

- 代码质量：新增/变更接口与 003 模块风格一致。
- 测试：新增接口纳入集成/契约测试。
- 性能：满足 spec 成功标准中的时延要求。
