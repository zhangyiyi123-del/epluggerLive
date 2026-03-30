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
        const token = localStorage.getItem('ep_token')

        // 上传耗时通常来自图片体积（尤其是 PNG）。这里在前端把大图/PNG 适度压成 JPEG，
        // 减少上传耗时与后端写文件耗时（每次最多 3 张上传，开销可控）。
        const compressImageIfNeeded = async (file: File): Promise<File> => {
          const shouldCompress = file.type === 'image/png' || file.size > 1.5 * 1024 * 1024
          if (!shouldCompress) return file

          try {
            const bitmap = await createImageBitmap(file)
            const maxWidth = 1600
            const scale = Math.min(1, maxWidth / bitmap.width)
            const width = Math.max(1, Math.round(bitmap.width * scale))
            const height = Math.max(1, Math.round(bitmap.height * scale))

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) return file

            ctx.drawImage(bitmap, 0, 0, width, height)

            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(
                (b) => resolve(b),
                'image/jpeg',
                0.78
              )
            )

            if (!blob) return file
            return new File(
              [blob],
              file.name.replace(/\.\w+$/i, '.jpg'),
              { type: 'image/jpeg', lastModified: file.lastModified }
            )
          } catch {
            // 压缩失败就退回原图，保证功能可用
            return file
          }
        }

        const uploadChunk = async (chunk: File[]): Promise<string[]> => {
          const form = new FormData()
          const compressed = await Promise.all(chunk.map(compressImageIfNeeded))
          compressed.forEach((f) => form.append('files', f))

          const headers: Record<string, string> = {}
          // 避免 token 为空仍发送 Authorization: Bearer ''，减少不必要的预检
          if (token) headers.Authorization = `Bearer ${token}`

          const res = await fetch(`${base}/api/checkin/upload`, {
            method: 'POST',
            headers,
            body: form,
          })

          const data = (await res.json().catch(() => ({}))) as { urls?: string[]; error?: string; message?: string }
          if (!res.ok) {
            throw new Error(data?.message || data?.error || '图片上传失败')
          }
          return data.urls ?? []
        }

        const chunks: File[][] = []
        for (let i = 0; i < imageFiles.length; i += 3) {
          chunks.push(imageFiles.slice(i, i + 3))
        }

        // 并行上传每一批（后端单次最多3张），避免串行等待导致“超级慢”
        const uploaded = await Promise.all(chunks.map(uploadChunk))
        contentImages = uploaded.flat()
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
      // 弹框展示给用户确认/分享；由按钮/关闭操作后返回圈子页
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
          <div className="publish-success-card" role="dialog" aria-modal="true">
            <div className="publish-success-confetti" aria-hidden="true">
              {[
                // dist: 上冲距离（px），size: 粒子粗细（px）
                ['#F59E0B', 210, 0.00, -22, 9],
                ['#3B82F6', 230, 0.05, 18, 9],
                ['#EC4899', 200, 0.02, -44, 8],
                ['#22C55E', 225, 0.08, 56, 8],
                ['#8B5CF6', 185, 0.01, -68, 8],
                ['#F97316', 245, 0.07, 82, 9],
                ['#EF4444', 215, 0.03, -98, 8],
                ['#10B981', 175, 0.10, 112, 8],

                // extra particles for density/brightness
                ['#F59E0B', 190, 0.12, -10, 7],
                ['#3B82F6', 205, 0.14, 30, 7],
                ['#EC4899', 220, 0.16, -55, 7],
                ['#22C55E', 180, 0.18, 60, 7],
                ['#8B5CF6', 240, 0.20, -80, 7],
                ['#F97316', 160, 0.22, 95, 7],
                ['#EF4444', 235, 0.24, -110, 7],
                ['#10B981', 170, 0.26, 125, 7],

                ['#F59E0B', 225, 0.04, -35, 8],
                ['#3B82F6', 205, 0.09, 45, 8],
                ['#EC4899', 215, 0.11, -75, 8],
                ['#22C55E', 190, 0.13, 80, 8],
              ].map(([color, dist, delay, rotate, size], i) => (
                <span
                  key={i}
                  className="publish-success-confetti-piece"
                  style={{
                    background: color as string,
                    ['--r' as any]: `${rotate}deg`,
                    ['--d' as any]: `${dist}px`,
                    ['--sz' as any]: `${size}px`,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>

            <div className="publish-success-check">
              <div className="publish-success-check-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <div className="publish-success-title">发布成功</div>
            <div className="publish-success-subtitle">你的动态已成功发布到圈子，快去看看吧</div>
          </div>

          <button
            className="publish-success-close-btn"
            type="button"
            aria-label="关闭"
            onClick={() => {
              setShowSuccess(false)
              navigate('/community')
            }}
          >
            <X size={16} />
          </button>
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
