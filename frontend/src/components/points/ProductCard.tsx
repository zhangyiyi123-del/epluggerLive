import type { Product } from '../../types/points'

interface ProductCardProps {
  product: Product
  userPoints: number
  onExchange?: (product: Product) => void
  /** 商城占位：敬请期待、横向积分、兑换灰钮 */
  placeholder?: boolean
}

export default function ProductCard({ product, userPoints, onExchange, placeholder }: ProductCardProps) {
  const canExchange =
    !placeholder &&
    userPoints >= product.points &&
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

  const statusInfo = placeholder ? null : getStatusLabel()

  return (
    <div className={`product-card ${placeholder ? 'product-card--placeholder' : ''} ${!placeholder && !canExchange ? 'disabled' : ''}`}>
      <div className={`product-image ${placeholder ? 'product-image--placeholder' : ''}`}>
        {placeholder ? (
          <span className="product-placeholder-caption">敬请期待</span>
        ) : (
          <span className="product-emoji">{product.image}</span>
        )}
        {statusInfo && (
          <div className={`product-status-badge ${statusInfo.class}`}>
            {statusInfo.text}
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-header">
          <span className="product-name">{placeholder ? '商品待上架' : product.name}</span>
          {!placeholder && <span className="product-type-badge">{getProductTypeLabel()}</span>}
        </div>
        {!placeholder && (
          <>
            <p className="product-desc">{product.description}</p>
            <div className="product-stock">
              库存: {product.stock > 0 ? product.stock : '无'}
            </div>
          </>
        )}
      </div>

      <div className="product-action">
        {placeholder ? (
          <div className="product-points-row">
            <span className="product-points-dash">—</span>
          </div>
        ) : (
          <div className="product-points">
            <span className="points-value">{product.points}</span>
            <span className="points-unit">积分</span>
          </div>
        )}

        <button
          type="button"
          className={`exchange-btn ${placeholder ? 'exchange-btn--placeholder' : ''}`}
          disabled={!canExchange}
          onClick={() => canExchange && onExchange?.(product)}
        >
          兑换
        </button>
      </div>
    </div>
  )
}
