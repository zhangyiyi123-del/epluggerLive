import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  X,
  MoreHorizontal
} from 'lucide-react'
import type { Post, Comment } from '../types/community'
import { MOCK_CURRENT_USER } from '../types/community'
import {
  getPost,
  getComments,
  likePost,
  likeComment,
  createComment
} from '../api/community'
import ImageLightbox from '../components/community/ImageLightbox'

interface LocationState {
  post?: Post
}

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state || {}) as LocationState
  const postFromState = state.post

  const [post, setPost] = useState<Post | null>(postFromState ?? null)
  const [postLoadDone, setPostLoadDone] = useState(!!postFromState)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string } | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    if (!postId) return
    if (postFromState && postFromState.id === postId) {
      setPost(postFromState)
      setPostLoadDone(true)
    } else if (!post || post.id !== postId) {
      setPostLoadDone(false)
      getPost(postId)
        .then((p) => {
          setPost(p ?? null)
          setPostLoadDone(true)
        })
        .catch(() => {
          setPost(null)
          setPostLoadDone(true)
        })
    }
  }, [postId, postFromState])

  useEffect(() => {
    if (!postId) return
    getComments(postId, 0, 50)
      .then((res) => {
        setComments(res.content)
        setCommentsLoaded(true)
      })
      .catch(() => setCommentsLoaded(true))
  }, [postId])

  useEffect(() => {
    if (showCommentModal) {
      setTimeout(() => {
        const input = document.querySelector('.comment-modal-input') as HTMLInputElement
        input?.focus()
      }, 100)
    }
  }, [showCommentModal])

  if (!post && !postLoadDone) {
    return (
      <div className="page">
        <div className="detail-header">
          <button className="detail-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="detail-empty">
          <p>加载中...</p>
        </div>
      </div>
    )
  }
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

  const handlePostLike = async () => {
    if (!post) return
    setLikeAnimation('post-like')
    setTimeout(() => setLikeAnimation(null), 600)
    try {
      const updated = await likePost(post.id)
      if (updated) setPost(updated)
    } catch {
      // ignore
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!post) return
    setLikeAnimation('comment-' + commentId)
    setTimeout(() => setLikeAnimation(null), 600)
    try {
      await likeComment(post.id, commentId)
      const res = await getComments(post.id, 0, 50)
      setComments(res.content)
    } catch {
      // ignore
    }
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

  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !post) return
    setIsSubmitting(true)
    try {
      const newComment = await createComment(
        post.id,
        commentContent.trim(),
        replyingTo?.commentId
      )
      setComments((prev) => {
        if (replyingTo) {
          return prev.map((c) =>
            c.id === replyingTo.commentId
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          )
        }
        return [newComment, ...prev]
      })
      setPost((p) =>
        p ? { ...p, commentsCount: p.commentsCount + 1 } : null
      )
      setCommentContent('')
      handleCloseCommentModal()
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false)
    }
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

        {/* @提及 */}
        {post.mentions && post.mentions.length > 0 && (
          <p className="post-mentions">
            提到了{' '}
            {post.mentions.map((m) => (
              <span key={m.id} className="mention-tag">@{m.name}</span>
            ))}
          </p>
        )}

        {/* 话题标签 */}
        {post.topics.length > 0 && (
          <div className="detail-topics">
            {post.topics.map(topic => (
              <span key={topic.id} className="detail-topic">#{topic.name}</span>
            ))}
          </div>
        )}

        {/* 图片展示：最多显示 4 张，点击放大并可左右滑动查看全部 */}
        {post.content.images && post.content.images.length > 0 && (
          <>
            <div className={'detail-images detail-images-' + (post.content.images.length > 4 ? 4 : post.content.images.length)}>
              {post.content.images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className="detail-image-item detail-image-btn"
                  onClick={() => {
                    setLightboxIndex(i)
                    setLightboxOpen(true)
                  }}
                >
                  <img src={img} alt="" />
                  {i === 3 && post.content.images.length > 4 && (
                    <div className="detail-image-more">+{post.content.images.length - 4}</div>
                  )}
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
          <span>{post.likesCount} 赞</span>
          <span>{post.commentsCount} 评论</span>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="detail-comments-list-container">
        <div className="detail-comments-header">
          <span className="detail-comments-title">评论</span>
          <span className="detail-comments-count">{post.commentsCount}</span>
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

          {commentsLoaded && comments.length === 0 && (
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
          className={
            'detail-bottom-action ' +
            (post.isLiked ? 'active' : '') +
            ' ' +
            getLikeAnimationClass('post', 'like')
          }
          onClick={handlePostLike}
        >
          <Heart size={22} fill={post.isLiked ? '#EF4444' : 'none'} />
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
