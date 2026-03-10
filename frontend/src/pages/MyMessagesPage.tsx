import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { MOCK_POSTS } from '../types/community'

interface MyMessagesPageProps {
  onBack?: () => void
}

type NoticeType = 'like' | 'comment' | 'mention'

interface Notice {
  id: string
  type: NoticeType
  fromName: string
  fromAvatar: string
  postId: string
  postSnippet: string
  content?: string
  createdAt: string
  isRead: boolean
}

const MOCK_NOTICES: Notice[] = [
  { id: 'n1', type: 'like', fromName: '张明', fromAvatar: '张', postId: 'p1', postSnippet: '今天完成了晨跑10公里，感觉整个人都清爽了！', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), isRead: false },
  { id: 'n2', type: 'comment', fromName: '李华', fromAvatar: '李', postId: 'p1', postSnippet: '今天完成了晨跑10公里，感觉整个人都清爽了！', content: '太厉害了，坚持就是胜利！', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), isRead: false },
  { id: 'n3', type: 'mention', fromName: '王芳', fromAvatar: '王', postId: 'p2', postSnippet: '感谢@我帮忙整理了文档，非常认真！', content: '感谢@我帮忙整理了文档！', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isRead: false },
  { id: 'n4', type: 'like', fromName: '赵强', fromAvatar: '赵', postId: 'p1', postSnippet: '今天完成了晨跑10公里，感觉整个人都清爽了！', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), isRead: true },
  { id: 'n5', type: 'comment', fromName: '孙丽', fromAvatar: '孙', postId: 'p3', postSnippet: '今天分享了一个设计资源包，收到了很多好评！', content: '我也要去跑步了！', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isRead: true },
]

const TYPE_LABEL: Record<NoticeType, string> = {
  like: '赞了你的动态',
  comment: '评论了你的动态',
  mention: '在动态中提到了你',
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

export default function MyMessagesPage({ onBack }: MyMessagesPageProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else window.history.back()
  }

  const handleNoticeClick = (n: Notice) => {
    const post = MOCK_POSTS.find(p => p.id === n.postId)
    navigate('/community/' + n.postId, { state: { post } })
  }

  return (
    <div className="page page-points-center">
      <div className="publish-header">
        <button type="button" className="publish-back-btn" onClick={handleBack}>
          <ChevronLeft size={22} />
        </button>
        <div className="publish-header-title">我的消息</div>
        <div style={{ width: 44 }} />
      </div>

      <div className="publish-content" style={{ padding: 0 }}>
        {MOCK_NOTICES.length === 0 ? (
          <div className="my-posts-empty">
            <p>暂无消息</p>
            <span>有互动时会在这里通知你</span>
          </div>
        ) : (
          <ul className="notice-list">
            {MOCK_NOTICES.map(n => (
              <li key={n.id} className="notice-item" onClick={() => handleNoticeClick(n)} style={{ cursor: 'pointer' }}>
                <div className="notice-avatar">{n.fromAvatar}</div>
                <div className="notice-body">
                  <div className="notice-meta">
                    <span className="notice-name">{n.fromName}</span>
                    <span className="notice-time">
                      {formatTime(n.createdAt)}
                      {!n.isRead && <i className="notice-dot" />}
                    </span>
                  </div>
                  <p className="notice-action">{TYPE_LABEL[n.type]}</p>
                  {n.content && n.type !== 'like' && (
                    <p className="notice-quote">{n.content}</p>
                  )}
                  <p className="notice-snippet">
                    {n.postSnippet.slice(0, 36)}{n.postSnippet.length > 36 ? '...' : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
