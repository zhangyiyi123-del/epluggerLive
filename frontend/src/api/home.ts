/**
 * 首页聚合 API：GET /api/home
 */
import { apiRequest } from './client'

export interface ProgressSummary {
  doneCount: number
  targetCount: number
  currentDurationMinutes: number
  targetDurationMinutes: number
  completed: boolean
}

export interface UserStats {
  points: number
  checkInDays: number
  streak: number
  rank: number
  rankChange: number
}

export interface RecentCheckInItem {
  id: string
  type: 'exercise' | 'positive'
  title: string
  time: string
  points: string
  avatarColor: string
}

export interface HotPostItem {
  id: string
  avatar: string
  avatarColor: string
  name: string
  dept: string
  text: string
  likes: number
  comments: number
}

export interface HomeResponse {
  todayProgress: ProgressSummary
  weekProgress: ProgressSummary
  userStats: UserStats
  /** 本周运动打卡次数 */
  weekExerciseCount?: number
  /** 本周正向打卡次数 */
  weekPositiveCount?: number
  recentCheckIns: RecentCheckInItem[]
  hotPosts: HotPostItem[]
}

export async function getHome(): Promise<HomeResponse | null> {
  const res = await apiRequest<HomeResponse>('/api/home')
  if (!res.ok) return null
  return res.data
}
