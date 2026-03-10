import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileText } from 'lucide-react'
import type { Post } from '../types/community'
import PostCard from '../components/community/PostCard'
import { getMyPosts, likePost, deletePost } from '../api/community'

interface MyPostsPageProps {
  onBack?: () => void
}

export default function MyPostsPage({ onBack }: MyPostsPageProps) {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyPosts(0, 50)
      .then((res) => {
        setPosts(res.content)
        setError(null)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  const handleLike = async (postId: string) => {
    try {
      const updated = await likePost(postId)
      if (updated) setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
    } catch {
      // ignore
    }
  }

  const handleOpenDetail = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (post) {
      navigate('/community/' + postId, { state: { post, backTo: '/profile/posts' } })
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('确定删除这条动态吗？')) return
    try {
      const ok = await deletePost(postId)
      if (ok) setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch {
      // ignore
    }
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
        {loading ? (
          <div className="my-posts-empty">
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className="my-posts-empty">
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
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
