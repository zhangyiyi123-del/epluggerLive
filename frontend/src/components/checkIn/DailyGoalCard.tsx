import { Target, CheckCircle, Clock, MapPin, ChevronRight } from 'lucide-react'
import type { DailyGoal, SportType } from '../../types/checkIn'

interface DailyGoalCardProps {
  sportTypes: SportType[]
  dailyGoals: DailyGoal[]
  todayProgress: {
    sportTypeId: string
    completedDuration: number
    completedDistance: number
  }[]
  onStartCheckIn: (sportTypeId: string) => void
}

export default function DailyGoalCard({ 
  sportTypes, 
  dailyGoals, 
  todayProgress,
  onStartCheckIn 
}: DailyGoalCardProps) {
  
  const getProgress = (sportTypeId: string) => {
    const goal = dailyGoals.find(g => g.sportTypeId === sportTypeId)
    const progress = todayProgress.find(p => p.sportTypeId === sportTypeId)
    
    if (!goal) return null
    
    const durationPercent = goal.targetDuration > 0 
      ? Math.min(100, ((progress?.completedDuration || 0) / goal.targetDuration) * 100)
      : 100
    
    const distancePercent = goal.targetDistance && goal.targetDistance > 0
      ? Math.min(100, ((progress?.completedDistance || 0) / goal.targetDistance) * 100)
      : 100
    
    const isDurationCompleted = (progress?.completedDuration || 0) >= goal.targetDuration
    const isDistanceCompleted = !goal.targetDistance || (progress?.completedDistance || 0) >= goal.targetDistance
    const isAllCompleted = isDurationCompleted && isDistanceCompleted
    
    return {
      goal,
      progress,
      durationPercent,
      distancePercent,
      isDurationCompleted,
      isDistanceCompleted,
      isAllCompleted,
    }
  }

  const getSportType = (sportTypeId: string) => {
    return sportTypes.find(s => s.id === sportTypeId)
  }

  const activeGoals = dailyGoals.filter(g => g.isActive)

  return (
    <div className="daily-goal-card">
      <div className="daily-goal-header">
        <div className="daily-goal-title">
          <Target size={18} />
          <span>今日目标</span>
        </div>
        <span className="badge badge-primary">每日</span>
      </div>

      <div className="daily-goal-list">
        {activeGoals.map(item => {
          const data = getProgress(item.sportTypeId)
          const sportType = getSportType(item.sportTypeId)
          
          if (!data || !sportType) return null
          
          return (
            <div key={item.sportTypeId} className="goal-item">
              <div className="goal-item-header">
                <div className="goal-sport-info">
                  <span className="goal-icon">{sportType.icon}</span>
                  <span className="goal-name">{sportType.name}</span>
                </div>
                {data.isAllCompleted ? (
                  <span className="goal-status completed">
                    <CheckCircle size={16} />
                    已达标
                  </span>
                ) : (
                  <button 
                    className="goal-action-btn"
                    onClick={() => onStartCheckIn(item.sportTypeId)}
                  >
                    去打卡
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
              
              <div className="goal-progress">
                <div className="goal-progress-header">
                  <span className="goal-progress-label">
                    <Clock size={14} />
                    时长
                  </span>
                  <span className="goal-progress-value">
                    {data.progress?.completedDuration || 0} / {data.goal.targetDuration} 分钟
                    {data.isDurationCompleted && <CheckCircle size={12} className="completed-icon" />}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${data.durationPercent}%`,
                      background: data.isDurationCompleted ? '#10B981' : 'linear-gradient(90deg, #4F46E5, #818CF8)'
                    }}
                  />
                </div>
              </div>
              
              {data.goal.targetDistance && (
                <div className="goal-progress">
                  <div className="goal-progress-header">
                    <span className="goal-progress-label">
                      <MapPin size={14} />
                      距离
                    </span>
                    <span className="goal-progress-value">
                      {((data.progress?.completedDistance || 0) / 1000).toFixed(1)} / {(data.goal.targetDistance / 1000).toFixed(1)} 公里
                      {data.isDistanceCompleted && <CheckCircle size={12} className="completed-icon" />}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${data.distancePercent}%`,
                        background: data.isDistanceCompleted ? '#10B981' : 'linear-gradient(90deg, #10B981, #34D399)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
