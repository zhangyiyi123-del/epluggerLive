import { useEffect, useRef, useState } from 'react'
import { ChevronRight, ChevronLeft, CalendarDays, Pencil } from 'lucide-react'
import { getHome, type HomeResponse } from '../api/home'
import { me } from '../api/auth'
import type { User } from '../types/community'
import { getExerciseCheckedDays } from '../api/checkin'

/** 按当前时段返回问候语 */
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
}



const CIRCLE_R = 100
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R

const GOAL_OPTIONS = [3, 5, 7, 10, 14, 21]

/** 本周目标环形卡片：本周打卡完成率 + 运动/正向/连续打卡 */
function WeekGoalStatsCard({
  weekDoneCount,
  weekTargetCount,
  exerciseCount,
  positiveCount,
  streakDays,
  onTargetChange,
}: {
  weekDoneCount: number
  weekTargetCount: number
  exerciseCount: number
  positiveCount: number
  streakDays: number
  onTargetChange: (v: number) => void
}) {
  const pct = weekTargetCount > 0 ? Math.min(100, Math.round((weekDoneCount / weekTargetCount) * 100)) : 0
  const targetOffset = CIRCLE_CIRCUMFERENCE * (1 - pct / 100)
  const [offset, setOffset] = useState(CIRCLE_CIRCUMFERENCE)
  const [showPicker, setShowPicker] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOffset(targetOffset), 80)
    return () => clearTimeout(t)
  }, [targetOffset])

  return (
    <>
      <div className="home-stats-card">
        <div className="progress-circle">
          <svg width="180" height="180" viewBox="0 0 240 240">
            <circle className="circle-bg" cx="120" cy="120" r={CIRCLE_R} />
            <circle
              className="circle-progress"
              cx="120"
              cy="120"
              r={CIRCLE_R}
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={offset}
              transform="rotate(-90 120 120)"
            />
          </svg>
          <div className="progress-text">
            <div className="progress-percent">
              <span className="progress-percent-num">{pct}</span><span className="progress-percent-sign">%</span>
            </div>
            <div className="progress-label">已完成</div>
          </div>
        </div>
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value"><span className="stat-num">{exerciseCount}</span><span className="stat-unit">次</span></div>
            <div className="stat-label">运动打卡</div>
          </div>
          <div className="stat-item">
            <div className="stat-value"><span className="stat-num">{positiveCount}</span><span className="stat-unit">次</span></div>
            <div className="stat-label">正向打卡</div>
          </div>
          <div className="stat-item">
            <div className="stat-value"><span className="stat-num">{streakDays}</span><span className="stat-unit">天</span></div>
            <div className="stat-label">连续打卡</div>
          </div>
        </div>
        <div className="goal-row">
          <span className="goal-label">本周目标</span>
          <span className="goal-value-wrap">
            <span className="goal-value-num">{weekTargetCount}<span className="goal-unit">次</span></span>
            <button type="button" className="goal-edit-btn" onClick={() => setShowPicker(true)}>
              <Pencil size={13} />
            </button>
          </span>
        </div>
      </div>

      {/* 底部弹出选择框 */}
      {showPicker && (
        <div className="goal-picker-overlay" onClick={() => setShowPicker(false)}>
          <div className="goal-picker-sheet" onClick={e => e.stopPropagation()}>
            <div className="goal-picker-handle" />
            <div className="goal-picker-title">设置本周目标</div>
            <div className="goal-picker-grid">
              {GOAL_OPTIONS.map(v => (
                <button
                  key={v}
                  type="button"
                  className={`goal-picker-option${v === weekTargetCount ? ' goal-picker-option--active' : ''}`}
                  onClick={() => { onTargetChange(v); setShowPicker(false) }}
                >
                  <span className="goal-picker-num">{v}</span>
                  <span className="goal-picker-unit">次</span>
                </button>
              ))}
            </div>
            <button type="button" className="goal-picker-cancel" onClick={() => setShowPicker(false)}>取消</button>
          </div>
        </div>
      )}
    </>
  )
}

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const WEEK_NAMES = ['日', '一', '二', '三', '四', '五', '六']

const BANNERS = [
  { src: '/banner-exercise.png', alt: '运动打卡' },
  { src: '/banner-positive.png', alt: '正向打卡' },
]

