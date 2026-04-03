import type { FollowedUser } from '../../types/community'

interface FollowingUserRowProps {
  users: FollowedUser[]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
}

export default function FollowingUserRow({ users, loading, error, onRetry }: FollowingUserRowProps) {
  if (loading) {
    return (
      <div className="following-user-row following-user-row--empty">
        <span className="following-user-row__empty-text">加载中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="following-user-row following-user-row--empty">
        <span className="following-user-row__empty-text">加载失败</span>
        {onRetry && (
          <button type="button" className="follow-btn" style={{ marginLeft: 8 }} onClick={onRetry}>
            重试
          </button>
        )}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="following-user-row__empty-illustration">
        <img src="/生成关注页面配图-removebg-preview.png" alt="暂无关注" />
      </div>
    )
  }

  return (
    <div className="following-user-row">
      {users.map(user => (
        <div key={user.id} className="following-user-item">
          <div className="following-user-avatar">
            {user.avatar && user.avatar.startsWith('http')
              ? <img src={user.avatar} alt={user.name} />
              : <span>{user.avatar || user.name[0]}</span>}
          </div>
          <span className="following-user-name">{user.name}</span>
        </div>
      ))}
    </div>
  )
}
