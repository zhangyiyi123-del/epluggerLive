import { useEffect, useState } from 'react'
import { Trophy, ChevronRight, Flame, Users, Footprints, Hand, Check, Heart, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getHome, type HomeResponse, type RecentCheckInItem } from '../api/home'

// 环形进度 SVG 组件
function RingProgress({ pct, size = 120, stroke = 10, color = '#4F46E5' }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F0F5" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

function ActivityIcon({ type }: { type: string }) {
  const color = type === 'exercise' ? '#F87171' : '#10B981'
  return (
    <div className="home-activity-icon" style={{ background: color }}>
      {type === 'exercise' ? <Footprints size={18} color="#fff" strokeWidth={2.1} /> : <Users size={18} color="#fff" strokeWidth={2.1} />}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<HomeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHome = () => {
    setLoading(true)
    setError(null)
    getHome()
      .then((res) => {
        setData(res ?? null)
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

  if (loading && !data) {
    return (
      <div className="page">
        <div className="section" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
          加载中…
        </div>
      </div>
    )
  }

  const todayProgress = data?.todayProgress ?? { doneCount: 0, targetCount: 3, currentDurationMinutes: 0, targetDurationMinutes: 30, completed: false }
  const weekProgress = data?.weekProgress ?? { doneCount: 0, targetCount: 15, currentDurationMinutes: 0, targetDurationMinutes: 150, completed: false }
  const userStats = data?.userStats ?? { points: 0, checkInDays: 0, streak: 0, rank: 0, rankChange: 0 }
  const recentCheckIns: RecentCheckInItem[] = data?.recentCheckIns ?? []
  const hotPosts = data?.hotPosts ?? []

  const todayPct = todayProgress.targetCount > 0
    ? Math.min(Math.round((todayProgress.doneCount / todayProgress.targetCount) * 100), 100)
    : 0
  const weekPct = weekProgress.targetCount > 0
    ? Math.min(Math.round((weekProgress.doneCount / weekProgress.targetCount) * 100), 100)
    : 0
  const todayDone = todayProgress.completed || todayProgress.doneCount >= todayProgress.targetCount

  return (
    <div className="page">
      {error && (
        <div className="section" style={{ padding: 12, background: 'var(--surface-warn)', color: 'var(--text-primary)', marginBottom: 8 }}>
          <p style={{ margin: 0 }}>{error}</p>
          <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={loadHome}>重试</button>
        </div>
      )}

      {/* ① 今日打卡进度 */}
      <div className="home-hero">
        <div className="home-hero-left">
          <div className="home-hero-greeting">
            <Hand size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
            早上好
          </div>
          <div className="home-hero-name">员工用户</div>
          <div className="home-hero-streak">
            <Flame size={14} color="#F59E0B" />
            已连续打卡 <strong>{userStats.streak}</strong> 天
          </div>
          <button className="home-hero-btn" onClick={() => navigate('/checkin')}>
            {todayDone ? <><Check size={14} style={{ flexShrink: 0 }} /> 今日已完成</> : '去打卡'}
          </button>
        </div>
        <div className="home-hero-rings">
          <div className="home-hero-ring-item">
            <div className="home-hero-ring-wrap">
              <RingProgress pct={todayPct} size={88} stroke={8} color={todayDone ? '#10B981' : '#6366F1'} />
              <div className="home-hero-ring-inner">
                <span className="home-hero-pct">{todayPct}%</span>
              </div>
            </div>
            <div className="home-hero-ring-label">今日</div>
            <div className="home-hero-ring-sub">{todayProgress.doneCount}/{todayProgress.targetCount}</div>
          </div>
          <div className="home-hero-ring-item">
            <div className="home-hero-ring-wrap">
              <RingProgress pct={weekPct} size={88} stroke={8} color="#F59E0B" />
              <div className="home-hero-ring-inner">
                <span className="home-hero-pct">{weekPct}%</span>
              </div>
            </div>
            <div className="home-hero-ring-label">本周</div>
            <div className="home-hero-ring-sub">{weekProgress.doneCount}/{weekProgress.targetCount}</div>
          </div>
        </div>
      </div>

      {/* ② 我的数据 */}
      <div className="home-stats-row">
        <div className="card-kpi card-kpi--primary">
          <div className="home-stat-value">{userStats.points}</div>
          <div className="home-stat-label">累计积分</div>
        </div>
        <div className="card-kpi card-kpi--accent">
          <div className="home-stat-value">{userStats.checkInDays}</div>
          <div className="home-stat-label">打卡天数</div>
        </div>
        <div className="card-kpi card-kpi--success" onClick={() => navigate('/leaderboard')}>
          <div className="home-stat-value">
            #{userStats.rank || '–'}
            {userStats.rankChange > 0 && <span className="home-stat-rank-up">↑{userStats.rankChange}</span>}
          </div>
          <div className="home-stat-label">本周排名</div>
        </div>
      </div>

      {/* ③ 最近打卡记录 */}
      <div className="section" style={{ marginBottom: 14 }}>
        <div className="section-header">
          <h3 className="section-title" style={{ margin: 0, fontSize: 15 }}>
            <Trophy size={15} style={{ marginRight: 5, color: 'var(--accent-color)' }} />
            最近记录
          </h3>
          <button type="button" className="view-all-btn" onClick={() => navigate('/checkin')}>
            全部 <ChevronRight size={13} />
          </button>
        </div>
        {recentCheckIns.length === 0 ? (
          <div className="text-light text-sm" style={{ padding: 16 }}>暂无打卡记录</div>
        ) : (
          <div className="activity-list">
            {recentCheckIns.map((a) => (
              <div key={a.id} className="activity-item">
                <ActivityIcon type={a.type} />
                <div className="activity-content">
                  <div className="font-medium text-sm">{a.title}</div>
                  <div className="text-light text-sm">{a.time}</div>
                </div>
                <span className="badge badge-success">{a.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ④ 热门动态 */}
      <div className="section" style={{ marginBottom: 14 }}>
        <div className="section-header">
          <h3 className="section-title" style={{ margin: 0, fontSize: 15 }}>
            <Users size={15} style={{ marginRight: 5, color: 'var(--primary-color)' }} />
            热门动态
          </h3>
          <button type="button" className="view-all-btn" onClick={() => navigate('/community')}>
            去圈子 <ChevronRight size={13} />
          </button>
        </div>
        {hotPosts.length === 0 ? (
          <div className="text-light text-sm" style={{ padding: 16 }}>暂无热门动态</div>
        ) : (
          <div className="home-posts">
            {hotPosts.map((p) => (
              <div key={p.id} className="home-post-item" onClick={() => navigate(`/community/${p.id}`)}>
                <div className="home-post-avatar" style={{ background: p.avatarColor }}>{p.avatar}</div>
                <div className="home-post-body">
                  <div className="home-post-meta">
                    <span className="home-post-name">{p.name}</span>
                    <span className="home-post-dept">{p.dept}</span>
                  </div>
                  <p className="home-post-text">{p.text}</p>
                  <div className="home-post-stats">
                    <span className="home-post-stat-item">
                      <Heart size={12} />
                      {p.likes}
                    </span>
                    <span className="home-post-stat-item">
                      <MessageCircle size={12} />
                      {p.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
