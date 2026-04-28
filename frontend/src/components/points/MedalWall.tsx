import { useEffect, useState } from 'react'
import { Lock, Calendar, Star } from 'lucide-react'
import type { Medal, UserPoints, MedalType } from '../../types/points'
import { MEDAL_CONFIGS } from '../../types/points'

interface MedalWallProps {
  userPoints: UserPoints
  onClose?: () => void
}

export default function MedalWall({ userPoints }: MedalWallProps) {
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null)
  const [newAwardQueue, setNewAwardQueue] = useState<Medal[]>([])

  const medalMap = new Map(userPoints.medals.map(m => [m.type, m]))
  const getMedal = (type: MedalType) => medalMap.get(type)
  const isObtained = (type: MedalType) => Boolean(getMedal(type)?.obtainedAt)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const obtainedCount = userPoints.medals.filter(m => m.obtainedAt).length
  const totalCount = MEDAL_CONFIGS.length
  const overallProgressText = `${obtainedCount}/${totalCount}`
  const pendingAward = newAwardQueue[0]

  useEffect(() => {
    if (!userPoints.userId) return
    const storageKey = `medal_award_seen:${userPoints.userId}`
    let seenMap: Record<string, string> = {}
    try {
      const raw = localStorage.getItem(storageKey)
      seenMap = raw ? JSON.parse(raw) : {}
    } catch {
      seenMap = {}
    }

    const unseenAwards = userPoints.medals
      .filter((m) => m.obtainedAt)
      .filter((m) => {
        const seenAt = seenMap[m.type]
        return seenAt !== m.obtainedAt
      })
      .sort((a, b) => {
        const ta = a.obtainedAt ? new Date(a.obtainedAt).getTime() : 0
        const tb = b.obtainedAt ? new Date(b.obtainedAt).getTime() : 0
        return tb - ta
      })

    setNewAwardQueue(unseenAwards)
  }, [userPoints.userId, userPoints.medals])

  const closeAwardPopup = () => {
    if (!pendingAward || !userPoints.userId || !pendingAward.obtainedAt) {
      setNewAwardQueue((prev) => prev.slice(1))
      return
    }
    const storageKey = `medal_award_seen:${userPoints.userId}`
    let seenMap: Record<string, string> = {}
    try {
      const raw = localStorage.getItem(storageKey)
      seenMap = raw ? JSON.parse(raw) : {}
    } catch {
      seenMap = {}
    }
    seenMap[pendingAward.type] = pendingAward.obtainedAt
    localStorage.setItem(storageKey, JSON.stringify(seenMap))
    setNewAwardQueue((prev) => prev.slice(1))
  }

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
          <span className="medal-overview-num">{overallProgressText}</span>
          <span className="medal-overview-label">已完成/全部</span>
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
            {MEDAL_CONFIGS.filter(c => isObtained(c.type)).map(config => {
              const obtained = getMedal(config.type)!
              return (
                <div
                  key={config.type}
                  className="medal-card obtained"
                  onClick={() => setSelectedMedal({ ...config, ...obtained })}
                >
                  <div className="medal-card-badge">
                    <span className="medal-card-emoji">{config.icon}</span>
                    <span className="medal-card-points">+{config.pointsReward}</span>
                  </div>
                  <div className="medal-card-name">{config.name}</div>
                  <div className="medal-card-condition">
                    当前进度 {config.requiredCount}/{config.requiredCount}
                  </div>
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
          {MEDAL_CONFIGS.filter(c => !isObtained(c.type)).map(config => (
            (() => {
              const medal = getMedal(config.type)
              const progress = Math.min(medal?.progress ?? 0, config.requiredCount)
              return (
                <div
                  key={config.type}
                  className="medal-card locked"
                  onClick={() => setSelectedMedal({ ...config, ...(medal ?? {}) } as Medal)}
                >
                  <div className="medal-card-badge locked-badge">
                    <span className="medal-card-emoji locked-emoji">{config.icon}</span>
                    <Lock size={12} className="medal-card-lock" />
                  </div>
                  <div className="medal-card-name locked-name">{config.name}</div>
                  <div className="medal-card-condition">当前进度 {progress}/{config.requiredCount}</div>
                </div>
              )
            })()
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
                  <span>
                    获取条件：{selectedMedal.condition}
                    {typeof selectedMedal.progress === 'number' && selectedMedal.requiredCount > 0
                      ? `（当前进度 ${Math.min(selectedMedal.progress, selectedMedal.requiredCount)}/${selectedMedal.requiredCount}）`
                      : ''}
                  </span>
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

      {/* 新获得勋章动效弹窗 */}
      {pendingAward && (
        <div className="medal-award-overlay" onClick={closeAwardPopup}>
          <div className="medal-award-modal" onClick={(e) => e.stopPropagation()}>
            <div className="medal-award-confetti" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="medal-award-glow" aria-hidden="true" />
            <div className="medal-award-title">恭喜解锁新勋章</div>
            <div className="medal-award-badge" aria-hidden="true">
              {pendingAward.icon}
            </div>
            <div className="medal-award-name">{pendingAward.name}</div>
            <div className="medal-award-desc">{pendingAward.description}</div>
            <div className="medal-award-reward">+{pendingAward.pointsReward} 积分已到账</div>
            <button className="medal-award-confirm" onClick={closeAwardPopup}>
              太棒了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
