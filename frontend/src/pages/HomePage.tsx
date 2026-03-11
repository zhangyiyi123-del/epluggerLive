import { Trophy, ChevronRight, Flame, Users, Footprints, FileText, Hand, Check, Heart, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const userStats = {
  points: 2850,
  checkInDays: 28,
  streak: 7,
  rank: 15,
  rankChange: 3,
}

const checkInKpi = {
  todayDone: 2,
  todayTarget: 3,
  weekDone: 5,
  weekTarget: 15,
}

const recentActivities = [
  { id: 1, title: '晨跑5公里', time: '今天 07:30', points: '+50', Icon: Footprints, color: '#F87171' },
  { id: 2, title: '帮助新人解答问题', time: '昨天 15:20', points: '+30', Icon: Users, color: '#10B981' },
  { id: 3, title: '完成周报', time: '昨天 09:00', points: '+20', Icon: FileText, color: '#3B82F6' },
]

const hotPosts = [
  { id: 'p4', avatar: '赵', avatarColor: '#6366F1', name: '赵强', dept: '运营部', text: '这段时间在准备公司年度分享会，整理了很多过往项目的复盘心得…', likes: 42, comments: 9 },
  { id: 'p5', avatar: '孙', avatarColor: '#10B981', name: '孙丽', dept: '市场部', text: '周末和同事一起完成了一次线下路跑活动，沿途风景太美了！', likes: 31, comments: 6 },
]

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

export default function HomePage() {
  const navigate = useNavigate()
  const todayPct = Math.min(Math.round((checkInKpi.todayDone / checkInKpi.todayTarget) * 100), 100)
  const weekPct  = Math.min(Math.round((checkInKpi.weekDone  / checkInKpi.weekTarget)  * 100), 100)
  const todayDone = checkInKpi.todayDone >= checkInKpi.todayTarget

  return (
    <div className="page">

      {/* ① 今日打卡进度 */}
      <div className="home-hero">
        {/* 左侧：问候 + 按钮 */}
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

        {/* 右侧：双环 */}
        <div className="home-hero-rings">
          <div className="home-hero-ring-item">
            <div className="home-hero-ring-wrap">
              <RingProgress pct={todayPct} size={88} stroke={8} color={todayDone ? '#10B981' : '#6366F1'} />
              <div className="home-hero-ring-inner">
                <span className="home-hero-pct">{todayPct}%</span>
              </div>
            </div>
            <div className="home-hero-ring-label">今日</div>
            <div className="home-hero-ring-sub">{checkInKpi.todayDone}/{checkInKpi.todayTarget}</div>
          </div>
          <div className="home-hero-ring-item">
            <div className="home-hero-ring-wrap">
              <RingProgress pct={weekPct} size={88} stroke={8} color="#F59E0B" />
              <div className="home-hero-ring-inner">
                <span className="home-hero-pct">{weekPct}%</span>
              </div>
            </div>
            <div className="home-hero-ring-label">本周</div>
            <div className="home-hero-ring-sub">{checkInKpi.weekDone}/{checkInKpi.weekTarget}</div>
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
            #{userStats.rank}
            <span className="home-stat-rank-up">↑{userStats.rankChange}</span>
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
        <div className="activity-list">
          {recentActivities.map(a => (
            <div key={a.id} className="activity-item">
              <div className="home-activity-icon" style={{ background: a.color }}>
                <a.Icon size={18} color="#fff" strokeWidth={2.1} />
              </div>
              <div className="activity-content">
                <div className="font-medium text-sm">{a.title}</div>
                <div className="text-light text-sm">{a.time}</div>
              </div>
              <span className="badge badge-success">{a.points}</span>
            </div>
          ))}
        </div>
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
        <div className="home-posts">
          {hotPosts.map(p => (
            <div key={p.id} className="home-post-item" onClick={() => navigate('/community')}>
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
      </div>

    </div>
  )
}
