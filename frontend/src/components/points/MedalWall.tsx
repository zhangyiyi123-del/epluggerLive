import { useState } from 'react'
import { Lock, Calendar, Star } from 'lucide-react'
import type { Medal, UserPoints } from '../../types/points'
import { MEDAL_CONFIGS } from '../../types/points'

interface MedalWallProps {
  userPoints: UserPoints
  onClose?: () => void
}

export default function MedalWall({ userPoints }: MedalWallProps) {
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null)

  // 获取已获得的勋章信息
  const getObtainedMedal = (type: string) => {
    return userPoints.medals.find(m => m.type === type)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const obtainedCount = userPoints.medals.length
  const totalCount = MEDAL_CONFIGS.length

  return (
    <div className="medal-wall">
      {/* 概览卡片 */}
      <div className="medal-wall-overview">
        <div className="medal-wall-overview-item">
          <span className="medal-overview-num">{obtainedCount}</span>
          <span className="medal-overview-label">已获勋章</span>
        </div>
        <div className="medal-wall-overview-divider" />
        <div className="medal-wall-overview-item">
          <span className="medal-overview-num">{totalCount - obtainedCount}</span>
          <span className="medal-overview-label">待解锁</span>
        </div>
        <div className="medal-wall-overview-divider" />
        <div className="medal-wall-overview-item">
          <span className="medal-overview-num">{Math.round(obtainedCount / totalCount * 100)}%</span>
          <span className="medal-overview-label">完成度</span>
        </div>
      </div>

      {/* 已获得勋章 */}
      {obtainedCount > 0 && (
        <div className="medal-section">
          <div className="medal-section-title">
            <Star size={14} />
            已获得（{obtainedCount}）
          </div>
          <div className="medal-wall-grid">
            {MEDAL_CONFIGS.filter(c => getObtainedMedal(c.type)).map(config => {
              const obtained = getObtainedMedal(config.type)!
              return (
                <div
                  key={config.type}
                  className="medal-card obtained"
                  onClick={() => setSelectedMedal(obtained)}
                >
                  <div className="medal-card-badge">
                    <span className="medal-card-emoji">{config.icon}</span>
                    <span className="medal-card-points">+{config.pointsReward}</span>
                  </div>
                  <div className="medal-card-name">{config.name}</div>
                  <div className="medal-card-date">
                    <Calendar size={9} />
                    {formatDate(obtained.obtainedAt!)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 未获得勋章 */}
      <div className="medal-section">
        <div className="medal-section-title locked-title">
          <Lock size={14} />
          待解锁（{totalCount - obtainedCount}）
        </div>
        <div className="medal-wall-grid">
          {MEDAL_CONFIGS.filter(c => !getObtainedMedal(c.type)).map(config => (
            <div
              key={config.type}
              className="medal-card locked"
              onClick={() => setSelectedMedal(config as any)}
            >
              <div className="medal-card-badge locked-badge">
                <span className="medal-card-emoji locked-emoji">{config.icon}</span>
                <Lock size={12} className="medal-card-lock" />
              </div>
              <div className="medal-card-name locked-name">{config.name}</div>
              <div className="medal-card-condition">{config.condition}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 提示 */}
      <div className="medal-tips">
        <Star size={13} />
        <span>每枚勋章获得时奖励 {MEDAL_CONFIGS[0]?.pointsReward ?? 50} 积分</span>
      </div>

      {/* 勋章详情弹窗 */}
      {selectedMedal && (
        <div className="medal-detail-overlay" onClick={() => setSelectedMedal(null)}>
          <div className="medal-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="medal-detail-header">
              <div className={`medal-detail-badge ${'obtainedAt' in selectedMedal && selectedMedal.obtainedAt ? 'obtained' : 'locked'}`}>
                <span className="medal-detail-icon">{selectedMedal.icon}</span>
              </div>
              <span className="medal-detail-name">{selectedMedal.name}</span>
            </div>
            <div className="medal-detail-content">
              <div className="medal-detail-desc">{selectedMedal.description}</div>
              {'obtainedAt' in selectedMedal && selectedMedal.obtainedAt ? (
                <div className="medal-detail-obtained">
                  <Calendar size={14} />
                  <span>获得于 {formatDate(selectedMedal.obtainedAt)}</span>
                </div>
              ) : (
                <div className="medal-detail-condition">
                  <Lock size={14} />
                  <span>获取条件：{selectedMedal.condition}</span>
                </div>
              )}
              <div className="medal-detail-reward">
                奖励积分：<span className="reward-points">+{selectedMedal.pointsReward}</span>
              </div>
            </div>
            <button className="medal-detail-close" onClick={() => setSelectedMedal(null)}>
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
