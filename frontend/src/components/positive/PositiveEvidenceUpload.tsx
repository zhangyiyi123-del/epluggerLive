import { useState, useRef } from 'react'
import { Image, FileText, Link2, Upload, X, Plus } from 'lucide-react'

interface PositiveEvidenceUploadProps {
  evidenceRequirement: 'required' | 'optional' | 'exempt'
  evidences: File[]
  onChange: (files: File[]) => void
}

export default function PositiveEvidenceUpload({
  evidenceRequirement,
  evidences,
  onChange
}: PositiveEvidenceUploadProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'file' | 'link'>('image')
  const [externalLink, setExternalLink] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getLabel = () => {
    switch (evidenceRequirement) {
      case 'required':
        return { text: '必填佐证', desc: '请上传至少1种佐证材料', color: '#EF4444' }
      case 'optional':
        return { text: '可选佐证', desc: '上传佐证可提升审核通过率', color: '#F59E0B' }
      case 'exempt':
        return { text: '免佐证', desc: '该分类无需上传佐证材料', color: '#10B981' }
    }
  }

  const label = getLabel()

  if (evidenceRequirement === 'exempt') {
    return (
      <div className="evidence-upload exempt">
        <div className="evidence-header">
          <span className="evidence-label" style={{ color: label.color }}>
            {label.text}
          </span>
        </div>
        <div className="evidence-exempt-content">
          <div className="evidence-exempt-icon">✓</div>
          <div className="evidence-exempt-text">{label.desc}</div>
        </div>
      </div>
    )
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) {
        alert(`${f.name} 不是图片文件`)
        return false
      }
      return true
    })
    onChange([...evidences, ...validFiles])
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(f => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      const maxSize = 20 * 1024 * 1024
      if (!allowedTypes.includes(f.type)) {
        alert(`${f.name} 不支持，请上传 pdf/word/excel 文件`)
        return false
      }
      if (f.size > maxSize) {
        alert(`${f.name} 超过20MB限制`)
        return false
      }
      return true
    })
    onChange([...evidences, ...validFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddLink = () => {
    if (!externalLink) return
    const linkFile = new File([], externalLink, { type: 'text/link' })
    Object.defineProperty(linkFile, 'url', { value: externalLink })
    onChange([...evidences, linkFile as any])
    setExternalLink('')
  }

  const handleRemove = (index: number) => {
    onChange(evidences.filter((_, i) => i !== index))
  }

  const getPreviewUrl = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return null
  }

  const imageCount = evidences.filter(f => f.type.startsWith('image/')).length
  const fileCount = evidences.filter(f => !f.type.startsWith('image/') && f.type !== 'text/link').length
  const linkCount = evidences.filter(f => f.type === 'text/link').length

  return (
    <div className="evidence-upload">
      <div className="evidence-header">
        <span className="evidence-label" style={{ color: label.color }}>
          {label.text}
        </span>
        <span className="evidence-desc">{label.desc}</span>
      </div>

      <div className="evidence-tabs">
        <button
          type="button"
          className={`evidence-tab ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          <Image size={16} />
          图片 {imageCount > 0 && `(${imageCount})`}
        </button>
        <button
          type="button"
          className={`evidence-tab ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
        >
          <FileText size={16} />
          文件 {fileCount > 0 && `(${fileCount})`}
        </button>
        <button
          type="button"
          className={`evidence-tab ${activeTab === 'link' ? 'active' : ''}`}
          onClick={() => setActiveTab('link')}
        >
          <Link2 size={16} />
          链接 {linkCount > 0 && `(${linkCount})`}
        </button>
      </div>

      {activeTab === 'image' && (
        <div className="evidence-content">
          {evidences.filter(f => f.type.startsWith('image/')).length > 0 && (
            <div className="evidence-grid">
              {evidences.map((file, index) => {
                if (!file.type.startsWith('image/')) return null
                return (
                  <div key={index} className="evidence-item">
                    <img src={getPreviewUrl(file)!} alt="" />
                    <button type="button" className="evidence-remove" onClick={() => handleRemove(index)}>
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
              {imageCount < 9 && (
                <button type="button" className="evidence-add" onClick={() => imageInputRef.current?.click()}>
                  <Plus size={20} />
                </button>
              )}
            </div>
          )}
          {imageCount === 0 && (
            <button type="button" className="evidence-upload-btn" onClick={() => imageInputRef.current?.click()}>
              <Upload size={24} />
              <span>点击上传图片</span>
              <span className="upload-hint">最多9张，支持png/jpg</span>
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

      {activeTab === 'file' && (
        <div className="evidence-content">
          {evidences.filter(f => !f.type.startsWith('image/') && f.type !== 'text/link').length > 0 && (
            <div className="file-list">
              {evidences.map((file, index) => {
                if (file.type.startsWith('image/') || file.type === 'text/link') return null
                return (
                  <div key={index} className="file-item">
                    <FileText size={20} />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(1)}KB</span>
                    <button type="button" className="file-remove" onClick={() => handleRemove(index)}>
                      <X size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          <button type="button" className="evidence-upload-btn" onClick={() => fileInputRef.current?.click()}>
            <Upload size={24} />
            <span>点击上传文件</span>
            <span className="upload-hint">支持pdf/word/excel，单文件≤20M</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {activeTab === 'link' && (
        <div className="evidence-content">
          <div className="link-input-wrapper">
            <input
              type="url"
              className="input"
              placeholder="请输入外部链接地址"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
            />
            <button type="button" className="btn btn-primary" onClick={handleAddLink}>
              添加
            </button>
          </div>
          {linkCount > 0 && (
            <div className="link-list">
              {evidences.map((file, index) => {
                if (file.type !== 'text/link') return null
                return (
                  <div key={index} className="link-item">
                    <Link2 size={16} />
                    <a href={(file as any).url} target="_blank" rel="noopener noreferrer">
                      {(file as any).url}
                    </a>
                    <button type="button" className="link-remove" onClick={() => handleRemove(index)}>
                      <X size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
