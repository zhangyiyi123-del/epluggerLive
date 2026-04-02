/**
 * 积分体系 API：我的积分、流水、勋章、排行榜、商城、消息通知。
 */
import { apiRequest } from './client'
import type {
  UserPoints,
  PointsRecord,
  Medal,
  Product,
  Order,
  PointsChangeType,
  ProductType,
  ProductStatus,
  OrderStatus
} from '../types/points'

export interface PagedResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface LeaderboardEntry {
  userId: string
  name: string
  avatar?: string
  initial: string
  value: number
  change?: number
}

export interface NotificationItem {
  id: number
  type: string
  relatedPostId: number | null
  relatedCommentId: number | null
  relatedUserId: number | null
  relatedRecordId: number | null
  contentSummary: string | null
  read: boolean
  createdAt: string
}

function mapMedal(d: {
  type: string
  name?: string
  description?: string
  icon?: string
  condition?: string
  requiredCount?: number
  pointsReward?: number
  obtainedAt?: string | null
  progress?: number | null
}): Medal {
  return {
    type: d.type as Medal['type'],
    name: d.name ?? '',
    description: d.description ?? '',
    icon: d.icon ?? '🏅',
    condition: d.condition ?? '',
    requiredCount: d.requiredCount ?? 0,
    pointsReward: d.pointsReward ?? 0,
    obtainedAt: d.obtainedAt ?? undefined,
    progress: d.progress ?? undefined
  }
}

function mapProduct(d: {
  id: string
  name: string
  description?: string | null
  type: string
  points: number
  stock: number
  warningStock: number
  image?: string | null
  status: string
  minLevel: number
}): Product {
  return {
    id: d.id,
    name: d.name,
    description: d.description ?? '',
    type: d.type as ProductType,
    points: d.points,
    stock: d.stock,
    warningStock: d.warningStock,
    image: d.image ?? '',
    status: d.status as ProductStatus,
    minLevel: d.minLevel
  }
}

/** 当日已获得积分：后端汇总 points_record 当日所有 amount>0（发帖奖励、打卡等均计入，扣分为负不计）；timeZone 与本地「今天」对齐。 */
export async function getTodayEarnedPoints(): Promise<number | null> {
  const tz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined
  const q = tz ? `?timeZone=${encodeURIComponent(tz)}` : ''
  const res = await apiRequest<{ points: number }>(`/api/points/today-earned${q}`)
  if (!res.ok) return null
  const n = res.data?.points
  return typeof n === 'number' ? n : 0
}

export async function getPointsMe(): Promise<UserPoints | null> {
  const res = await apiRequest<{
    userId: string
    availablePoints: number
    totalEarnedPoints: number
    totalUsedPoints: number
    expiringPoints: number
    expiringDate?: string | null
    level: number
    currentLevelPoints: number
    nextLevelPoints: number
    medals: Array<{ type: string; name?: string; description?: string; icon?: string; condition?: string; requiredCount?: number; pointsReward?: number; obtainedAt?: string | null; progress?: number | null }>
  }>('/api/points/me')
  if (!res.ok) return null
  const d = res.data
  return {
    userId: d.userId,
    availablePoints: d.availablePoints,
    totalEarnedPoints: d.totalEarnedPoints,
    totalUsedPoints: d.totalUsedPoints,
    expiringPoints: d.expiringPoints ?? 0,
    expiringDate: d.expiringDate ?? undefined,
    level: d.level,
    currentLevelPoints: d.currentLevelPoints,
    nextLevelPoints: d.nextLevelPoints,
    medals: (d.medals ?? []).map(mapMedal)
  }
}

export async function getPointsRecords(page = 0, size = 20): Promise<PagedResult<PointsRecord>> {
  const res = await apiRequest<PagedResult<{
    id: number
    type: string
    amount: number
    balance: number
    description?: string | null
    sourceId?: string | null
    createdAt: string
    expiresAt?: string | null
  }>>(`/api/points/records?page=${page}&size=${size}`)
  if (!res.ok) return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 }
  const data = res.data
  return {
    ...data,
    content: data.content.map((r) => ({
      id: String(r.id),
      type: r.type as PointsChangeType,
      amount: r.amount,
      balance: r.balance,
      description: r.description ?? '',
      sourceId: r.sourceId ?? undefined,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt ?? undefined
    }))
  }
}

