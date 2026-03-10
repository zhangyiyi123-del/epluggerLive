import { useState, useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageLightboxProps {
  images: string[]
  initialIndex?: number
  onClose: () => void
}

export default function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(
    Math.min(Math.max(0, initialIndex), images.length - 1)
  )
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? images.length - 1 : i - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setIndex((i) => (i >= images.length - 1 ? 0 : i + 1))
  }, [images.length])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    },
    [onClose, goPrev, goNext]
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => handleKeyDown(e)
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKeyDown])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const minSwipe = 50
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  const onTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return
    const diff = touchStart - touchEnd
    if (Math.abs(diff) < minSwipe) return
    if (diff > 0) goNext()
    else goPrev()
    setTouchStart(null)
    setTouchEnd(null)
  }

  if (images.length === 0) return null

  const current = images[index]

  return (
    <div
      className="image-lightbox-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      <button
        type="button"
        className="image-lightbox-close"
        onClick={onClose}
        aria-label="关闭"
      >
        <X size={28} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="image-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            aria-label="上一张"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            type="button"
            className="image-lightbox-next"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            aria-label="下一张"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div
        className="image-lightbox-content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img src={current} alt="" className="image-lightbox-img" draggable={false} />
      </div>

      {images.length > 1 && (
        <div className="image-lightbox-indicator">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
