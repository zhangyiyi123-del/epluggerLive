import { getStoredToken, setStoredToken, apiRequest } from './client'
import type { User } from '../types/community'

export interface LoginResponse {
  token: string
  user: User
}

/**
 * 密码登录。仅支持密码登录，短信登录暂未开放。
 */
export async function login(phone: string, password: string): Promise<LoginResponse> {
  const result = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
    token: null,
  })
  if (!result.ok) {
    throw new Error(result.error.message || '登录失败')
  }
  return result.data
}

/**
 * 获取当前用户信息（需已登录，请求头会带本地 token）。
 */
export async function me(): Promise<User | null> {
  const result = await apiRequest<User>('/api/auth/me')
  if (!result.ok) {
    return null
  }
  return result.data
}

/**
 * 刷新 Token，返回新 token 与用户信息。
 */
export async function refresh(): Promise<LoginResponse | null> {
  const result = await apiRequest<LoginResponse>('/api/auth/refresh', {
    method: 'POST',
    token: getStoredToken(),
  })
  if (!result.ok) {
    return null
  }
  return result.data
}

const CURRENT_USER_STORAGE_KEY = 'currentUser'

/**
 * 保存登录态到本地并返回用户信息。
 */
export function saveLogin(res: LoginResponse): User {
  setStoredToken(res.token)
  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(res.user))
  } catch {
    /* ignore quota / private mode */
  }
  return res.user
}

/**
 * 退出登录：清除本地 token 与缓存的当前用户（供圈子等页读取 id）。
 */
export function logout(): void {
  setStoredToken(null)
  try {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * 是否已登录（本地是否有 token）。不校验服务端是否有效。
 */
export function isLoggedIn(): boolean {
  return !!getStoredToken()
}

/** 个人中心资料与统计（连续打卡、累计积分、勋章数） */
export interface UserProfile {
  id: string
  name: string
  avatar?: string
  department: string
  position?: string
  consecutiveCheckInDays: number
  totalEarnedPoints: number
  medalCount: number
}

/**
 * 获取当前用户个人中心资料与统计（用于个人中心页）。
 */
export async function getProfile(): Promise<UserProfile | null> {
  const result = await apiRequest<UserProfile>('/api/users/me')
  if (!result.ok) return null
  return result.data
}

/** 同事项：用于 @ 提及、参与同事选择 */
export interface ColleagueItem {
  id: string
  name: string
  department?: string
  avatar?: string
  position?: string
}

/**
 * 获取同事列表（排除当前用户），用于发布动态 @、正向打卡参与同事选择。
 */
export async function getColleagues(): Promise<ColleagueItem[]> {
  const result = await apiRequest<ColleagueItem[]>('/api/users/colleagues')
  if (!result.ok) return []
  return result.data ?? []
}
