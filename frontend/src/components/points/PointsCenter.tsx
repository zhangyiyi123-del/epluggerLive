import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import type { UserPoints, PointsRecord } from '../../types/points'
import { getPointsRecords } from '../../api/points'
import { getPointsRecordIcon } from './pointsRecordMeta'

interface PointsCenterProps {
  userPoints: UserPoints
  onViewHistory?: () => void
}

export default function PointsCenter({ userPoints, onViewHistory }: PointsCenterProps) {
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
          {onViewHistory && (
            <button type="button" className="view-all-btn" onClick={onViewHistory}>
               <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* 记录列表 */}
        <div className="records-list">
          {recordsLoading ? (
            <div className="empty-records"><p>加载中...</p></div>
          ) : (
            <>
          {records.slice(0, 5).map(record => (
            <div key={record.id} className="record-item">
              <div className="record-icon">{getPointsRecordIcon(record.type)}</div>
              <div className="record-content">
                <div className="record-description">{record.description}</div>
                <div className="record-time">{formatTime(record.createdAt)}</div>
              </div>
              <div className={`record-amount ${record.amount >= 0 ? 'positive' : 'negative'}`}>
                {record.amount >= 0 ? '+' : ''}{record.amount}
              </div>
            </div>
          ))}
          {records.length === 0 && !recordsLoading && (
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
