-- 种子数据：运动类型（与前端 DEFAULT_SPORT_TYPES 对齐）
INSERT INTO sport_type (id, name, icon, sort_order, is_enabled) VALUES
('running',  '跑步',  '🏃', 1, 1),
('fitness',  '健身',  '🏋️', 2, 1),
('hiking',   '徒步',  '🥾', 3, 1),
('cycling',  '骑行',  '🚴', 4, 1),
('swimming', '游泳',  '🏊', 5, 1),
('ball',     '球类',  '⛹️', 7, 1),
('climbing', '攀岩',  '🧗', 8, 0);
