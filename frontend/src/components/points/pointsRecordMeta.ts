import type { PointsRecord } from '../../types/points'

export const POINTS_RECORD_ICONS: Record<string, string> = {
  'exercise-checkin': '🏃',
  'exercise_checkin': '🏃',
  'exercise-cycle-bonus': '🏅',
  'positive-checkin': '✨',
  'positive_checkin': '✨',
  'positive-quality-bonus': '🌟',
  'positive-participant': '👥',
  'positive_participant': '👥',
  'activity-join': '🎯',
  'post-publish': '📝',
  'post-quality': '💫',
  'like-given': '👍',
  'post_like': '👍',
  'post_comment': '💬',
  'medal-reward': '🏆',
  'medal_reward': '🏆',
  'exchange': '🛒',
  'expired': '⏰',
  'deduct': '❌',
  'refund': '✅',
}

export const POINTS_RECORD_LABELS: Record<string, string> = {
  'exercise-checkin': '运动打卡',
  'exercise_checkin': '运动打卡',
  'exercise-cycle-bonus': '周期奖励',
  'positive-checkin': '正向打卡',
  'positive_checkin': '正向打卡',
  'positive-quality-bonus': '优质奖励',
  'positive-participant': '参与奖励',
  'positive_participant': '参与奖励',
  'activity-join': '活动参与',
  'post-publish': '发布动态',
  'post-quality': '优质动态',
  'like-given': '点赞互动',
  'post_like': '点赞奖励',
  'post_comment': '评论奖励',
  'medal-reward': '勋章奖励',
  'medal_reward': '勋章奖励',
  'exchange': '商品兑换',
  'expired': '积分过期',
  'deduct': '积分扣除',
  'refund': '积分补发',
}

export function getPointsRecordIcon(type: string): string {
  return POINTS_RECORD_ICONS[type] || '📌'
}

export function getPointsRecordTypeLabel(type: string): string {
  return POINTS_RECORD_LABELS[type] || '其他'
}

export function isPointsRecordIncome(record: PointsRecord): boolean {
  return record.amount > 0
}
