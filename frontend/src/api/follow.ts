import { apiRequest } from './client'
import type { FollowedUser } from '../types/community'

interface FollowedUserDto {
  id: string
  name: string
  avatar?: string
  department: string
}

function mapFollowedUser(d: FollowedUserDto): FollowedUser {
  return {
    id: d.id,
    name: d.name ?? '',
    avatar: d.avatar,
    department: d.department ?? '',
  }
}

/** 关注指定用户，返回被关注用户摘要。 */
export async function followUser(userId: string): Promise<FollowedUser> {
  const res = await apiRequest<FollowedUserDto>(`/api/follow/${userId}`, { method: 'POST' })
  if (!res.ok) throw new Error(res.error?.message ?? '关注失败')
  return mapFollowedUser(res.data)
}

/** 取消关注指定用户。 */
export async function unfollowUser(userId: string): Promise<void> {
  const res = await apiRequest<unknown>(`/api/follow/${userId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(res.error?.message ?? '取消关注失败')
}

/** 获取当前用户已关注的用户列表。 */
export async function getFollowingUsers(): Promise<FollowedUser[]> {
  const res = await apiRequest<FollowedUserDto[]>('/api/follow/following')
  if (!res.ok) return []
  return (res.data ?? []).map(mapFollowedUser)
}
