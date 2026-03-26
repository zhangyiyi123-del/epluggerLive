# API Contracts: 打卡同步到圈子

本功能在既有打卡接口上**向后兼容扩展**（新增可选字段与响应字段）。路径与方法与现网一致。

## 1. 运动打卡提交

- **Method / Path**：`POST /api/checkin/exercise`（以项目实际为准，若与 `ExerciseCheckInController` 映射不一致则以代码为准）  
- **Request body**（在现有 JSON 上增加）：

```json
{
  "sportTypeId": "running",
  "duration": 30,
  "durationUnit": "minute",
  "syncToCommunity": true,
  "attachmentUrls": []
}
```

- **Response**（在现有 JSON 上增加，示例）：

```json
{
  "id": 123,
  "points": 10,
  "communitySync": {
    "attempted": true,
    "success": true,
    "postId": 456,
    "message": null
  }
}
```

失败示例（打卡成功、同步失败）：

```json
{
  "id": 123,
  "points": 10,
  "communitySync": {
    "attempted": true,
    "success": false,
    "postId": null,
    "message": "动态未能发布，请稍后在圈子手动分享"
  }
}
```

## 2. 正向打卡提交

- **Method / Path**：`POST /api/checkin/positive`（以 `PositiveCheckInController` 为准）  
- **Request**：增加 `syncToCommunity`（boolean，可选，缺省按 `true`）。  
- **Response**：同结构嵌套 `communitySync`。

## 3. 与手动发帖的关系

- 手动发帖仍为 **`POST /api/posts`** + `PostCreateRequest`。  
- 同步发帖在服务端内部调用与 `PostService.create` **相同**的入口，不新增对外「同步专用」REST（首期）。

## 4. 错误码约定（建议）

- 打卡校验失败：保持现有 4xx 行为。  
- 打卡成功但同步失败：**不**将整体改为 5xx；HTTP 200 + `communitySync.success=false`（除非现有项目统一用 207，则以项目惯例为准并在 quickstart 说明）。

## 5. 版本与兼容

- 旧客户端不传 `syncToCommunity`：默认 `true` 时与 spec FR-002 一致；若产品要求旧客户端默认 `false`，须在发布说明中改为**破坏性变更**并改默认值。

## 6. 实现约定（与代码一致）

- JSON 属性名：**camelCase** — `syncToCommunity`、`communitySync`、`attempted`、`success`、`postId`、`message`。
- 后端 DTO：`CommunitySyncResult`（Java）序列化为上述嵌套对象。

## 7. 同步动态正文模板（与 `CheckInCommunitySyncService` 一致）

正文由服务端生成，写入 `PostCreateRequest.contentText`；超长按 **500 字**截断（与代码常量 `MAX_POST_TEXT` 一致）。文末统一带可识别话题 **`#来自打卡同步`**（正向模板中话题前有空格，便于与正文区分）。

### 7.1 运动打卡（`source_type = exercise_checkin`）

- **句式**（一句连贯描述，无强制换行）：  
  `刚完成一次{运动类型名}打卡，运动时长 {duration} 分钟`  
  若有距离：`，路程 {数值}{距离单位}`  
  句末：`。#来自打卡同步`
- **占位**：`{运动类型名}` 缺省为「运动」；距离与单位来自打卡记录；图片 URL 来自本次打卡附件（与手动发帖相同的 `contentImages` 列表语义）。

**示例**（有距离）：`刚完成一次跑步打卡，运动时长 30 分钟，路程 5km。#来自打卡同步`

### 7.2 正向打卡（`source_type = positive_checkin`）

- **前缀**：`【正向打卡·{分类名}】`（分类缺省为「正向打卡」）。
- **拼接规则**：
  - 仅有正文：前缀 + 空格 + `description`
  - 仅有标题：前缀 + 空格 + `title`
  - 标题与正文均有：前缀 + 空格 + `title` + `：` + `description`（中文冒号衔接）
- **后缀**：` #来自打卡同步`（注意话题前空格）。
- 图片 URL 来自本次正向打卡佐证（最多 9 张，与实现一致）。

**示例**（标题+正文）：`【正向打卡·团队协作】 本周例会：今天组织了跨部门对齐。#来自打卡同步`
