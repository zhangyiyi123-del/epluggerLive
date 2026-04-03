import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle, LogOut, ChevronRight, ChevronLeft,
  FileText, ClipboardPenLine,
} from 'lucide-react'
import { MEDAL_CONFIGS } from '../types/points'
import type { UserPoints as UserPointsType } from '../types/points'
import MedalWall from '../components/points/MedalWall'
import { getProfile, type UserProfile } from '../api/auth'
import { getPointsMe, getUnreadCount } from '../api/points'
import { useBottomNavSuppressSetter } from '../context/BottomNavSuppressContext'

const menuItems = [
  { icon: FileText, label: '我的动态', badge: '', color: '#8B5CF6' },
  { icon: MessageCircle, label: '我的消息', badgeKey: 'messages', color: '#3B82F6', badgeType: 'danger' as const },
  { icon: ClipboardPenLine, label: '问题反馈', badge: '', color: '#6B7280' },
]

interface ProfilePageProps {
  onLogout?: () => void
}

export default function ProfilePage({ onLogout }: ProfilePageProps) {
  const navigate = useNavigate()
  const setSuppressBottomNav = useBottomNavSuppressSetter()
  const [showMedalWall, setShowMedalWall] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userPoints, setUserPoints] = useState<UserPointsType | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    getProfile().then((p) => {
      if (p) setProfile(p)
    })
    getUnreadCount().then(setUnreadCount).catch(() => {})
    getPointsMe().then((p) => { if (p) setUserPoints(p) })
  }, [])

  useEffect(() => {
    if (!setSuppressBottomNav) return
    setSuppressBottomNav(showMedalWall)
    return () => setSuppressBottomNav(false)
  }, [showMedalWall, setSuppressBottomNav])

  const displayUserPoints: UserPointsType = userPoints ?? {
    userId: profile?.id ?? '',
    availablePoints: 0,
    totalEarnedPoints: profile?.totalEarnedPoints ?? 0,
    totalUsedPoints: 0,
    expiringPoints: 0,
    level: 1,
    currentLevelPoints: 0,
    nextLevelPoints: 200,
    medals: [],
  }

  // 勋章墙全屏（查看全部）
  if (showMedalWall) {
    return (
      <div className="page page-points-center">
        <div className="publish-header">
          <button type="button" className="publish-back-btn" onClick={() => setShowMedalWall(false)}>
            <ChevronLeft size={22} />
          </button>
          <div className="publish-header-title">我的勋章</div>
          <div style={{ width: 44 }} />
        </div>
        <div className="publish-content">
          <MedalWall userPoints={displayUserPoints} onClose={() => setShowMedalWall(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Profile Header：头像居左，姓名岗位与头像对齐 */}
      <div className="profile-header">
        <div className="profile-header-top">
          <div className="profile-header-left">
            <div className="profile-avatar">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile?.name ?? '头像'}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                profile?.name?.slice(0, 1) || '我'
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name">{profile?.name ?? '加载中...'}</div>
              <div className="profile-dept">{[profile?.department, profile?.position].filter(Boolean).join(' · ') || '—'}</div>
            </div>
          </div>
        </div>
        <div className="profile-stats-row">
          <div className="profile-stat">
            <span className="profile-stat-value">{profile?.consecutiveCheckInDays ?? 0}</span>
            <span className="profile-stat-label">连续打卡</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">{profile?.totalEarnedPoints ?? 0}</span>
            <span className="profile-stat-label">累计积分</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">{profile?.medalCount ?? 0}</span>
            <span className="profile-stat-label">获得勋章</span>
          </div>
        </div>
        <button
          type="button"
          className="profile-points-center-btn"
          onClick={() => navigate('/leaderboard', { state: { openPointsCenter: true } })}
        >
          积分中心
        </button>
      </div>

      {/* Content（与打卡、排行等页面一致，使用 .page 统一内边距） */}
      <div className="profile-content">
        {/* Medals */}
        <div className="section">
          <div className="header" style={{ marginBottom: 12 }}>
            <h3 className="section-title" style={{ margin: 0 }}>我的勋章</h3>
            <button className="view-all-btn" onClick={() => setShowMedalWall(true)}>
              查看全部 <ChevronRight size={14} />
            </button>
          </div>
          {/* 已获得最多3枚 + 补齐未获得占位，共显示3个 */}
          <div className="profile-medal-row">
            {(() => {
              const medals = displayUserPoints.medals.filter(m => m.obtainedAt).slice(0, 3)
              const configs = medals.map(m => MEDAL_CONFIGS.find(c => c.type === m.type)).filter(Boolean)
              const lockedConfigs = MEDAL_CONFIGS.filter(c => !displayUserPoints.medals.find(m => m.type === c.type && m.obtainedAt))
              const displayCount = 3
              const items: { config: typeof MEDAL_CONFIGS[0]; obtained: boolean }[] = [
                ...configs.map(c => ({ config: c!, obtained: true })),
                ...lockedConfigs.slice(0, displayCount - configs.length).map(c => ({ config: c, obtained: false })),
              ]
              return items.map(({ config, obtained }) => (
                <div key={config.type} className="profile-medal-item" onClick={() => setShowMedalWall(true)}>
                  <div className={`profile-medal-badge ${obtained ? 'lit' : 'dim'}`}>
                    <span className="profile-medal-emoji">{config.icon}</span>
                  </div>
                  <span className="profile-medal-name">{config.name}</span>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Menu Items */}
        <div className="section">
          <div className="menu-list">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="menu-item"
                onClick={() => {
                  if (item.label === '我的动态') navigate('/profile/posts')
                  else if (item.label === '我的消息') navigate('/profile/messages')
                  else if (item.label === '问题反馈') navigate('/profile/feedback')
                }}
                style={{
                  cursor:
                    item.label === '我的动态' || item.label === '我的消息' || item.label === '问题反馈'
                      ? 'pointer'
                      : undefined,
                }}
              >
                <div className="menu-icon" style={{ background: `${item.color}15`, color: item.color }}>
                  <item.icon size={18} />
                </div>
                <span className="menu-label">{item.label}</span>
                {'badgeKey' in item && item.badgeKey === 'messages' && unreadCount > 0 && (
                  <span className={`badge ${item.badgeType === 'danger' ? 'badge-warning' : 'badge-primary'}`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {'badge' in item && item.badge && (
                  <span className={`badge ${item.badgeType === 'danger' ? 'badge-warning' : 'badge-primary'}`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={18} className="menu-arrow" />
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          className="btn"
          style={{ width: '100%', background: '#FEE2E2', color: '#EF4444', marginTop: 20 }}
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut size={18} />
          退出登录
        </button>

        {/* 退出确认弹窗 */}
        {showLogoutConfirm && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '0 32px',
            }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <div
              style={{
                width: '100%', maxWidth: 320, background: '#fff',
                borderRadius: 20, padding: '28px 24px 24px',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                }}>
                  <LogOut size={22} color="#EF4444" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 6 }}>确认退出登录？</p>
                <p style={{ fontSize: 13, color: '#6B7280' }}>退出后需要重新登录才能使用</p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 12, border: '1.5px solid #E5E7EB',
                    background: '#fff', fontSize: 15, fontWeight: 600, color: '#6B7280', cursor: 'pointer',
                  }}
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  取消
                </button>
                <button
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                    background: '#EF4444', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer',
                  }}
                  onClick={() => {
                    setShowLogoutConfirm(false)
                    onLogout?.()
                    navigate('/', { replace: true })
                  }}
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version */}
        <div className="text-center text-sm text-light" style={{ marginTop: 20, marginBottom: 40 }}>
          易普圈 v1.0.0
        </div>
      </div>
    </div>
  )
}
