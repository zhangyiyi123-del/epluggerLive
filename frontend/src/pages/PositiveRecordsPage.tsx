import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Users, Sparkles, TrendingUp, Star } from 'lucide-react'
import { DEFAULT_POSITIVE_CATEGORIES } from '../types/positive'

type PositiveRecord = {
  id: string
  categoryId: string
  date: string
  description: string
  points: number
}

const MOCK_POSITIVE_RECORDS: PositiveRecord[] = [
  { id: 'p1', categoryId: 'teamwork', date: new Date().toISOString(), description: '帮助同事完成汇报', points: 30 },
  { id: 'p2', categoryId: 'culture', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), description: '参与社区捐赠', points: 40 },
  { id: 'p3', categoryId: 'growth', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: '完成学习分享并输出笔记', points: 35 },
  { id: 'p4', categoryId: 'teamwork', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), description: '跨部门协作推动需求落地', points: 45 },
]

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('zh-CN')
  } catch {
    return iso
  }
}

const getCategory = (id: string) => DEFAULT_POSITIVE_CATEGORIES.find(category => category.id === id)

const getCategoryName = (id: string) => {
  const category = DEFAULT_POSITIVE_CATEGORIES.find(c => c.id === id)
  return category ? category.name : '正向'
}

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

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayOfWeek = (now.getDay() + 6) % 7
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const filteredRecords = MOCK_POSITIVE_RECORDS.filter(record => {
    const recordDate = new Date(record.date)
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
          {filteredRecords.length > 0 ? (
            filteredRecords.map(record => {
              const category = getCategory(record.categoryId)
              return (
                <div key={record.id} className="exercise-record-card">
                  <div className="exercise-record-left">
                    <div className={`exercise-record-icon exercise-record-icon--${record.categoryId}`}>{getCategoryIcon(record.categoryId)}</div>
                    <div className="exercise-record-name">{getCategoryName(record.categoryId)}</div>
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
                          <span className="metric-text">{category?.name ?? '正向'}</span>
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
                          <span className="metric-number">{formatDate(record.date)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
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
