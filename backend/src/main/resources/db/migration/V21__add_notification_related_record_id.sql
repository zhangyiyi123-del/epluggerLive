-- 用户故事 3：@ 提及 — 通知跳转正向打卡记录
ALTER TABLE notification
    ADD COLUMN related_record_id BIGINT DEFAULT NULL COMMENT '正向打卡记录ID(@提及跳转)';
