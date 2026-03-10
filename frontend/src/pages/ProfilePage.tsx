import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MessageCircle, LogOut, ChevronRight, ChevronLeft,
  Bell, HelpCircle, FileText, Moon
} from 'lucide-react'
import { MOCK_USER_POINTS, MEDAL_CONFIGS } from '../types/points'
import MedalWall from '../components/points/MedalWall'

const menuItems = [
  { icon: FileText, label: '我的动态', badge: '', color: '#8B5CF6' },
  { icon: MessageCircle, label: '我的消息', badge: '3', color: '#4F46E5', badgeType: 'danger' },
  { icon: Bell, label: '通知设置', badge: '', color: '#10B981' },
  { icon: HelpCircle, label: '帮助与反馈', badge: '', color: '#6B7280' },
]

interface ProfilePageProps {
  onLogout?: () => void
}

export default function ProfilePage({ onLogout }: ProfilePageProps) {
  const navigate = useNavigate()
  const [showMedalWall, setShowMedalWall] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
          <MedalWall userPoints={MOCK_USER_POINTS} onClose={() => setShowMedalWall(false)} />
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
            <div className="profile-avatar">我</div>
            <div className="profile-info">
              <div className="profile-name">员工用户</div>
              <div className="profile-dept">技术部 · 前端开发</div>
            </div>
          </div>
        </div>
        <div className="profile-stats-row">
          <div className="profile-stat">
            <span className="profile-stat-value">28</span>
            <span className="profile-stat-label">连续打卡</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">2850</span>
            <span className="profile-stat-label">累计积分</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">4</span>
            <span className="profile-stat-label">获得勋章</span>
          </div>
        </div>
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
              const obtained = MOCK_USER_POINTS.medals.slice(0, 3)
              const configs = obtained.map(m => MEDAL_CONFIGS.find(c => c.type === m.type)).filter(Boolean)
              // 未获得：取第一批还没有的勋章补足到3个
              const lockedConfigs = MEDAL_CONFIGS.filter(c => !MOCK_USER_POINTS.medals.find(m => m.type === c.type))
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
                }}
                style={{ cursor: item.label === '我的动态' || item.label === '我的消息' ? 'pointer' : undefined }}
              >
                <div className="menu-icon" style={{ background: `${item.color}15`, color: item.color }}>
                  <item.icon size={18} />
                </div>
                <span className="menu-label">{item.label}</span>
                {item.badge && (
                  <span className={`badge ${item.badgeType === 'danger' ? 'badge-warning' : 'badge-primary'}`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={18} className="menu-arrow" />
              </div>
            ))}
          </div>
        </div>

        {/* 深色模式 */}
        <div className="section">
          <div className="menu-list">
            <div className="menu-item">
              <div className="menu-icon" style={{ background: '#1F293715', color: '#1F2937' }}>
                <Moon size={18} />
              </div>
              <span className="menu-label">深色模式</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: darkMode ? '#4F46E5' : '#E5E7EB',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: 2,
                  left: darkMode ? 22 : 2,
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
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
