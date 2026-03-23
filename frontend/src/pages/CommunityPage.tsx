import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Users, Clock, Grid3X3, Search, X, Trash2, Plus } from 'lucide-react'
import type { Post, FeedFilter, FollowedUser } from '../types/community'
import { FEED_FILTERS } from '../types/community'
import PostCard from '../components/community/PostCard'
import FollowingUserRow from '../components/community/FollowingUserRow'
import { getPosts, likePost, deletePost } from '../api/community'
import { followUser, unfollowUser, getFollowingUsers } from '../api/follow'
import { getUnreadCount } from '../api/points'

export default function CommunityPage() {
  const navigate = useNavigate()
  const initialFilterIndex = FEED_FILTERS.findIndex(f => f.value === 'latest')
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('latest')
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  
  // 搜索：输入框内容与提交给后端的 keyword（Enter/失焦时提交）
  const [searchQuery, setSearchQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [currentFilterIndex, setCurrentFilterIndex] = useState(
    initialFilterIndex === -1 ? 0 : initialFilterIndex
  )
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  
  const [unreadCount, setUnreadCount] = useState(0)

  // 已关注用户列表
  const [followingUsers, setFollowingUsers] = useState<FollowedUser[]>([])
  const [followingUserIds, setFollowingUserIds] = useState<Set<string>>(new Set())
  const [followingLoading, setFollowingLoading] = useState(false)
  const [followingError, setFollowingError] = useState(false)
  const followingLoadedRef = useRef(false)

  // 当前用户 ID（从 localStorage 读取）
  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem('currentUser') || localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        return String(parsed.id ?? parsed.userId ?? '')
      }
    } catch {}
    return ''
  })()

  useEffect(() => {
    getUnreadCount().then(setUnreadCount)
    const timer = setInterval(() => getUnreadCount().then(setUnreadCount), 30000)
    return () => clearInterval(timer)
  }, [])

  // 删除确认弹窗状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const pageSize = 5

  // 筛选或检索关键词变化时重新加载
  useEffect(() => {
    loadPosts(true)
  }, [activeFilter, searchKeyword])

  const loadPosts = async (refresh = false, nextPage?: number) => {
    const pageToUse = nextPage ?? page
    const apiPage = refresh ? 0 : pageToUse - 1
    setIsLoadingMore(true)
    setLoadError(null)
    try {
      const result = await getPosts(activeFilter, apiPage, pageSize, searchKeyword || undefined)
      const list = result.content
      if (refresh) {
        setPosts(list)
        setPage(1)
      } else {
        setPosts((prev) => [...prev, ...list])
        setPage(pageToUse)
      }
      setHasMore(result.number + 1 < result.totalPages)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '加载失败，请重试')
      if (refresh) setPosts([])
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return
    loadPosts(false, page + 1)
  }

  const handleLike = async (postId: string) => {
    try {
      const updated = await likePost(postId)
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
      }
    } catch {
      // 乐观更新回退可在此处理
    }
  }

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      navigate('/community/' + postId, { state: { post } })
    }
  }

  const handleShare = (postId: string) => {
    console.log('Share post:', postId)
  }

  const handleEdit = (postId: string) => {
    console.log('Edit post:', postId)
  }

  // 加载已关注用户列表（切换到"关注"标签时调用）
  const loadFollowingUsers = async () => {
    setFollowingLoading(true)
    setFollowingError(false)
    try {
      const users = await getFollowingUsers()
      setFollowingUsers(users)
      setFollowingUserIds(new Set(users.map(u => u.id)))
    } catch {
      setFollowingError(true)
    } finally {
      setFollowingLoading(false)
    }
  }

  // 切换到"关注"标签时加载关注列表
  useEffect(() => {
    if (activeFilter === 'following' && !followingLoadedRef.current) {
      followingLoadedRef.current = true
      loadFollowingUsers()
    }
  }, [activeFilter])

  const handleFollow = async (authorId: string) => {
    // 乐观更新
    setPosts(prev => prev.map(p =>
      p.author.id === authorId ? { ...p, isAuthorFollowed: true } : p
    ))
    try {
      const followed = await followUser(authorId)
      setFollowingUsers(prev => {
        if (prev.find(u => u.id === authorId)) return prev
        return [followed, ...prev]
      })
      setFollowingUserIds(prev => new Set([...prev, authorId]))
    } catch {
      // 回退乐观更新
      setPosts(prev => prev.map(p =>
        p.author.id === authorId ? { ...p, isAuthorFollowed: false } : p
      ))
    }
  }

  const handleUnfollow = async (authorId: string) => {
    // 乐观更新
    setPosts(prev => prev.map(p =>
      p.author.id === authorId ? { ...p, isAuthorFollowed: false } : p
    ))
    try {
      await unfollowUser(authorId)
      setFollowingUsers(prev => prev.filter(u => u.id !== authorId))
      setFollowingUserIds(prev => {
        const next = new Set(prev)
        next.delete(authorId)
        return next
      })
    } catch {
      // 回退乐观更新
      setPosts(prev => prev.map(p =>
        p.author.id === authorId ? { ...p, isAuthorFollowed: true } : p
      ))
    }
  }

  const handleDelete = (postId: string) => {
    setPostToDelete(postId)
    setShowDeleteConfirm(true)
  }
  
  const confirmDelete = async () => {
    if (!postToDelete) {
      setShowDeleteConfirm(false)
      setPostToDelete(null)
      return
    }
    try {
      const ok = await deletePost(postToDelete)
      if (ok) setPosts((prev) => prev.filter((p) => p.id !== postToDelete))
    } finally {
      setShowDeleteConfirm(false)
      setPostToDelete(null)
    }
  }
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setPostToDelete(null)
  }

  const getFilterIcon = (filter: FeedFilter) => {
    switch (filter) {
      case 'latest': return <Clock size={14} />
      case 'popular': return <Flame size={14} />
      case 'department': return <Users size={14} />
      case 'following': return <Grid3X3 size={14} />
      default: return <Clock size={14} />
    }
  }
  
  // 提交检索关键词（Enter 或失焦）：与当前 filter 组合请求后端
  const submitSearchKeyword = () => {
    const k = searchQuery.trim()
    setSearchKeyword(k)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchKeyword('')
  }

  // 切换标签并触发滑动方向
  const changeFilter = (nextFilter: FeedFilter) => {
    const newIndex = FEED_FILTERS.findIndex(f => f.value === nextFilter)
    if (newIndex === -1 || newIndex === currentFilterIndex) return

    setSlideDirection(newIndex > currentFilterIndex ? 'left' : 'right')
    setActiveFilter(nextFilter)
    setCurrentFilterIndex(newIndex)
  }

  // 左右滑动切换标签
  const handleTouchStart = (e: any) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = (e: any) => {
    if (touchStartX === null || !e.changedTouches || e.changedTouches.length === 0) return
    
    const endX = e.changedTouches[0].clientX
    const diffX = endX - touchStartX
    const threshold = 50

    // 忽略小幅度滑动
    if (Math.abs(diffX) < threshold) {
      setTouchStartX(null)
      return
    }

    if (diffX < 0 && currentFilterIndex < FEED_FILTERS.length - 1) {
      // 向左滑动，切到右侧下一个标签
      changeFilter(FEED_FILTERS[currentFilterIndex + 1].value)
    } else if (diffX > 0 && currentFilterIndex > 0) {
      // 向右滑动，切到左侧上一个标签
      changeFilter(FEED_FILTERS[currentFilterIndex - 1].value)
    }

    setTouchStartX(null)
  }

  return (
    <div
      className="page community-page"
      style={{ padding: 0 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 顶栏：搜索 + 筛选 */}
      <header className="community-header">
        <div className="top-search-bar">
        <div className="top-search-input-container">
          <Search size={18} className="top-search-icon" />
          <input
            type="text"
            className="top-search-input"
            placeholder="搜索动态、作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitSearchKeyword()}
          />
          {searchQuery && (
            <button
              type="button"
              className="top-search-clear"
              onClick={clearSearch}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          className="top-search-message"
          onClick={() => navigate('/profile/messages')}
          aria-label="私信"
        >
          <span className="msg-icon-wrap">
            <img src="/icon-message.png" alt="私信" style={{ width: 36, height: 36 }} />
            {unreadCount > 0 && <span className="msg-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </span>
        </button>
        </div>
        {/* 筛选标签 */}
        <div className="feed-filters">
          {FEED_FILTERS.map(filter => (
            <button
              key={filter.value}
              type="button"
              className={'filter-tag ' + (activeFilter === filter.value ? 'active' : '')}
              onClick={() => changeFilter(filter.value)}
            >
              {getFilterIcon(filter.value)}
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {/* 关注标签下：已关注用户横向列表 */}
      {activeFilter === 'following' && (
        <FollowingUserRow
          users={followingUsers}
          loading={followingLoading}
          error={followingError}
          onRetry={() => { followingLoadedRef.current = false; loadFollowingUsers() }}
        />
      )}

      {/* 检索无结果提示：已提交关键词且列表为空且非加载错误 */}
      {searchKeyword && !loadError && posts.length === 0 && (
        <div className="empty-feed">
          <p>未找到相关动态</p>
          <p className="empty-hint">试试其他关键词或筛选条件</p>
          <button type="button" className="load-more-btn" onClick={clearSearch}>
            清空搜索
          </button>
        </div>
      )}

      {/* 动态列表 */}
      <div
        className={'feed-content' + (
          slideDirection === 'left' ? ' slide-left' : slideDirection === 'right' ? ' slide-right' : ''
        )}
        onAnimationEnd={() => setSlideDirection(null)}
      >
        {loadError && (
          <div className="empty-feed">
            <p>{loadError}</p>
            <button type="button" className="load-more-btn" onClick={() => loadPosts(true)}>
              重试
            </button>
          </div>
        )}
        {!loadError && posts.map((post) => (
          <PostCard
            key={post.id}
            post={{
              ...post,
              isAuthorFollowed: followingUserIds.has(post.author.id) || post.isAuthorFollowed,
            }}
            currentUserId={currentUserId}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onOpenDetail={(postId) => navigate('/community/' + postId, { state: { post } })}
          />
        ))}
        
        {/* 加载更多 */}
        {hasMore && posts.length > 0 && (
          <div className="loading-more">
            <button 
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}

        {!hasMore && posts.length > 0 && !loadError && (
          <div className="loading-more">
            <span className="load-all">已加载全部</span>
          </div>
        )}

        {!loadError && posts.length === 0 && !searchKeyword && activeFilter !== 'following' && (
          <div className="empty-feed">
            <p>暂无动态</p>
            <p className="empty-hint">快来发布第一条动态吧~</p>
          </div>
        )}
      </div>

      {/* 右下角悬浮发布按钮（与设计系统 .fab-button 统一） */}
      <button
        type="button"
        className="fab-button"
        onClick={() => navigate('/publish')}
        title="发布动态"
        aria-label="发布动态"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="confirm-dialog-overlay" onClick={cancelDelete}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-dialog-content">
              <div className="confirm-dialog-icon">
                <Trash2 size={28} />
              </div>
              <div className="confirm-dialog-title">删除动态</div>
              <div className="confirm-dialog-message">确定要删除这条动态吗？删除后将无法恢复。</div>
            </div>
            <div className="confirm-dialog-actions">
              <button className="confirm-dialog-btn cancel" onClick={cancelDelete}>
                取消
              </button>
              <button className="confirm-dialog-btn confirm" onClick={confirmDelete}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
