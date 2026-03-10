import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, Heart, MessageCircle, Send, X, MoreHorizontal
} from 'lucide-react'
import type { Post, Comment } from '../types/community'
import { MOCK_POSTS, MOCK_CURRENT_USER } from '../types/community'

interface LocationState {
  post?: Post
}

// 模拟评论数据
const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    author: { id: 'u2', name: '李华', avatar: '李', department: '产品部' },
    content: '太棒了！坚持就是胜利💪',
    emotions: [],
    mentions: [],
    likesCount: 5,
    isLiked: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: 'c1-r1',
        postId: 'p1',
        author: { id: 'u1', name: '张明', avatar: '张', department: '技术部' },
        content: '谢谢鼓励！一起加油',
        emotions: [],
        mentions: [],
        parentId: 'c1',
        likesCount: 2,
        isLiked: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'c2',
    postId: 'p1',
    author: { id: 'u3', name: '王芳', avatar: '王', department: '设计部' },
    content: '晨跑真的让人精神百倍，我也想开始运动了🏃‍♀️',
    emotions: [],
    mentions: [],
    likesCount: 3,
    isLiked: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
]

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = (location.state || {}) as LocationState
  const postFromState = state.post
  
  const post = postFromState || MOCK_POSTS.find(p => p.id === postId)
  
  const [isLiked, setIsLiked] = useState(post?.isLiked || false)
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0)
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 统一评论弹窗状态
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string } | null>(null)
  const [commentContent, setCommentContent] = useState('')
  
  // 点赞动画状态
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null)

  // 弹窗打开时聚焦输入框
  useEffect(() => {
    if (showCommentModal) {
      setTimeout(() => {
        const input = document.querySelector('.comment-modal-input') as HTMLInputElement
        input?.focus()
      }, 100)
    }
  }, [showCommentModal])

  if (!post) {
    return (
      <div className="page">
        <div className="detail-header">
          <button className="detail-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="detail-empty">
          <p>帖子不存在或已被删除</p>
        </div>
      </div>
    )
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return minutes + '分钟前'
    if (hours < 24) return hours + '小时前'
    if (days < 7) return days + '天前'
    return (date.getMonth() + 1) + '-' + date.getDate()
  }

  // 帖子点赞
  const handlePostLike = () => {
    setLikeAnimation('post-like')
    setTimeout(() => setLikeAnimation(null), 600)
    
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  // 评论点赞
  const handleCommentLike = (commentId: string) => {
    setLikeAnimation('comment-' + commentId)
    setTimeout(() => setLikeAnimation(null), 600)
    
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1
        }
      }
      return comment
    }))
  }

  // 打开评论弹窗 - 用于新评论和回复
  const handleOpenCommentModal = (commentId?: string, authorName?: string) => {
    if (commentId && authorName) {
      setReplyingTo({ commentId, authorName })
    } else {
      setReplyingTo(null)
    }
    setCommentContent('')
    setShowCommentModal(true)
  }

  // 关闭评论弹窗
  const handleCloseCommentModal = () => {
    setShowCommentModal(false)
    setReplyingTo(null)
    setCommentContent('')
  }

  // 提交评论/回复
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (replyingTo) {
      // 回复评论
      const newReply: Comment = {
        id: 'r' + Date.now(),
        postId: post.id,
        author: MOCK_CURRENT_USER,
        content: commentContent,
        emotions: [],
        mentions: [],
        parentId: replyingTo.commentId,
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString()
      }
      
      setComments(comments.map(comment => {
        if (comment.id === replyingTo.commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          }
        }
        return comment
      }))
    } else {
      // 新评论
      const newComment: Comment = {
        id: 'c' + Date.now(),
        postId: post.id,
        author: MOCK_CURRENT_USER,
        content: commentContent,
        emotions: [],
        mentions: [],
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString()
      }
      setComments([newComment, ...comments])
    }
    
    setCommentContent('')
    setIsSubmitting(false)
    handleCloseCommentModal()
  }

  // 获取点赞动画类名
  const getLikeAnimationClass = (type: string, id: string) => {
    return likeAnimation === type + '-' + id ? 'like-animation' : ''
  }

  return (
    <div className="detail-page">
      {/* 顶部导航栏 */}
      <div className="detail-header">
        <button className="detail-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <div className="detail-header-title">详情</div>
        <button className="detail-more-btn">
          <MoreHorizontal size={22} />
        </button>
      </div>

      {/* 帖子内容 */}
      <div className="detail-content">
        {/* 作者信息 */}
        <div className="detail-author">
          <div className="detail-avatar">
            {post.author.avatar || post.author.name[0]}
          </div>
          <div className="detail-author-info">
            <div className="detail-author-name-row">
              <span className="detail-author-name">{post.author.name}</span>
              {post.isFeatured && (
                <span className="detail-featured-badge-inline">
                  <span>⭐</span> 精选
                </span>
              )}
            </div>
            <div className="detail-author-meta">
              {post.author.department} · {formatTime(post.createdAt)}
            </div>
          </div>
        </div>

        {/* 帖子正文 */}
        <div className="detail-text">
          {post.content.text}
        </div>

        {/* 话题标签 */}
        {post.topics.length > 0 && (
          <div className="detail-topics">
            {post.topics.map(topic => (
              <span key={topic.id} className="detail-topic">#{topic.name}</span>
            ))}
          </div>
        )}

        {/* 图片展示 */}
        {post.content.images && post.content.images.length > 0 && (
          <div className={'detail-images detail-images-' + (post.content.images.length > 4 ? 4 : post.content.images.length)}>
            {post.content.images.slice(0, 4).map((img, i) => (
              <div key={i} className="detail-image-item">
                <img src={img} alt="" />
                {i === 3 && post.content.images.length > 4 && (
                  <div className="detail-image-more">+{post.content.images.length - 4}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 关联打卡 */}
        {post.relatedCheckIn && (
          <div className="detail-related-checkin">
            <div className="detail-related-icon">📋</div>
            <div className="detail-related-info">
              <div className="detail-related-title">{post.relatedCheckIn.title}</div>
              <div className="detail-related-summary">{post.relatedCheckIn.summary}</div>
            </div>
          </div>
        )}

        {/* 统计数据 */}
        <div className="detail-stats">
          <span>{likesCount} 赞</span>
          <span>{comments.length} 评论</span>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="detail-comments-list-container">
        <div className="detail-comments-header">
          <span className="detail-comments-title">评论</span>
          <span className="detail-comments-count">{comments.length}</span>
        </div>

        <div className="detail-comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="detail-comment-item">
              <div className="detail-comment-avatar">
                {comment.author.avatar || comment.author.name[0]}
              </div>
              <div className="detail-comment-body">
                <div className="detail-comment-header">
                  <span className="detail-comment-author">{comment.author.name}</span>
                  <span className="detail-comment-dept">{comment.author.department}</span>
                </div>
                <div className="detail-comment-content">{comment.content}</div>
                <div className="detail-comment-footer">
                  <span className="detail-comment-time">{formatTime(comment.createdAt)}</span>
                  <div className="detail-comment-actions">
                    <button 
                      className={'detail-comment-action ' + (comment.isLiked ? 'liked' : '') + ' ' + getLikeAnimationClass('comment', comment.id)}
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      <Heart size={14} fill={comment.isLiked ? '#EF4444' : 'none'} />
                      <span>{comment.likesCount > 0 ? comment.likesCount : ''}</span>
                    </button>
                    <button 
                      className="detail-comment-action"
                      onClick={() => handleOpenCommentModal(comment.id, comment.author.name)}
                    >
                      <MessageCircle size={14} />
                      <span>回复</span>
                    </button>
                  </div>
                </div>
                
                {/* 子评论 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="detail-comment-replies">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="detail-reply-item">
                        <span className="detail-reply-author">{reply.author.name}: </span>
                        <span className="detail-reply-content">{reply.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="detail-no-comments">
              <MessageCircle size={32} />
              <p>暂无评论，快来抢沙发吧~</p>
            </div>
          )}
        </div>
      </div>

      {/* 底部悬浮操作栏 - 只保留点赞，评论点击打开弹窗 */}
      <div className="detail-bottom-bar">
        <div className="detail-bottom-avatar">
          {MOCK_CURRENT_USER.avatar || MOCK_CURRENT_USER.name[0]}
        </div>
        <button 
          className="detail-bottom-comment-btn"
          onClick={() => handleOpenCommentModal()}
        >
          <MessageCircle size={18} />
          <span>写评论...</span>
        </button>
        <button 
          className={'detail-bottom-action ' + (isLiked ? 'active' : '') + ' ' + getLikeAnimationClass('post', '')}
          onClick={handlePostLike}
        >
          <Heart size={22} fill={isLiked ? '#EF4444' : 'none'} />
        </button>
      </div>

      {/* 统一评论弹窗 - 底部弹出层 */}
      {showCommentModal && (
        <div className="comment-modal-overlay" onClick={handleCloseCommentModal}>
          <div className="comment-modal" onClick={e => e.stopPropagation()}>
            <div className="comment-modal-header">
              <span className="comment-modal-title">
                {replyingTo ? '回复 @' + replyingTo.authorName : '发表评论'}
              </span>
              <button className="comment-modal-close" onClick={handleCloseCommentModal}>
                <X size={20} />
              </button>
            </div>
            <div className="comment-modal-content">
              <input
                type="text"
                className="comment-modal-input"
                placeholder={replyingTo ? "写下你的回复..." : "写下你的评论..."}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <button 
                className="comment-modal-send"
                onClick={handleSubmitComment}
                disabled={!commentContent.trim() || isSubmitting}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
