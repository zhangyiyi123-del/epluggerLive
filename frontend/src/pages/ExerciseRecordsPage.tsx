import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Footprints, Dumbbell, Mountain, Bike, Waves, Activity, Volleyball, MountainSnow } from 'lucide-react'
import { DEFAULT_SPORT_TYPES } from '../types/checkIn'
import * as checkInApi from '../api/checkin'
import type { ExerciseRecordItem } from '../api/checkin'

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('zh-CN')
  } catch {
    return iso
  }
}

const getSportName = (id: string, name?: string) => {
  if (name) return name
  const sport = DEFAULT_SPORT_TYPES.find(st => st.id === id)
  return sport ? sport.name : id
}

const getSportIcon = (id: string) => {
  switch (id) {
    case 'running':
      return <Footprints size={24} />
    case 'fitness':
      return <Dumbbell size={24} />
    case 'hiking':
      return <Mountain size={24} />
    case 'cycling':
      return <Bike size={24} />
    case 'swimming':
      return <Waves size={24} />
    case 'yoga':
      return <Activity size={24} />
    case 'ball':
      return <Volleyball size={24} />
    case 'climbing':
      return <MountainSnow size={24} />
    default:
      return <Activity size={24} />
  }
}

export default function ExerciseRecordsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [records, setRecords] = useState<ExerciseRecordItem[]>([])

  useEffect(() => {
    let cancelled = false
    checkInApi.getExerciseRecords(0, 100).then(res => {
      if (!cancelled) setRecords(res.content || [])
    })
    return () => { cancelled = true }
  }, [])

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayOfWeek = (now.getDay() + 6) % 7
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.checkedInAt)
    if (Number.isNaN(recordDate.getTime())) return false
    if (filter === 'today') return recordDate >= startOfToday
    if (filter === 'week') return recordDate >= startOfWeek
    if (filter === 'month') return recordDate >= startOfMonth
    return true
  })

  return (
    <div className="publish-page exercise-records-page">
      <div className="publish-header">
        <button className="publish-back-btn" onClick={() => navigate('/checkin')}>
          <ChevronLeft size={22} />
        </button>
        <div className="publish-header-title">运动记录</div>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="publish-content exercise-records-content">
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
            filteredRecords.map(record => (
              <div key={record.id} className="exercise-record-card">
                <div className="exercise-record-left">
                  <div className={`exercise-record-icon exercise-record-icon--${record.sportTypeId}`}>{getSportIcon(record.sportTypeId)}</div>
                  <div className="exercise-record-name">{getSportName(record.sportTypeId, record.sportTypeName)}</div>
                </div>
                <div className="exercise-record-right">
                  <div className="exercise-record-metrics">
                    <div className="metric-row">
                      <span className="metric-bar duration"></span>
                      <span className="metric-label">时长</span>
                      <span className="metric-value">
                        <span className="metric-number">{record.duration}</span>
                        <span className="metric-unit">min</span>
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-bar distance"></span>
                      <span className="metric-label">距离</span>
                      <span className="metric-value">
                        {record.distance != null ? (
                          <>
                            <span className="metric-number">{Number(record.distance).toFixed(1)}</span>
                            <span className="metric-unit">km</span>
                          </>
                        ) : (
                          <span className="metric-number">--</span>
                        )}
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
                        <span className="metric-number">{formatDate(record.checkedInAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>暂无运动打卡记录</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/checkin')}>
                返回打卡
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
