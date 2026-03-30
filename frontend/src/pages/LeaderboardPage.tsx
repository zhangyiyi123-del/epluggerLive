import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Medal, Flame, Heart, ChevronRight, ChevronLeft, Star, Lock, ChevronDown } from 'lucide-react'
import { MOCK_USER_POINTS, LEVEL_CONFIGS } from '../types/points'
import type { UserPoints as UserPointsType } from '../types/points'
import PointsCenter from '../components/points/PointsCenter'
import LevelProgress from '../components/points/LevelProgress'
import MedalWall from '../components/points/MedalWall'
import PointsMallPage from './PointsMallPage'
import { getPointsMe, getLeaderboard, type LeaderboardEntry } from '../api/points'
import { useBottomNavSuppressSetter } from '../context/BottomNavSuppressContext'

type LeaderboardType = 'points' | 'exercise' | 'positive'

/** 时间范围：全部、本年、本月、本周、今日 */
type LeaderboardPeriod = 'all' | 'year' | 'month' | 'week' | 'today'

const typeLabels: Record<LeaderboardType, { title: string; unit: string; icon: any }> = {
  points: { title: '积分榜', unit: '积分', icon: Medal },
  exercise: { title: '运动榜', unit: '次', icon: Flame },
  positive: { title: '正向榜', unit: '次', icon: Heart },
}

