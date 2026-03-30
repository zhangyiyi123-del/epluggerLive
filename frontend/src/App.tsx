import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { Home, CheckCircle, Users, Trophy, User } from 'lucide-react'
import * as authApi from './api/auth'
import { BottomNavSuppressContext } from './context/BottomNavSuppressContext'
import HomePage from './pages/HomePage'
import CheckInPage from './pages/CheckInPage'
import ExerciseRecordsPage from './pages/ExerciseRecordsPage'
import PositiveCheckInPage from './pages/PositiveCheckInPage'
import PositiveRecordsPage from './pages/PositiveRecordsPage'
import CommunityPage from './pages/CommunityPage'
import PostDetailPage from './pages/PostDetailPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import PublishPage from './pages/PublishPage'
import MyPostsPage from './pages/MyPostsPage'
import MyMessagesPage from './pages/MyMessagesPage'
import PointsRecordsPage from './pages/PointsRecordsPage'
import FeedbackPage from './pages/FeedbackPage'
import LoginPage from './pages/LoginPage'
import './App.css'

function AppContent({ isLoggedIn, onLogin, onLogout }: { isLoggedIn: boolean; onLogin: () => void; onLogout: () => void }) {
  const location = useLocation()
  const [suppressBottomNav, setSuppressBottomNav] = useState(false)

  const hideBottomNav =
    location.pathname === '/' ||
    location.pathname.startsWith('/community/') ||
    location.pathname === '/publish' ||
    location.pathname === '/profile/posts' ||
    location.pathname === '/profile/messages' ||
    location.pathname === '/checkin/exercise-records' ||
    location.pathname === '/checkin/positive-records' ||
    location.pathname === '/checkin/positive' ||
    location.pathname === '/points/records' ||
    location.pathname === '/profile/feedback' ||
    location.pathname === '/login'

  const bottomNavVisible = isLoggedIn && !hideBottomNav && !suppressBottomNav

  // 未登录时仅允许访问默认页（登录页），其余重定向到 /
  if (!isLoggedIn && location.pathname !== '/' && location.pathname !== '/login') {
    return <Navigate to="/" replace />
  }

  return (
    <BottomNavSuppressContext.Provider value={setSuppressBottomNav}>
      <div className={`app-container${bottomNavVisible ? '' : ' app-container--no-bottom-nav'}`}>
      <Routes>
        {/* 默认页：未登录显示登录页，已登录跳转首页 */}
        <Route path="/" element={
          isLoggedIn
            ? <Navigate to="/home" replace />
            : <LoginPage onLogin={onLogin} />
        } />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/checkin/exercise-records" element={<ExerciseRecordsPage />} />
        <Route path="/checkin/positive" element={<PositiveCheckInPage />} />
        <Route path="/checkin/positive-records" element={<PositiveRecordsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:postId" element={<PostDetailPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage onLogout={onLogout} />} />
        <Route path="/profile/posts" element={<MyPostsPage onBack={() => window.history.back()} />} />
        <Route path="/profile/messages" element={<MyMessagesPage onBack={() => window.history.back()} />} />
        <Route path="/profile/feedback" element={<FeedbackPage />} />
        <Route path="/points/records" element={<PointsRecordsPage />} />
      </Routes>

      {bottomNavVisible && (
        <nav className="bottom-nav">
          <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Home size={22} />
            <span>首页</span>
          </NavLink>
          <NavLink to="/checkin" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <CheckCircle size={22} />
            <span>打卡</span>
          </NavLink>
          <NavLink to="/community" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={22} />
            <span>圈子</span>
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Trophy size={22} />
            <span>排行</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <User size={22} />
            <span>我的</span>
          </NavLink>
        </nav>
      )}
      </div>
    </BottomNavSuppressContext.Provider>
  )
}

function App() {
  // 登录态由 JWT 驱动：本地存 ep_token，有 token 视为已登录
  const [isLoggedIn, setIsLoggedIn] = useState(() => authApi.isLoggedIn())

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    authApi.logout()
    setIsLoggedIn(false)
  }

  return (
    <BrowserRouter>
      <AppContent isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} />
    </BrowserRouter>
  )
}

export default App
