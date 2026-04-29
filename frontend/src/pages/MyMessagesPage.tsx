import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getNotifications, markNotificationRead } from '../api/points'

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
  relatedRecordId: string
  postSnippet: string
  content?: string
  createdAt: string
  isRead: boolean
}

function mapType(apiType: string): NoticeType {
  if (apiType === 'post_like') return 'like'
  if (apiType === 'comment') return 'comment'
  if (apiType === 'mention') return 'mention'
  return 'like'
}

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
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadNotices = () => {
    setLoadError(null)
    setLoading(true)
    getNotifications(0, 50)
      .then((res) => {
        const list = (res.content ?? []).map((n) => ({
          id: String(n.id),
          type: mapType(n.type),
          fromName: n.contentSummary?.split(' ')[0] ?? '有人',
          fromAvatar: '',
          postId: n.relatedPostId != null ? String(n.relatedPostId) : '',
          relatedRecordId: n.relatedRecordId != null ? String(n.relatedRecordId) : '',
          postSnippet: n.contentSummary ?? '',
          content: n.contentSummary ?? undefined,
          createdAt: n.createdAt,
          isRead: n.read
        }))
        setNotices(list)
      })
      .catch(() => {
        setLoadError('加载失败，请稍后重试')
        setNotices([])
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    const t = setTimeout(() => loadNotices(), 0)
    return () => clearTimeout(t)
  }, [])

  const handleBack = () => {
    if (onBack) onBack()
    else window.history.back()
  }

  const handleNoticeClick = async (n: Notice) => {
    if (!n.isRead) {
      await markNotificationRead(Number(n.id))
      setNotices((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
    }
    if (n.type === 'mention' && n.relatedRecordId) {
      navigate('/checkin/positive-records')
    } else if (n.postId) {
      navigate('/community/' + n.postId)
    }
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
        {loading ? (
          <div className="my-posts-empty"><p>加载中...</p></div>
        ) : loadError ? (
          <div className="my-posts-empty">
            <p>{loadError}</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={loadNotices}>重试</button>
          </div>
        ) : notices.length === 0 ? (
          <div className="my-messages-empty">
            <img src="/no-messages.png" alt="暂无消息" />
          </div>
        ) : (
          <ul className="notice-list">
            {notices.map(n => (
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
