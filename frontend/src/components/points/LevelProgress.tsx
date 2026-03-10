import { Shield, ChevronRight, Zap } from 'lucide-react'
import type { UserPoints } from '../../types/points'
import { LEVEL_CONFIGS } from '../../types/points'

interface LevelProgressProps {
  userPoints: UserPoints
  onViewMall?: () => void
  onViewLevelBenefits?: () => void
}

export default function LevelProgress({ userPoints, onViewMall, onViewLevelBenefits }: LevelProgressProps) {
  // 计算进度百分比
  const getProgressPercent = () => {
    const { currentLevelPoints, level } = userPoints
    const levelConfig = LEVEL_CONFIGS[level - 1]
    const pointsInLevel = currentLevelPoints - levelConfig.minPoints
    const pointsNeeded = levelConfig.maxPoints - levelConfig.minPoints + 1
    return Math.min((pointsInLevel / pointsNeeded) * 100, 100)
  }

  // 获取等级权益描述（用于卡片上的当前权益 + 问号进入说明页）
  const getLevelBenefit = (level: number) => {
    if (level <= 3) return '兑换低价值商品 (50-200分)'
    if (level <= 6) return '兑换中价值商品 (201-1000分)'
    if (level <= 9) return '兑换高价值商品 (1001-3000分)'
    return '兑换专属荣誉商品 (3000+分)'
  }

  return (
    <div className="level-progress">
      {/* 当前等级卡片 */}
      <div className="level-card current">
        <div className="level-card-header">
          <div className="level-badge">
            <Shield size={18} />
            <span className="level-name">Lv{userPoints.level}</span>
          </div>
          <button className="view-mall-btn" onClick={onViewMall}>
            去兑换 <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="level-progress-info">
          <div className="progress-text">
            <span className="current-points">{userPoints.currentLevelPoints}</span>
            <span className="separator">/</span>
            <span className="next-points">{userPoints.nextLevelPoints}</span>
            <span className="unit">分</span>
          </div>
          
          <div className="progress-bar-wrapper">
            <div 
              className="progress-bar"
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>
          
          <div className="progress-hint">
            距 Lv{userPoints.level + 1} 还需 {userPoints.nextLevelPoints - userPoints.currentLevelPoints} 积分
          </div>
        </div>

        <div className="level-benefit">
          <Zap size={14} />
          <span>当前权益: {getLevelBenefit(userPoints.level)}</span>
          {onViewLevelBenefits && (
            <button type="button" className="level-benefit-help" onClick={onViewLevelBenefits} title="等级权益说明">?</button>
          )}
        </div>
      </div>

      {/* 升级动画提示 (仅显示) */}
      {userPoints.level < 10 && userPoints.nextLevelPoints - userPoints.currentLevelPoints <= 100 && (
        <div className="level-up-hint">
          <Zap size={14} />
          <span>距离升级仅差 {userPoints.nextLevelPoints - userPoints.currentLevelPoints} 积分！</span>
        </div>
      )}
    </div>
  )
}
