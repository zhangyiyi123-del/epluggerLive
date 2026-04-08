import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Medal, Flame, Heart, ChevronLeft, Star, Lock, ChevronDown } from 'lucide-react'
import { LEVEL_CONFIGS } from '../types/points'
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

const typeLabels: Record<LeaderboardType, { title: string; cardTitle: string; unit: string; icon: any }> = {
  points: { title: '积分榜', cardTitle: '积分排行榜', unit: '积分', icon: Medal },
  exercise: { title: '运动榜', cardTitle: '运动排行榜', unit: '次', icon: Flame },
  positive: { title: '正向榜', cardTitle: '正向排行榜', unit: '次', icon: Heart },
}

const periodLabels: Record<LeaderboardPeriod, string> = {
  all: '全部',
  year: '年榜',
  month: '月榜',
  week: '周榜',
  today: '日榜',
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

  const [userPoints, setUserPoints] = useState<UserPointsType>({
    userId: '',
    availablePoints: 0,
    totalEarnedPoints: 0,
    totalUsedPoints: 0,
    expiringPoints: 0,
    expiringDate: undefined,
    level: 1,
    currentLevelPoints: 0,
    nextLevelPoints: 200,
    medals: [],
  })
  const [userPointsLoading, setUserPointsLoading] = useState(true)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)

  useEffect(() => {
    setUserPointsLoading(true)
    getPointsMe()
      .then((data) => {
        if (data) setUserPoints(data)
        else
          setUserPoints((prev) => ({
            ...prev,
            userId: '',
            availablePoints: 0,
            totalEarnedPoints: 0,
            totalUsedPoints: 0,
            expiringPoints: 0,
            expiringDate: undefined,
            level: 1,
            currentLevelPoints: 0,
            nextLevelPoints: 200,
            medals: [],
          }))
      })
      .finally(() => setUserPointsLoading(false))
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
  const myRankIndex = userPoints.userId ? currentData.findIndex((u) => u.userId === userPoints.userId) : -1
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

  const getRankClass = (rank: number, value: number) => {
    if (value === 0) return 'rank-other'
    if (rank === 1) return 'rank-1'
    if (rank === 2) return 'rank-2'
    if (rank === 3) return 'rank-3'
    return 'rank-other'
  }

  /** 当前榜指标为 0 时不展示数字名次，统一显示 "-" */
  const formatRankBadge = (value: number, rank: number) => (value === 0 ? '-' : String(rank))

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
          <button type="button" className="publish-back-btn" onClick={() => navigate('/profile')}>
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
      <div className="leaderboard-header-glass">
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
          <div className="leaderboard-my-rank-card">
            <div className="leaderboard-my-rank-content">
              {(() => {
                const myEntry = myRankIndex >= 0 ? currentData[myRankIndex] : null
                return (
                  <>
                    <div className="leaderboard-my-rank-name">
                      Hi，{myEntry?.name ?? (userPointsLoading ? '加载中' : '未上榜')}
                    </div>
                    <div className="leaderboard-my-rank-row">
                      <div className="leaderboard-my-rank-avatar">
                        {myEntry?.avatar ? (
                          <img src={myEntry.avatar} alt="头像" className="leaderboard-my-rank-avatar-img" />
                        ) : (
                          myEntry?.initial ?? '?'
                        )}
                      </div>
                      <div className="leaderboard-my-rank-info">
                        <div className="leaderboard-my-rank-rank">
                          排名：<span className={`rank ${getRankClass(myRank ?? 0, myValue)}`}>
                            {userPointsLoading || leaderboardLoading
                              ? '-'
                              : myValue === 0
                                ? '-'
                                : myRank != null
                                  ? `NO.${myRank}`
                                  : '-'}
                          </span>
                        </div>
                        <div className="leaderboard-my-rank-score">
                          {userPointsLoading || leaderboardLoading
                            ? '-'
                            : myValue}
                          <span className="leaderboard-my-rank-unit">{userPointsLoading || leaderboardLoading ? '' : unit}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="section">
            <div className="leaderboard-period-tabs">
              {(['all', 'year', 'month', 'week', 'today'] as LeaderboardPeriod[]).map(period => (
                <button
                  key={period}
                  type="button"
                  className={`leaderboard-period-tab ${activePeriod === period ? 'active' : ''}`}
                  onClick={() => setActivePeriod(period)}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>

            {/* 第1名及以后：同一张卡片内的列表 */}
            <div className="leaderboard-list-card">
              {leaderboardLoading ? (
                <div className="my-posts-empty"><p>加载中...</p></div>
              ) : (
              currentData.slice(0).map((user, index) => {
                const rank = index + 1
                return (
                  <div key={user.userId} className="leaderboard-item-inner">
                    <div className="rank-badge-wrapper">
                      {rank === 1 ? (
                        <img src="/第一名.png" alt="第一名" className="rank-badge-img" />
                      ) : rank === 2 ? (
                        <img src="/第二名.png" alt="第二名" className="rank-badge-img" />
                      ) : rank === 3 ? (
                        <img src="/第三名.png" alt="第三名" className="rank-badge-img" />
                      ) : (
                        <div className={`rank ${getRankClass(rank, user.value)}`}>
                          {formatRankBadge(user.value, rank)}
                        </div>
                      )}
                    </div>
                    <div className="avatar leaderboard-list-avatar">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: '100%', height: '100%', borderRadius: '0', objectFit: 'cover' }}
                        />
                      ) : (
                        user.initial
                      )}
                    </div>
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
    </div>
  )
}
