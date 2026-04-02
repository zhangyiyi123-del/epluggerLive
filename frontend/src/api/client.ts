/**
 * API 基础地址与请求封装。
 * 优先使用 VITE_API_BASE_URL；未设置时默认跟随当前页面主机并使用 8080 端口。
 * 例如页面在 http://172.16.0.162:5173 时，默认请求 http://172.16.0.162:8080。
 */
function resolveBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const protocol = window.location.protocol || 'http:'
    return `${protocol}//${window.location.hostname}:8080`
  }
  return 'http://localhost:8080'
}

const BASE_URL = resolveBaseUrl()

const AUTH_TOKEN_KEY = 'ep_token'

export function getApiBaseUrl(): string {
  return BASE_URL.replace(/\/$/, '')
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token == null) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<{ data: T; ok: true } | { ok: false; status: number; error: ApiError }> {
  const { token, ...init } = options
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  }
  const t = token !== undefined ? token : getStoredToken()
  if (t) {
    headers['Authorization'] = `Bearer ${t}`
  }

  const res = await fetch(url, { ...init, headers })
  const text = await res.text()
  let body: ApiError | unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as ApiError | unknown
    } catch {
      body = { message: text }
    }
  }

  if (res.ok) {
    return { ok: true, data: (body as T) ?? ({} as T) }
  }

  const error: ApiError =
    body && typeof body === 'object' && 'code' in body && 'message' in body
      ? (body as ApiError)
      : { code: 'ERROR', message: (body as { message?: string })?.message || res.statusText || '请求失败' }

  // 开发时打印完整响应，便于排查（报错时可把控制台这行输出贴给开发者）
  if (import.meta.env?.DEV) {
    console.warn(`[API] ${res.status} ${options.method ?? 'GET'} ${path}`, { body: text || null, error })
  }
  return { ok: false, status: res.status, error }
}
