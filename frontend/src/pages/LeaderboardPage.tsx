import { useState, useEffect, useRef } from 'react'
import { Medal, Flame, Heart, ChevronRight, ChevronLeft, Star, Lock, Filter, ChevronDown } from 'lucide-react'
import { MOCK_USER_POINTS, LEVEL_CONFIGS } from '../types/points'
import PointsCenter from '../components/points/PointsCenter'
import LevelProgress from '../components/points/LevelProgress'
import MedalWall from '../components/points/MedalWall'
import PointsMallPage from './PointsMallPage'

type LeaderboardType = 'points' | 'exercise' | 'positive'

/** 时间范围：全部、本年、本月、本周、今日 */
type LeaderboardPeriod = 'all' | 'year' | 'month' | 'week' | 'today'

type User = {
  id: number
  name: string
  /** 首字母展示用（无头像图时） */
  initial: string
  value: number
  change?: number
}

const mockData: Record<LeaderboardType, User[]> = {
  points: [
    { id: 1, name: '王小明', initial: 'W', value: 12580, change: 2 },
    { id: 2, name: '李小红', initial: 'L', value: 11200, change: -1 },
    { id: 3, name: '张三丰', initial: 'Z', value: 10850, change: 1 },
    { id: 4, name: '赵敏', initial: 'Z', value: 9850, change: 3 },
    { id: 5, name: '钱多多', initial: 'Q', value: 9200, change: -2 },
    { id: 6, name: '孙丽', initial: 'S', value: 8650, change: 1 },
    { id: 7, name: '周杰', initial: 'Z', value: 8120, change: -1 },
    { id: 8, name: '吴芳', initial: 'W', value: 7580, change: 0 },
    { id: 9, name: '郑浩', initial: 'Z', value: 6920, change: 2 },
    { id: 10, name: '冯婷', initial: 'F', value: 6350, change: -2 },
    { id: 11, name: '陈明', initial: 'C', value: 5780, change: 1 },
    { id: 12, name: '楚云', initial: 'C', value: 5120, change: 0 },
    { id: 13, name: '卫强', initial: 'W', value: 4480, change: -1 },
    { id: 14, name: '蒋琳', initial: 'J', value: 3620, change: 1 },
    { id: 15, name: '我', initial: 'M', value: 2850, change: 0 },
    { id: 16, name: '沈亮', initial: 'S', value: 2100, change: 0 },
    { id: 17, name: '韩雪', initial: 'H', value: 1580, change: 0 },
  ],
  exercise: [
    { id: 1, name: '郑成功', initial: 'Z', value: 32, change: 0 },
    { id: 2, name: '王重阳', initial: 'W', value: 28, change: 0 },
    { id: 3, name: '林黛玉', initial: 'L', value: 25, change: 0 },
    { id: 4, name: '黄蓉', initial: 'H', value: 23, change: 1 },
    { id: 5, name: '欧阳锋', initial: 'O', value: 21, change: -1 },
    { id: 6, name: '杨过', initial: 'Y', value: 20, change: 0 },
    { id: 7, name: '小龙女', initial: 'L', value: 19, change: 0 },
    { id: 8, name: '郭靖', initial: 'G', value: 18, change: 1 },
    { id: 9, name: '周伯通', initial: 'Z', value: 17, change: 0 },
    { id: 10, name: '段誉', initial: 'D', value: 16, change: -1 },
    { id: 11, name: '虚竹', initial: 'X', value: 15, change: 0 },
    { id: 12, name: '乔峰', initial: 'Q', value: 14, change: 0 },
    { id: 13, name: '阿朱', initial: 'Z', value: 13, change: 0 },
    { id: 14, name: '慕容复', initial: 'M', value: 13, change: 1 },
    { id: 15, name: '我', initial: 'M', value: 12, change: 0 },
    { id: 16, name: '鸠摩智', initial: 'J', value: 11, change: 0 },
    { id: 17, name: '丁春秋', initial: 'D', value: 10, change: 0 },
  ],
  positive: [
    { id: 1, name: '刘备', initial: 'L', value: 56, change: 0 },
    { id: 2, name: '关羽', initial: 'G', value: 48, change: 0 },
    { id: 3, name: '张飞', initial: 'Z', value: 42, change: 0 },
    { id: 4, name: '诸葛亮', initial: 'Z', value: 38, change: 1 },
    { id: 5, name: '赵云', initial: 'Z', value: 35, change: -1 },
    { id: 6, name: '马超', initial: 'M', value: 32, change: 0 },
    { id: 7, name: '黄忠', initial: 'H', value: 30, change: 0 },
    { id: 8, name: '魏延', initial: 'W', value: 28, change: 1 },
    { id: 9, name: '姜维', initial: 'J', value: 26, change: 0 },
    { id: 10, name: '庞统', initial: 'P', value: 24, change: -1 },
    { id: 11, name: '徐庶', initial: 'X', value: 22, change: 0 },
    { id: 12, name: '法正', initial: 'F', value: 21, change: 0 },
    { id: 13, name: '马谡', initial: 'M', value: 20, change: 0 },
    { id: 14, name: '关平', initial: 'G', value: 19, change: 0 },
    { id: 15, name: '我', initial: 'M', value: 18, change: 0 },
    { id: 16, name: '周仓', initial: 'Z', value: 17, change: 0 },
    { id: 17, name: '廖化', initial: 'L', value: 16, change: 0 },
  ],
}

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
  const [activeType, setActiveType] = useState<LeaderboardType>('points')
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>('all')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showMedalWall, setShowMedalWall] = useState(false)
  const [showFullMall, setShowFullMall] = useState(false)
  const [showPointsCenter, setShowPointsCenter] = useState(false)
  const [showLevelBenefits, setShowLevelBenefits] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  
  const userPoints = MOCK_USER_POINTS
  const currentData = mockData[activeType]
  const { title, unit, icon: Icon } = typeLabels[activeType]

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
          <p className="level-benefits-intro">积分等级对应可兑换的积分区间，等级越高可兑换商品价值越高。</p>
          <div className="level-rank-section">
            <div className="level-rank-header level-rank-header-static">
              <span>等级权益</span>
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
                    <div className="level-item-benefit">
                      {config.minExchangeValue}-{config.maxExchangeValue === Infinity ? '∞' : config.maxExchangeValue}分
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
            onViewHistory={() => {}}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* 筛选：积分榜、运动榜、正向榜 */}
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
        {/* Current User Rank - 原色布局，排名与积分字号一致、中间·隔开 */}
        <div className="card leaderboard-my-rank-card">
          <div className="flex justify-between items-center">
            <div>
              <div className="leaderboard-my-rank-label">我的当前排名</div>
              <div className="leaderboard-my-rank-row">
                <span className="leaderboard-my-rank-text">第15名</span>
                <span className="leaderboard-my-rank-dot"> · </span>
                <span className="leaderboard-my-rank-text">{userPoints.availablePoints} {unit}</span>
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
                  <Filter size={16} />
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
            {currentData.length >= 3 && (
              <div className="leaderboard-podium">
                <div className="podium-column podium-2nd">
                  <div className="podium-user">
                    <div className="podium-avatar">{currentData[1].initial}</div>
                    <div className="podium-name">{currentData[1].name}</div>
                    <div className="podium-value">{currentData[1].value}<span className="podium-unit">{unit}</span></div>
                  </div>
                  <div className="podium-step">
                    <span className="podium-rank rank-2">2</span>
                  </div>
                </div>
                <div className="podium-column podium-1st">
                  <div className="podium-user">
                    <div className="podium-avatar">{currentData[0].initial}</div>
                    <div className="podium-name">{currentData[0].name}</div>
                    <div className="podium-value">{currentData[0].value}<span className="podium-unit">{unit}</span></div>
                  </div>
                  <div className="podium-step">
                    <span className="podium-rank rank-1">1</span>
                  </div>
                </div>
                <div className="podium-column podium-3rd">
                  <div className="podium-user">
                    <div className="podium-avatar">{currentData[2].initial}</div>
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
              {currentData.slice(3).map((user, index) => {
                const rank = index + 4
                return (
                  <div key={user.id} className="leaderboard-item-inner">
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
              })}
            </div>
          </div>
        </>
    </div>
  )
}
