import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Building2,
  X,
  ChevronRight,
  Calendar,
  UserPlus as UserPlusIcon,
  Globe
} from 'lucide-react'
import type { Visibility } from '../types/community'
import { getApiBaseUrl } from '../api/client'
import { createPost } from '../api/community'
import { getColleagues, type ColleagueItem } from '../api/auth'

export default function PublishPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // 表单状态
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [visibility, setVisibility] = useState<Visibility>({ type: 'company' })
  const [selectedCheckIn, setSelectedCheckIn] = useState<{ id: string; title: string; date: string } | null>(null)
  const [selectedMention, setSelectedMention] = useState<{ id: string; name: string; department: string } | null>(null)
  
  // 选择器显示状态
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false)
  const [showCheckInPicker, setShowCheckInPicker] = useState(false)
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

  const getVisibilityIcon = () => {
    switch (visibility.type) {
      case 'company': return <Globe size={18} />
      case 'department': return <Building2 size={18} />
      case 'project': return <Users size={18} />
      case 'custom': return <UserPlusIcon size={18} />
    }
  }

  const getVisibilityLabel = () => {
    switch (visibility.type) {
      case 'company': return '全公司'
      case 'department': return '本部门'
      case 'project': return '项目组'
      case 'custom': return '自定义'
    }
  }

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
        visibilityType: visibility.type,
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

  // 模拟打卡记录数据
  const mockCheckIns = [
    { id: 'c1', title: '晨跑打卡', date: '今天 7:30' },
    { id: 'c2', title: '每日阅读', date: '今天 9:00' },
    { id: 'c3', title: '团队会议', date: '今天 14:00' },
  ]

  return (
    <div className="publish-page">
      {/* 发布成功动画 */}
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

      {/* 顶部导航栏 */}
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

      {/* 内容区域 */}
      <div className="publish-content">
        {submitError && (
          <div className="form-error" style={{ color: 'var(--color-danger)', marginBottom: 8 }}>
            {submitError}
          </div>
        )}
        {/* 图片上传 - 始终显示 */}
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

        {/* 文本输入 - 增大区域 */}
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
        {/* 已选关联打卡记录 */}
        {selectedCheckIn && (
          <div className="publish-selected-tags">
            <span className="publish-selected-tag">
              <Calendar size={12} />
              {selectedCheckIn.title}
              <button onClick={() => setSelectedCheckIn(null)}><X size={12} /></button>
            </span>
          </div>
        )}

        {/* 已选关联人员 */}
        {selectedMention && (
          <div className="publish-selected-tags">
            <span className="publish-selected-tag">
              <UserPlusIcon size={12} />
              {selectedMention.name}
              <button onClick={() => setSelectedMention(null)}><X size={12} /></button>
            </span>
          </div>
        )}

        {/* 关联选项 - 每行一个 */}

        {/* 关联选项 - 每行一个 */}
        <div className="publish-options">
          {/* 关联打卡记录 */}
          <button className="publish-option-item" onClick={() => setShowCheckInPicker(true)}>
            <div className="publish-option-icon">
              <Calendar size={18} />
            </div>
            <span className="publish-option-text">关联打卡记录</span>
            <ChevronRight size={18} className="publish-option-arrow" />
          </button>

          {/* 关联公司人员 */}
          <button className="publish-option-item" onClick={() => setShowMentionPicker(true)}>
            <div className="publish-option-icon">
              <UserPlusIcon size={18} />
            </div>
            <span className="publish-option-text">关联公司人员</span>
            <ChevronRight size={18} className="publish-option-arrow" />
          </button>

          {/* 权限设置 */}
          <button className="publish-option-item" onClick={() => setShowVisibilityPicker(true)}>
            <div className="publish-option-icon">
              {getVisibilityIcon()}
            </div>
            <span className="publish-option-text">{getVisibilityLabel()}</span>
            <ChevronRight size={18} className="publish-option-arrow" />
          </button>
        </div>
        {/* 打卡记录选择器 */}
        {showCheckInPicker && (
          <div className="publish-picker-overlay" onClick={() => setShowCheckInPicker(false)}>
            <div className="publish-picker" onClick={e => e.stopPropagation()}>
              <div className="publish-picker-header">
                <span className="publish-picker-title">关联打卡记录</span>
                <button className="publish-picker-close" onClick={() => setShowCheckInPicker(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="publish-picker-list">
                {mockCheckIns.map(checkIn => (
                  <button key={checkIn.id} className="publish-picker-item" onClick={() => {
                    setSelectedCheckIn(checkIn)
                    setShowCheckInPicker(false)
                  }}>
                    <Calendar size={18} />
                    <div className="publish-picker-item-info">
                      <span>{checkIn.title}</span>
                      <span className="publish-picker-item-desc">{checkIn.date}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 关联人员选择器 */}
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

        {/* 可见范围选择器 */}
        {showVisibilityPicker && (
          <div className="publish-picker-overlay" onClick={() => setShowVisibilityPicker(false)}>
            <div className="publish-picker" onClick={e => e.stopPropagation()}>
              <div className="publish-picker-header">
                <span className="publish-picker-title">谁可以看</span>
                <button className="publish-picker-close" onClick={() => setShowVisibilityPicker(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="publish-picker-list">
                {[
                  { type: 'company' as const, label: '全公司', desc: '所有员工可见', icon: Globe },
                  { type: 'department' as const, label: '本部门', desc: '仅部门同事可见', icon: Building2 },
                  { type: 'project' as const, label: '项目组', desc: '项目组成员可见', icon: Users },
                  { type: 'custom' as const, label: '自定义', desc: '指定同事可见', icon: UserPlusIcon },
                ].map(option => (
                  <button
                    key={option.type}
                    className={'publish-picker-item ' + (visibility.type === option.type ? 'selected' : '')}
                    onClick={() => {
                      setVisibility({ type: option.type })
                      setShowVisibilityPicker(false)
                    }}
                  >
                    <option.icon size={18} />
                    <div className="publish-picker-item-info">
                      <span>{option.label}</span>
                      <span className="publish-picker-item-desc">{option.desc}</span>
                    </div>
                    {visibility.type === option.type && (
                      <span className="publish-picker-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
