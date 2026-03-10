import { useState } from 'react'
import type { Comment } from '../../types/community'
import CommentCard from './CommentCard'
import { Send, X } from 'lucide-react'

interface CommentListProps {
  comments: Comment[]
  postId: string
  onAddComment?: (postId: string, content: string, parentId?: string) => void
  onLikeComment?: (commentId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

export default function CommentList({
  comments,
  postId,
  onAddComment,
  onLikeComment,
  onLoadMore,
  hasMore = false,
  isLoading = false
}: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !onAddComment) return
    
    onAddComment(postId, replyContent, replyingTo || undefined)
    setReplyContent('')
    setReplyingTo(null)
  }

  const handleCancelReply = () => {
    setReplyContent('')
    setReplyingTo(null)
  }

  return (
    <div className="comment-list">
      {/* 评论输入框 */}
      <div className="comment-input-section">
        <input
          type="text"
          className="comment-input"
          placeholder="写评论..."
          value={replyingTo === '' ? replyContent : ''}
          onChange={(e) => {
            setReplyingTo('')
            setReplyContent(e.target.value)
          }}
          onFocus={() => setReplyingTo('')}
        />
        <button 
          className="comment-submit-btn"
          onClick={handleSubmitReply}
          disabled={!replyContent.trim()}
        >
          <Send size={16} />
        </button>
      </div>

      {/* 评论列表 */}
      <div className="comments-container">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <CommentCard
              comment={comment}
              onLike={onLikeComment}
              onReply={(commentId) => setReplyingTo(commentId)}
            />
            
            {/* 回复输入框 */}
            {replyingTo === comment.id && (
              <div className="reply-input-wrapper">
                <div className="reply-input-container">
                  <input
                    type="text"
                    className="reply-input"
                    placeholder={`回复 @${comment.author.name}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  />
                  <div className="reply-input-actions">
                    <button className="btn btn-sm btn-secondary" onClick={handleCancelReply}>
                      <X size={14} />
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={handleSubmitReply}
                      disabled={!replyContent.trim()}
                    >
                      发送
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 子评论 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="comment-replies">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="reply-item">
                    <CommentCard
                      comment={reply}
                      onLike={onLikeComment}
                      onReply={(commentId) => setReplyingTo(commentId)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="load-more-section">
          <button 
            className="load-more-btn"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : '查看更多评论'}
          </button>
        </div>
      )}

      {comments.length === 0 && (
        <div className="empty-comments">
          <p>暂无评论，快来抢沙发吧~</p>
        </div>
      )}
    </div>
  )
}
