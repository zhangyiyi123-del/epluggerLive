// ============================================
// 积分系统类型定义
// ============================================

// 用户等级配置 (固定10级)
export interface LevelConfig {
  level: number
  name: string
  minPoints: number
  maxPoints: number
  minExchangeValue: number  // 可兑换商品最低积分
  maxExchangeValue: number  // 可兑换商品最高积分
}

// 勋章类型
export type MedalType = 
  | 'sports-rookie'      // 运动萌新
  | 'sports-master'       // 运动达人
  | 'sports-champion'    // 运动健将
  | 'positive-messenger' // 正向使者
  | 'community-star'     // 正向标杆
  | 'team-star'          // 团队之星
  | 'post-rookie'        // 发圈新秀
  | 'content-creator'    // 内容创作者
  | 'hot-author'         // 高热作者
  | 'interaction-star'   // 互动之星
  | 'full-attendance'    // 全勤标兵

// 勋章信息
export interface Medal {
  type: MedalType
  name: string
  description: string
  icon: string
  condition: string
  requiredCount: number  // 所需次数/天数
  pointsReward: number   // 获得时的积分奖励
  obtainedAt?: string    // 获得时间
  progress?: number      // 当前进度
}

// 积分变动类型
export type PointsChangeType = 
  | 'exercise-checkin'        // 运动打卡
  | 'exercise-cycle-bonus'    // 周期达标奖励
  | 'positive-checkin'       // 正向打卡
  | 'positive-quality-bonus' // 优质行为奖励
  | 'positive-participant'  // 参与人奖励
  | 'positive_participant'  // 参与人奖励（后端流水类型）
  | 'activity-join'         // 参与活动
  | 'post-publish'           // 发布动态
  | 'post-quality'           // 优质动态奖励
  | 'like-given'             // 点赞获得
  | 'medal-reward'           // 勋章奖励
  | 'exchange'               // 兑换消费
  | 'expired'                // 积分过期
  | 'deduct'                 // 扣除(作弊)
  | 'refund'                 // 补发

// 积分变动记录
export interface PointsRecord {
  id: string
  type: PointsChangeType
  amount: number  // 正数获取，负数消耗
  balance: number // 变动后余额
  description: string
  sourceId?: string  // 关联的打卡/动态ID
  createdAt: string
  expiresAt?: string // 过期时间
}

// 用户积分信息
// 注意：等级应由「累计获取」或独立等级进度计算，而非可用积分。这样用户兑换后可用积分减少，等级不会随之下降，权益设计才合理。
export interface UserPoints {
  userId: string
  availablePoints: number      // 可用积分（兑换会减少）
  totalEarnedPoints: number    // 累计获取积分（用于等级判定时只增不减）
  totalUsedPoints: number      // 已使用积分
  expiringPoints: number       // 即将过期积分(30天内)
  expiringDate?: string        // 过期日期
  level: number                // 当前等级（建议按累计获取或等级进度算，不随可用积分减少而降级）
  currentLevelPoints: number   // 当前等级积分（本等级内进度或用于进度条）
  nextLevelPoints: number      // 下一等级所需积分
  medals: Medal[]              // 勋章列表（含已获得与待解锁，obtainedAt 区分）
}

// 积分获取规则配置
export interface PointsRule {
  type: PointsChangeType
  name: string
  basePoints: number
  dailyLimit?: number          // 每日次数限制
  dailyPointsLimit?: number    // 每日积分上限
  conditions?: string
}

// 商品类型
export type ProductType = 'physical' | 'virtual' | 'honor'

// 商品状态
export type ProductStatus = 'available' | 'low-stock' | 'out-of-stock' | 'offline'

// 积分商品
export interface Product {
  id: string
  name: string
  description: string
  type: ProductType
  points: number           // 兑换所需积分
  stock: number            // 当前库存
  warningStock: number     // 预警库存
  image: string
  status: ProductStatus
  minLevel: number         // 最低可兑换等级
  redeemCode?: string      // 兑换码(虚拟商品)
  usageGuide?: string     // 使用说明
}

// 订单状态
export type OrderStatus = 'pending' | 'delivered' | 'completed' | 'cancelled'

