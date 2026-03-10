import { useState, MouseEvent } from 'react'
import { Heart, MessageCircle, Share2, Star, ChevronDown, ChevronUp, Edit2, Trash2, Play } from 'lucide-react'
import type { Post } from '../../types/community'

interface PostCardProps {
  post: Post
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  onShare: (postId: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
   // 进入帖子详情
  onOpenDetail?: (postId: string) => void
}

export default function PostCard({ post, onLike, onComment, onShare, onEdit, onDelete, onOpenDetail }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleLike = () => {
    // 仅触发数据层面的点赞，不额外添加样式或动画
    onLike(post.id)
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
    <div className={`post-card ${post.isFeatured ? 'featured' : ''}`}>
      {/* 精选标识 */}
      {post.isFeatured && (
        <div className="featured-badge">
          <Star size={12} />
          精选
        </div>
      )}

      {/* 头部 */}
      <div className="post-header" onClick={handleOpenDetail}>
        <div className="post-author">
          <div className="avatar">{post.author.avatar || post.author.name[0]}</div>
          <div className="post-author-info">
            <span className="author-name">{post.author.name}</span>
            <span className="author-dept">{post.author.department} · {formatTime(post.createdAt)}</span>
          </div>
        </div>
        
      </div>

      {/* 内容 */}
      <div className="post-content" onClick={handleOpenDetail}>
        {/* 文本 */}
        <p className={`post-text ${isExpanded ? 'expanded' : shouldTruncate ? 'clamped' : ''}`}>
          {post.content.text}
        </p>
        {shouldTruncate && (
          <button className="expand-btn" onClick={handleToggleExpand}>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? '收起' : '展开全部'}
          </button>
        )}

        {/* 图片 */}
        {post.content.images && post.content.images.length > 0 && (
          <div className={`post-images ${getImageGridClass(post.content.images.length)}`}>
            {post.content.images.slice(0, 9).map((img, i) => (
              <img key={i} src={img} alt="" />
            ))}
          </div>
        )}

        {/* 视频 */}
        {post.content.video && (
          <div className="post-video">
            <img src={post.content.video.cover} alt="" className="video-cover" />
            <div className="play-btn">
              <Play size={24} />
            </div>
            <span className="video-duration">{post.content.video.duration}s</span>
          </div>
        )}

        {/* 关联打卡 */}
        {post.relatedCheckIn && (
          <div className="related-checkin">
            <span className="checkin-icon">📋</span>
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

      {/* 底部操作 */}
      <div className="post-actions">
        <button 
          className="action-btn"
          style={{ 
            borderColor: post.isLiked ? '#EF4444' : undefined,
            backgroundColor: 'transparent'
          }}
          onClick={handleLike}
        >
          <Heart 
            size={18} 
            fill={post.isLiked ? '#EF4444' : 'none'} 
            color={post.isLiked ? '#EF4444' : undefined}
          />
          {post.likesCount > 0 ? post.likesCount : ''}
        </button>
        
        <button className="action-btn" onClick={() => onComment(post.id)}>
          <MessageCircle size={18} />
          {post.commentsCount > 0 ? post.commentsCount : ''}
        </button>
        
        <button className="action-btn" onClick={() => onShare(post.id)}>
          <Share2 size={18} />
        </button>

        {post.canDelete && (
          <button className="action-btn" onClick={() => onDelete?.(post.id)}>
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
