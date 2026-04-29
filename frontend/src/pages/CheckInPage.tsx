import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  Heart,
  ChevronLeft,
  ChevronRight,
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
  Info,
  X,
} from 'lucide-react'
import type { SportType, CheckInFormData, CheckInMode } from '../types/checkIn'
import { DEFAULT_SPORT_TYPES } from '../types/checkIn'
import { DEFAULT_POSITIVE_CATEGORIES } from '../types/positive'
import CheckInForm from '../components/checkIn/CheckInForm'
import { useBottomNavSuppressSetter } from '../context/BottomNavSuppressContext'
import * as checkInApi from '../api/checkin'
import { getTodayEarnedPoints } from '../api/points'
import type {
  ExerciseRecordItem,
  PositiveRecordItem,
} from '../api/checkin'

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
  const setSuppressBottomNav = useBottomNavSuppressSetter()
  const [activeTab, setActiveTab] = useState<CheckInType>('exercise')
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
  const [successData, setSuccessData] = useState<{
    type: string
    title: string
    communitySyncWarning?: string
    /** 有发圈分时用于副文案：打卡 + 发圈 */
    sessionCheckInPoints?: number
    sessionPointsHint?: string
  } | null>(null)
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

  useEffect(() => {
    if (!setSuppressBottomNav) return
    const hideBottom =
      showSuccess || (checkInMode === 'single' && activeTab === 'exercise')
    setSuppressBottomNav(hideBottom)
    return () => setSuppressBottomNav(false)
  }, [showSuccess, checkInMode, activeTab, setSuppressBottomNav])

  const getSportName = (id: string) => {
    const s = sportTypes.find(st => st.id === id)
    return s ? s.name : id
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
        syncToCommunity: data.syncToCommunity !== false,
      })
      setEarnedPoints(res.points)
      setTodayEarnedPoints(typeof res.todayEarnedPoints === 'number' ? res.todayEarnedPoints : null)
      const syncWarn =
        res.communitySync?.attempted && res.communitySync?.success === false
          ? res.communitySync?.message || '未能同步到圈子，可稍后在圈子手动分享'
          : undefined
      setShowSuccess(true)
      setSuccessData({
        type: 'exercise',
        title: '运动打卡成功',
        communitySyncWarning: syncWarn,
        sessionCheckInPoints: res.points,
        sessionPointsHint: res.pointsHint,
      })
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

  const [displayPoints, setDisplayPoints] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [todayEarnedPoints, setTodayEarnedPoints] = useState<number | null>(null)
  const [sessionPointsHintOpen, setSessionPointsHintOpen] = useState(false)

  useEffect(() => {
    if (!showSuccess) return
    setDisplayPoints(0)
    setShowConfetti(true)
    const duration = 1200
    const steps = 30
    const increment = earnedPoints / steps
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= earnedPoints) {
        setDisplayPoints(earnedPoints)
        clearInterval(timer)
      } else {
        setDisplayPoints(Math.floor(current))
      }
    }, interval)
    return () => {
      clearInterval(timer)
      setShowConfetti(false)
    }
  }, [showSuccess, earnedPoints])

  useEffect(() => {
    if (!showSuccess) {
      setTodayEarnedPoints(null)
      setSessionPointsHintOpen(false)
      return
    }
    if (todayEarnedPoints !== null) return
    let cancelled = false
    getTodayEarnedPoints().then((n) => {
      if (!cancelled) setTodayEarnedPoints(n ?? 0)
    })
    return () => {
      cancelled = true
    }
  }, [showSuccess, todayEarnedPoints])

  useEffect(() => {
    if (!sessionPointsHintOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSessionPointsHintOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sessionPointsHintOpen])

  if (showSuccess) {
    const successKind = successData?.type ?? 'exercise'
    const sessionPointsHint = successData?.sessionPointsHint
    const showZeroPointHint = earnedPoints === 0 && !!sessionPointsHint
    const showLimitHint = sessionPointsHint === '今日运动积分已达上限'
    const sessionPointsHintText = showLimitHint
      ? '打卡记录会保留，今日最多 2 次可得积分。'
      : (sessionPointsHint ?? '本次打卡未获得积分。')
    return (
      <>
      <div className="page checkin-success-page" style={{ padding: 0 }}>
        <div className={`success-page-wrapper success-page-wrapper--${successKind}`}>
          {showConfetti && (
            <div className="confetti-container" aria-hidden>
              {[...Array(30)].map((_, i) => (
                <div key={i} className={`confetti confetti--${i % 5}`} style={{ 
                  '--delay': `${Math.random() * 2.8}s`,
                  '--x': `${4 + Math.random() * 92}%`,
                  '--rotation': `${Math.random() * 360}deg`,
                } as React.CSSProperties} />
              ))}
            </div>
          )}
          <div className="success-bg-particles" aria-hidden>
            {[...Array(52)].map((_, i) => {
              const left = ((i * 37 + 11) % 92) + 4
              const top = ((i * 19 + 23) % 88) + 6
              const size = 2 + (i % 6) * 0.65
              const dur = 11 + (i % 10) * 1.1
              const delay = ((i * 0.21) % 5) + (i % 3) * 0.4
              const tx = -14 + (i % 9) * 3.5
              const ty = -22 + (i % 7) * 5.5
              const opacity = 0.32 + (i % 8) * 0.06
              return (
                <span
                  key={`bg-particle-${i}`}
                  className={`success-bg-particle success-bg-particle--${i % 4}`}
                  style={{
                    '--p-left': `${left}%`,
                    '--p-top': `${top}%`,
                    '--p-size': `${size}px`,
                    '--p-dur': `${dur}s`,
                    '--p-delay': `${delay}s`,
                    '--p-tx': `${tx}px`,
                    '--p-ty': `${ty}px`,
                    '--p-opacity': opacity,
                  } as React.CSSProperties}
                />
              )
            })}
          </div>
          <div className="success-page-top-bar">
            <button
              type="button"
              className="success-page-back"
              onClick={handleSuccessClose}
              aria-label="返回"
            >
              <ChevronLeft size={28} strokeWidth={2.25} />
            </button>
            <p className="success-page-type-label">{successData?.title ?? '打卡已完成'}</p>
          </div>
          <div className="success-page-main">
            <div className="success-card" role="status" aria-live="polite" aria-atomic="true">
              <img
                src="/success-mascot.png"
                alt=""
                className="success-mascot"
                width={200}
                height={200}
                decoding="async"
              />

              <div className="success-card-header">
                <div className="success-title-with-stamp">
                  <h1 className="success-title">恭喜！打卡成功</h1>
                  <img
                    src="/completed-today.png"
                    alt=""
                    className="success-done-stamp"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="success-card-body">
                <div
                  className="reward-card"
                  aria-label={`本次获得 ${displayPoints} 积分，今日已获得 ${todayEarnedPoints === null ? '加载中' : todayEarnedPoints} 积分`}
                >
                  <div className="reward-inline-row">
                    <div className="reward-segment">
                      <div className="reward-caption-with-hint">
                        <span className="reward-inline-value">{showZeroPointHint ? '—' : displayPoints}</span>
                        {showZeroPointHint ? (
                          <button
                            type="button"
                            className="reward-points-hint-trigger"
                            aria-haspopup="dialog"
                            aria-expanded={sessionPointsHintOpen}
                            aria-label="查看积分说明"
                            onClick={() => setSessionPointsHintOpen(true)}
                          >
                            <Info size={13} strokeWidth={2.5} aria-hidden />
                          </button>
                        ) : null}
                      </div>
                      <div className="reward-segment-fill" aria-hidden />
                      <span className="reward-caption">{showZeroPointHint ? sessionPointsHint : '本次获得积分'}</span>
                    </div>
                    <span className="reward-meta-divider" aria-hidden />
                    <div className="reward-segment reward-segment--today">
                      <span className="reward-inline-value">
                        {todayEarnedPoints === null ? '…' : todayEarnedPoints}
                      </span>
                      <div className="reward-segment-fill" aria-hidden />
                      <span className="reward-today-label">今日获得积分</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="success-card-footer">
                {successData?.communitySyncWarning ? (
                  <p className="checkin-success-sync-warning" role="alert">
                    {successData.communitySyncWarning}
                  </p>
                ) : null}
                <p className="encourage-text">每一次运动都是进步，继续保持！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {sessionPointsHintOpen ? (
        <div
          className="checkin-points-hint-overlay"
          role="presentation"
          onClick={() => setSessionPointsHintOpen(false)}
        >
          <div
            className="checkin-points-hint-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-checkin-points-hint-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="checkin-points-hint-close"
              aria-label="关闭"
              onClick={() => setSessionPointsHintOpen(false)}
            >
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
            <h2 id="exercise-checkin-points-hint-title" className="checkin-points-hint-title">
              积分说明
            </h2>
            <p className="checkin-points-hint-body">{sessionPointsHintText}</p>
            <div className="checkin-points-hint-actions">
              <button
                type="button"
                className="checkin-points-hint-ok"
                onClick={() => setSessionPointsHintOpen(false)}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </>
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

    </div>
  )
}
