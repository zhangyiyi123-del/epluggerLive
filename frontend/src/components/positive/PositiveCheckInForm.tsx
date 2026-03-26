import { useState } from 'react'
import { FileText, AlertCircle } from 'lucide-react'
import type { PositiveCategory, PositiveTag, RelatedColleague } from '../../types/positive'
import CategoryTagSelector from './CategoryTagSelector'
import ColleagueSelector from './ColleagueSelector'
import PositiveEvidenceUpload from './PositiveEvidenceUpload'

interface PositiveCheckInFormProps {
  categories: PositiveCategory[]
  tags: PositiveTag[]
  colleagueList: { userId: string; name: string; avatar?: string }[]
  projectList: string[]
  onSubmit: (data: {
    title?: string
    categoryId: string
    tagIds: string[]
    description: string
    relatedProject?: string
    relatedColleagues: RelatedColleague[]
    evidences: File[]
  }) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function PositiveCheckInForm({
  categories,
  tags,
  colleagueList,
  projectList,
  onSubmit,
  onCancel,
  isSubmitting = false
}: PositiveCheckInFormProps) {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [relatedProject, setRelatedProject] = useState('')
  const [relatedColleagues, setRelatedColleagues] = useState<RelatedColleague[]>([])
  const [evidences, setEvidences] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // 分类必选
    if (!categoryId) {
      newErrors.category = '请选择行为分类'
    }
    
    // 标签必选
    if (tagIds.length === 0) {
      newErrors.tag = '请至少选择一个行为标签'
    }
    
    if (description.length > 2000) {
      newErrors.description = '详细描述不能超过2000字'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    onSubmit({
      title: title || undefined,
      categoryId,
      tagIds,
      description,
      relatedProject: relatedProject || undefined,
      relatedColleagues,
      evidences,
    })
  }

  return (
    <form className="positive-form" onSubmit={handleSubmit}>
      {/* 标题 */}
      <div className="form-group">
        <label className="form-label">
          标题
          <span className="form-hint">（选填，最多20字）</span>
        </label>
        <input
          type="text"
          className="input"
          placeholder="请输入标题，或留空自动生成"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 20))}
          maxLength={20}
        />
      </div>

      {/* 分类与标签 */}
      <CategoryTagSelector
        categories={categories}
        tags={tags}
        selectedCategoryId={categoryId}
        selectedTagIds={tagIds}
        onCategorySelect={setCategoryId}
        onTagsSelect={setTagIds}
      />
      {errors.category && (
        <div className="form-error" style={{ marginTop: -16, marginBottom: 16 }}>
          <AlertCircle size={14} />
          {errors.category}
        </div>
      )}
      {errors.tag && (
        <div className="form-error" style={{ marginTop: -16, marginBottom: 16 }}>
          <AlertCircle size={14} />
          {errors.tag}
        </div>
      )}

      {/* 详细描述 */}
      <div className="form-group">
        <label className="form-label">
          <FileText size={16} />
          详细描述 <span className="form-hint">（选填）</span>
        </label>
        <textarea
          className={`input description-input ${errors.description ? 'input-error' : ''}`}
          placeholder="选填，可描述背景、过程、结果与影响等"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
          rows={6}
          maxLength={2000}
        />
        <div className="textarea-counter">
          <span className={description.length > 2000 ? 'text-danger' : ''}>{description.length}</span>
          <span>/ 2000 字</span>
        </div>
        {errors.description && (
          <div className="form-error">
            <AlertCircle size={14} />
            {errors.description}
          </div>
        )}
      </div>

      {/* 关联项目 */}
      <div className="form-group">
        <label className="form-label">
          关联项目
          <span className="form-hint">（选填）</span>
        </label>
        <div className="related-inputs">
          <input
            type="text"
            className="input"
            placeholder="关联项目（支持搜索）"
            list="project-list"
            value={relatedProject}
            onChange={(e) => setRelatedProject(e.target.value)}
          />
          <datalist id="project-list">
            {projectList.map((p, i) => <option key={i} value={p} />)}
          </datalist>
        </div>
      </div>

      {/* 关联同事 */}
      <ColleagueSelector
        colleagues={colleagueList}
        selectedColleagues={relatedColleagues}
        onChange={setRelatedColleagues}
      />

      {/* 佐证上传 */}
      <PositiveEvidenceUpload
        evidenceRequirement="optional"
        evidences={evidences}
        onChange={setEvidences}
      />
      {/* 提交按钮 */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交打卡'}
        </button>
      </div>
    </form>
  )
}
