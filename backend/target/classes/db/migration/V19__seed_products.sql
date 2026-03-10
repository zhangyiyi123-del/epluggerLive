-- 积分商城种子商品（与前端 MOCK_PRODUCTS 对齐部分）
INSERT IGNORE INTO product (id, name, description, type, points_cost, stock, warning_stock, image, status, min_level, sort_order) VALUES
('p1', '便签纸', '精美便签纸一套', 'physical', 50, 100, 5, '📝', 'available', 1, 1),
('p2', '1元话费', '手机充值1元', 'virtual', 100, 999, 5, '📱', 'available', 1, 2),
('p3', '7天视频会员', '视频会员周卡', 'virtual', 150, 50, 5, '🎬', 'available', 1, 3),
('p4', '中性笔', '办公用中性笔', 'physical', 80, 200, 5, '🖊️', 'available', 1, 4),
('p5', '笔记本', '精美笔记本', 'physical', 120, 80, 5, '📓', 'available', 1, 5),
('p6', '水杯', '公司定制水杯', 'physical', 300, 30, 5, '☕', 'available', 4, 6),
('p7', '充电宝', '10000mAh充电宝', 'physical', 500, 15, 5, '🔋', 'available', 4, 7),
('p8', '20元话费', '手机充值20元', 'virtual', 400, 100, 5, '💰', 'available', 4, 8),
('p9', '下午茶券', '公司下午茶兑换券', 'physical', 250, 50, 5, '🍵', 'available', 4, 9),
('p10', '30天视频会员', '视频会员月卡', 'virtual', 600, 30, 5, '📺', 'low-stock', 4, 10);
