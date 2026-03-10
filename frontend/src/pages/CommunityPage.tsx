import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Users, Clock, Grid3X3, Search, X, RefreshCw, Trash2 } from 'lucide-react'
import type { Post, FeedFilter } from '../types/community'
import { MOCK_POSTS, FEED_FILTERS } from '../types/community'
import PostCard from '../components/community/PostCard'

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

  // 初始化加载
  useEffect(() => {
    loadPosts(true)
  }, [activeFilter])

  const loadPosts = async (refresh = false) => {
    const currentPage = refresh ? 1 : page
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredPosts = [...MOCK_POSTS]
    
    switch (activeFilter) {
      case 'popular':
        filteredPosts.sort((a, b) => b.likesCount - a.likesCount)
        break
      case 'department':
        filteredPosts = filteredPosts.filter(p => 
          p.visibility.type === 'department'
        )
        break
      case 'following':
        filteredPosts = filteredPosts.slice(0, 3)
        break
      case 'latest':
      default:
        filteredPosts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
    
    // 分页 - 每页5条
    const pageSize = 5
    const startIndex = (currentPage - 1) * pageSize
    const pagedPosts = filteredPosts.slice(startIndex, startIndex + pageSize)
    
    if (refresh) {
      setPosts(pagedPosts)
      setPage(1)
    } else {
      setPosts([...posts, ...pagedPosts])
    }
    
    setHasMore(startIndex + pageSize < filteredPosts.length)
    setIsLoadingMore(false)
  }

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    setPage(page + 1)
    loadPosts(false)
  }

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
        }
      }
      return post
    }))
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
  
  const confirmDelete = () => {
    if (postToDelete) {
      setPosts(posts.filter(p => p.id !== postToDelete))
    }
    setShowDeleteConfirm(false)
    setPostToDelete(null)
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
    await new Promise(resolve => setTimeout(resolve, 800))
    await loadPosts(true)
    setIsRefreshing(false)
  }
  
  // 搜索功能
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟搜索结果
    const filtered = posts.filter(post => 
      post.content.text.toLowerCase().includes(query.toLowerCase()) ||
      post.author.name.toLowerCase().includes(query.toLowerCase()) ||
      post.topics.some(t => t.name.toLowerCase().includes(query.toLowerCase()))
    )
    
    setSearchResults(filtered)
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
      className="page"
      style={{ padding: 0 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 顶部搜索栏 */}
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
          className="top-search-refresh"
          onClick={handleAutoRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
        </button>
      </div>
      
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
      
      {/* 筛选标签 */}
      <div className="feed-filters">
        {FEED_FILTERS.map(filter => (
          <button
            key={filter.value}
            className={'filter-tag ' + (activeFilter === filter.value ? 'active' : '')}
            onClick={() => {
              changeFilter(filter.value)
            }}
          >
            {getFilterIcon(filter.value)}
            {filter.label}
          </button>
        ))}
      </div>

      {/* 动态列表 */}
      <div
        className={'feed-content' + (
          slideDirection === 'left' ? ' slide-left' : slideDirection === 'right' ? ' slide-right' : ''
        )}
        onAnimationEnd={() => setSlideDirection(null)}
      >
        {posts.map(post => (
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

        {!hasMore && posts.length > 0 && (
          <div className="loading-more">
            <span className="load-all">已加载全部</span>
          </div>
        )}

        {posts.length === 0 && (
          <div className="empty-feed">
            <p>暂无动态</p>
            <p className="empty-hint">快来发布第一条动态吧~</p>
          </div>
        )}
      </div>

      {/* 右下角悬浮发布按钮 */}
      <button
        className="fab-button"
        onClick={() => navigate('/publish')}
        title="发布动态"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
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
