import type { SportType } from '../../types/checkIn'

interface SportTypeSelectorProps {
  sportTypes: SportType[]
  selectedId: string | null
  onSelect: (sportType: SportType) => void
}

export default function SportTypeSelector({ sportTypes, selectedId, onSelect }: SportTypeSelectorProps) {
  const enabledTypes = sportTypes
    .filter(type => type.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="sport-type-selector">
      <label className="form-label">选择运动类型</label>
      <div className="sport-type-grid">
        {enabledTypes.map(sportType => (
          <button
            key={sportType.id}
            type="button"
            className={`sport-type-item ${selectedId === sportType.id ? 'selected' : ''}`}
            onClick={() => onSelect(sportType)}
          >
            <span className="sport-type-icon">{sportType.icon}</span>
            <span className="sport-type-name">{sportType.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
