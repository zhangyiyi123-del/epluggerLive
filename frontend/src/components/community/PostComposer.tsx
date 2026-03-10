import { useState, useRef } from 'react'
import { Image, Video, Smile, Hash, AtSign, Lock, Users, Building2, UserPlus, X, Send } from 'lucide-react'
import type { PostFormData, Visibility, Topic, Mention, RelatedCheckIn } from '../../types/community'
import { POSITIVE_EMOJIS, MOCK_TOPICS } from '../../types/community'

interface PostComposerProps {
  onSubmit: (data: PostFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function PostComposer({ onSubmit, onCancel, isSubmitting = false }: PostComposerProps) {
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Visibility>({ type: 'company' })
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTopicPicker, setShowTopicPicker] = useState(false)
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false)
  const [showAtPicker, setShowAtPicker] = useState(false)
  const [mentions, _setMentions] = useState<Mention[]>([])
  const [relatedCheckIn, _setRelatedCheckIn] = useState<RelatedCheckIn | undefined>()
  const [atSearchText, setAtSearchText] = useState('')
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const getVisibilityIcon = () => {
    switch (visibility.type) {
      case 'company': return <Lock size={14} />
      case 'department': return <Building2 size={14} />
      case 'project': return <Users size={14} />
      case 'custom': return <UserPlus size={14} />
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
    // Create object URLs for preview
    const newImages = files.map(f => URL.createObjectURL(f))
    setImages([...images, ...newImages])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleEmojiClick = (emoji: string) => {
    const textarea = textAreaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = text.slice(0, start) + emoji + text.slice(end)
    setText(newText)
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      textarea.focus()
    }, 0)
  }

  const handleTopicSelect = (topic: Topic) => {
    if (!selectedTopics.find(t => t.id === topic.id) && selectedTopics.length < 3) {
      setSelectedTopics([...selectedTopics, topic])
    }
    setShowTopicPicker(false)
  }

  const handleRemoveTopic = (topicId: string) => {
    setSelectedTopics(selectedTopics.filter(t => t.id !== topicId))
  }

  const handleAtInsert = (name: string) => {
    const textarea = textAreaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const newText = text.slice(0, start) + `@${name} ` + text.slice(start)
    setText(newText)
    setShowAtPicker(false)
    setAtSearchText('')
    
    setTimeout(() => {
      textarea.focus()
    }, 0)
  }

  const handleSubmit = () => {
    if (!text.trim() || text.length > 500) {
      alert('请输入1-500字的正文内容')
      return
    }

    onSubmit({
      content: {
        text,
        images,
        emotions: [],
      },
      visibility,
      topics: selectedTopics,
      mentions,
      relatedCheckIn,
    })
  }

  return (
    <div className="post-composer">
      {/* 文本输入 */}
      <div className="composer-textarea-wrapper">
        <textarea
          ref={textAreaRef}
          className="composer-textarea"
          placeholder="分享你的正向故事..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          rows={4}
        />
        <div className="textarea-counter">
          <span className={text.length > 500 ? 'text-danger' : text.length < 1 ? 'text-warning' : ''}>
            {text.length}
          </span>
          /500
        </div>
      </div>

      {/* 图片上传 */}
      {images.length > 0 && (
        <div className="composer-images">
          {images.map((img, index) => (
            <div key={index} className="composer-image-item">
              <img src={img} alt="" />
              <button className="remove-image" onClick={() => handleRemoveImage(index)}>
                <X size={14} />
              </button>
            </div>
          ))}
          {images.length < 9 && (
            <button className="add-image-btn" onClick={() => imageInputRef.current?.click()}>
              <Image size={20} />
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
      )}

      {/* 工具栏 */}
      <div className="composer-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={() => imageInputRef.current?.click()} title="图片">
            <Image size={18} />
          </button>
          <button className="toolbar-btn" title="视频">
            <Video size={18} />
          </button>
          <button 
            className="toolbar-btn" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="表情"
          >
            <Smile size={18} />
          </button>
          <button 
            className="toolbar-btn" 
            onClick={() => setShowTopicPicker(!showTopicPicker)}
            title="话题"
          >
            <Hash size={18} />
          </button>
          <button 
            className="toolbar-btn" 
            onClick={() => setShowAtPicker(!showAtPicker)}
            title="@同事"
          >
            <AtSign size={18} />
          </button>
        </div>
        
        <button 
          className="visibility-btn"
          onClick={() => setShowVisibilityPicker(!showVisibilityPicker)}
        >
          {getVisibilityIcon()}
          <span>{getVisibilityLabel()}</span>
        </button>
      </div>

      {/* 表情选择器 */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          {POSITIVE_EMOJIS.map((emoji, i) => (
            <button key={i} className="emoji-btn" onClick={() => handleEmojiClick(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 话题选择器 */}
      {showTopicPicker && (
        <div className="topic-picker">
          <div className="topic-list">
            {MOCK_TOPICS.map(topic => (
              <button
                key={topic.id}
                className={`topic-item ${selectedTopics.find(t => t.id === topic.id) ? 'selected' : ''}`}
                onClick={() => handleTopicSelect(topic)}
              >
                <span>#</span>
                {topic.name}
                <span className="topic-count">{topic.postCount}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* @选择器 */}
      {showAtPicker && (
        <div className="at-picker">
          <input
            type="text"
            className="input"
            placeholder="搜索同事..."
            value={atSearchText}
            onChange={(e) => setAtSearchText(e.target.value)}
          />
          <div className="at-results">
            {['张三', '李四', '王五', '赵六'].filter(name => 
              name.includes(atSearchText)
            ).map(name => (
              <button key={name} className="at-result-item" onClick={() => handleAtInsert(name)}>
                <span className="avatar-sm">{name[0]}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 可见范围选择器 */}
      {showVisibilityPicker && (
        <div className="visibility-picker">
          {[
            { type: 'company' as const, label: '全公司', icon: Lock, desc: '所有员工可见' },
            { type: 'department' as const, label: '本部门', icon: Building2, desc: '仅部门同事可见' },
            { type: 'project' as const, label: '项目组', icon: Users, desc: '项目组成员可见' },
            { type: 'custom' as const, label: '自定义', icon: UserPlus, desc: '指定同事可见' },
          ].map(option => (
            <button
              key={option.type}
              className={`visibility-option ${visibility.type === option.type ? 'selected' : ''}`}
              onClick={() => {
                setVisibility({ type: option.type })
                setShowVisibilityPicker(false)
              }}
            >
              <option.icon size={18} />
              <div className="visibility-option-info">
                <span>{option.label}</span>
                <span className="visibility-option-desc">{option.desc}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 已选话题标签 */}
      {selectedTopics.length > 0 && (
        <div className="selected-topics">
          {selectedTopics.map(topic => (
            <span key={topic.id} className="selected-topic">
              #{topic.name}
              <button onClick={() => handleRemoveTopic(topic.id)}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}

      {/* 提交按钮 */}
      <div className="composer-actions">
        <button className="btn btn-secondary" onClick={onCancel}>取消</button>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={!text.trim() || text.length > 500 || isSubmitting}
        >
          <Send size={16} />
          {isSubmitting ? '发布中...' : '发布'}
        </button>
      </div>
    </div>
  )
}
