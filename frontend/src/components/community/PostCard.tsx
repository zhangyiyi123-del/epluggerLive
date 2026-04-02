import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Heart, MessageCircle, Star, ChevronDown, ChevronUp, Trash2, Play, ClipboardList } from 'lucide-react'
import type { Post } from '../../types/community'
import ImageLightbox from './ImageLightbox'
import Avatar from '../common/Avatar'

interface PostCardProps {
  post: Post
  currentUserId?: string
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  onFollow?: (authorId: string) => Promise<void>
  onUnfollow?: (authorId: string) => Promise<void>
  // 进入帖子详情
  onOpenDetail?: (postId: string) => void
}

export default function PostCard({ post, currentUserId, onLike, onComment, onEdit: _onEdit, onDelete, onFollow, onUnfollow, onOpenDetail }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [followAnimating, setFollowAnimating] = useState(false)

  const handleLike = () => {
    onLike(post.id)
  }

  // 本人动态不展示关注：后端对作者会返回 canEdit/canDelete；本地 id 与 author.id 需统一为字符串比较
  const viewerId =
    currentUserId != null && String(currentUserId).trim() !== '' ? String(currentUserId) : ''
  const authorId = String(post.author.id)
  const isOwnPost =
    post.canEdit === true ||
    post.canDelete === true ||
    (viewerId !== '' && viewerId === authorId)
  const showFollowBtn = !isOwnPost && (onFollow || onUnfollow)
  const showHeaderDelete = isOwnPost && post.canDelete && Boolean(onDelete)

  const handleFollowClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (followLoading) return
    setFollowLoading(true)
    try {
      if (post.isAuthorFollowed) {
        await onUnfollow?.(post.author.id)
      } else {
        await onFollow?.(post.author.id)
      }
      // 操作成功后触发动画
      setFollowAnimating(true)
    } finally {
      setFollowLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `今天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    if (days < 2) return `昨天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    if (days < 7) return `${days}天前`
    return `${date.getMonth() + 1}-${date.getDate()}`
  }

  // 估算是否需要“展开全部”按钮（文本较长）
  const shouldTruncate = post.content.text.length > 90

  const getImageGridClass = (count: number) => {
    if (count === 1) return 'grid-1'
    if (count === 2) return 'grid-2'
    if (count === 3) return 'grid-3'
    if (count === 4) return 'grid-4'
    return 'grid-many'
  }

  const handleToggleExpand = (e: MouseEvent<HTMLButtonElement>) => {
    // 阻止触发卡片点击（避免直接跳详情）
    e.stopPropagation()
    setIsExpanded(prev => !prev)
  }

  const handleOpenDetail = () => {
    onOpenDetail?.(post.id)
  }

  return (
    <div className={`post-card ${post.isFeatured ? 'featured' : ''} ${showHeaderDelete ? 'post-card--header-delete' : ''}`}>
      {/* 精选标识 */}
      {post.isFeatured && (
        <div className="featured-badge">
          <Star size={12} />
          精选
        </div>
      )}

      {/* 头部：头像、昵称、部门时间、关注按钮 */}
      <div className="post-header">
        <div className="post-author" onClick={handleOpenDetail} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenDetail() } }} aria-label="查看详情" style={{ flex: 1, cursor: 'pointer' }}>
          <Avatar className="avatar" name={post.author.name} avatar={post.author.avatar} />
          <div className="post-author-info">
            <span className="author-name">{post.author.name}</span>
            <span className="author-dept">{post.author.position || post.author.department} · {formatTime(post.createdAt)}</span>
          </div>
        </div>
        <div className="post-header-actions">
          {showHeaderDelete && (
            <button
              type="button"
              className="post-header-delete-btn"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(post.id)
              }}
              aria-label="删除动态"
            >
              <Trash2 size={18} aria-hidden />
            </button>
          )}
          {showFollowBtn && (
            <button
              type="button"
              className={[
                'follow-btn',
                post.isAuthorFollowed ? 'following' : '',
                followAnimating ? 'follow-btn--pop' : '',
              ].filter(Boolean).join(' ')}
              onClick={handleFollowClick}
              disabled={followLoading}
              aria-label={post.isAuthorFollowed ? '取消关注' : '关注'}
              onAnimationEnd={() => setFollowAnimating(false)}
            >
              <span className="follow-btn__icon" aria-hidden>
                {post.isAuthorFollowed ? '✓' : '+'}
              </span>
              {post.isAuthorFollowed ? '已关注' : '关注'}
            </button>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div className="post-content" onClick={handleOpenDetail}>
        {/* 文本 */}
        <p className={`post-text ${isExpanded ? 'expanded' : shouldTruncate ? 'clamped' : ''}`}>
          {post.content.text}
        </p>
        {post.mentions && post.mentions.length > 0 && (
          <p className="post-mentions">
            提到了{' '}
            {post.mentions.map((m) => (
              <span key={m.id} className="mention-tag">@{m.name}</span>
            ))}
          </p>
        )}
        {shouldTruncate && (
          <button type="button" className="expand-btn" onClick={handleToggleExpand}>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? '收起' : '展开全部'}
          </button>
        )}

        {/* 图片 - 点击放大 */}
        {post.content.images && post.content.images.length > 0 && (
          <>
            <div className={`post-images ${getImageGridClass(post.content.images.length)}`}>
              {post.content.images.slice(0, 9).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className="post-image-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(i)
                    setLightboxOpen(true)
                  }}
                >
                  <img src={img} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            {lightboxOpen && (
              <ImageLightbox
                images={post.content.images}
                initialIndex={lightboxIndex}
                onClose={() => setLightboxOpen(false)}
              />
            )}
          </>
        )}

        {/* 视频 */}
        {post.content.video && (
          <div className="post-video">
            <img src={post.content.video.cover} alt="" className="video-cover" loading="lazy" />
            <div className="play-btn">
              <Play size={24} />
            </div>
            <span className="video-duration">{post.content.video.duration}s</span>
          </div>
        )}

        {/* 关联打卡 */}
        {post.relatedCheckIn && (
          <div className="related-checkin">
            <span className="checkin-icon" aria-hidden><ClipboardList size={14} /></span>
            <span className="checkin-title">{post.relatedCheckIn.title}</span>
            <span className="checkin-summary">{post.relatedCheckIn.summary}</span>
          </div>
        )}

        {/* 话题标签 */}
        {post.topics.length > 0 && (
          <div className="post-topics">
            {post.topics.map(topic => (
              <span key={topic.id} className="post-topic">#{topic.name}</span>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作：点赞、评论均分居中（本人删除在头部右上角） */}
      <div className="post-actions">
        <div className="post-actions-primary">
          <button
            type="button"
            className={`action-btn ${post.isLiked ? 'is-liked' : ''}`}
            onClick={handleLike}
            aria-pressed={post.isLiked}
          >
            <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
            {post.likesCount > 0 ? post.likesCount : ''}
          </button>
          <button type="button" className="action-btn" onClick={() => onComment(post.id)}>
            <MessageCircle size={18} />
            {post.commentsCount > 0 ? post.commentsCount : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
