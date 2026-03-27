import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import type { UserPoints, PointsRecord } from '../../types/points'
import { getPointsRecords } from '../../api/points'

interface PointsCenterProps {
  userPoints: UserPoints
  onViewHistory?: () => void
}

const RECORD_ICONS: Record<string, string> = {
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
  'medal-reward': '🏆',
  'medal_reward': '🏆',
  'exchange': '🛒',
  'expired': '⏰',
  'deduct': '❌',
  'refund': '✅',
}

export default function PointsCenter({ userPoints, onViewHistory }: PointsCenterProps) {
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [records, setRecords] = useState<PointsRecord[]>([])
  const [recordsLoading, setRecordsLoading] = useState(true)

  useEffect(() => {
    getPointsRecords(0, 20).then((res) => {
      setRecords(res.content ?? [])
    }).finally(() => setRecordsLoading(false))
  }, [])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
  }

  const getRecordIcon = (type: string) => RECORD_ICONS[type] || '📌'

  const filterRecords = (records: PointsRecord[]) => {
    const now = new Date()
    switch (filter) {
      case 'today':
        return records.filter(r => {
          const recordDate = new Date(r.createdAt)
          return recordDate.toDateString() === now.toDateString()
        })
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return records.filter(r => new Date(r.createdAt) >= weekAgo)
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return records.filter(r => new Date(r.createdAt) >= monthAgo)
      default:
        return records
    }
  }

  const filteredRecords = filterRecords(records)

  return (
    <div className="points-center">
      {/* 累计积分、已使用积分、可用积分 一行展示（紧凑样式） */}
      <div className="points-center-summary">
        <div className="points-center-summary-item">
          <span className="points-center-summary-label">累计积分</span>
          <span className="points-center-summary-value">{userPoints.totalEarnedPoints.toLocaleString()}</span>
        </div>
        <div className="points-center-summary-divider" />
        <div className="points-center-summary-item">
          <span className="points-center-summary-label">已使用</span>
          <span className="points-center-summary-value">{userPoints.totalUsedPoints.toLocaleString()}</span>
        </div>
        <div className="points-center-summary-divider" />
        <div className="points-center-summary-item">
          <span className="points-center-summary-label">可用积分</span>
          <span className="points-center-summary-value">{userPoints.availablePoints.toLocaleString()}</span>
        </div>
      </div>

      {/* 积分明细（原最近变动） */}
      <div className="points-records-section">
        <div className="section-header">
          <h4>积分明细</h4>
          <button className="view-all-btn" onClick={onViewHistory}>
            查看全部 <ChevronRight size={14} />
          </button>
        </div>

        {/* 筛选标签 */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >全部</button>
          <button 
            className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >今日</button>
          <button 
            className={`filter-tab ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >本周</button>
          <button 
            className={`filter-tab ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >本月</button>
        </div>

        {/* 记录列表 */}
        <div className="records-list">
          {recordsLoading ? (
            <div className="empty-records"><p>加载中...</p></div>
          ) : (
            <>
          {filteredRecords.slice(0, 5).map(record => (
            <div key={record.id} className="record-item">
              <div className="record-icon">{getRecordIcon(record.type)}</div>
              <div className="record-content">
                <div className="record-description">{record.description}</div>
                <div className="record-time">{formatTime(record.createdAt)}</div>
              </div>
              <div className={`record-amount ${record.amount >= 0 ? 'positive' : 'negative'}`}>
                {record.amount >= 0 ? '+' : ''}{record.amount}
              </div>
            </div>
          ))}
          {filteredRecords.length === 0 && !recordsLoading && (
            <div className="empty-records">
              <p>暂无积分记录</p>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
