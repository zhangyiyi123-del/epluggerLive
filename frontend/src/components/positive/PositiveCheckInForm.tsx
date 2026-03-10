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
  customerList: string[]
  onSubmit: (data: {
    title?: string
    categoryId: string
    tagIds: string[]
    description: string
    relatedProject?: string
    relatedCustomer?: string
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
  customerList,
  onSubmit,
  onCancel,
  isSubmitting = false
}: PositiveCheckInFormProps) {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [relatedProject, setRelatedProject] = useState('')
  const [relatedCustomer, setRelatedCustomer] = useState('')
  const [relatedColleagues, setRelatedColleagues] = useState<RelatedColleague[]>([])
  const [evidences, setEvidences] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentCategory = categories.find(c => c.id === categoryId)

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
    
    // 描述 20-500字
    if (!description || description.length < 20) {
      newErrors.description = '详细描述至少需要20个字'
    } else if (description.length > 500) {
      newErrors.description = '详细描述不能超过500字'
    }
    
    // 佐证检查
    if (currentCategory?.evidenceRequirement === 'required' && evidences.length === 0) {
      newErrors.evidence = '该分类需要上传佐证材料'
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
      relatedCustomer: relatedCustomer || undefined,
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
          详细描述 <span className="required">*</span>
        </label>
        <textarea
          className={`input description-input ${errors.description ? 'input-error' : ''}`}
          placeholder="请按「背景 - 过程 - 结果 - 影响」的逻辑填写，字数20-500字"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
        />
        <div className="textarea-counter">
          <span className={description.length < 20 ? 'text-warning' : description.length > 500 ? 'text-danger' : 'text-success'}>
            {description.length}
          </span>
          <span>/ 500 字 {description.length < 20 ? '（还需补充）' : description.length > 500 ? '（已超限）' : '（符合要求）'}</span>
        </div>
        {errors.description && (
          <div className="form-error">
            <AlertCircle size={14} />
            {errors.description}
          </div>
        )}
      </div>

      {/* 关联项目/客户 */}
      <div className="form-group">
        <label className="form-label">
          关联项目 / 客户
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
          
          <input
            type="text"
            className="input"
            placeholder="关联客户（支持搜索）"
            list="customer-list"
            value={relatedCustomer}
            onChange={(e) => setRelatedCustomer(e.target.value)}
          />
          <datalist id="customer-list">
            {customerList.map((c, i) => <option key={i} value={c} />)}
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
        evidenceRequirement={currentCategory?.evidenceRequirement || 'optional'}
        evidences={evidences}
        onChange={setEvidences}
      />
      {errors.evidence && (
        <div className="form-error" style={{ marginTop: -16 }}>
          <AlertCircle size={14} />
          {errors.evidence}
        </div>
      )}

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