export async function getMedals(): Promise<Medal[]> {
  const res = await apiRequest<Array<{ type: string; name?: string; description?: string; icon?: string; condition?: string; requiredCount?: number; pointsReward?: number; obtainedAt?: string | null; progress?: number | null }>>('/api/points/medals')
  if (!res.ok) return []
  return (res.data ?? []).map(mapMedal)
}

export async function getLeaderboard(type: 'points' | 'exercise' | 'positive', timeRange: string): Promise<LeaderboardEntry[]> {
  const res = await apiRequest<LeaderboardEntry[]>(`/api/leaderboard?type=${type}&timeRange=${timeRange}`)
  if (!res.ok) return []
  return res.data ?? []
}

export async function getProducts(): Promise<Product[]> {
  const res = await apiRequest<Array<{ id: string; name: string; description?: string | null; type: string; points: number; stock: number; warningStock: number; image?: string | null; status: string; minLevel: number }>>('/api/mall/products')
  if (!res.ok) return []
  return (res.data ?? []).map(mapProduct)
}

export async function getMyOrders(page = 0, size = 50): Promise<PagedResult<Order>> {
  const res = await apiRequest<PagedResult<{
    id: number
    orderNo: string
    product: { id: string; name: string; description?: string | null; type: string; points: number; stock: number; warningStock: number; image?: string | null; status: string; minLevel: number }
    pointsSpent: number
    status: string
    redeemedAt: string
    deliveredAt?: string | null
    completedAt?: string | null
    userName: string
    userId: string
    pickupCode?: string | null
  }>>(`/api/mall/orders?page=${page}&size=${size}`)
  if (!res.ok) return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 }
  const data = res.data
  return {
    ...data,
    content: data.content.map((o) => ({
      id: String(o.id),
      orderNo: o.orderNo,
      product: mapProduct(o.product),
      pointsSpent: o.pointsSpent,
      status: o.status as OrderStatus,
      redeemedAt: o.redeemedAt,
      deliveredAt: o.deliveredAt ?? undefined,
      completedAt: o.completedAt ?? undefined,
      userName: o.userName,
      userId: o.userId,
      pickupCode: o.pickupCode ?? undefined
    }))
  }
}

export async function placeOrder(productId: string): Promise<Order | null> {
  const res = await apiRequest<{
    id: number
    orderNo: string
    product: { id: string; name: string; description?: string | null; type: string; points: number; stock: number; warningStock: number; image?: string | null; status: string; minLevel: number }
    pointsSpent: number
    status: string
    redeemedAt: string
    deliveredAt?: string | null
    completedAt?: string | null
    userName: string
    userId: string
    pickupCode?: string | null
  }>(`/api/mall/orders?productId=${encodeURIComponent(productId)}`, { method: 'POST' })
  if (!res.ok) return null
  const o = res.data
  return {
    id: String(o.id),
    orderNo: o.orderNo,
    product: mapProduct(o.product),
    pointsSpent: o.pointsSpent,
    status: o.status as OrderStatus,
    redeemedAt: o.redeemedAt,
    deliveredAt: o.deliveredAt ?? undefined,
    completedAt: o.completedAt ?? undefined,
    userName: o.userName,
    userId: o.userId,
    pickupCode: o.pickupCode ?? undefined
  }
}

export async function getNotifications(page = 0, size = 50): Promise<PagedResult<NotificationItem>> {
  const res = await apiRequest<PagedResult<NotificationItem>>(`/api/notifications?page=${page}&size=${size}`)
  if (!res.ok) return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 }
  return res.data
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiRequest<number>('/api/notifications/unread-count')
  if (!res.ok) return 0
  return typeof res.data === 'number' ? res.data : 0
}

export async function markNotificationRead(id: number): Promise<boolean> {
  const res = await apiRequest<unknown>(`/api/notifications/${id}/read`, { method: 'PATCH' })
  return res.ok
}
