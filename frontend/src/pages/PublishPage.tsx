import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  X,
  ChevronRight,
  UserPlus as UserPlusIcon,
} from 'lucide-react'
import { getApiBaseUrl } from '../api/client'
import { createPost } from '../api/community'
import { getColleagues, type ColleagueItem } from '../api/auth'

export default function PublishPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [selectedMention, setSelectedMention] = useState<{ id: string; name: string; department: string } | null>(null)

  const [showMentionPicker, setShowMentionPicker] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [colleagueList, setColleagueList] = useState<ColleagueItem[]>([])
  const [mentionSearch, setMentionSearch] = useState('')

  useEffect(() => {
    getColleagues().then(setColleagueList)
  }, [])

  const filteredColleagues = colleagueList.filter(
    c => !mentionSearch.trim() || c.name.toLowerCase().includes(mentionSearch.toLowerCase()) || (c.department || '').toLowerCase().includes(mentionSearch.toLowerCase())
  )

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 9) {
      alert('最多上传9张图片')
      return
    }
    const newImages = files.map((f) => URL.createObjectURL(f))
    setImages((prev) => [...prev, ...newImages])
    setImageFiles((prev) => [...prev, ...files])
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!text.trim() || text.length > 500) {
      alert('请输入1-500字的正文内容')
      return
    }
    setSubmitError('')
    setIsSubmitting(true)
    try {
      let contentImages: string[] = []
      if (imageFiles.length > 0) {
        const base = getApiBaseUrl()
        for (let i = 0; i < imageFiles.length; i += 3) {
          const chunk = imageFiles.slice(i, i + 3)
          const form = new FormData()
          chunk.forEach((f) => form.append('files', f))
          const res = await fetch(`${base}/api/checkin/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('ep_token') || ''}` },
            body: form,
          })
          const data = (await res.json()) as { urls?: string[] }
          if (res.ok && data.urls) contentImages = contentImages.concat(data.urls)
        }
      }
      await createPost({
        contentText: text.trim(),
        contentImages: contentImages.length > 0 ? contentImages : undefined,
        visibilityType: 'company',
        topicIds: [],
        mentionUserIds:
          selectedMention && /^\d+$/.test(String(selectedMention.id))
            ? [Number(selectedMention.id)]
            : undefined,
      })
      setShowSuccess(true)
      await new Promise((r) => setTimeout(r, 1500))
      navigate('/community')
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '发布失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canPublish = text.trim().length > 0 && text.length <= 500

  return (
    <div className="publish-page">
      {showSuccess && (
        <div className="publish-success-overlay">
          <div className="publish-success-animation">
            <div className="success-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span>发布成功</span>
          </div>
        </div>
      )}

      <div className="publish-header">
        <button className="publish-back-btn" onClick={() => navigate('/community')}>
          <ArrowLeft size={22} />
        </button>
        <div className="publish-header-title">发布动态</div>
        <button
          className={'publish-submit-btn ' + (canPublish ? 'active' : 'disabled')}
          onClick={handleSubmit}
          disabled={!canPublish || isSubmitting}
        >
          {isSubmitting ? '发布中' : '发布'}
        </button>
      </div>

      <div className="publish-content">
        {submitError && (
          <div className="form-error" style={{ color: 'var(--color-danger)', marginBottom: 8 }}>
            {submitError}
          </div>
        )}
        <div className="publish-images-scroll">
          {images.map((img, index) => (
            <div key={index} className="publish-image-item">
              <img src={img} alt="" />
              <button className="publish-remove-image" onClick={() => handleRemoveImage(index)}>
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < 9 && (
            <button
              type="button"
              className="publish-add-image-scroll"
              onClick={() => imageInputRef.current?.click()}
            >
              <span className="add-icon">+</span>
              <span>{images.length}/9</span>
            </button>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>

        <div className="publish-textarea-wrapper">
          <textarea
            ref={textAreaRef}
            className="publish-textarea"
            placeholder="分享你的正向故事..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            rows={8}
          />
          <div className="publish-text-counter">
            <span className={text.length > 500 ? 'text-danger' : text.length < 1 ? 'text-warning' : ''}>
              {text.length}
            </span>/500
          </div>
        </div>

        {selectedMention && (
          <div className="publish-selected-tags">
            <span className="publish-selected-tag">
              <UserPlusIcon size={12} />
              {selectedMention.name}
              <button onClick={() => setSelectedMention(null)}><X size={12} /></button>
            </span>
          </div>
        )}

        <div className="publish-options">
          <button className="publish-option-item" onClick={() => setShowMentionPicker(true)}>
            <div className="publish-option-icon">
              <UserPlusIcon size={18} />
            </div>
            <span className="publish-option-text">关联公司人员</span>
            <ChevronRight size={18} className="publish-option-arrow" />
          </button>
        </div>

        {showMentionPicker && (
          <div className="publish-picker-overlay" onClick={() => setShowMentionPicker(false)}>
            <div className="publish-picker" onClick={e => e.stopPropagation()}>
              <div className="publish-picker-header">
                <span className="publish-picker-title">关联公司人员</span>
                <button className="publish-picker-close" onClick={() => setShowMentionPicker(false)}>
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                className="publish-picker-input"
                placeholder="搜索同事..."
                value={mentionSearch}
                onChange={e => setMentionSearch(e.target.value)}
              />
              <div className="publish-picker-list">
                {filteredColleagues.length === 0 ? (
                  <div className="publish-picker-empty">{colleagueList.length === 0 ? '加载中...' : '无匹配同事'}</div>
                ) : (
                  filteredColleagues.map(person => (
                    <button key={person.id} className="publish-picker-item" onClick={() => {
                      setSelectedMention({ id: person.id, name: person.name, department: person.department ?? '' })
                      setShowMentionPicker(false)
                    }}>
                      <span className="publish-picker-avatar">{person.avatar || person.name[0]}</span>
                      <div className="publish-picker-item-info">
                        <span>{person.name}</span>
                        <span className="publish-picker-item-desc">{person.department ?? ''}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
