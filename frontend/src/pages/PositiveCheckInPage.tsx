import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Building2, UserPlus, X, Tag } from 'lucide-react'
import type { PositiveCategory, PositiveTag, RelatedColleague } from '../types/positive'
import { DEFAULT_POSITIVE_TAGS, MOCK_COLLEAGUES, MOCK_CUSTOMERS } from '../types/positive'
import * as checkInApi from '../api/checkin'
import type { PositiveCategoryDto } from '../api/checkin'

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
  const [relatedCustomer, setRelatedCustomer] = useState('')
  const [selectedColleagues, setSelectedColleagues] = useState<RelatedColleague[]>([])
  const [evidences, setEvidences] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)
  const [showColleaguePicker, setShowColleaguePicker] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [tempTags, setTempTags] = useState<PositiveTag[]>([])
  const [tempColleagues, setTempColleagues] = useState<RelatedColleague[]>([])
  const [colleagueSearchText, setColleagueSearchText] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [pointsPreview, setPointsPreview] = useState<checkInApi.PointsPreviewDto | null>(null)
  const evidenceImageInputRef = useRef<HTMLInputElement>(null)

  const tags = DEFAULT_POSITIVE_TAGS
  const colleagueList = MOCK_COLLEAGUES
  const customerList = MOCK_CUSTOMERS

  const evidenceRequirement = selectedCategory?.evidenceRequirement ?? 'optional'
  const requiresEvidence = evidenceRequirement === 'required'

  useEffect(() => {
    checkInApi
      .getPointsPreview(description.length, evidences.length, selectedColleagues.length)
      .then(setPointsPreview)
  }, [description.length, evidences.length, selectedColleagues.length])

  const canSubmit =
    selectedCategory !== null &&
    description.trim().length >= 20 &&
    description.trim().length <= 500 &&
    (!requiresEvidence || evidences.length > 0)

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
      })
      setEarnedPoints(res.points)
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
    setRelatedCustomer('')
    setSelectedColleagues([])
    setEvidences([])
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
    return (
      <div className="page">
        <div className="checkin-success">
          <div className="checkin-success-icon">
            <Check size={40} />
          </div>
          <h2 className="checkin-success-title">正向打卡成功！</h2>
          <div className="checkin-success-points">+{earnedPoints} 积分</div>
          <div className="checkin-success-breakdown">
            <div className="breakdown-item">
              <span>基础奖励</span>
              <span>+30</span>
            </div>
            {selectedColleagues.length > 0 && (
              <div className="breakdown-item">
                <span>参与人奖励</span>
                <span>+{selectedColleagues.length * 5}</span>
              </div>
            )}
            {evidences.length > 0 && (
              <div className="breakdown-item">
                <span>佐证奖励</span>
                <span>+10</span>
              </div>
            )}
            {description.length > 50 && selectedColleagues.length > 0 && (
              <div className="breakdown-item">
                <span>优质奖励</span>
                <span>+10</span>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleSuccessClose}>
            完成
          </button>
        </div>
      </div>
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
        {/* 关联客户选择器 */}
        {showCustomerPicker && (
          <div className="publish-picker-overlay" onClick={() => setShowCustomerPicker(false)}>
            <div className="publish-picker" onClick={e => e.stopPropagation()}>
              <div className="publish-picker-header">
                <span className="publish-picker-title">关联客户</span>
                <button type="button" className="publish-picker-close" onClick={() => setShowCustomerPicker(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="publish-picker-list">
                <button
                  type="button"
                  className={`publish-picker-item ${!relatedCustomer ? 'selected' : ''}`}
                  onClick={() => {
                    setRelatedCustomer('')
                    setShowCustomerPicker(false)
                  }}
                >
                  <Building2 size={18} />
                  <div className="publish-picker-item-info">
                    <span>不选择</span>
                  </div>
                  {!relatedCustomer && <span className="publish-picker-check">✓</span>}
                </button>
                {customerList.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`publish-picker-item ${relatedCustomer === c ? 'selected' : ''}`}
                    onClick={() => {
                      setRelatedCustomer(c)
                      setShowCustomerPicker(false)
                    }}
                  >
                    <Building2 size={18} />
                    <div className="publish-picker-item-info">
                      <span>{c}</span>
                    </div>
                    {relatedCustomer === c && <span className="publish-picker-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
            placeholder="分享你的正向故事... 描述行为内容、成果、收获等（建议50字以上）"
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 500))}
            rows={6}
            maxLength={500}
          />
          <div className="publish-text-counter">
            <span className={description.length > 500 ? 'text-danger' : description.length < 1 ? 'text-warning' : ''}>
              {description.length}
            </span>/500
            {description.length >= 50 && <span className="quality-hint"> 已满足优质条件</span>}
            {description.trim().length > 0 && description.trim().length < 20 && (
              <span className="text-warning" style={{ marginLeft: 8 }}>还需 {20 - description.trim().length} 字即可提交</span>
            )}
          </div>
          <div className="positive-form-hint" style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            描述需 20-500 字才能提交；必填项填完整后提交按钮才会可用。
          </div>
        </div>

        {/* 关联客户、参与同事、选择标签 - 放在正文下方 */}
        <div className="publish-options positive-options-below-body">
          <button type="button" className="publish-option-item" onClick={() => setShowCustomerPicker(true)}>
            <div className="publish-option-icon">
              <Building2 size={18} />
            </div>
            <span className="publish-option-text">关联客户</span>
            <span className="publish-option-value">{relatedCustomer || '请选择'}</span>
            <ChevronRight size={18} className="publish-option-arrow" />
          </button>
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

        {pointsPreview && (
          <div className="positive-points-preview" style={{ marginBottom: 12, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            预计积分：<strong style={{ color: 'var(--color-primary)' }}>{pointsPreview.totalPoints}</strong>
            {pointsPreview.qualityBonus > 0 && <span>（含优质+{pointsPreview.qualityBonus}）</span>}
            {pointsPreview.evidenceBonus > 0 && <span>（佐证+{pointsPreview.evidenceBonus}）</span>}
            {pointsPreview.colleagueBonus > 0 && <span>（参与人+{pointsPreview.colleagueBonus}）</span>}
          </div>
        )}
        {submitError && (
          <div className="form-error" style={{ color: 'var(--color-danger)', marginBottom: 8 }}>
            {submitError}
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
          <button
            type="button"
            className="btn btn-primary btn-primary-green"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            title={!canSubmit ? (description.trim().length < 20 ? '描述至少 20 字才能提交' : !selectedCategory ? '请选择分类' : requiresEvidence && evidences.length === 0 ? '该分类需要上传佐证' : '') : undefined}
          >
            {isSubmitting ? '提交中...' : '提交'}
          </button>
        </div>
      </div>
    </div>
  )
}
