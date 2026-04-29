import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, UserPlus, X, Tag, Info } from 'lucide-react'
import type { PositiveCategory, PositiveTag, RelatedColleague } from '../types/positive'
import { DEFAULT_POSITIVE_TAGS } from '../types/positive'
import * as checkInApi from '../api/checkin'
import { getColleagues } from '../api/auth'
import type { PositiveCategoryDto } from '../api/checkin'
import { getTodayEarnedPoints } from '../api/points'

export default function PositiveCheckInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const categoryIdFromState = (location.state as { categoryId?: string } | null)?.categoryId

  const [categories, setCategories] = useState<PositiveCategoryDto[]>([])
  const [selectedCategory, setSelectedCategory] = useState<PositiveCategory | null>(null)
  const [selectedTags, setSelectedTags] = useState<PositiveTag[]>([])

  useEffect(() => {
    checkInApi.getPositiveCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (categories.length === 0) return
    if (categoryIdFromState) {
      const cat = categories.find(c => c.id === categoryIdFromState)
      setSelectedCategory(cat ? toPositiveCategory(cat) : null)
      setSelectedTags([])
    } else if (!selectedCategory) {
      setSelectedCategory(toPositiveCategory(categories[0]))
    }
  }, [categories, categoryIdFromState])

  function toPositiveCategory(d: PositiveCategoryDto): PositiveCategory {
    return {
      id: d.id,
      name: d.name,
      icon: d.icon,
      description: d.description,
      isEnabled: d.enabled,
      sortOrder: d.sortOrder,
      isBuiltIn: true,
      evidenceRequirement: d.evidenceRequirement,
    }
  }
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColleagues, setSelectedColleagues] = useState<RelatedColleague[]>([])
  const [evidences, setEvidences] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [showColleaguePicker, setShowColleaguePicker] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [tempTags, setTempTags] = useState<PositiveTag[]>([])
  const [tempColleagues, setTempColleagues] = useState<RelatedColleague[]>([])
  const [colleagueSearchText, setColleagueSearchText] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [syncToCommunity, setSyncToCommunity] = useState(true)
  const [communitySyncWarning, setCommunitySyncWarning] = useState<string | undefined>(undefined)
  const evidenceImageInputRef = useRef<HTMLInputElement>(null)
  const [displayPoints, setDisplayPoints] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [todayEarnedPoints, setTodayEarnedPoints] = useState<number | null>(null)
  const [sessionPointsHint, setSessionPointsHint] = useState<string | null>(null)
  const [sessionPointsHintOpen, setSessionPointsHintOpen] = useState(false)
  const nonWhitespaceDescriptionLength = description.replace(/\s+/g, '').length
  const qualityQualified = nonWhitespaceDescriptionLength >= 100 && evidences.length > 0 && selectedColleagues.length >= 1

  const tags = DEFAULT_POSITIVE_TAGS
  const [colleagueList, setColleagueList] = useState<{ userId: string; name: string; avatar?: string }[]>([])

  useEffect(() => {
    getColleagues().then(list =>
      setColleagueList(list.map(c => ({ userId: c.id, name: c.name, avatar: c.avatar })))
    )
  }, [])

  useEffect(() => {
    if (!showSuccess) return
    setDisplayPoints(0)
    setShowConfetti(true)
    const duration = 1200
    const steps = 30
    const increment = earnedPoints / steps || 0
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= earnedPoints) {
        setDisplayPoints(earnedPoints)
        clearInterval(timer)
      } else {
        setDisplayPoints(Math.floor(current))
      }
    }, interval)
    return () => {
      clearInterval(timer)
      setShowConfetti(false)
    }
  }, [showSuccess, earnedPoints])

  useEffect(() => {
    if (!showSuccess) {
      setTodayEarnedPoints(null)
      setSessionPointsHint(null)
      setSessionPointsHintOpen(false)
      return
    }
    if (todayEarnedPoints !== null) return
    let cancelled = false
    getTodayEarnedPoints().then((n) => {
      if (!cancelled) setTodayEarnedPoints(n ?? 0)
    })
    return () => {
      cancelled = true
    }
  }, [showSuccess, todayEarnedPoints])

  const canSubmit = selectedCategory !== null

  useEffect(() => {
    if (!sessionPointsHintOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSessionPointsHintOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sessionPointsHintOpen])

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting || !selectedCategory) return
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const evidenceUrls =
        evidences.length > 0
          ? await checkInApi.uploadPositiveEvidences(evidences.slice(0, 9))
          : []
      const relatedColleagueIds = selectedColleagues
        .map(c => Number(c.userId))
        .filter(n => !Number.isNaN(n))
      const res = await checkInApi.submitPositiveCheckIn({
        categoryId: selectedCategory.id,
        title: title.trim() || undefined,
        tagIds: selectedTags.map(t => t.id),
        description: description.trim(),
        relatedColleagueIds: relatedColleagueIds.length > 0 ? relatedColleagueIds : undefined,
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        syncToCommunity,
      })
      setEarnedPoints(res.points)
      setSessionPointsHint(res.pointsHint ?? null)
      setTodayEarnedPoints(typeof res.todayEarnedPoints === 'number' ? res.todayEarnedPoints : null)
      setCommunitySyncWarning(
        res.communitySync?.attempted && res.communitySync?.success === false
          ? res.communitySync?.message || '未能同步到圈子，可稍后在圈子手动分享'
          : undefined
      )
      setShowSuccess(true)
    } catch (e) {
      console.error(e)
      setSubmitError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    navigate('/checkin')
  }

  const handleReset = () => {
    setSelectedTags([])
    setTitle('')
    setDescription('')
    setSelectedColleagues([])
    setEvidences([])
    setSyncToCommunity(true)
  }

  const handleEvidenceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[]
    const valid: File[] = files.filter(f => f.type.startsWith('image/'))
    if (evidences.length + valid.length > 9) {
      setEvidences(prev => [...prev, ...valid.slice(0, 9 - prev.length)])
    } else {
      setEvidences(prev => [...prev, ...valid])
    }
    if (evidenceImageInputRef.current) evidenceImageInputRef.current.value = ''
  }

  const handleRemoveEvidenceImage = (index: number) => {
    setEvidences(prev => prev.filter((_, i) => i !== index))
  }

  if (showSuccess) {
    const showZeroPointHint = earnedPoints === 0 && !!sessionPointsHint
    const showLimitHint = sessionPointsHint === '今日正向积分已达上限'
    const sessionPointsHintText = showLimitHint
      ? '打卡记录会保留，今日最多 3 次可得积分。'
      : (sessionPointsHint ?? '本次打卡未获得积分。')
    return (
      <>
      <div className="page checkin-success-page" style={{ padding: 0 }}>
        <div className="success-page-wrapper success-page-wrapper--positive">
          {showConfetti && (
            <div className="confetti-container" aria-hidden>
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className={`confetti confetti--${i % 5}`}
                  style={{
                    '--delay': `${Math.random() * 2.8}s`,
                    '--x': `${4 + Math.random() * 92}%`,
                    '--rotation': `${Math.random() * 360}deg`,
                  } as CSSProperties}
                />
              ))}
            </div>
          )}
          <div className="success-bg-particles" aria-hidden>
            {[...Array(52)].map((_, i) => {
              const left = ((i * 37 + 11) % 92) + 4
              const top = ((i * 19 + 23) % 88) + 6
              const size = 2 + (i % 6) * 0.65
              const dur = 11 + (i % 10) * 1.1
              const delay = ((i * 0.21) % 5) + (i % 3) * 0.4
              const tx = -14 + (i % 9) * 3.5
              const ty = -22 + (i % 7) * 5.5
              const opacity = 0.32 + (i % 8) * 0.06
              return (
                <span
                  key={`bg-particle-${i}`}
                  className={`success-bg-particle success-bg-particle--${i % 4}`}
                  style={{
                    '--p-left': `${left}%`,
                    '--p-top': `${top}%`,
                    '--p-size': `${size}px`,
                    '--p-dur': `${dur}s`,
                    '--p-delay': `${delay}s`,
                    '--p-tx': `${tx}px`,
                    '--p-ty': `${ty}px`,
                    '--p-opacity': opacity,
                  } as CSSProperties}
                />
              )
            })}
          </div>
          <div className="success-page-top-bar">
            <button
              type="button"
              className="success-page-back"
              onClick={handleSuccessClose}
              aria-label="返回"
            >
              <ChevronLeft size={28} strokeWidth={2.25} />
            </button>
            <p className="success-page-type-label">正向打卡成功</p>
          </div>
          <div className="success-page-main">
            <div className="success-card" role="status" aria-live="polite" aria-atomic="true">
              <img
                src="/success-mascot.png"
                alt=""
                className="success-mascot"
                width={200}
                height={200}
                decoding="async"
              />
              <div className="success-card-header">
                <div className="success-title-with-stamp">
                  <h1 className="success-title">恭喜！打卡成功</h1>
                  <img
                    src="/completed-today.png"
                    alt=""
                    className="success-done-stamp"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="success-card-body">
                <div
                  className="reward-card"
                  aria-label={`本次获得 ${displayPoints} 积分，今日已获得 ${todayEarnedPoints === null ? '加载中' : todayEarnedPoints} 积分`}
                >
                  <div className="reward-inline-row">
                    <div className="reward-segment">
                      <div className="reward-caption-with-hint">
                        <span className="reward-inline-value">{showZeroPointHint ? '—' : displayPoints}</span>
                        {showZeroPointHint ? (
                          <button
                            type="button"
                            className="reward-points-hint-trigger"
                            aria-haspopup="dialog"
                            aria-expanded={sessionPointsHintOpen}
                            aria-label="查看积分说明"
                            onClick={() => setSessionPointsHintOpen(true)}
                          >
                            <Info size={13} strokeWidth={2.5} aria-hidden />
                          </button>
                        ) : null}
                      </div>
                      <div className="reward-segment-fill" aria-hidden />
                      <span className="reward-caption">{showZeroPointHint ? sessionPointsHint : '本次获得积分'}</span>
                    </div>
                    <span className="reward-meta-divider" aria-hidden />
                    <div className="reward-segment reward-segment--today">
                      <span className="reward-inline-value">
                        {todayEarnedPoints === null ? '…' : todayEarnedPoints}
                      </span>
                      <div className="reward-segment-fill" aria-hidden />
                      <span className="reward-today-label">今日获得积分</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="success-card-footer">
                {communitySyncWarning ? (
                  <p className="checkin-success-sync-warning" role="alert">
                    {communitySyncWarning}
                  </p>
                ) : null}
                <p className="encourage-text">
                感谢分享这份正向力量，继续发光吧✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {sessionPointsHintOpen ? (
        <div
          className="checkin-points-hint-overlay"
          role="presentation"
          onClick={() => setSessionPointsHintOpen(false)}
        >
          <div
            className="checkin-points-hint-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="positive-checkin-points-hint-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="checkin-points-hint-close"
              aria-label="关闭"
              onClick={() => setSessionPointsHintOpen(false)}
            >
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
            <h2 id="positive-checkin-points-hint-title" className="checkin-points-hint-title">
              积分说明
            </h2>
            <p className="checkin-points-hint-body">{sessionPointsHintText}</p>
            <div className="checkin-points-hint-actions">
              <button
                type="button"
                className="checkin-points-hint-ok"
                onClick={() => setSessionPointsHintOpen(false)}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </>
    )
  }

  return (
    <div className="publish-page positive-checkin-page">
      <div className="publish-header">
        <button className="publish-back-btn" onClick={() => navigate('/checkin')}>
          <ChevronLeft size={22} />
        </button>
        <div className="publish-header-title">
          {categories.length === 0 ? '正向打卡（加载中…）' : selectedCategory ? `正向打卡-${selectedCategory.name}` : '正向打卡'}
        </div>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="publish-content positive-checkin-content">
        {/* 参与同事选择器 - 右上角仅√确认，无 X */}
        {showColleaguePicker && (
          <div className="publish-picker-overlay" onClick={() => setShowColleaguePicker(false)}>
            <div className="publish-picker publish-picker-tall" onClick={e => e.stopPropagation()}>
              <div className="publish-picker-header publish-picker-header-with-confirm">
                <span className="publish-picker-title">参与同事</span>
                <button
                  type="button"
                  className="publish-picker-confirm-icon-btn"
                  onClick={() => {
                    setSelectedColleagues([...tempColleagues])
                    setShowColleaguePicker(false)
                  }}
                >
                  <Check size={22} />
                </button>
              </div>
              <input
                type="text"
                className="publish-picker-input"
                placeholder="搜索同事姓名..."
                value={colleagueSearchText}
                onChange={e => setColleagueSearchText(e.target.value)}
              />
              <div className="publish-picker-list">
                {colleagueList
                  .filter(c => c.name.toLowerCase().includes(colleagueSearchText.toLowerCase()))
                  .map(colleague => {
                    const isSelected = tempColleagues.some(t => t.userId === colleague.userId)
                    return (
                      <button
                        key={colleague.userId}
                        type="button"
                        className={`publish-picker-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (isSelected) {
                            setTempColleagues(prev => prev.filter(t => t.userId !== colleague.userId))
                          } else if (tempColleagues.length < 5) {
                            setTempColleagues(prev => [...prev, { ...colleague, role: 'witness' as const }])
                          }
                        }}
                      >
                        <span className="publish-picker-avatar">{colleague.name[0]}</span>
                        <div className="publish-picker-item-info">
                          <span>{colleague.name}</span>
                        </div>
                        {isSelected && <span className="publish-picker-check">✓</span>}
                      </button>
                    )
                  })}
              </div>
              <div className="positive-colleague-picker-footer-hint">
                已选 {tempColleagues.length}/5 人
              </div>
            </div>
          </div>
        )}

        {/* 选择标签选择器 - 右上角仅√确认，无 X */}
        {showTagPicker && selectedCategory && (
          <div className="publish-picker-overlay" onClick={() => setShowTagPicker(false)}>
            <div className="publish-picker" onClick={e => e.stopPropagation()}>
              <div className="publish-picker-header publish-picker-header-with-confirm">
                <span className="publish-picker-title">选择标签</span>
                <button
                  type="button"
                  className="publish-picker-confirm-icon-btn"
                  onClick={() => {
                    setSelectedTags([...tempTags])
                    setShowTagPicker(false)
                  }}
                >
                  <Check size={22} />
                </button>
              </div>
              <div className="publish-picker-list">
                {tags
                  .filter(tag => tag.categoryId === selectedCategory.id)
                  .map(tag => {
                    const isSelected = tempTags.some(t => t.id === tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        className={`publish-picker-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (isSelected) {
                            setTempTags(prev => prev.filter(t => t.id !== tag.id))
                          } else if (tempTags.length < 3) {
                            setTempTags(prev => [...prev, tag])
                          }
                        }}
                      >
                        <Tag size={18} />
                        <div className="publish-picker-item-info">
                          <span>{tag.name}</span>
                        </div>
                        {isSelected && <span className="publish-picker-check">✓</span>}
                      </button>
                    )
                  })}
              </div>
              <div className="positive-colleague-picker-footer-hint">
                已选 {tempTags.length}/3 个
              </div>
            </div>
          </div>
        )}

        {/* 佐证材料 - 布局与发布动态一致：上传图片上下左右间距 */}
        <div className="positive-evidence-section">
          <div className="publish-images-scroll">
            {evidences.map((file, index) => (
              <div key={index} className="publish-image-item">
                <img src={URL.createObjectURL(file)} alt="" />
                <button type="button" className="publish-remove-image" onClick={() => handleRemoveEvidenceImage(index)}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {evidences.length < 9 && (
              <button
                type="button"
                className="publish-add-image-scroll"
                onClick={() => evidenceImageInputRef.current?.click()}
              >
                <span className="add-icon">+</span>
                <span>{evidences.length}/9</span>
              </button>
            )}
            <input
              ref={evidenceImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              onChange={handleEvidenceImageSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* 标题 - 无字数提示 */}
        <div className="publish-textarea-wrapper positive-title-section">
          <input
            type="text"
            className="publish-textarea positive-input-single"
            placeholder="标题"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="positive-title-body-divider" />

        {/* 正文 - 已选标签可删 */}
        <div className="publish-textarea-wrapper positive-body-section">
          {selectedTags.length > 0 && (
            <div className="positive-selected-tags-inline">
              {selectedTags.map(tag => (
                <span key={tag.id} className="positive-tag-chip">
                  {tag.name}
                  <button type="button" className="positive-tag-chip-remove" onClick={() => setSelectedTags(prev => prev.filter(t => t.id !== tag.id))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <textarea
            className="publish-textarea"
            placeholder="分享你的正向故事..."
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 2000))}
            rows={6}
            maxLength={2000}
          />
          <div className="publish-text-counter positive-body-counter-sync-row">
            <div className="positive-counter-left">
              <span className="positive-char-count">
                <span className={description.length > 2000 ? 'text-danger' : ''}>{description.length}</span>/2000
              </span>
              {qualityQualified && (
                <span className="quality-hint">已满足优质加分条件</span>
              )}
            </div>
            <label className="checkin-sync-to-community-row positive-sync-on-counter-row positive-sync-circular-checkbox">
              <input
                type="checkbox"
                className="positive-sync-checkbox-native"
                checked={syncToCommunity}
                onChange={(e) => setSyncToCommunity(e.target.checked)}
              />
              <span className="positive-sync-checkbox-face" aria-hidden={true} />
              <span>同步到圈子</span>
            </label>
          </div>
        </div>

        {/* 参与同事、选择标签 - 放在正文下方 */}
        <div className="publish-options positive-options-below-body">
          <button type="button" className="publish-option-item" onClick={() => {
            setTempColleagues([...selectedColleagues])
            setColleagueSearchText('')
            setShowColleaguePicker(true)
          }}>
            <div className="publish-option-icon">
              <UserPlus size={18} />
            </div>
            <span className="publish-option-text">参与同事</span>
            <span className="publish-option-value">
              {selectedColleagues.length > 0 ? `已选 ${selectedColleagues.length} 人` : '请选择'}
            </span>
            <ChevronRight size={18} className="publish-option-arrow" />
          </button>
          <button
            type="button"
            className="publish-option-item"
            disabled={!selectedCategory}
            onClick={() => {
              if (selectedCategory) {
                setTempTags([...selectedTags])
                setShowTagPicker(true)
              }
            }}
          >
            <div className="publish-option-icon">
              <Tag size={18} />
            </div>
            <span className="publish-option-text">选择标签</span>
            <span className="publish-option-value">
              {selectedTags.length > 0 ? `已选 ${selectedTags.length} 个` : '请选择'}
            </span>
            <ChevronRight size={18} className="publish-option-arrow" />
          </button>
        </div>

        {submitError && (
          <div className="form-error" style={{ color: 'var(--color-danger)', marginBottom: 8 }}>
            {submitError}
          </div>
        )}
        <div className="form-actions positive-checkin-form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
          <button
            type="button"
            className="btn btn-primary btn-primary-green positive-checkin-submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            title={!canSubmit ? '请选择行为分类' : undefined}
          >
            {isSubmitting ? '提交中...' : '确认打卡'}
          </button>
        </div>
      </div>
    </div>
  )
}
