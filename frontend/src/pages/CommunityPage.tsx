import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Users, Clock, Grid3X3, Search, X, RefreshCw, Trash2, Plus } from 'lucide-react'
import type { Post, FeedFilter } from '../types/community'
import { FEED_FILTERS } from '../types/community'
import PostCard from '../components/community/PostCard'
import { getPosts, likePost, deletePost } from '../api/community'

export default function CommunityPage() {
  const navigate = useNavigate()
  const initialFilterIndex = FEED_FILTERS.findIndex(f => f.value === 'latest')
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('latest')
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  
  // 搜索功能状态
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [currentFilterIndex, setCurrentFilterIndex] = useState(
    initialFilterIndex === -1 ? 0 : initialFilterIndex
  )
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  
  // 删除确认弹窗状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const pageSize = 5

  // 初始化加载
  useEffect(() => {
    loadPosts(true)
  }, [activeFilter])

  const loadPosts = async (refresh = false, nextPage?: number) => {
    const pageToUse = nextPage ?? page
    const apiPage = refresh ? 0 : pageToUse - 1
    setIsLoadingMore(true)
    setLoadError(null)
    try {
      const result = await getPosts(activeFilter, apiPage, pageSize)
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
      setLoadError(e instanceof Error ? e.message : '加载失败')
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
  
  // 刷新功能
  const handleAutoRefresh = async () => {
    setIsRefreshing(true)
    await loadPosts(true)
    setIsRefreshing(false)
  }

  // 搜索：在当前已加载列表中筛选
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    setSearchResults(
      posts.filter(
        (post) =>
          post.content.text.toLowerCase().includes(query.toLowerCase()) ||
          post.author.name.toLowerCase().includes(query.toLowerCase()) ||
          post.topics.some((t) => t.name.toLowerCase().includes(query.toLowerCase()))
      )
    )
    setIsSearching(false)
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
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="top-search-clear"
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          className="top-search-refresh"
          onClick={handleAutoRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
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

      {/* 搜索结果提示 */}
      {searchQuery && (
        <div className="search-results-bar">
          {isSearching ? (
            <span>搜索中...</span>
          ) : searchResults.length > 0 ? (
            <span>找到 <strong>{searchResults.length}</strong> 条结果</span>
          ) : (
            <span>未找到相关动态</span>
          )}
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
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
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

        {!loadError && posts.length === 0 && (
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
