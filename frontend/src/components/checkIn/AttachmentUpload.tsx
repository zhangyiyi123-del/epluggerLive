import { useState, useRef } from 'react'
import { Image, X, GripVertical, Plus, Eye } from 'lucide-react'

interface AttachmentUploadProps {
  attachments: File[]
  onChange: (files: File[]) => void
  maxCount?: number
  /** 为 true 时不显示内部「佐证上传」标题行 */
  hideLabel?: boolean
}

export default function AttachmentUpload({ attachments, onChange, maxCount = 9, hideLabel = false }: AttachmentUploadProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + attachments.length > maxCount) {
      alert(`最多只能上传 ${maxCount} 张图片`)
      return
    }
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} 不是图片文件`)
        return false
      }
      return true
    })
    
    onChange([...attachments, ...validFiles])
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index)
    onChange(newAttachments)
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    
    const newAttachments = [...attachments]
    const draggedItem = newAttachments[dragIndex]
    newAttachments.splice(dragIndex, 1)
    newAttachments.splice(index, 0, draggedItem)
    onChange(newAttachments)
    setDragIndex(index)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
  }

  const openPreview = (index: number) => {
    setPreviewIndex(index)
  }

  const closePreview = () => {
    setPreviewIndex(null)
  }

  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file)
  }

  return (
    <div className="attachment-upload">
      {!hideLabel && (
        <label className="form-label">
          <Image size={16} />
          佐证上传
          <span className="form-hint">（非必填）</span>
        </label>
      )}
      {attachments.length > 0 && (
        <div className="attachment-grid">
          {attachments.map((file, index) => (
            <div
              key={index}
              className={`attachment-item ${dragIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <img src={getPreviewUrl(file)} alt={`佐证${index + 1}`} />
              
              <div className="attachment-actions">
                <button
                  type="button"
                  className="attachment-btn"
                  onClick={() => openPreview(index)}
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  className="attachment-btn delete"
                  onClick={() => handleRemove(index)}
                >
                  <X size={14} />
                </button>
              </div>
              
              <div className="drag-handle">
                <GripVertical size={14} />
              </div>
            </div>
          ))}
          
          {attachments.length < maxCount && (
            <button
              type="button"
              className="add-attachment-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={20} />
              <span>添加</span>
            </button>
          )}
        </div>
      )}
      
      {attachments.length === 0 && (
        <button
          type="button"
          className="upload-placeholder"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">
            <Image size={24} />
          </div>
          <span>点击上传佐证图片</span>
          <span className="upload-hint">最多 {maxCount} 张，支持 png/jpg</span>
        </button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {previewIndex !== null && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={closePreview}>
              <X size={24} />
            </button>
            <img src={getPreviewUrl(attachments[previewIndex])} alt="预览" />
            <div className="preview-info">
              {previewIndex + 1} / {attachments.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
