import { Check } from 'lucide-react'
import type { PositiveCategory, PositiveTag } from '../../types/positive'

interface CategoryTagSelectorProps {
  categories: PositiveCategory[]
  tags: PositiveTag[]
  selectedCategoryId: string | null
  selectedTagIds: string[]
  onCategorySelect: (categoryId: string) => void
  onTagsSelect: (tagIds: string[]) => void
  maxTags?: number
}

export default function CategoryTagSelector({
  categories,
  tags,
  selectedCategoryId,
  selectedTagIds,
  onCategorySelect,
  onTagsSelect,
  maxTags = 5
}: CategoryTagSelectorProps) {
  const enabledCategories = categories
    .filter(c => c.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const currentCategoryTags = tags
    .filter(t => t.categoryId === selectedCategoryId && t.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const getEvidenceLabel = (requirement: string) => {
    switch (requirement) {
      case 'required':
        return { text: '必填佐证', color: '#EF4444' }
      case 'optional':
        return { text: '可选佐证', color: '#F59E0B' }
      case 'exempt':
        return { text: '免佐证', color: '#3B82F6' }
      default:
        return { text: '', color: '#6B7280' }
    }
  }

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsSelect(selectedTagIds.filter(id => id !== tagId))
    } else {
      if (selectedTagIds.length < maxTags) {
        onTagsSelect([...selectedTagIds, tagId])
      }
    }
  }

  return (
    <div className="category-tag-selector">
      <div className="form-group">
        <label className="form-label">
          行为分类 <span className="required">*</span>
        </label>
        <div className="category-grid">
          {enabledCategories.map(category => {
            const evidenceLabel = getEvidenceLabel(category.evidenceRequirement)
            return (
              <button
                key={category.id}
                type="button"
                className={`category-item ${selectedCategoryId === category.id ? 'selected' : ''}`}
                onClick={() => {
                  onCategorySelect(category.id)
                  onTagsSelect([])
                }}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span 
                  className="category-evidence"
                  style={{ color: evidenceLabel.color }}
                >
                  {evidenceLabel.text}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedCategoryId && currentCategoryTags.length > 0 && (
        <div className="form-group">
          <label className="form-label">
            行为标签 <span className="text-light">（最多选 {maxTags} 个）</span>
          </label>
          <div className="tag-grid">
            {currentCategoryTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className={`tag-item ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
                onClick={() => handleTagToggle(tag.id)}
              >
                {selectedTagIds.includes(tag.id) && <Check size={14} />}
                {tag.name}
              </button>
            ))}
          </div>
          {selectedTagIds.length > 0 && (
            <div className="text-sm text-secondary" style={{ marginTop: 8 }}>
              已选择 {selectedTagIds.length}/{maxTags} 个标签
            </div>
          )}
        </div>
      )}
    </div>
  )
}
