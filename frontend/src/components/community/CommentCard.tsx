import type { Comment } from '../../types/community'
import { MessageCircle, Heart, MoreHorizontal, Reply } from 'lucide-react'

interface CommentCardProps {
  comment: Comment
  onLike?: (commentId: string) => void
  onReply?: (commentId: string) => void
  onReport?: (commentId: string) => void
}

export default function CommentCard({ comment, onLike, onReply, onReport }: CommentCardProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
  }

  // 从 author 中获取可能的部门信息
  const getAuthorDept = () => {
    const author = comment.author as any
    return author.department || ''
  }

  return (
    <div className="comment-card">
      {/* 评论头部 */}
      <div className="comment-header">
        <div className="comment-author">
          <div className="avatar-sm">
            {comment.author.avatar || comment.author.name[0]}
          </div>
          <div className="comment-author-info">
            <span className="comment-author-name">{comment.author.name}</span>
            {getAuthorDept() && (
              <span className="comment-author-dept">{getAuthorDept()}</span>
            )}
          </div>
        </div>
        <button className="comment-more" onClick={() => onReport?.(comment.id)}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* 评论内容 */}
      <div className="comment-content">
        {comment.parentId && (
          <div className="comment-reply-to">
            回复 <span className="reply-target">@某用户</span>
          </div>
        )}
        <p>{comment.content}</p>
      </div>

      {/* 评论底部 */}
      <div className="comment-footer">
        <span className="comment-time">{formatTime(comment.createdAt)}</span>
        <div className="comment-actions">
          <button 
            className={`comment-action ${comment.isLiked ? 'liked' : ''}`}
            onClick={() => onLike?.(comment.id)}
          >
            <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'none'} />
            <span>{comment.likesCount || 0}</span>
          </button>
          <button 
            className="comment-action"
            onClick={() => onReply?.(comment.id)}
          >
            <Reply size={14} />
            <span>回复</span>
          </button>
          {comment.replies && comment.replies.length > 0 && (
            <button className="comment-action">
              <MessageCircle size={14} />
              <span>查看{comment.replies.length}条回复</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
