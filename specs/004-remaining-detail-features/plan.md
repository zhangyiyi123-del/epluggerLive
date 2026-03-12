# Implementation Plan: 易普圈未完成细节对接

**Branch**: `004-remaining-detail-features` | **Date**: 2025-03-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/004-remaining-detail-features/spec.md`；前端 React，后端 Spring Boot；与分支 003 技术栈一致，同一系统。

## Summary

在 003 已完成的「前端 React + 后端 Spring Boot + MySQL」基础上，补齐易普圈未对接细节：**首页聚合数据**（今日/本周进度、个人统计、最近 3 条打卡、热门动态）、**圈子筛选与检索组合**、**圈子内 @ 与通知**、**打卡页运动月度统计**。前端将首页/圈子/打卡页等现有 Mock 或占位替换为真实 API 调用，后端扩展或新增相应接口，使四项用户故事可端到端验收。

## Technical Context

与 **003-refine-requirements** 保持一致，本期不引入新技术栈。

### Frontend（已存在，本期对接 004 相关 API）

| 项 | 选型 |
|----|------|
| **Language/Version** | TypeScript 5.x，React 18 |
| **Primary Dependencies** | Vite，React Router DOM v6，Lucide React |
| **Storage** | 登录态 localStorage + JWT |
| **Testing** | 待补充（Vitest/Jest + 组件/集成测试） |
| **Target Platform** | 移动端 Web（浏览器） |
| **Project Type** | SPA |
| **Constraints** | 与宪章一致：Lint/格式化、设计系统复用、关键路径性能预算、分页/按需加载 |

### Backend（与 003 同一服务，本期扩展接口）

| 项 | 选型 |
|----|------|
| **Framework** | Spring Boot 3.x |
| **Language/Version** | Java 17 或 21（LTS） |
| **Primary Dependencies** | Spring Web（REST），Spring Security + JWT，Spring Data JPA，MySQL 驱动 |
| **Storage** | MySQL；文件/对象存储用于图片与佐证（同 003） |
| **Testing** | JUnit 5，Spring Boot Test，MockMvc/TestRestTemplate；契约测试可选 |
| **Target Platform** | Linux 服务器（容器化部署优先） |
| **Project Type** | Web 服务（REST API） |
| **Performance Goals** | 首页聚合 3s 内返回；圈子列表/检索 3s 内；月度统计 2s 内（满足 spec SC） |
| **Constraints** | 无状态；JWT 认证；与宪章一致 |
| **Scale/Scope** | 与 003 一致，企业内千～万级用户；本期仅扩展接口与前端对接，无新库表必选 |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 宪章原则 | 符合性 |
|----------|--------|
| **一、代码质量** | 后端扩展接口与 003 模块边界一致；前端 API 层与类型与 003 风格一致；Lint/格式化通过。 |
| **二、测试标准** | 新增/变更接口具备可自动化测试；契约与 003 风格一致。 |
| **三、用户体验一致性** | 前端已按设计系统实现首页/圈子/打卡页；本期仅替换数据源，不改变交互与视觉。 |
| **四、性能要求** | 首页聚合、列表+检索、月度统计满足 spec 成功标准（3s/3s/2s）；分页与空状态在实现中落实。 |
| **附加约束** | 技术栈与 003 一致；安全与合规：最小必要数据、接口权限与审计约定同 003。 |

**结论**：无违反项，无需填写 Complexity Tracking。

## Project Structure

### Documentation (this feature)

```text
specs/004-remaining-detail-features/
├── plan.md              # 本文件
├── research.md          # Phase 0：本期无新选型，复用 003 结论与接口扩展决策
├── data-model.md        # Phase 1：无新表；聚合与查询扩展说明
├── quickstart.md        # Phase 1：与 003 一致，指向同一前后端
├── contracts/           # Phase 1：004 相关接口扩展（首页、圈子检索+组合、月度统计、@ 通知）
└── tasks.md             # Phase 2：由 /speckit.tasks 生成
```

### Source Code (repository root，与 003 相同)

```text
frontend/                    # 已存在；本期改首页、圈子、打卡页等 API 对接
├── src/
│   ├── api/                 # 新增或扩展：home.ts、community.ts 增加 keyword、getPosts 组合
│   ├── pages/               # HomePage、CommunityPage、CheckInPage 等替换 Mock
│   └── ...
backend/                     # 与 003 同一项目；本期扩展 controller/service
├── src/main/java/com/eplugger/
│   ├── web/                 # 新增或扩展：HomeController、PostController 检索参数、Exercise 月度
│   ├── service/             # 首页聚合、热门规则、月度汇总、@ 通知
│   └── ...
```

**Structure Decision**：与 003 共用 `frontend/` 与 `backend/`，本期仅在现有结构中新增/扩展接口与前端调用，不新增项目或服务。

## Phases Overview

| Phase | 产出 | 说明 |
|-------|------|------|
| **Phase 0** | research.md | 无新技术选型；首页聚合/热门规则、筛选+检索组合、月度统计、@ 通知的接口形态与复用 003 的决策。 |
| **Phase 1** | data-model.md, contracts/, quickstart.md | 无新表；聚合与查询扩展；004 相关 API 契约；本地运行同 003。 |
| **Phase 2** | tasks.md | 由 `/speckit.tasks` 根据本计划与 spec 拆解任务。 |

## Implementation Notes

- **首页**：后端提供聚合接口（如 `GET /api/home`）返回今日/本周进度、个人统计、最近 3 条打卡、热门动态（由后端按点赞/评论/时间规则计算）；前端 HomePage 替换 Mock 为单次请求或按区块拆分请求。
- **圈子**：`GET /api/posts` 增加 `keyword` 参数，与现有 `filter` 组合；筛选与检索可同时生效，列表同时满足二者条件。
- **@**：发布动态与正向打卡已支持 `mentionUserIds`；后端在创建动态/正向记录时写入 @ 关系并创建「@ 类型」通知；前端「我的消息」已支持通知列表与跳转，需保证 @ 通知的跳转目标与展示正确。
- **运动月度统计**：后端提供月度汇总接口（如 `GET /api/checkin/exercise/monthly-summary?month=yyyy-MM`），返回该月次数、总时长/距离/卡路里等；打卡页已有入口，前端对该区块请求该接口并展示。
- **契约**：与 003 的 `contracts/` 及 `frontend/src/types/` 对齐；004 扩展在 contracts 中补充或单独小文件说明。

## Complexity Tracking

无需填写（Constitution Check 无违反项）。
