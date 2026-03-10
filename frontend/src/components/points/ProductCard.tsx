import { AlertCircle } from 'lucide-react'
import type { Product } from '../../types/points'

interface ProductCardProps {
  product: Product
  userPoints: number
  userLevel: number
  onExchange?: (product: Product) => void
}

export default function ProductCard({ product, userPoints, userLevel, onExchange }: ProductCardProps) {
  const canExchange = 
    userPoints >= product.points &&
    userLevel >= product.minLevel &&
    product.status === 'available' &&
    product.stock > 0

  const getProductTypeLabel = () => {
    switch (product.type) {
      case 'physical': return '实物'
      case 'virtual': return '虚拟'
      case 'honor': return '荣誉'
    }
  }

  const getStatusLabel = () => {
    switch (product.status) {
      case 'available': return null
      case 'low-stock': return { text: '库存紧张', class: 'warning' }
      case 'out-of-stock': return { text: '已售罄', class: 'danger' }
      case 'offline': return { text: '已下架', class: 'disabled' }
    }
  }

  const statusInfo = getStatusLabel()

  return (
    <div className={`product-card ${!canExchange ? 'disabled' : ''}`}>
      {/* 商品图片 */}
      <div className="product-image">
        <span className="product-emoji">{product.image}</span>
        {statusInfo && (
          <div className={`product-status-badge ${statusInfo.class}`}>
            {statusInfo.text}
          </div>
        )}
      </div>

      {/* 商品信息 */}
      <div className="product-info">
        <div className="product-header">
          <span className="product-name">{product.name}</span>
          <span className="product-type-badge">{getProductTypeLabel()}</span>
        </div>
        <p className="product-desc">{product.description}</p>
        
        <div className="product-stock">
          库存: {product.stock > 0 ? product.stock : '无'}
        </div>
      </div>

      {/* 兑换区域 */}
      <div className="product-action">
        <div className="product-points">
          <span className="points-value">{product.points}</span>
          <span className="points-unit">积分</span>
        </div>
        
        {!canExchange && userLevel < product.minLevel && (
          <div className="exchange-limit-hint">
            <AlertCircle size={12} />
            <span>Lv{product.minLevel}可兑换</span>
          </div>
        )}

        <button 
          className="exchange-btn"
          disabled={!canExchange}
          onClick={() => canExchange && onExchange?.(product)}
        >
          兑换
        </button>
      </div>
    </div>
  )
}