// 积分订单
export interface Order {
  id: string
  orderNo: string         // 订单编号
  product: Product
  pointsSpent: number
  status: OrderStatus
  redeemedAt: string
  deliveredAt?: string
  completedAt?: string
  userName: string
  userId: string
  pickupCode?: string     // 领取码(实物)
}

// ============================================
// 常量配置
// ============================================

// 等级配置
export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, name: 'Lv1', minPoints: 0, maxPoints: 200, minExchangeValue: 50, maxExchangeValue: 200 },
  { level: 2, name: 'Lv2', minPoints: 201, maxPoints: 500, minExchangeValue: 50, maxExchangeValue: 200 },
  { level: 3, name: 'Lv3', minPoints: 501, maxPoints: 1000, minExchangeValue: 50, maxExchangeValue: 200 },
  { level: 4, name: 'Lv4', minPoints: 1001, maxPoints: 1800, minExchangeValue: 201, maxExchangeValue: 1000 },
  { level: 5, name: 'Lv5', minPoints: 1801, maxPoints: 2800, minExchangeValue: 201, maxExchangeValue: 1000 },
  { level: 6, name: 'Lv6', minPoints: 2801, maxPoints: 4000, minExchangeValue: 201, maxExchangeValue: 1000 },
  { level: 7, name: 'Lv7', minPoints: 4001, maxPoints: 5500, minExchangeValue: 1001, maxExchangeValue: 3000 },
  { level: 8, name: 'Lv8', minPoints: 5501, maxPoints: 7500, minExchangeValue: 1001, maxExchangeValue: 3000 },
  { level: 9, name: 'Lv9', minPoints: 7501, maxPoints: 10000, minExchangeValue: 1001, maxExchangeValue: 3000 },
  { level: 10, name: 'Lv10', minPoints: 10001, maxPoints: Infinity, minExchangeValue: 3000, maxExchangeValue: Infinity },
]

// 勋章配置
export const MEDAL_CONFIGS: Omit<Medal, 'obtainedAt' | 'progress'>[] = [
  { type: 'sports-rookie', name: '运动萌新', description: '连续运动达标7天', icon: '🏃', condition: '连续运动7天', requiredCount: 7, pointsReward: 50 },
  { type: 'sports-master', name: '运动达人', description: '累计运动达标30天', icon: '🏅', condition: '累计运动30天', requiredCount: 30, pointsReward: 50 },
  { type: 'sports-champion', name: '运动健将', description: '累计运动达标100天', icon: '🏆', condition: '累计运动100天', requiredCount: 100, pointsReward: 50 },
  { type: 'positive-messenger', name: '正向使者', description: '累计正向打卡20次', icon: '✨', condition: '累计正向打卡20次', requiredCount: 20, pointsReward: 50 },
  { type: 'community-star', name: '正向标杆', description: '累计发布10条优质正向打卡', icon: '📱', condition: '累计发布10条优质正向打卡', requiredCount: 10, pointsReward: 50 },
  { type: 'team-star', name: '团队之星', description: '累计邀请20人参与', icon: '👥', condition: '累计邀请20人参与', requiredCount: 20, pointsReward: 50 },
  { type: 'post-rookie', name: '发圈新秀', description: '累计发布动态10条', icon: '📝', condition: '累计发布动态10条', requiredCount: 10, pointsReward: 50 },
  { type: 'content-creator', name: '内容创作者', description: '累计发布动态50条', icon: '🧠', condition: '累计发布动态50条', requiredCount: 50, pointsReward: 50 },
  { type: 'hot-author', name: '高热作者', description: '累计5条动态互动数达到20', icon: '🔥', condition: '累计5条动态互动数达到20', requiredCount: 5, pointsReward: 50 },
  { type: 'interaction-star', name: '互动之星', description: '累计点赞200次', icon: '❤️', condition: '累计点赞200次', requiredCount: 200, pointsReward: 50 },
  { type: 'full-attendance', name: '全勤标兵', description: '自然月打卡全达标', icon: '📅', condition: '自然月全勤', requiredCount: 1, pointsReward: 50 },
]

