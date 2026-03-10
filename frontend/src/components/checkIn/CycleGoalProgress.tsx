import { Calendar, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import type { CycleProgress, CycleType } from '../../types/checkIn'

interface CycleGoalProgressProps {
  progress: CycleProgress
  onSwitchCycle?: (type: CycleType) => void
}

export default function CycleGoalProgress({ progress, onSwitchCycle }: CycleGoalProgressProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}.${date.getDate()}`
  }

  const durationPercent = Math.min(100, (progress.currentDuration / progress.targetDuration) * 100)
  const distancePercent = progress.targetDistance 
    ? Math.min(100, (progress.currentDistance / progress.targetDistance) * 100)
    : 100

  const cycleLabel = progress.cycleType === 'week' ? '本周' : '本月'
  const cycleTypeOptions: CycleType[] = ['week', 'month']

  return (
    <div className="cycle-goal-card">
      <div className="cycle-goal-header">
        <div className="cycle-goal-title">
          <Calendar size={18} />
          <span>{cycleLabel}累计目标</span>
        </div>
        
        {onSwitchCycle && (
          <div className="cycle-switcher">
            {cycleTypeOptions.map(type => (
              <button
                key={type}
                className={`cycle-switch-btn ${progress.cycleType === type ? 'active' : ''}`}
                onClick={() => onSwitchCycle(type)}
              >
                {type === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="cycle-date-range">
        <span>{formatDate(progress.startDate)} - {formatDate(progress.endDate)}</span>
        <span className="days-remaining">
          还剩 {progress.daysRemaining} 天
        </span>
      </div>

      <div className="cycle-progress-container">
        <div className="cycle-progress-item">
          <div className="cycle-progress-header">
            <span className="cycle-progress-label">
              <Clock size={16} />
              累计时长
            </span>
            <span className={`cycle-progress-value ${progress.isCompleted ? 'completed' : ''}`}>
              {Math.floor(progress.currentDuration)} / {progress.targetDuration} 分钟
              {progress.isCompleted && <CheckCircle size={16} />}
            </span>
          </div>
          <div className="cycle-progress-bar">
            <div 
              className="cycle-progress-fill"
              style={{ 
                width: `${durationPercent}%`,
                background: progress.isCompleted 
                  ? 'linear-gradient(90deg, #10B981, #34D399)' 
                  : 'linear-gradient(90deg, #4F46E5, #818CF8)'
              }}
            />
          </div>
          <div className="cycle-progress-percent">
            {durationPercent.toFixed(0)}%
          </div>
        </div>

        {progress.targetDistance && (
          <div className="cycle-progress-item">
            <div className="cycle-progress-header">
              <span className="cycle-progress-label">
                <MapPin size={16} />
                累计距离
              </span>
              <span className={`cycle-progress-value ${progress.isCompleted ? 'completed' : ''}`}>
                {(progress.currentDistance / 1000).toFixed(1)} / {(progress.targetDistance / 1000).toFixed(1)} 公里
                {progress.isCompleted && <CheckCircle size={16} />}
              </span>
            </div>
            <div className="cycle-progress-bar">
              <div 
                className="cycle-progress-fill"
                style={{ 
                  width: `${distancePercent}%`,
                  background: progress.isCompleted 
                    ? 'linear-gradient(90deg, #10B981, #34D399)' 
                    : 'linear-gradient(90deg, #10B981, #34D399)'
                }}
              />
            </div>
            <div className="cycle-progress-percent">
              {distancePercent.toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      <div className={`cycle-goal-status ${progress.isCompleted ? 'completed' : 'in-progress'}`}>
        {progress.isCompleted ? (
          <>
            <CheckCircle size={20} />
            <span>恭喜！{cycleLabel}目标已达成</span>
          </>
        ) : (
          <>
            <AlertCircle size={20} />
            <span>继续加油，距离{cycleLabel}目标还差 {progress.targetDuration - progress.currentDuration} 分钟</span>
          </>
        )}
      </div>
    </div>
  )
}
