// 运动类型
export interface SportType {
  id: string
  name: string
  icon: string
  description?: string
  isEnabled: boolean
  sortOrder: number
  isBuiltIn: boolean
  createdAt?: string
}

// 运动强度
export type ExerciseIntensity = 'low' | 'medium' | 'high'

export interface IntensityOption {
  value: ExerciseIntensity
  label: string
  color: string
}

export const INTENSITY_OPTIONS: IntensityOption[] = [
  { value: 'low', label: '低', color: '#10B981' },
  { value: 'medium', label: '中', color: '#F59E0B' },
  { value: 'high', label: '高', color: '#EF4444' },
]

// 打卡记录
export interface CheckInRecord {
  id: string
  userId: string
  sportTypeId: string
  sportTypeName: string
  sportTypeIcon: string
  duration: number
  durationUnit: 'minute' | 'hour'
  distance?: number
  distanceUnit: 'km' | 'm'
  intensity: ExerciseIntensity
  attachments: Attachment[]
  checkedInAt: string
  status: 'normal' | 'suspicious' | 'pending_review' | 'rejected'
  suspiciousReason?: string
  points: number
  reviewedAt?: string
  reviewedBy?: string
}

export interface Attachment {
  id: string
  url: string
  type: 'image' | 'screenshot'
  uploadedAt: string
}

// 每日目标配置
export interface DailyGoal {
  sportTypeId: string
  targetDuration: number
  targetDistance?: number
  isActive: boolean
}

// 周期累计目标
export type CycleType = 'week' | 'month'

export interface CycleGoal {
  id: string
  type: CycleType
  sportTypeId?: string
  targetDuration: number
  targetDistance?: number
  startDate: string
  endDate: string
  isActive: boolean
}

export interface CycleProgress {
  cycleType: CycleType
  startDate: string
  endDate: string
  currentDuration: number
  currentDistance: number
  targetDuration: number
  targetDistance?: number
  isCompleted: boolean
  daysRemaining: number
}

export type CheckInMode = 'single' | 'daily_goal' | 'cycle'

export interface CheckInFormData {
  sportTypeId: string
  mode: CheckInMode
  duration: number
  durationUnit: 'minute' | 'hour'
  distance: number
  distanceUnit: 'km' | 'm'
  intensity: ExerciseIntensity
  attachments: File[]
  metrics?: Record<string, string | number>
}

// 默认运动类型
export const DEFAULT_SPORT_TYPES: SportType[] = [
  { id: 'running', name: '跑步', icon: '🏃', isEnabled: true, sortOrder: 1, isBuiltIn: true },
  { id: 'fitness', name: '健身', icon: '🏋️', isEnabled: true, sortOrder: 2, isBuiltIn: true },
  { id: 'hiking', name: '徒步', icon: '🥾', isEnabled: true, sortOrder: 3, isBuiltIn: true },
  { id: 'cycling', name: '骑行', icon: '🚴', isEnabled: true, sortOrder: 4, isBuiltIn: true },
  { id: 'swimming', name: '游泳', icon: '🏊', isEnabled: true, sortOrder: 5, isBuiltIn: true },
  { id: 'ball', name: '球类', icon: '⛹️', isEnabled: true, sortOrder: 7, isBuiltIn: true },
  { id: 'climbing', name: '攀岩', icon: '🧗', isEnabled: false, sortOrder: 8, isBuiltIn: true },
]

export const MOCK_TODAY_CHECKINS: CheckInRecord[] = [
  {
    id: '1',
    userId: 'user1',
    sportTypeId: 'running',
    sportTypeName: '跑步',
    sportTypeIcon: '🏃',
    duration: 30,
    durationUnit: 'minute',
    distance: 5,
    distanceUnit: 'km',
    intensity: 'medium',
    attachments: [],
    checkedInAt: new Date().toISOString(),
    status: 'normal',
    points: 50,
  }
]

export const MOCK_CYCLE_PROGRESS: CycleProgress = {
  cycleType: 'week',
  startDate: '2024-02-26',
  endDate: '2024-03-03',
  currentDuration: 120,
  currentDistance: 15,
  targetDuration: 180,
  targetDistance: 20,
  isCompleted: false,
  daysRemaining: 4,
}

export type ExerciseRecord = {
  id: string
  sportTypeId: string
  date: string
  duration: number
  distance?: number
  points: number
}

export const MOCK_EXERCISE_RECORDS: ExerciseRecord[] = [
  { id: 'e1', sportTypeId: 'running', date: new Date().toISOString(), duration: 30, distance: 5000, points: 15 },
  { id: 'e2', sportTypeId: 'fitness', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), duration: 60, points: 30 },
  { id: 'e3', sportTypeId: 'cycling', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), duration: 40, distance: 12000, points: 25 },
  { id: 'e4', sportTypeId: 'running', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), duration: 45, distance: 7000, points: 20 },
  { id: 'e5', sportTypeId: 'hiking', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), duration: 120, distance: 8000, points: 50 },
  { id: 'e6', sportTypeId: 'swimming', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), duration: 60, distance: 1500, points: 40 },
]
