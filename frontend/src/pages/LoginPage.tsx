import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Smartphone, ChevronRight } from 'lucide-react'
import * as authApi from '../api/auth'

interface LoginPageProps {
  onLogin: () => void
}

/** 当前仅支持密码登录，短信登录暂未开放 */
export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState('')

  const validate = () => {
    const errs: { phone?: string; password?: string } = {}
    if (!phone || !/^1\d{10}$/.test(phone)) {
      errs.phone = '请输入正确的手机号'
    }
    if (!password) {
      errs.password = '请输入密码'
    }
    setErrors(errs)
    setSubmitError('')
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      const res = await authApi.login(phone.trim(), password)
      authApi.saveLogin(res)
      onLogin()
      navigate('/home', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* 顶部品牌区 */}
      <div className="login-hero">
        <div className="login-logo">
          <div className="login-logo-icon">EP</div>
        </div>
        <h1 className="login-brand">易普圈</h1>
        <p className="login-slogan">企业正向激励社区</p>
      </div>

      {/* 登录卡片（当前仅支持密码登录） */}
      <div className="login-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <div className={`login-input-wrap ${errors.phone ? 'error' : ''}`}>
              <Smartphone size={18} className="login-input-icon" />
              <input
                type="tel"
                className="login-input"
                placeholder="请输入手机号"
                value={phone}
                maxLength={11}
                onChange={e => { setPhone(e.target.value); setErrors(ev => ({ ...ev, phone: undefined })); setSubmitError('') }}
              />
            </div>
            {errors.phone && <p className="login-error">{errors.phone}</p>}
          </div>

          <div className="login-field">
            <div className={`login-input-wrap ${errors.password ? 'error' : ''}`}>
              <Lock size={18} className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="请输入密码"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(ev => ({ ...ev, password: undefined })); setSubmitError('') }}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="login-error">{errors.password}</p>}
          </div>

          <div className="login-forgot">
            <button type="button" className="login-forgot-btn">忘记密码？</button>
          </div>

          {submitError && <p className="login-error" style={{ marginBottom: 8 }}>{submitError}</p>}

          <button
            type="submit"
            className={`login-submit ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* 企业 SSO（前端暂时隐藏，恢复显示时去掉外层 style） */}
        <div className="login-enterprise-sso" style={{ display: 'none' }} aria-hidden="true">
          <div className="login-divider">
            <span>其他登录方式</span>
          </div>
          <button type="button" className="login-sso-btn">
            <div className="login-sso-icon">企</div>
            企业统一认证登录（SSO）
            <ChevronRight size={16} className="login-sso-arrow" />
          </button>
        </div>
      </div>

      {/* 底部协议 */}
      <p className="login-agreement">
        登录即代表同意
        <button type="button" className="login-link">《用户协议》</button>
        和
        <button type="button" className="login-link">《隐私政策》</button>
      </p>
    </div>
  )
}
