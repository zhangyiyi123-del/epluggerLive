import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileText } from 'lucide-react'
import { MOCK_POSTS, MOCK_CURRENT_USER } from '../types/community'
import type { Post } from '../types/community'
import PostCard from '../components/community/PostCard'

// onBack 仍保留，方便在路由外内嵌使用时传入
interface MyPostsPageProps {
  onBack?: () => void
}

export default function MyPostsPage({ onBack }: MyPostsPageProps) {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>(
    MOCK_POSTS.slice(0, 2).map(p => ({ ...p, author: MOCK_CURRENT_USER, canEdit: true, canDelete: true }))
  )

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
        : p
    ))
  }

  const handleOpenDetail = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      navigate('/community/' + postId, { state: { post, backTo: '/profile/posts' } })
    }
  }

  const handleDelete = (postId: string) => {
    if (!confirm('确定删除这条动态吗？')) return
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  return (
    <div className="page page-points-center">
      <div className="publish-header">
        <button type="button" className="publish-back-btn" onClick={handleBack}>
          <ChevronLeft size={22} />
        </button>
        <div className="publish-header-title">我的动态</div>
        <div style={{ width: 44 }} />
      </div>

      <div className="publish-content">
        {posts.length === 0 ? (
          <div className="my-posts-empty">
            <FileText size={48} className="my-posts-empty-icon" />
            <p>还没有发布过动态</p>
            <span>去圈子发布你的第一条动态吧～</span>
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleOpenDetail}
                onShare={() => {}}
                onDelete={handleDelete}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
