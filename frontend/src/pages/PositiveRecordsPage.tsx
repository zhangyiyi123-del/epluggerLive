import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Users, Sparkles, TrendingUp, Star } from 'lucide-react'
import * as checkInApi from '../api/checkin'
import type { PositiveRecordItem } from '../api/checkin'

const formatDate = (iso: string | number) => {
  try {
    return new Date(iso).toLocaleDateString('zh-CN')
  } catch {
    return String(iso)
  }
}

const getCategoryName = (record: PositiveRecordItem) => record.categoryName || '正向'

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'teamwork':
      return <Users size={24} />
    case 'culture':
      return <Sparkles size={24} />
    case 'growth':
      return <TrendingUp size={24} />
    case 'other':
      return <Star size={24} />
    default:
      return <Sparkles size={24} />
  }
}

export default function PositiveRecordsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [records, setRecords] = useState<PositiveRecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadRecords = () => {
    setLoadError(null)
    setLoading(true)
    checkInApi.getPositiveRecords(0, 50).then(data => {
      setRecords(data?.content ?? [])
      setLoading(false)
    }).catch(() => {
      setLoadError('加载失败，请检查登录或网络')
      setRecords([])
      setLoading(false)
    })
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayOfWeek = (now.getDay() + 6) % 7
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.createdAt)
    if (Number.isNaN(recordDate.getTime())) return false
    if (filter === 'today') return recordDate >= startOfToday
    if (filter === 'week') return recordDate >= startOfWeek
    if (filter === 'month') return recordDate >= startOfMonth
    return true
  })

  return (
    <div className="publish-page positive-records-page">
      <div className="publish-header">
        <button className="publish-back-btn" onClick={() => navigate('/checkin')}>
          <ChevronLeft size={22} />
        </button>
        <div className="publish-header-title">正向记录</div>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="publish-content">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >全部</button>
          <button
            className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >本日</button>
          <button
            className={`filter-tab ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >本周</button>
          <button
            className={`filter-tab ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >本月</button>
        </div>

        <div className="exercise-records-list">
          {loading ? (
            <div className="empty-state"><p>加载中...</p></div>
          ) : loadError ? (
            <div className="empty-state">
              <p>{loadError}</p>
              <button className="btn btn-primary btn-sm" type="button" onClick={loadRecords}>重试</button>
            </div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map(record => (
              <div key={record.id} className="exercise-record-card">
                <div className="exercise-record-left">
                  <div className={`exercise-record-icon exercise-record-icon--${record.categoryId}`}>{getCategoryIcon(record.categoryId)}</div>
                  <div className="exercise-record-name">{getCategoryName(record)}</div>
                </div>
                <div className="exercise-record-right">
                  <div className="exercise-record-metrics">
                    <div className="metric-row">
                      <span className="metric-bar duration"></span>
                      <span className="metric-label">内容</span>
                      <span className="metric-value">
                        <span className="metric-text">{record.description}</span>
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-bar distance"></span>
                      <span className="metric-label">类别</span>
                      <span className="metric-value">
                        <span className="metric-text">{record.categoryName}</span>
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-bar points"></span>
                      <span className="metric-label">积分</span>
                      <span className="metric-value">
                        <span className="metric-number">+{record.points}</span>
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-bar time"></span>
                      <span className="metric-label">时间</span>
                      <span className="metric-value">
                        <span className="metric-number">{formatDate(record.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>暂无正向打卡记录</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/checkin/positive')}>
                立即打卡
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
