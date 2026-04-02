import { useMemo, useState } from 'react'

interface AvatarProps {
  name?: string
  avatar?: string
  className?: string
}

/**
 * 通用头像：优先显示图片，加载失败时回退首字母。
 */
export default function Avatar({ name, avatar, className = 'avatar' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const fallback = useMemo(() => (name && name.length > 0 ? name.slice(0, 1) : '我'), [name])
  const useImage = !!avatar && !imgError

  return (
    <div
      className={className}
      style={{
        overflow: 'hidden',
        flexShrink: 0,
        background: useImage
          ? 'transparent'
          : 'linear-gradient(135deg, var(--primary-light), var(--primary-color))',
      }}
    >
      {useImage ? (
        <img
          src={avatar}
          alt={name || '头像'}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      ) : (
        fallback
      )}
    </div>
  )
}