const periodLabels: Record<LeaderboardPeriod, string> = {
  all: '全部',
  year: '本年',
  month: '本月',
  week: '本周',
  today: '今日',
}

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSuppressBottomNav = useBottomNavSuppressSetter()
  const [activeType, setActiveType] = useState<LeaderboardType>('points')
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>('all')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showMedalWall, setShowMedalWall] = useState(false)
  const [showFullMall, setShowFullMall] = useState(false)
  const [showPointsCenter, setShowPointsCenter] = useState(false)
  const [showLevelBenefits, setShowLevelBenefits] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  const [userPoints, setUserPoints] = useState<UserPointsType>(MOCK_USER_POINTS)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)

  useEffect(() => {
    getPointsMe().then((data) => {
      if (data) setUserPoints(data)
    })
  }, [])

  useEffect(() => {
    const s = location.state as { openPointsCenter?: boolean } | undefined
    if (s?.openPointsCenter) {
      setShowPointsCenter(true)
      navigate('/leaderboard', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (!setSuppressBottomNav) return
    const overlay = showPointsCenter || showFullMall
    setSuppressBottomNav(overlay)
    return () => setSuppressBottomNav(false)
  }, [showPointsCenter, showFullMall, setSuppressBottomNav])

  useEffect(() => {
    setLeaderboardLoading(true)
    getLeaderboard(activeType, activePeriod)
      .then((data) => setLeaderboardData(data ?? []))
      .finally(() => setLeaderboardLoading(false))
  }, [activeType, activePeriod])

  const currentData = leaderboardData
  const { title, unit, icon: Icon } = typeLabels[activeType]
  const myRankIndex = currentData.findIndex((u) => u.userId === userPoints.userId)
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null
  const myValue = myRankIndex >= 0 ? currentData[myRankIndex].value : userPoints.availablePoints

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false)
      }
    }
    if (showPeriodDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPeriodDropdown])

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1'
    if (rank === 2) return 'rank-2'
    if (rank === 3) return 'rank-3'
    return 'rank-other'
  }

  // 积分商城页面（带顶部标题与返回，与积分中心一致）
  if (showFullMall) {
    return <PointsMallPage onBack={() => setShowFullMall(false)} />
  }

  // 等级权益说明页（从积分中心内卡片问号进入）
  if (showPointsCenter && showLevelBenefits) {
    return (
      <div className="page page-points-center">
        <div className="publish-header">
          <button type="button" className="publish-back-btn" onClick={() => setShowLevelBenefits(false)}>
            <ChevronLeft size={22} />
          </button>
          <div className="publish-header-title">等级权益说明</div>
          <div style={{ width: 44 }} />
        </div>
        <div className="publish-content points-center-section">
          <div className="level-rank-section">
            <div className="level-rank-header level-rank-header-static">
              <span>等级与累计获得积分</span>
            </div>
            <div className="level-list">
              {LEVEL_CONFIGS.map(config => {
                const isCurrentOrHigher = config.level <= userPoints.level
                const isCurrent = config.level === userPoints.level
                return (
                  <div
                    key={config.level}
                    className={`level-item ${isCurrent ? 'current' : ''} ${!isCurrentOrHigher ? 'locked' : ''}`}
                  >
                    <div className="level-item-left">
                      {isCurrentOrHigher ? (
                        <Star size={16} className="level-star" />
                      ) : (
                        <Lock size={16} className="level-lock" />
                      )}
                      <span className="level-item-name">Lv{config.level}</span>
                    </div>
                    <div className="level-item-range">
                      {config.minPoints === 0 ? '0' : config.minPoints} - {config.maxPoints === Infinity ? '∞' : config.maxPoints}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 勋章墙弹窗
  if (showMedalWall) {
    return (
      <div className="page page-points-center">
        <div className="publish-header">
          <button type="button" className="publish-back-btn" onClick={() => setShowMedalWall(false)}>
            <ChevronLeft size={22} />
          </button>
          <div className="publish-header-title">我的勋章</div>
          <div style={{ width: 44 }} />
        </div>
        <div className="publish-content">
          <MedalWall userPoints={userPoints} onClose={() => setShowMedalWall(false)} />
        </div>
      </div>
    )
  }

  // 积分中心独立视图：顶部与发布动态一致（返回按钮 + 标题），内容区同 publish-content
  if (showPointsCenter) {
    return (
      <div className="page page-points-center">
        <div className="publish-header">
          <button type="button" className="publish-back-btn" onClick={() => setShowPointsCenter(false)}>
            <ChevronLeft size={22} />
          </button>
          <div className="publish-header-title">积分中心</div>
          <div style={{ width: 44 }} />
        </div>
        <div className="publish-content points-center-section">
          <LevelProgress 
            userPoints={userPoints}
            onViewMall={() => setShowFullMall(true)}
            onViewLevelBenefits={() => setShowLevelBenefits(true)}
          />
          <PointsCenter 
            userPoints={userPoints}
            onViewHistory={() => navigate('/points/records')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page page-leaderboard">
      {/* tab 切换 */}
      <div className="tab-switcher" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <button 
          className={`tab-btn ${activeType === 'points' ? 'active' : ''}`}
          onClick={() => setActiveType('points')}
        >
          {typeLabels.points.title}
        </button>
        <button 
          className={`tab-btn ${activeType === 'exercise' ? 'active' : ''}`}
          onClick={() => setActiveType('exercise')}
        >
          {typeLabels.exercise.title}
        </button>
        <button 
          className={`tab-btn ${activeType === 'positive' ? 'active' : ''}`}
          onClick={() => setActiveType('positive')}
        >
          {typeLabels.positive.title}
        </button>
      </div>

      {/* 排行榜 */}
      <>
        {/* Current User Rank */}
        <div className="card leaderboard-my-rank-card">
          <div className="flex justify-between items-center">
            <div>
              <div className="leaderboard-my-rank-label">我的当前排名</div>
              <div className="leaderboard-my-rank-row">
                <span className="leaderboard-my-rank-text">
                  {leaderboardLoading ? '加载中' : myRank != null ? `第${myRank}名` : '未上榜'}
                </span>
                <span className="leaderboard-my-rank-dot"> · </span>
                <span className="leaderboard-my-rank-text">{myValue} {unit}</span>
              </div>
            </div>
            <button
              type="button"
              className="leaderboard-center-entry"
              onClick={() => setShowPointsCenter(true)}
            >
              积分中心 <ChevronRight size={16} />
            </button>
          </div>
        </div>

          {/* Leaderboard List */}
          <div className="section">
            <div className="section-header-with-filter">
              <h3 className="section-title">
                <Icon size={18} />
                {title}
              </h3>
              <div className="leaderboard-filter-wrapper" ref={filterDropdownRef}>
                <button
                  type="button"
                  className="leaderboard-filter-btn"
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                >
                  <span className="leaderboard-filter-label">{periodLabels[activePeriod]}</span>
                  <ChevronDown 
                    size={14} 
                    className={`leaderboard-filter-chevron ${showPeriodDropdown ? 'open' : ''}`}
                  />
                </button>
                {showPeriodDropdown && (
                  <div className="leaderboard-period-dropdown">
                    {(['all', 'year', 'month', 'week', 'today'] as LeaderboardPeriod[]).map(period => (
                      <button
                        key={period}
                        type="button"
                        className={`leaderboard-period-option ${activePeriod === period ? 'active' : ''}`}
                        onClick={() => {
                          setActivePeriod(period)
                          setShowPeriodDropdown(false)
                        }}
                      >
                        {periodLabels[period]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 前三名：柱状领奖台阶梯展示（2nd | 1st | 3rd） */}
            {!leaderboardLoading && currentData.length >= 3 && (
              <div className="leaderboard-podium">
                <div className="podium-column podium-2nd">
                  <div className="podium-user">
                    <div className="podium-avatar-wrap">
                      <div className="podium-avatar">{currentData[1].initial}</div>
                      <img src="/rank-frame-2.png" className="podium-frame" alt="" />
                    </div>
                    <div className="podium-name">{currentData[1].name}</div>
                    <div className="podium-value">{currentData[1].value}<span className="podium-unit">{unit}</span></div>
                  </div>
                  <div className="podium-step">
                    <span className="podium-rank rank-2">2</span>
                  </div>
                </div>
                <div className="podium-column podium-1st">
                  <div className="podium-user">
                    <div className="podium-avatar-wrap">
                      <div className="podium-avatar">{currentData[0].initial}</div>
                      <img src="/rank-frame-1.png" className="podium-frame" alt="" />
                    </div>
                    <div className="podium-name">{currentData[0].name}</div>
                    <div className="podium-value">{currentData[0].value}<span className="podium-unit">{unit}</span></div>
                  </div>
                  <div className="podium-step">
                    <span className="podium-rank rank-1">1</span>
                  </div>
                </div>
                <div className="podium-column podium-3rd">
                  <div className="podium-user">
                    <div className="podium-avatar-wrap">
                      <div className="podium-avatar">{currentData[2].initial}</div>
                      <img src="/rank-frame-3.png" className="podium-frame" alt="" />
                    </div>
                    <div className="podium-name">{currentData[2].name}</div>
                    <div className="podium-value">{currentData[2].value}<span className="podium-unit">{unit}</span></div>
                  </div>
                  <div className="podium-step">
                    <span className="podium-rank rank-3">3</span>
                  </div>
                </div>
              </div>
            )}

            {/* 第4名及以后：同一张卡片内的列表 */}
            <div className="leaderboard-list-card">
              {leaderboardLoading ? (
                <div className="my-posts-empty"><p>加载中...</p></div>
              ) : (
              currentData.slice(3).map((user, index) => {
                const rank = index + 4
                return (
                  <div key={user.userId} className="leaderboard-item-inner">
                    <div className={`rank ${getRankClass(rank)}`}>
                      {rank}
                    </div>
                    <div className="avatar leaderboard-list-avatar">{user.initial}</div>
                    <div style={{ flex: 1 }}>
                      <div className="font-semibold">{user.name}</div>
                      {user.change !== undefined && user.change !== 0 && (
                        <div className="text-sm text-light">
                          {user.change > 0 ? `↑上升${user.change}名` : `↓下降${Math.abs(user.change)}名`}
                        </div>
                      )}
                    </div>
<div className="leaderboard-list-value">
                    {user.value}
                    <span className="text-sm text-light font-normal">{unit}</span>
                  </div>
                  </div>
                )
              })
              )}
            </div>
          </div>
        </>
    </div>
  )
}
