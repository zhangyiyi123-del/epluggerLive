import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
  Sparkles,
  TrendingUp,
  Star,
  Footprints,
  Dumbbell,
  Mountain,
  Bike,
  Waves,
  Activity,
  Volleyball,
  MountainSnow,
} from 'lucide-react'
import type { SportType, CheckInFormData, CheckInMode } from '../types/checkIn'
import { DEFAULT_SPORT_TYPES } from '../types/checkIn'
import { DEFAULT_POSITIVE_CATEGORIES } from '../types/positive'
import CheckInForm from '../components/checkIn/CheckInForm'
import * as checkInApi from '../api/checkin'
import type { ExerciseRecordItem, PositiveRecordItem } from '../api/checkin'

type CheckInType = 'exercise' | 'positive'

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('zh-CN')
  } catch {
    return iso
  }
}

export default function CheckInPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<CheckInType>('exercise')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [checkedDays, setCheckedDays] = useState<Set<number>>(new Set([1, 2, 3, 5, 8, 9, 12, 15, 16, 18, 20, 22]))
  const touchStartX = useRef<number | null>(null)

  const [sportTypes, setSportTypes] = useState<SportType[]>(DEFAULT_SPORT_TYPES)
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecordItem[]>([])
  const [positiveRecords, setPositiveRecords] = useState<PositiveRecordItem[]>([])
  const [checkInMode, setCheckInMode] = useState<CheckInMode | null>(null)
  const [selectedSportType, setSelectedSportType] = useState<SportType | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [successData, setSuccessData] = useState<{type: string; title: string} | null>(null)
  const [submitError, setSubmitError] = useState('')

  const loadSportTypes = async () => {
    const list = await checkInApi.getSportTypes()
    if (list.length > 0) setSportTypes(list)
  }
  const loadExerciseRecords = async () => {
    const res = await checkInApi.getExerciseRecords(0, 50)
    setExerciseRecords(res.content || [])
  }
  const loadPositiveRecords = async () => {
    try {
      const res = await checkInApi.getPositiveRecords(0, 50)
      setPositiveRecords(res?.content ?? [])
    } catch {
      setPositiveRecords([])
    }
  }
  useEffect(() => {
    loadSportTypes()
    loadExerciseRecords()
    loadPositiveRecords()
  }, [])

  const getSportName = (id: string) => {
    const s = sportTypes.find(st => st.id === id)
    return s ? s.name : id
  }
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const defaultSportType = sportTypes.find(s => s.isEnabled) ?? sportTypes[0]

  const handleStartExerciseCheckIn = () => {
    setCheckInMode('single')
    setSelectedSportType(defaultSportType)
    setAttachments([])
  }

  const handleExerciseEntry = (sportType: SportType) => {
    setCheckInMode('single')
    setSelectedSportType(sportType)
    setAttachments([])
  }

  const getExerciseStats = (sportTypeId: string) => {
    const records = exerciseRecords.filter(record => record.sportTypeId === sportTypeId)
    const count = records.length
    const totalMinutes = records.reduce((sum, record) => sum + record.duration, 0)
    return { count, totalMinutes }
  }

const getExerciseIcon = (sportTypeId: string) => {
  switch (sportTypeId) {
    case 'running':
      return <Footprints size={20} />
    case 'fitness':
      return <Dumbbell size={20} />
    case 'hiking':
      return <Mountain size={20} />
    case 'cycling':
      return <Bike size={20} />
    case 'swimming':
      return <Waves size={20} />
    case 'yoga':
      return <Activity size={20} />
    case 'ball':
      return <Volleyball size={20} />
    case 'climbing':
      return <MountainSnow size={20} />
    default:
      return <Activity size={20} />
  }
}


  const handleExerciseSubmit = async (data: CheckInFormData) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      let attachmentUrls: string[] = []
      if (data.attachments && data.attachments.length > 0) {
        attachmentUrls = await checkInApi.uploadAttachments(data.attachments.slice(0, 3))
      }
      const res = await checkInApi.submitExerciseCheckIn({
        sportTypeId: data.sportTypeId,
        duration: data.duration,
        durationUnit: data.durationUnit,
        distance: data.distance,
        distanceUnit: data.distanceUnit,
        intensity: data.intensity,
        attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      })
      setEarnedPoints(res.points)
      setShowSuccess(true)
      setSuccessData({ type: 'exercise', title: '运动打卡成功' })
      const today = new Date().getDate()
      setCheckedDays(prev => new Set(prev).add(today))
      await loadExerciseRecords()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setCheckInMode(null)
    setSelectedSportType(null)
    setAttachments([])
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    setCheckInMode(null)
    setSelectedSportType(null)
    setAttachments([])
    setSuccessData(null)
  }

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const weekNames = ['日', '一', '二', '三', '四', '五', '六']

const getPositiveIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'teamwork':
      return <Users size={20} />
    case 'culture':
      return <Sparkles size={20} />
    case 'growth':
      return <TrendingUp size={20} />
    case 'other':
      return <Star size={20} />
    default:
      return <Sparkles size={20} />
  }
}


  const getPositiveCategoryName = (categoryId: string) => {
    const category = DEFAULT_POSITIVE_CATEGORIES.find(item => item.id === categoryId)
    return category?.name ?? categoryId
  }

  if (showSuccess) {
    return (
      <div className="page">
        <div className="checkin-success">
          <div className="checkin-success-icon">
            <Check size={40} />
          </div>
          <h2 className="checkin-success-title">{successData?.title}！</h2>
          <div className="checkin-success-points">
            +{earnedPoints} 积分
          </div>
          
          <button className="btn btn-primary" onClick={handleSuccessClose}>
            完成
          </button>
        </div>
      </div>
    )
  }

  if (checkInMode === 'single' && activeTab === 'exercise') {
    return (
      <div className="publish-page exercise-checkin-page">
        <div className="publish-header">
          <button className="publish-back-btn" onClick={handleCancel}>
            <ChevronLeft size={22} />
          </button>
          <div className="publish-header-title">运动打卡</div>
          <div style={{ width: 44 }}></div>
        </div>

        <div className="publish-content exercise-checkin-content">
          {submitError && (
            <div className="form-error" style={{ marginBottom: 12 }}>{submitError}</div>
          )}
          <CheckInForm
            sportType={selectedSportType ?? defaultSportType}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            onSubmit={handleExerciseSubmit}
            onReset={() => setAttachments([])}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="page checkin-page"
      onTouchStart={event => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={event => {
        if (touchStartX.current === null) return
        const endX = event.changedTouches[0]?.clientX
        if (endX === undefined) return
        const deltaX = endX - touchStartX.current
        touchStartX.current = null
        if (Math.abs(deltaX) < 50) return
        if (deltaX < 0 && activeTab === 'exercise') {
          setActiveTab('positive')
        }
        if (deltaX > 0 && activeTab === 'positive') {
          setActiveTab('exercise')
        }
      }}
    >
      {/* Tab Switcher */}
      <div className="tab-switcher glass-tab checkin-tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'exercise' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercise')}
        >
          运动
        </button>
        <button 
          className={`tab-btn ${activeTab === 'positive' ? 'active' : ''}`}
          onClick={() => setActiveTab('positive')}
        >
          正向
        </button>
      </div>

      {/* 运动打卡Tab内容 */}
      {activeTab === 'exercise' ? (
        <>
          {/* 运动打卡入口 */}
          <div className="exercise-entry-list">
            {sportTypes
              .filter(sport => sport.isEnabled)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(sport => {
                const stats = getExerciseStats(sport.id)
                return (
                  <button
                    key={sport.id}
                    type="button"
                    className="exercise-entry-card"
                    onClick={() => handleExerciseEntry(sport)}
                  >
                    <span className="exercise-entry-top">
                      <span className="exercise-entry-info">
                        <span className={`exercise-entry-icon exercise-entry-icon--${sport.id}`}>
                          {getExerciseIcon(sport.id)}
                        </span>
                        <span className="exercise-entry-name">{sport.name}</span>
                      </span>
                    </span>
                    <span className="exercise-entry-stats">
                      {stats.count}次 · {stats.totalMinutes}分钟
                    </span>
                    <span className={`exercise-entry-chart exercise-entry-chart--${sport.id}`}>
                      <svg viewBox="0 0 120 40" aria-hidden="true" focusable="false">
                        <defs>
                          <linearGradient id={`exercise-chart-gradient-${sport.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          className="exercise-entry-chart-area"
                          d="M2 30 L18 30 L18 18 L34 18 L34 26 L50 26 L50 12 L66 12 L66 22 L82 22 L82 10 L98 10 L98 20 L118 20 L118 38 L2 38 Z"
                          style={{ fill: `url(#exercise-chart-gradient-${sport.id})` }}
                        />
                        <path
                          className="exercise-entry-chart-line"
                          d="M2 30 L18 30 L18 18 L34 18 L34 26 L50 26 L50 12 L66 12 L66 22 L82 22 L82 10 L98 10 L98 20 L118 20"
                        />
                      </svg>
                    </span>
                  </button>
                )
              })}
          </div>

          {/* 运动打卡记录 */}
          <div className="section">
            <div className="card">
              <div className="section-header checkin-record-header">
                <div className="flex items-center gap-2">
                  <h4 className="section-title">
                    <Flame size={18} className="section-icon" />
                    运动打卡记录
                  </h4>
                </div>
                <button className="view-all-btn" onClick={() => navigate('/checkin/exercise-records')}>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="record-card-list">
                {exerciseRecords.length > 0 ? (
                  exerciseRecords.slice(0, 3).map(r => (
                    <div key={r.id} className="record-card-item">
                      <div className={`record-card-icon record-card-icon--${r.sportTypeId}`}>
                        {getExerciseIcon(r.sportTypeId)}
                      </div>
                      <div className="record-card-content">
                        <div className="record-card-title">{r.sportTypeName || getSportName(r.sportTypeId)}</div>
                        <div className="record-card-meta">
                          <span>{formatDate(r.checkedInAt)}</span>
                          <span className="divider">·</span>
                          <span>{r.duration} 分钟 {r.distance != null ? `· ${r.distance}km` : ''}</span>
                        </div>
                      </div>
                      <div className="record-card-points">
                        <span className="points-value">+{r.points}</span>
                        <span className="points-label">积分</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Flame size={32} className="empty-icon" />
                    <p>暂无运动打卡记录</p>
                    <button className="btn btn-primary btn-sm" onClick={handleStartExerciseCheckIn}>
                      立即打卡
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </>
      ) : (
        <>
          {/* 快速入口 */}
          <div className="positive-entry-list">
            {DEFAULT_POSITIVE_CATEGORIES.slice(0, 4).map(category => (
              <button
                key={category.id}
                type="button"
                className="positive-entry-card"
                onClick={() => navigate('/checkin/positive', { state: { categoryId: category.id } })}
              >
                <span className={`positive-entry-icon positive-entry-icon--${category.id}`}>
                  {getPositiveIcon(category.id)}
                </span>
                <span className="positive-entry-content">
                  <span className="positive-entry-name">{category.name}</span>
                  <span className="positive-entry-desc">{category.description}</span>
                </span>
                <span className={`positive-entry-chart positive-entry-chart--${category.id}`}>
                  <svg viewBox="0 0 120 40" aria-hidden="true" focusable="false">
                    <defs>
                      <linearGradient id={`chart-gradient-${category.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      className="positive-entry-chart-area"
                      d="M2 32 L16 32 L16 18 L30 18 L30 26 L44 26 L44 10 L58 10 L58 24 L72 24 L72 14 L86 14 L86 8 L100 8 L100 22 L118 22 L118 38 L2 38 Z"
                      style={{ fill: `url(#chart-gradient-${category.id})` }}
                    />
                    <path
                      className="positive-entry-chart-line"
                      d="M2 32 L16 32 L16 18 L30 18 L30 26 L44 26 L44 10 L58 10 L58 24 L72 24 L72 14 L86 14 L86 8 L100 8 L100 22 L118 22"
                    />
                  </svg>
                </span>
              </button>
            ))}
          </div>

          {/* 正向打卡记录 */}
          <div className="section positive-records-section">
            <div className="card">
              <div className="section-header checkin-record-header">
                <div className="flex items-center gap-2">
                  <h4 className="section-title">
                    <Heart size={18} className="section-icon" />
                    正向打卡记录
                  </h4>
                </div>
                <button className="view-all-btn" onClick={() => navigate('/checkin/positive-records')}>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="record-card-list">
                {positiveRecords.length > 0 ? (
                  positiveRecords.slice(0, 3).map(r => (
                    <div key={r.id} className="record-card-item">
                      <div className={`positive-entry-icon positive-entry-icon--${r.categoryId}`}>
                        {getPositiveIcon(r.categoryId)}
                      </div>
                      <div className="record-card-content">
                        <div className="record-card-title">{r.description}</div>
                        <div className="record-card-meta">
                          <span>{formatDate(r.createdAt)}</span>
                          <span className="divider">·</span>
                          <span>{r.categoryName ?? getPositiveCategoryName(r.categoryId)}</span>
                        </div>
                      </div>
                      <div className="record-card-points positive">
                        <span className="points-value">+{r.points}</span>
                        <span className="points-label">积分</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Heart size={32} className="empty-icon" />
                    <p>暂无正向打卡记录</p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/checkin/positive')}>
                      立即打卡
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          
        </>
      )}

      {/* 日历 */}
      <div className="section">
        <div className="calendar">
          <div className="calendar-header">
            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold">
              {currentMonth.getFullYear()}年 {monthNames[currentMonth.getMonth()]}
            </span>
            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="calendar-grid">
            {weekNames.map(day => (
              <div key={day} className="calendar-day" style={{ fontWeight: 600, color: '#6B7280' }}>
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day other-month"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const today = new Date()
              const isToday = day === today.getDate() && 
                currentMonth.getMonth() === today.getMonth() && 
                currentMonth.getFullYear() === today.getFullYear()
              const isChecked = checkedDays.has(day)
              
              return (
                <div 
                  key={day} 
                  className={`calendar-day ${isToday ? 'today' : ''} ${isChecked ? 'checked' : ''}`}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 本月统计 */}
      <div className="section">
        <h4 className="section-title">本月统计</h4>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">12</div>
            <div className="stat-label">运动次数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#10B981' }}>8</div>
            <div className="stat-label">正向次数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#4F46E5' }}>680</div>
            <div className="stat-label">获得积分</div>
          </div>
        </div>
      </div>
    </div>
  )
}
