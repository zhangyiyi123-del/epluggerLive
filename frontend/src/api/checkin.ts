/**
 * 运动打卡 API：运动类型、上传佐证、提交打卡、记录列表、当日/本周进度。
 */
import { getApiBaseUrl, apiRequest } from './client'
import type { SportType } from '../types/checkIn'

export interface ExerciseRecordItem {
  id: number
  sportTypeId: string
  sportTypeName: string
  sportTypeIcon: string
  duration: number
  durationUnit: string
  distance?: number
  distanceUnit?: string
  intensity: string
  points: number
  checkedInAt: string
  attachments?: { id: number; url: string; type: string; uploadedAt: string }[]
}

export interface ExerciseCheckInResponse {
  id: number
  sportTypeId: string
  sportTypeName: string
  sportTypeIcon: string
  duration: number
  durationUnit: string
  distance?: number
  distanceUnit?: string
  intensity: string
  points: number
  status: string
  checkedInAt: string
  attachments?: { id: number; url: string; type: string; uploadedAt: string }[]
}

export interface CycleProgressDto {
  cycleType: string
  startDate: string
  endDate: string
  currentDurationMinutes: number
  currentDistanceKm: number
  targetDurationMinutes: number
  targetDistanceKm?: number
  completed: boolean
  daysRemaining: number
}

export interface ExerciseCheckInRequest {
  sportTypeId: string
  duration: number
  durationUnit: 'minute' | 'hour'
  distance?: number
  distanceUnit?: 'km' | 'm'
  intensity: 'low' | 'medium' | 'high'
  attachmentUrls?: string[]
}

export interface PagedResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export async function getSportTypes(): Promise<SportType[]> {
  const res = await apiRequest<SportType[]>('/api/checkin/exercise/sport-types')
  if (!res.ok) return []
  const list = res.data as unknown as { id: string; name: string; icon: string; sortOrder: number; enabled: boolean }[]
  return list.map((x) => ({
    id: x.id,
    name: x.name,
    icon: x.icon,
    sortOrder: x.sortOrder,
    isEnabled: x.enabled,
    isBuiltIn: true,
  }))
}

export async function uploadAttachments(files: File[]): Promise<string[]> {
  if (files.length === 0) return []
  if (files.length > 3) throw new Error('最多上传 3 张图片')
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/checkin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('ep_token') || ''}` },
    body: form,
  })
  const text = await res.text()
  let body: { urls?: string[]; error?: string } = {}
  if (text) {
    try {
      body = JSON.parse(text) as { urls?: string[]; error?: string }
    } catch {
      throw new Error('上传失败')
    }
  }
  if (!res.ok || body.error) throw new Error(body.error || '上传失败')
  return body.urls || []
}

export async function submitExerciseCheckIn(body: ExerciseCheckInRequest): Promise<ExerciseCheckInResponse> {
  const res = await apiRequest<ExerciseCheckInResponse>('/api/checkin/exercise', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(res.error?.message || '提交失败')
  return res.data
}

export async function getExerciseRecords(page = 0, size = 50): Promise<PagedResult<ExerciseRecordItem>> {
  const res = await apiRequest<PagedResult<ExerciseRecordItem>>(
    `/api/checkin/exercise/records?page=${page}&size=${size}`
  )
  if (!res.ok) return { content: [], totalElements: 0, totalPages: 0, number: 0, size }
  return res.data
}

export async function getTodayProgress(): Promise<CycleProgressDto | null> {
  const res = await apiRequest<CycleProgressDto>('/api/checkin/exercise/progress/today')
  if (!res.ok) return null
  return res.data
}

export async function getWeekProgress(): Promise<CycleProgressDto | null> {
  const res = await apiRequest<CycleProgressDto>('/api/checkin/exercise/progress/week')
  if (!res.ok) return null
  return res.data
}

// ---------- 正向行为打卡 API ----------
export interface PositiveCategoryDto {
  id: string
  name: string
  icon: string
  description?: string
  enabled: boolean
  sortOrder: number
  evidenceRequirement: 'required' | 'optional' | 'exempt'
}

export interface PositiveCheckInRequest {
  categoryId: string
  title?: string
  tagIds?: string[]
  description: string
  relatedColleagueIds?: number[]
  evidenceUrls?: string[]
}

export interface PositiveEvidenceDto {
  id: number
  url: string
  type: string
  name?: string
  uploadedAt: string
}

export interface PositiveCheckInResponse {
  id: number
  categoryId: string
  categoryName: string
  categoryIcon: string
  title?: string
  description: string
  tagIds: string[]
  relatedColleagueIds: number[]
  points: number
  status: string
  createdAt: string
  evidences: PositiveEvidenceDto[]
}

export interface PositiveRecordItem {
  id: number
  categoryId: string
  categoryName: string
  categoryIcon: string
  title?: string
  description: string
  tagIds: string[]
  points: number
  status: string
  createdAt: string
  evidences: PositiveEvidenceDto[]
}

export interface PointsPreviewDto {
  basePoints: number
  qualityBonus: number
  evidenceBonus: number
  colleagueBonus: number
  totalPoints: number
}

export async function getPositiveCategories(): Promise<PositiveCategoryDto[]> {
  const res = await apiRequest<PositiveCategoryDto[]>('/api/checkin/positive/categories')
  if (!res.ok) return []
  return res.data
}

/** 上传正向佐证（每批最多 3 张，可多批共最多 9 张） */
export async function uploadPositiveEvidences(files: File[]): Promise<string[]> {
  if (files.length === 0) return []
  if (files.length > 9) throw new Error('最多上传 9 张图片')
  const urls: string[] = []
  for (let i = 0; i < files.length; i += 3) {
    const chunk = files.slice(i, i + 3)
    const chunkUrls = await uploadAttachments(chunk)
    urls.push(...chunkUrls)
  }
  return urls
}

export async function submitPositiveCheckIn(body: PositiveCheckInRequest): Promise<PositiveCheckInResponse> {
  const res = await apiRequest<PositiveCheckInResponse>('/api/checkin/positive', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(res.error?.message || '提交失败')
  return res.data
}

export async function getPositiveRecords(page = 0, size = 50): Promise<PagedResult<PositiveRecordItem>> {
  const res = await apiRequest<PagedResult<PositiveRecordItem>>(
    `/api/checkin/positive/records?page=${page}&size=${size}`
  )
  if (!res.ok) throw new Error(res.error?.message || '加载记录失败')
  return res.data
}

export async function getPointsPreview(
  descriptionLength: number,
  evidenceCount: number,
  colleagueCount: number
): Promise<PointsPreviewDto | null> {
  const res = await apiRequest<PointsPreviewDto>(
    `/api/checkin/positive/points-preview?descriptionLength=${descriptionLength}&evidenceCount=${evidenceCount}&colleagueCount=${colleagueCount}`
  )
  if (!res.ok) return null
  return res.data
}
