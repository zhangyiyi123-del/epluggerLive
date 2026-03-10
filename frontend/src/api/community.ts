/**
 * 圈子 API：动态列表/详情/发布/编辑/删除/点赞/收藏，评论列表/发表/回复/点赞，话题列表。
 */
import { apiRequest } from './client'
import type { Post, Comment, Topic, User, Visibility, FeedFilter } from '../types/community'

export interface PagedResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ---------- 与后端 DTO 一致的请求/响应类型 ----------
export interface PostCreateRequest {
  contentText: string
  contentImages?: string[]
  visibilityType: string
  topicIds?: string[]
  mentionUserIds?: number[]
}

interface UserDto {
  id: string
  name: string
  avatar?: string
  department: string
  position?: string
}

interface TopicDto {
  id: string
  name: string
  postCount: number
}

interface PostDto {
  id: number
  author: UserDto
  contentText: string
  contentImages: string[] | null
  visibilityType: string
  topics: TopicDto[]
  mentionUserIds: number[] | null
  likesCount: number
  commentsCount: number
  liked: boolean
  collected: boolean
  canEdit: boolean
  canDelete: boolean
  createdAt: string
  updatedAt?: string
}

interface CommentDto {
  id: number
  postId: number
  author: UserDto
  content: string
  parentId: number | null
  replies: CommentDto[] | null
  likesCount: number
  liked: boolean
  createdAt: string
}

function mapUser(d: UserDto): User {
  return {
    id: String(d.id),
    name: d.name ?? '',
    avatar: d.avatar,
    department: d.department ?? '',
    position: d.position,
  }
}

function mapPost(d: PostDto): Post {
  return {
    id: String(d.id),
    author: mapUser(d.author),
    content: {
      text: d.contentText ?? '',
      images: d.contentImages ?? [],
      emotions: [],
    },
    visibility: { type: d.visibilityType as Visibility['type'] },
    topics: (d.topics ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      postCount: t.postCount ?? 0,
    })),
    mentions: [],
    likesCount: d.likesCount ?? 0,
    commentsCount: d.commentsCount ?? 0,
    isLiked: d.liked ?? false,
    isCollected: d.collected ?? false,
    isFeatured: false,
    isPinned: false,
    canEdit: d.canEdit ?? false,
    canDelete: d.canDelete ?? false,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

function mapComment(d: CommentDto): Comment {
  return {
    id: String(d.id),
    postId: String(d.postId),
    author: mapUser(d.author),
    content: d.content ?? '',
    emotions: [],
    mentions: [],
    parentId: d.parentId != null ? String(d.parentId) : undefined,
    replies: (d.replies ?? []).map(mapComment),
    likesCount: d.likesCount ?? 0,
    isLiked: d.liked ?? false,
    createdAt: d.createdAt,
  }
}

export async function getPosts(
  filter: FeedFilter,
  page = 0,
  size = 20
): Promise<PagedResult<Post>> {
  const res = await apiRequest<PagedResult<PostDto>>(
    `/api/posts?filter=${encodeURIComponent(filter)}&page=${page}&size=${size}`
  )
  if (!res.ok) throw new Error(res.error?.message ?? '加载动态失败')
  return {
    ...res.data,
    content: res.data.content.map(mapPost),
  }
}

export async function getPost(id: string): Promise<Post | null> {
  const res = await apiRequest<PostDto>(`/api/posts/${id}`)
  if (!res.ok) return null
  return mapPost(res.data)
}

export async function createPost(body: PostCreateRequest): Promise<Post> {
  const res = await apiRequest<PostDto>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(res.error?.message ?? '发布失败')
  return mapPost(res.data)
}

export async function updatePost(id: string, body: PostCreateRequest): Promise<Post | null> {
  const res = await apiRequest<PostDto>(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  return mapPost(res.data)
}

export async function deletePost(id: string): Promise<boolean> {
  const res = await apiRequest<unknown>(`/api/posts/${id}`, { method: 'DELETE' })
  return res.ok
}

export async function likePost(id: string): Promise<Post | null> {
  const res = await apiRequest<PostDto>(`/api/posts/${id}/like`, { method: 'POST' })
  if (!res.ok) return null
  return mapPost(res.data)
}

export async function favoritePost(id: string): Promise<Post | null> {
  const res = await apiRequest<PostDto>(`/api/posts/${id}/favorite`, { method: 'POST' })
  if (!res.ok) return null
  return mapPost(res.data)
}

export async function getMyPosts(page = 0, size = 50): Promise<PagedResult<Post>> {
  const res = await apiRequest<PagedResult<PostDto>>(
    `/api/posts/my?page=${page}&size=${size}`
  )
  if (!res.ok) throw new Error(res.error?.message ?? '加载我的动态失败')
  return {
    ...res.data,
    content: res.data.content.map(mapPost),
  }
}

export async function getTopics(): Promise<Topic[]> {
  const res = await apiRequest<TopicDto[]>('/api/posts/topics')
  if (!res.ok) return []
  return (res.data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    postCount: t.postCount ?? 0,
  }))
}

export async function getComments(
  postId: string,
  page = 0,
  size = 50
): Promise<PagedResult<Comment>> {
  const res = await apiRequest<PagedResult<CommentDto>>(
    `/api/posts/${postId}/comments?page=${page}&size=${size}`
  )
  if (!res.ok) throw new Error(res.error?.message ?? '加载评论失败')
  return {
    ...res.data,
    content: res.data.content.map(mapComment),
  }
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  const res = await apiRequest<CommentDto>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      content: content.trim(),
      parentId: parentId != null ? Number(parentId) : null,
    }),
  })
  if (!res.ok) throw new Error(res.error?.message ?? '发送失败')
  return mapComment(res.data)
}

export async function likeComment(postId: string, commentId: string): Promise<void> {
  await apiRequest<unknown>(`/api/posts/${postId}/comments/${commentId}/like`, {
    method: 'POST',
  })
}
