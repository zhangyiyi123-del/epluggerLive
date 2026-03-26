import { useState, useEffect } from 'react'
import { X, Calendar, Filter } from 'lucide-react'
import type { PointsRecord } from '../../types/points'
import { getPointsRecords } from '../../api/points'

interface PointsDetailModalProps {
  onClose: () => void
}

type FilterType = 'all' | 'today' | 'week' | 'month' | 'income' | 'expense'

const RECORD_ICONS: Record<string, string> = {
  'exercise-checkin': '🏃', 'exercise_checkin': '🏃',
  'exercise-cycle-bonus': '🏅', 'positive-checkin': '✨', 'positive_checkin': '✨',
  'positive-quality-bonus': '🌟', 'positive-participant': '👥', 'activity-join': '🎯',
  'post-publish': '📝', 'post-quality': '💫', 'like-given': '👍', 'medal-reward': '🏆', 'medal_reward': '🏆',
  'exchange': '🛒', 'expired': '⏰', 'deduct': '❌', 'refund': '✅',
}
const RECORD_LABELS: Record<string, string> = {
  'exercise-checkin': '运动打卡', 'exercise_checkin': '运动打卡',
  'exercise-cycle-bonus': '周期奖励', 'positive-checkin': '正向打卡', 'positive_checkin': '正向打卡',
  'positive-quality-bonus': '优质奖励', 'positive-participant': '参与奖励', 'activity-join': '活动参与',
  'post-publish': '发布动态', 'post-quality': '优质动态', 'like-given': '点赞互动',
  'medal-reward': '勋章奖励', 'medal_reward': '勋章奖励', 'exchange': '商品兑换', 'expired': '积分过期',
  'deduct': '积分扣除', 'refund': '积分补发',
}

export default function PointsDetailModal({ onClose }: PointsDetailModalProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [records, setRecords] = useState<PointsRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPointsRecords(0, 100).then((res) => {
      setRecords(res.content ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const getRecordIcon = (type: string) => RECORD_ICONS[type] || '📌'
  const getRecordTypeLabel = (type: string) => RECORD_LABELS[type] || '其他'

  const isIncome = (record: PointsRecord) => record.amount > 0

  const filterRecords = (records: PointsRecord[]) => {
    const now = new Date()
    return records.filter(record => {
      switch (filter) {
        case 'today':
          return new Date(record.createdAt).toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return new Date(record.createdAt) >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return new Date(record.createdAt) >= monthAgo
        case 'income':
          return isIncome(record)
        case 'expense':
          return !isIncome(record)
        default:
          return true
      }
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRecords = filterRecords(records)

  // 计算统计
  const totalIncome = filteredRecords
    .filter(r => r.amount > 0)
    .reduce((sum, r) => sum + r.amount, 0)
  
  const totalExpense = filteredRecords
    .filter(r => r.amount < 0)
    .reduce((sum, r) => sum + Math.abs(r.amount), 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="points-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>积分明细</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="detail-stats">
          <div className="stat-item income">
            <span className="stat-label">收入</span>
            <span className="stat-value">+{totalIncome}</span>
          </div>
          <div className="stat-item expense">
            <span className="stat-label">支出</span>
            <span className="stat-value">-{totalExpense}</span>
          </div>
        </div>

        {/* 筛选 */}
        <div className="filter-section">
          <Filter size={14} />
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >全部</button>
            <button 
              className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
              onClick={() => setFilter('income')}
            >收入</button>
            <button 
              className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
              onClick={() => setFilter('expense')}
            >支出</button>
            <button 
              className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >今日</button>
            <button 
              className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >本周</button>
            <button 
              className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
              onClick={() => setFilter('month')}
            >本月</button>
          </div>
        </div>

        {/* 记录列表 */}
        <div className="detail-records">
          {loading ? (
            <div className="no-records"><p>加载中...</p></div>
          ) : (
          filteredRecords.map(record => (
            <div 
              key={record.id} 
              className={`detail-record ${isIncome(record) ? 'income' : 'expense'}`}
            >
              <div className="record-icon">{getRecordIcon(record.type)}</div>
              <div className="record-content">
                <div className="record-header">
                  <span className="record-type">{getRecordTypeLabel(record.type)}</span>
                  <span className="record-balance">余额: {record.balance}</span>
                </div>
                <div className="record-desc">{record.description}</div>
                <div className="record-time">
                  <Calendar size={12} />
                  {formatDate(record.createdAt)}
                </div>
              </div>
              <div className={`record-amount ${isIncome(record) ? 'positive' : 'negative'}`}>
                {isIncome(record) ? '+' : ''}{record.amount}
              </div>
            </div>
          ))
          )}
          {!loading && filteredRecords.length === 0 && (
            <div className="no-records">
              <p>暂无记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
