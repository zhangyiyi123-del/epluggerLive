import { useState } from 'react'
import { Search, X, UserPlus, Check } from 'lucide-react'
import type { RelatedColleague } from '../../types/positive'

interface ColleagueSelectorProps {
  colleagues: { userId: string; name: string; avatar?: string }[]
  selectedColleagues: RelatedColleague[]
  onChange: (colleagues: RelatedColleague[]) => void
  maxColleagues?: number
}

export default function ColleagueSelector({
  colleagues,
  selectedColleagues,
  onChange,
  maxColleagues = 10
}: ColleagueSelectorProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState('')

  const filteredColleagues = colleagues.filter(c => 
    c.name.toLowerCase().includes(searchText.toLowerCase()) &&
    !selectedColleagues.some(sc => sc.userId === c.userId)
  )

  const handleAdd = (colleague: { userId: string; name: string; avatar?: string }) => {
    if (selectedColleagues.length < maxColleagues) {
      onChange([
        ...selectedColleagues,
        { ...colleague, role: 'witness' }
      ])
      setSearchText('')
    }
  }

  const handleRemove = (userId: string) => {
    onChange(selectedColleagues.filter(c => c.userId !== userId))
  }

  const handleRoleChange = (userId: string, role: 'participant' | 'witness') => {
    onChange(selectedColleagues.map(c => 
      c.userId === userId ? { ...c, role } : c
    ))
  }

  return (
    <div className="colleague-selector">
      <label className="form-label">
        <UserPlus size={16} />
        关联同事
        <span className="form-hint">（选填，最多 {maxColleagues} 人）</span>
      </label>

      {/* 已选择的同事 */}
      {selectedColleagues.length > 0 && (
        <div className="selected-colleagues">
          {selectedColleagues.map(colleague => (
            <div key={colleague.userId} className="colleague-chip">
              <span className="colleague-avatar">{colleague.avatar || colleague.name[0]}</span>
              <span className="colleague-name">{colleague.name}</span>
              <select
                className="role-select"
                value={colleague.role}
                onChange={(e) => handleRoleChange(colleague.userId, e.target.value as 'participant' | 'witness')}
              >
                <option value="witness">见证人</option>
                <option value="participant">参与人</option>
              </select>
              <button
                type="button"
                className="colleague-remove"
                onClick={() => handleRemove(colleague.userId)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 搜索添加 */}
      {selectedColleagues.length < maxColleagues && (
        <div className="colleague-search">
          {showSearch ? (
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="input"
                placeholder="搜索同事姓名..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="search-close"
                onClick={() => {
                  setShowSearch(false)
                  setSearchText('')
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="add-colleague-btn"
              onClick={() => setShowSearch(true)}
            >
              <UserPlus size={16} />
              添加同事
            </button>
          )}

          {/* 搜索结果 */}
          {showSearch && searchText && filteredColleagues.length > 0 && (
            <div className="search-results">
              {filteredColleagues.slice(0, 5).map(colleague => (
                <button
                  key={colleague.userId}
                  type="button"
                  className="search-result-item"
                  onClick={() => handleAdd(colleague)}
                >
                  <span className="colleague-avatar">{colleague.avatar || colleague.name[0]}</span>
                  <span className="colleague-name">{colleague.name}</span>
                  <Check size={16} className="add-icon" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedColleagues.length > 0 && (
        <div className="text-sm text-light" style={{ marginTop: 8 }}>
          已选择 {selectedColleagues.length}/{maxColleagues} 人
        </div>
      )}
    </div>
  )
}
