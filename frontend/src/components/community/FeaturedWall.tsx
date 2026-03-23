import { useState } from 'react'
import type { Post } from '../../types/community'
import { Star, ChevronLeft, ChevronRight, Award, Zap } from 'lucide-react'

interface FeaturedWallProps {
  posts: Post[]
  onSelectPost?: (post: Post) => void
}

export default function FeaturedWall({ posts, onSelectPost }: FeaturedWallProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const featuredPosts = posts.filter(p => p.isFeatured)

  const goToPrev = () => {
    setCurrentIndex(prev => (prev === 0 ? featuredPosts.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev === featuredPosts.length - 1 ? 0 : prev + 1))
  }

  if (featuredPosts.length === 0) {
    return (
      <div className="featured-wall empty">
        <div className="featured-header">
          <Award size={18} className="featured-icon" />
          <span>精选墙</span>
        </div>
        <div className="empty-featured">
          <Star size={32} />
          <p>暂无精选内容</p>
          <p className="empty-hint">优质内容将有机会上精选墙</p>
        </div>
      </div>
    )
  }

  const currentPost = featuredPosts[currentIndex]

  return (
    <div className="featured-wall">
      <div className="featured-header">
        <Award size={18} className="featured-icon" />
        <span>精选墙</span>
        <span className="featured-count">{featuredPosts.length}</span>
      </div>

      <div className="featured-carousel">
        <button className="carousel-btn prev" onClick={goToPrev}>
          <ChevronLeft size={20} />
        </button>

        <div 
          className="featured-slide"
          onClick={() => onSelectPost?.(currentPost)}
        >
          {/* 封面图 */}
          {currentPost.content.images && currentPost.content.images.length > 0 ? (
            <div className="featured-cover">
              <img src={currentPost.content.images[0]} alt="" loading="lazy" />
              <div className="featured-overlay" />
            </div>
          ) : (
            <div className="featured-cover default-cover">
              <Zap size={48} />
            </div>
          )}

          {/* 内容信息 */}
          <div className="featured-content">
            <div className="featured-author">
              <div className="avatar-sm">
                {currentPost.author.avatar || currentPost.author.name[0]}
              </div>
              <span className="author-name">{currentPost.author.name}</span>
            </div>
            <p className="featured-text">
              {currentPost.content.text.slice(0, 80)}
              {currentPost.content.text.length > 80 ? '...' : ''}
            </p>
            <div className="featured-stats">
              <span>❤️ {currentPost.likesCount}</span>
              <span>💬 {currentPost.commentsCount}</span>
            </div>
          </div>

          {/* 指示器 */}
          <div className="featured-indicators">
            {featuredPosts.map((_, idx) => (
              <span 
                key={idx} 
                className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
              />
            ))}
          </div>
        </div>

        <button className="carousel-btn next" onClick={goToNext}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
