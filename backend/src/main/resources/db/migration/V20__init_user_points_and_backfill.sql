-- 为所有用户初始化 user_points，并从历史运动打卡、正向打卡回填积分
INSERT INTO user_points (user_id, total_earned, total_used, available, updated_at)
SELECT u.id, 0, 0, 0, NOW(6)
FROM `user` u
WHERE NOT EXISTS (SELECT 1 FROM user_points up WHERE up.user_id = u.id);

-- 按用户汇总历史打卡积分并更新 user_points
UPDATE user_points up
SET
  total_earned = (SELECT COALESCE(SUM(c.points), 0) FROM check_in_record c WHERE c.user_id = up.user_id)
               + (SELECT COALESCE(SUM(p.points), 0) FROM positive_record p WHERE p.user_id = up.user_id),
  available = (SELECT COALESCE(SUM(c.points), 0) FROM check_in_record c WHERE c.user_id = up.user_id)
            + (SELECT COALESCE(SUM(p.points), 0) FROM positive_record p WHERE p.user_id = up.user_id)
            - up.total_used,
  updated_at = NOW(6);
