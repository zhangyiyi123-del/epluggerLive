import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as authApi from '../api/auth'
import type { LoginResponse } from '../api/auth'

const ssoExchangeInFlight = new Map<string, Promise<LoginResponse>>()

/**
 * epWorkApp SSO：后端 302 到本页 ?code=...，用 code 换圈内 JWT。
 */
export default function SsoCallbackPage({ onLogin }: { onLogin: () => void }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('正在登录…')
  useEffect(() => {
    const reason = searchParams.get('reason')
    if (reason) {
      setMessage('登录失败，请返回重试')
      return
    }
    const code = searchParams.get('code')
    if (!code) {
      setMessage('缺少授权码，无法完成登录')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        let promise = ssoExchangeInFlight.get(code)
        if (!promise) {
          promise = authApi.exchangeSsoCode(code)
          ssoExchangeInFlight.set(code, promise)
        }
        const res = await promise
        authApi.saveLogin(res)
        if (!cancelled) {
          onLogin()
          navigate('/home', { replace: true })
        }
      } catch {
        if (!cancelled) {
          setMessage('登录失败，请关闭页面或返回首页重试')
        }
      } finally {
        ssoExchangeInFlight.delete(code)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, navigate, onLogin])

  return (
    <div className="sso-callback" style={{ padding: '2rem', textAlign: 'center' }}>
      <p>{message}</p>
    </div>
  )
}