export default function HomePage() {
  const [data, setData] = useState<HomeResponse | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 打卡日历
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [checkedDays, setCheckedDays] = useState<Set<number>>(new Set())
  const [weekTarget, setWeekTarget] = useState<number | null>(null)
  const [bannerIndex, setBannerIndex] = useState(0)
  const bannerTouchX = useRef<number | null>(null)
  const calSummaryMonth = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`
  const calFirstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
  const calDaysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()

  useEffect(() => {
    getExerciseCheckedDays(calSummaryMonth).then(days => setCheckedDays(new Set(days))).catch(() => {})
  }, [calSummaryMonth])

  const loadHome = () => {
    setLoading(true)
    setError(null)
    Promise.all([getHome(), me()])
      .then(([res, currentUser]) => {
        setData(res ?? null)
        setUser(currentUser ?? null)
        if (res == null) setError('加载失败，请稍后重试')
      })
      .catch(() => {
        setError('加载失败，请稍后重试')
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    const t = setTimeout(() => loadHome(), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex(i => (i + 1) % BANNERS.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  if (loading && !data) {
    return (
      <div className="page home-page">
        <div className="section" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
          加载中…
        </div>
      </div>
    )
  }

  const weekProgress = data?.weekProgress ?? { doneCount: 0, targetCount: 10, currentDurationMinutes: 0, targetDurationMinutes: 150, completed: false }
  const userStats = data?.userStats ?? { points: 0, checkInDays: 0, streak: 0, rank: 0, rankChange: 0 }
  const effectiveTarget = weekTarget ?? weekProgress.targetCount


  return (
    <div className="page home-page">
      {error && (
        <div className="section" style={{ padding: 12, background: 'var(--surface-warn)', color: 'var(--text-primary)', marginBottom: 8 }}>
          <p style={{ margin: 0 }}>{error}</p>
          <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={loadHome}>重试</button>
        </div>
      )}
      

      {/* ① 问候语 + 姓名 */}
      <div className="home-greeting-row">
        <span className="home-greeting-text">{getGreeting()}，</span>
        <span className="home-greeting-name">{user?.name ?? '员工用户'}</span>
      </div>

      {/* ② 本周目标环形卡片 */}
      <WeekGoalStatsCard
        weekDoneCount={weekProgress.doneCount}
        weekTargetCount={effectiveTarget}
        exerciseCount={data?.weekExerciseCount ?? 0}
        positiveCount={data?.weekPositiveCount ?? 0}
        streakDays={userStats.streak}
        onTargetChange={setWeekTarget}
      />

      {/* ③ 轮播图 */}
      <div
        className="home-banner-carousel"
        onTouchStart={e => { bannerTouchX.current = e.touches[0]?.clientX ?? null }}
        onTouchEnd={e => {
          if (bannerTouchX.current === null) return
          const dx = (e.changedTouches[0]?.clientX ?? 0) - bannerTouchX.current
          bannerTouchX.current = null
          if (Math.abs(dx) < 40) return
          setBannerIndex(i => dx < 0 ? (i + 1) % BANNERS.length : (i - 1 + BANNERS.length) % BANNERS.length)
        }}
      >
        <div className="home-banner-track" style={{ transform: `translateX(-${bannerIndex * 100}%)` }}>
          {BANNERS.map(b => (
            <div key={b.src} className="home-banner-slide">
              <img src={b.src} alt={b.alt} className="home-banner-img" />
            </div>
          ))}
        </div>
        <div className="home-banner-dots">
          {BANNERS.map((_, i) => (
            <span
              key={i}
              className={`home-banner-dot${i === bannerIndex ? ' home-banner-dot--active' : ''}`}
              onClick={() => setBannerIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* ④ 协同激励共成长 Banner */}
      {/* <div className="home-incentive-banner">
        <div className="home-incentive-content">
          <div className="home-incentive-title">协同激励共成长</div>
          <div className="home-incentive-desc">正向打卡记录工作节奏，运动打卡保持健康活力，动态分享传递正能量。</div>
        </div>
        <img src="/banner-incentive.png" className="home-incentive-img" alt="协同激励" />
      </div> */}


      {/* ③ 打卡日历 */}
      <div className="home-section-card home-calendar-card">
        <div className="section-header">
          <h3 className="section-title" style={{ margin: 0, fontSize: 15 }}>
            <CalendarDays size={15} style={{ marginRight: 5, color: 'var(--primary-color)' }} />
            打卡日历
          </h3>
        </div>
        <div className="home-calendar">
          <div className="home-calendar-nav">
            <button type="button" className="home-cal-nav-btn" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>
              <ChevronLeft size={16} />
            </button>
            <span className="home-cal-title">{calendarMonth.getFullYear()}年 {MONTH_NAMES[calendarMonth.getMonth()]}</span>
            <button type="button" className="home-cal-nav-btn" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="home-cal-grid">
            {WEEK_NAMES.map(d => (
              <div key={d} className="home-cal-week-label">{d}</div>
            ))}
            {Array.from({ length: calFirstDay }).map((_, i) => (
              <div key={`e-${i}`} className="home-cal-day home-cal-day--empty" />
            ))}
            {Array.from({ length: calDaysInMonth }).map((_, i) => {
              const day = i + 1
              const today = new Date()
              const isToday = day === today.getDate() && calendarMonth.getMonth() === today.getMonth() && calendarMonth.getFullYear() === today.getFullYear()
              const isChecked = checkedDays.has(day)
              return (
                <div key={day} className={`home-cal-day${isToday ? ' home-cal-day--today' : ''}${isChecked ? ' home-cal-day--checked' : ''}`}>
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}