// 积分获取规则
export const POINTS_RULES: PointsRule[] = [
  // 行为加分
  { type: 'exercise-checkin', name: '运动打卡', basePoints: 0, dailyLimit: 2, conditions: '1分钟=0.5分，单次5-30分' },
  { type: 'exercise-cycle-bonus', name: '周期达标奖励', basePoints: 50, conditions: '周达标50分，月达标200分' },
  { type: 'positive-checkin', name: '正向打卡', basePoints: 30, dailyLimit: 2, conditions: '审核通过30分，优质+10分' },
  { type: 'positive-participant', name: '参与人奖励', basePoints: 5, conditions: '每次5分，无上限' },
  { type: 'activity-join', name: '参与活动', basePoints: 50, conditions: '完成活动任务50分' },
  // 互动加分
  { type: 'post-publish', name: '发布动态', basePoints: 15, dailyLimit: 3, conditions: '每次15分' },
  { type: 'post-quality', name: '优质动态', basePoints: 15, dailyLimit: 1, conditions: '24小时内≥8次互动加15分' },
  { type: 'like-given', name: '点赞他人', basePoints: 2, dailyLimit: 8, conditions: '每日前8次点赞，每次2分' },
  { type: 'medal-reward', name: '勋章奖励', basePoints: 50, conditions: '获得勋章奖励50分' },
]

// 积分有效期(月)
export const POINTS_VALIDITY_MONTHS = 12

// 每日积分上限
export const DAILY_POINTS_LIMIT = 300

// ============================================
// Mock 数据
// ============================================

// 当前用户积分信息（等级由累计获取积分推导：5200 对应 Lv7 区间 4001-5500）
export const MOCK_USER_POINTS: UserPoints = {
  userId: 'user-001',
  availablePoints: 2850,
  totalEarnedPoints: 5200,
  totalUsedPoints: 2350,
  expiringPoints: 0,
  level: 7,
  currentLevelPoints: 5200,   // 累计积分，用于等级进度条
  nextLevelPoints: 5501,      // 下一等级所需累计积分（Lv8 门槛）
  medals: [
    { ...MEDAL_CONFIGS[0], obtainedAt: '2025-01-15', progress: 7 },
    { ...MEDAL_CONFIGS[3], obtainedAt: '2025-02-01', progress: 20 },
  ]
}

// 积分变动记录
export const MOCK_POINTS_RECORDS: PointsRecord[] = [
  { id: '1', type: 'exercise-checkin', amount: 15, balance: 2850, description: '运动打卡(30分钟)', createdAt: '2025-02-28T10:30:00' },
  { id: '2', type: 'post-publish', amount: 15, balance: 2835, description: '发布社区动态', createdAt: '2025-02-28T09:00:00' },
  { id: '3', type: 'positive-checkin', amount: 30, balance: 2830, description: '正向打卡审核通过', createdAt: '2025-02-27T18:00:00' },
  { id: '4', type: 'like-given', amount: 2, balance: 2800, description: '点赞同事动态', createdAt: '2025-02-27T15:30:00' },
  { id: '5', type: 'exchange', amount: -500, balance: 2798, description: '兑换咖啡券', createdAt: '2025-02-26T14:00:00' },
  { id: '6', type: 'medal-reward', amount: 50, balance: 3298, description: '获得勋章: 运动萌新', createdAt: '2025-01-15' },
  { id: '7', type: 'exercise-cycle-bonus', amount: 50, balance: 3248, description: '周运动达标奖励', createdAt: '2025-02-20' },
  { id: '8', type: 'expired', amount: -120, balance: 3198, description: '积分过期', createdAt: '2024-03-01', expiresAt: '2024-03-01' },
]

