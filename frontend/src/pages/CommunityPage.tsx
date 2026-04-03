import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Plus } from 'lucide-react'
import type { Post, FeedFilter, FollowedUser } from '../types/community'
import { FEED_FILTERS } from '../types/community'
import PostCard from '../components/community/PostCard'
import FollowingUserRow from '../components/community/FollowingUserRow'
import { getPosts, likePost, deletePost } from '../api/community'
import { followUser, unfollowUser, getFollowingUsers } from '../api/follow'
import { getUnreadCount } from '../api/points'
import DeletePostConfirmModal from '../components/DeletePostConfirmModal'

export default function CommunityPage() {
  const PULL_REFRESH_THRESHOLD = 72
  const PULL_REFRESH_MAX = 120
  const PULL_REFRESH_MIN_DURATION = 600
  const PULL_REFRESH_SUCCESS_DURATION = 850

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
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'refreshing' | 'success'>('idle')
  const [currentFilterIndex, setCurrentFilterIndex] = useState(
    initialFilterIndex === -1 ? 0 : initialFilterIndex
  )
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  
  const [unreadCount, setUnreadCount] = useState(0)
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const isHorizontalSwipeRef = useRef(false)
  const isPullGestureRef = useRef(false)
  const pullDistanceRef = useRef(0)
  const pullArmedRef = useRef(false)

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

  const loadPosts = useCallback(async (refresh = false, nextPage?: number) => {
    const pageToUse = nextPage ?? 1
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
  }, [activeFilter, pageSize, searchKeyword])

  // 筛选或检索关键词变化时重新加载
  useEffect(() => {
    loadPosts(true)
  }, [activeFilter, searchKeyword, loadPosts])

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return
    loadPosts(false, page + 1)
  }

  const triggerRefresh = useCallback(async () => {
    if (refreshStatus === 'refreshing') return
    setRefreshStatus('refreshing')
    const startedAt = Date.now()
    try {
      await loadPosts(true)
      const elapsed = Date.now() - startedAt
      if (elapsed < PULL_REFRESH_MIN_DURATION) {
        await new Promise((resolve) => setTimeout(resolve, PULL_REFRESH_MIN_DURATION - elapsed))
      }
      setRefreshStatus('success')
      await new Promise((resolve) => setTimeout(resolve, PULL_REFRESH_SUCCESS_DURATION))
    } finally {
      setRefreshStatus('idle')
      setPullDistance(0)
      pullDistanceRef.current = 0
      pullArmedRef.current = false
    }
  }, [loadPosts, refreshStatus, PULL_REFRESH_MIN_DURATION, PULL_REFRESH_SUCCESS_DURATION])

  // 上滑到列表底部自动加载下一页（保留按钮作为兜底）
  useEffect(() => {
    const trigger = loadMoreTriggerRef.current
    if (!trigger) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return
        if (isLoadingMore || !hasMore || posts.length === 0) return
        handleLoadMore()
      },
      { root: null, rootMargin: '180px 0px', threshold: 0.01 }
    )

    observer.observe(trigger)
    return () => observer.disconnect()
  }, [isLoadingMore, hasMore, posts.length, page, activeFilter, searchKeyword])

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
    if (!e.touches || e.touches.length === 0) return
    const touch = e.touches[0]
    setTouchStartX(touch.clientX)
    touchStartYRef.current = touch.clientY
    isHorizontalSwipeRef.current = false
    isPullGestureRef.current = false
    pullArmedRef.current = false
  }

  const handleTouchMove = (e: any) => {
    if (!e.touches || e.touches.length === 0) return
    if (refreshStatus !== 'idle') return
    if (touchStartX === null || touchStartYRef.current === null) return

    const touch = e.touches[0]
    const diffX = touch.clientX - touchStartX
    const diffY = touch.clientY - touchStartYRef.current

    if (!isHorizontalSwipeRef.current && !isPullGestureRef.current) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isHorizontalSwipeRef.current = true
      } else if (diffY > 0 && Math.abs(diffY) > 8 && window.scrollY <= 0) {
        isPullGestureRef.current = true
      }
    }

    if (!isPullGestureRef.current || isHorizontalSwipeRef.current || window.scrollY > 0 || diffY <= 0) {
      return
    }

    e.preventDefault()
    const damped = Math.min(PULL_REFRESH_MAX, diffY * 0.45)
    pullDistanceRef.current = damped
    setPullDistance(damped)
    if (damped >= PULL_REFRESH_THRESHOLD) {
      pullArmedRef.current = true
    }
  }

  const handleTouchEnd = (e: any) => {
    if (touchStartX === null || !e.changedTouches || e.changedTouches.length === 0) {
      setTouchStartX(null)
      touchStartYRef.current = null
      return
    }
    
    const endX = e.changedTouches[0].clientX
    const diffX = endX - touchStartX
    const threshold = 50

    const shouldRefresh = isPullGestureRef.current &&
      (pullArmedRef.current || pullDistanceRef.current >= PULL_REFRESH_THRESHOLD) &&
      refreshStatus === 'idle'

    if (shouldRefresh) {
      setTouchStartX(null)
      touchStartYRef.current = null
      isHorizontalSwipeRef.current = false
      isPullGestureRef.current = false
      void triggerRefresh()
      return
    }

    // 忽略小幅度滑动
    if (Math.abs(diffX) < threshold) {
      setTouchStartX(null)
      touchStartYRef.current = null
      if (refreshStatus === 'idle') {
        setPullDistance(0)
      }
      pullDistanceRef.current = 0
      pullArmedRef.current = false
      return
    }

    if (isHorizontalSwipeRef.current && diffX < 0 && currentFilterIndex < FEED_FILTERS.length - 1) {
      // 向左滑动，切到右侧下一个标签
      changeFilter(FEED_FILTERS[currentFilterIndex + 1].value)
    } else if (isHorizontalSwipeRef.current && diffX > 0 && currentFilterIndex > 0) {
      // 向右滑动，切到左侧上一个标签
      changeFilter(FEED_FILTERS[currentFilterIndex - 1].value)
    }

    setTouchStartX(null)
    touchStartYRef.current = null
    setPullDistance(0)
    pullDistanceRef.current = 0
    pullArmedRef.current = false
  }

  const pullReady = pullDistance >= PULL_REFRESH_THRESHOLD

  return (
    <div
      className="page community-page"
      style={{ padding: 0 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <div className="community-body-frame">
        <div
          className={
            'pull-refresh-indicator' +
            (pullReady ? ' ready' : '') +
            (refreshStatus === 'refreshing' ? ' refreshing' : '') +
            (refreshStatus === 'success' ? ' success' : '')
          }
          style={{ height: refreshStatus === 'idle' ? pullDistance : PULL_REFRESH_THRESHOLD }}
          role="status"
          aria-live="polite"
        >
          {refreshStatus === 'refreshing' ? (
            <span className="pull-refresh-spinner" aria-hidden="true" />
          ) : refreshStatus === 'success' ? (
            <span className="pull-refresh-success-icon" aria-hidden="true" />
          ) : (
            <span className={'pull-refresh-arrow' + (pullReady ? ' ready' : '')} aria-hidden="true" />
          )}
          <span>
            {refreshStatus === 'refreshing'
              ? '刷新中...'
              : refreshStatus === 'success'
                ? '已为你更新最新动态'
                : pullReady
                  ? '松手立即刷新'
                  : '下拉刷新动态'}
          </span>
        </div>

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
              <div className="load-more-trigger" ref={loadMoreTriggerRef} aria-hidden />
              {isLoadingMore ? (
                <span className="loading-inline">
                  <span className="loading-spinner" aria-hidden="true" />
                  加载中...
                </span>
              ) : (
                <span className="load-more-hint">继续上滑自动加载</span>
              )}
            </div>
          )}

          {!hasMore && posts.length > 0 && !loadError && (
            <div className="loading-more">
              <span className="load-all">已加载全部</span>
            </div>
          )}

          {!loadError && posts.length === 0 && !searchKeyword && activeFilter !== 'following' && (
            <div className="community-empty-feed">
              <img src="/暂无动态.png" alt="暂无动态" />
            </div>
          )}
        </div>
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

      <DeletePostConfirmModal
        open={showDeleteConfirm}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
