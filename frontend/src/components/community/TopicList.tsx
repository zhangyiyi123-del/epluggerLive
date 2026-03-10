import { useState } from 'react'
import type { Topic } from '../../types/community'
import { Hash, Users, Flame } from 'lucide-react'

interface TopicListProps {
  topics: Topic[]
  onSelectTopic?: (topic: Topic) => void
  onFollowTopic?: (topicId: string) => void
  selectedTopicId?: string
  showFollowedOnly?: boolean
}

export default function TopicList({
  topics,
  onSelectTopic,
  onFollowTopic,
  selectedTopicId,
  showFollowedOnly = false
}: TopicListProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'hot' | 'following'>('all')

  const filteredTopics = topics.filter(topic => {
    if (activeFilter === 'following') return topic.isFollowing
    if (showFollowedOnly) return topic.isFollowing
    return true
  })

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (activeFilter === 'hot') {
      return b.postCount - a.postCount
    }
    return b.postCount - a.postCount
  })

  return (
    <div className="topic-list-container">
      {/* 话题筛选标签 */}
      <div className="topic-filters">
        <button
          className={`topic-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <Hash size={14} />
          全部
        </button>
        <button
          className={`topic-filter-btn ${activeFilter === 'hot' ? 'active' : ''}`}
          onClick={() => setActiveFilter('hot')}
        >
          <Flame size={14} />
          热门
        </button>
        <button
          className={`topic-filter-btn ${activeFilter === 'following' ? 'active' : ''}`}
          onClick={() => setActiveFilter('following')}
        >
          <Users size={14} />
          已关注
        </button>
      </div>

      {/* 话题列表 */}
      <div className="topic-list">
        {sortedTopics.map(topic => (
          <div
            key={topic.id}
            className={`topic-item ${selectedTopicId === topic.id ? 'selected' : ''}`}
            onClick={() => onSelectTopic?.(topic)}
          >
            {topic.coverImage ? (
              <div className="topic-cover">
                <img src={topic.coverImage} alt={topic.name} />
              </div>
            ) : (
              <div className="topic-icon">
                <Hash size={20} />
              </div>
            )}
            <div className="topic-info">
              <span className="topic-name">#{topic.name}</span>
              <span className="topic-post-count">{topic.postCount} posts</span>
            </div>
            {topic.isFollowing ? (
              <button
                className="topic-follow-btn following"
                onClick={(e) => {
                  e.stopPropagation()
                  onFollowTopic?.(topic.id)
                }}
              >
                已关注
              </button>
            ) : (
              <button
                className="topic-follow-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onFollowTopic?.(topic.id)
                }}
              >
                <Users size={12} />
                关注
              </button>
            )}
          </div>
        ))}
      </div>

      {sortedTopics.length === 0 && (
        <div className="empty-topics">
          {activeFilter === 'following' ? (
            <p>暂无关注的话题</p>
          ) : (
            <p>暂无话题</p>
          )}
        </div>
      )}
    </div>
  )
}