// 积分商品
export const MOCK_PRODUCTS: Product[] = [
  // 低价值商品 (Lv1-3)
  { id: 'p1', name: '便签纸', description: '精美便签纸一套', type: 'physical', points: 50, stock: 100, warningStock: 5, image: '📝', status: 'available', minLevel: 1 },
  { id: 'p2', name: '1元话费', description: '手机充值1元', type: 'virtual', points: 100, stock: 999, warningStock: 5, image: '📱', status: 'available', minLevel: 1 },
  { id: 'p3', name: '7天视频会员', description: '视频会员周卡', type: 'virtual', points: 150, stock: 50, warningStock: 5, image: '🎬', status: 'available', minLevel: 1 },
  { id: 'p4', name: '中性笔', description: '办公用中性笔', type: 'physical', points: 80, stock: 200, warningStock: 5, image: '🖊️', status: 'available', minLevel: 1 },
  { id: 'p5', name: '笔记本', description: '精美笔记本', type: 'physical', points: 120, stock: 80, warningStock: 5, image: '📓', status: 'available', minLevel: 1 },
  
  // 中价值商品 (Lv4-6)
  { id: 'p6', name: '水杯', description: '公司定制水杯', type: 'physical', points: 300, stock: 30, warningStock: 5, image: '☕', status: 'available', minLevel: 4 },
  { id: 'p7', name: '充电宝', description: '10000mAh充电宝', type: 'physical', points: 500, stock: 15, warningStock: 5, image: '🔋', status: 'available', minLevel: 4 },
  { id: 'p8', name: '20元话费', description: '手机充值20元', type: 'virtual', points: 400, stock: 100, warningStock: 5, image: '💰', status: 'available', minLevel: 4 },
  { id: 'p9', name: '下午茶券', description: '公司下午茶兑换券', type: 'physical', points: 250, stock: 50, warningStock: 5, image: '🍵', status: 'available', minLevel: 4 },
  { id: 'p10', name: '30天视频会员', description: '视频会员月卡', type: 'virtual', points: 600, stock: 30, warningStock: 5, image: '📺', status: 'low-stock', minLevel: 4 },
  
  // 高价值商品 (Lv7-9)
  { id: 'p11', name: '蓝牙耳机', description: '无线蓝牙耳机', type: 'physical', points: 1500, stock: 10, warningStock: 5, image: '🎧', status: 'available', minLevel: 7 },
  { id: 'p12', name: '体检套餐', description: '全身体检套餐', type: 'physical', points: 2000, stock: 5, warningStock: 5, image: '🏥', status: 'available', minLevel: 7 },
  { id: 'p13', name: '100元话费', description: '手机充值100元', type: 'virtual', points: 1800, stock: 20, warningStock: 5, image: '💵', status: 'available', minLevel: 7 },
  { id: 'p14', name: '年卡会员', description: '视频平台年卡', type: 'virtual', points: 2500, stock: 10, warningStock: 5, image: '🎥', status: 'available', minLevel: 7 },
  
  // 专属荣誉 (Lv10)
  { id: 'p15', name: '定制奖杯', description: '公司定制荣誉奖杯', type: 'honor', points: 3000, stock: 3, warningStock: 5, image: '🏆', status: 'available', minLevel: 10 },
  { id: 'p16', name: '高端茶礼', description: '精美茶叶礼盒', type: 'honor', points: 3500, stock: 5, warningStock: 5, image: '🎁', status: 'available', minLevel: 10 },
  { id: 'p17', name: '定制相册', description: '公司定制纪念相册', type: 'honor', points: 5000, stock: 2, warningStock: 5, image: '📖', status: 'out-of-stock', minLevel: 10 },
]

// 订单记录
export const MOCK_ORDERS: Order[] = [
  { id: 'o1', orderNo: 'P20250228001', product: MOCK_PRODUCTS[2], pointsSpent: 150, status: 'completed', redeemedAt: '2025-02-20T14:30:00', completedAt: '2025-02-21T10:00:00', userName: '我', userId: 'user-001', pickupCode: 'COFFEE2025' },
  { id: 'o2', orderNo: 'P20250225002', product: MOCK_PRODUCTS[8], pointsSpent: 250, status: 'delivered', redeemedAt: '2025-02-25T16:00:00', deliveredAt: '2025-02-26T09:00:00', userName: '我', userId: 'user-001', pickupCode: 'TEA2025' },
  { id: 'o3', orderNo: 'P20250228003', product: MOCK_PRODUCTS[1], pointsSpent: 100, status: 'pending', redeemedAt: '2025-02-28T11:00:00', userName: '我', userId: 'user-001' },
]
