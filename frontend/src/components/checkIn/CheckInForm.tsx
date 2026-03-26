import { useState } from 'react'
import { Clock, MapPin, AlertCircle, Activity, Footprints, Dumbbell, Mountain, Bike, Waves, Volleyball, MountainSnow } from 'lucide-react'
import type { ExerciseIntensity, SportType, CheckInFormData } from '../../types/checkIn'
import AttachmentUpload from './AttachmentUpload'

interface CheckInFormProps {
  sportType: SportType
  attachments: File[]
  onAttachmentsChange: (files: File[]) => void
  onSubmit: (data: CheckInFormData) => void
  onReset: () => void
  isSubmitting?: boolean
}

const INITIAL_FIELD_VALUES: Record<string, string> = {
  duration: '',
  distance: '',
  pace: '',
  elevation: '',
  steps: '',
  laps: '',
  sets: '',
  weight: '',
  matches: '',
  score: '',
  height: '',
  routeGrade: '',
}

export default function CheckInForm({
  sportType,
  attachments,
  onAttachmentsChange,
  onSubmit,
  onReset,
  isSubmitting = false,
}: CheckInFormProps) {
  const [durationUnit, setDurationUnit] = useState<'minute' | 'hour'>('minute')
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'm'>('km')
  const intensity: ExerciseIntensity = 'medium'

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({ ...INITIAL_FIELD_VALUES })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [syncToCommunity, setSyncToCommunity] = useState(true)

  const updateFieldValue = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setFieldValues({ ...INITIAL_FIELD_VALUES })
    setErrors({})
    setDurationUnit('minute')
    setDistanceUnit('km')
    setSyncToCommunity(true)
    onReset()
  }

  type UnitOption = { value: 'minute' | 'hour' | 'km' | 'm'; label: string }
  type FieldConfig = {
    key: string
    label: string
    icon: typeof Clock
    type: 'number' | 'text'
    required?: boolean
    placeholder?: string
    unit?: string
    unitOptions?: UnitOption[]
  }

  const baseDurationField: FieldConfig = {
    key: 'duration',
    label: '运动时长',
    icon: Clock,
    type: 'number' as const,
    required: true,
    placeholder: '0',
    unitOptions: [
      { value: 'minute', label: '分钟' },
      { value: 'hour', label: '小时' },
    ],
  }

  const baseDistanceField: FieldConfig = {
    key: 'distance',
    label: '运动距离',
    icon: MapPin,
    type: 'number' as const,
    required: true,
    placeholder: '0',
    unitOptions: [
      { value: 'km', label: '公里' },
      { value: 'm', label: '米' },
    ],
  }

  const sportFieldConfigs: Record<string, FieldConfig[]> = {
    running: [
      baseDurationField,
      baseDistanceField,
      { key: 'pace', label: '平均配速', icon: Activity, type: 'number', placeholder: '0', unit: '分/公里' },
    ],
    cycling: [
      baseDurationField,
      baseDistanceField,
      { key: 'elevation', label: '爬升高度', icon: Activity, type: 'number', placeholder: '0', unit: '米' },
    ],
    hiking: [
      baseDurationField,
      baseDistanceField,
      { key: 'steps', label: '步数', icon: Activity, type: 'number', placeholder: '0', unit: '步' },
    ],
    swimming: [
      baseDurationField,
      { key: 'distance', label: '游泳距离', icon: MapPin, type: 'number', required: true, placeholder: '0', unit: '米' },
      { key: 'laps', label: '泳池圈数', icon: Activity, type: 'number', placeholder: '0', unit: '圈' },
    ],
    fitness: [
      baseDurationField,
      { key: 'sets', label: '训练组数', icon: Activity, type: 'number', placeholder: '0', unit: '组' },
      { key: 'weight', label: '最大重量', icon: Activity, type: 'number', placeholder: '0', unit: '公斤' },
    ],
    ball: [
      baseDurationField,
      { key: 'matches', label: '对局场次', icon: Activity, type: 'number', placeholder: '0', unit: '场' },
      { key: 'score', label: '得分', icon: Activity, type: 'number', placeholder: '0', unit: '分' },
    ],
    climbing: [
      baseDurationField,
      { key: 'height', label: '攀爬高度', icon: Activity, type: 'number', placeholder: '0', unit: '米' },
      { key: 'routeGrade', label: '线路难度', icon: Activity, type: 'text', placeholder: '如 V3 / 5.10a' },
    ],
  }

  const fields = sportFieldConfigs[sportType.id] ?? [baseDurationField, baseDistanceField]

  const getExerciseIcon = (sportTypeId: string) => {
    switch (sportTypeId) {
      case 'running': return <Footprints size={20} />
      case 'fitness': return <Dumbbell size={20} />
      case 'hiking': return <Mountain size={20} />
      case 'cycling': return <Bike size={20} />
      case 'swimming': return <Waves size={20} />
      case 'yoga': return <Activity size={20} />
      case 'ball': return <Volleyball size={20} />
      case 'climbing': return <MountainSnow size={20} />
      default: return <Activity size={20} />
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      const key = field.key
      const value = fieldValues[key]
      if (field.required) {
        if (field.type === 'number') {
          const num = parseFloat(value)
          if (!value || isNaN(num) || num <= 0) {
            newErrors[key] = `请输入有效的${field.label}`
          }
        } else if (!value?.trim()) {
          newErrors[key] = `请输入有效的${field.label}`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    const distanceField = fields.find(field => field.key === 'distance')
    const durationValue = parseFloat(fieldValues.duration || '0')
    const distanceValue = parseFloat(fieldValues.distance || '0')

    const metrics: Record<string, string | number> = {}
    fields.forEach(field => {
      if (field.key === 'duration' || field.key === 'distance') return
      const value = fieldValues[field.key]
      if (value === undefined || value === '') return
      metrics[field.key] = field.type === 'number' ? parseFloat(value) : value
    })

    onSubmit({
      sportTypeId: sportType.id,
      mode: 'single',
      duration: durationValue,
      durationUnit,
      distance: distanceValue,
      distanceUnit: distanceField && !distanceField.unitOptions ? 'm' : distanceUnit,
      intensity,
      attachments,
      metrics,
      syncToCommunity,
    })
  }

  return (
    <form className="checkin-form" onSubmit={handleSubmit}>
      <div className="checkin-form-row checkin-form-row-single">
        <span className="checkin-form-row-label">运动类型</span>
        <div className="checkin-form-row-value sport-type-selected">
          <span className={`sport-type-selected-icon sport-type-selected-icon--${sportType.id}`}>
            {getExerciseIcon(sportType.id)}
          </span>
          <span className="sport-type-selected-name">{sportType.name}</span>
        </div>
      </div>

      {fields.map((field, index) => {
        const key = field.key
        const hasUnitOptions = Array.isArray(field.unitOptions)
        const isDuration = key === 'duration'
        const isDistance = key === 'distance'
        const activeUnit = isDuration ? durationUnit : isDistance ? distanceUnit : undefined
        const isLast = index === fields.length - 1
        const isFirst = index === 0
        return (
          <div key={key} className={`checkin-form-row ${isFirst ? 'checkin-form-row-divider-top' : ''} ${!isLast ? 'checkin-form-row-divider' : ''}`}>
            <label className="checkin-form-row-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="checkin-form-row-control">
              <div className="input-with-unit">
                <input
                  type={field.type}
                  className={`checkin-form-input ${errors[key] ? 'input-error' : ''}`}
                  placeholder={field.placeholder ?? '请填写'}
                  value={fieldValues[key] ?? ''}
                  onChange={(e) => updateFieldValue(key, e.target.value)}
                  min={field.type === 'number' ? '0' : undefined}
                  step={field.type === 'number' ? (isDuration ? '1' : '0.1') : undefined}
                />
                {hasUnitOptions ? (
                  <div className="unit-switcher unit-switcher-inline">
                    {(field.unitOptions as UnitOption[]).map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`unit-btn ${activeUnit === option.value ? 'active' : ''}`}
                        onClick={() => {
                          if (isDuration) setDurationUnit(option.value as 'minute' | 'hour')
                          else if (isDistance) setDistanceUnit(option.value as 'km' | 'm')
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : field.unit ? (
                  <span className="unit-label">{field.unit}</span>
                ) : null}
              </div>
              {errors[key] && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  {errors[key]}
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div className="checkin-form-upload-section">
        <div className="checkin-form-upload-title">上传图片</div>
        <AttachmentUpload
          attachments={attachments}
          onChange={onAttachmentsChange}
          maxCount={9}
          hideLabel
        />
      </div>

      <label className="checkin-sync-to-community-row">
        <input
          type="checkbox"
          checked={syncToCommunity}
          onChange={(e) => setSyncToCommunity(e.target.checked)}
        />
        <span>同步到圈子</span>
      </label>

      <div className="form-actions exercise-checkin-form-actions">
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-primary-green exercise-checkin-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : '确认打卡'}
        </button>
      </div>
    </form>
  )
}
