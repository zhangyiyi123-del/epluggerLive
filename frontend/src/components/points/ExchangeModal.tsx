import { useState } from 'react'
import { ShoppingBag, CreditCard, Award, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react'
import type { Product } from '../../types/points'

interface ExchangeModalProps {
  product: Product
  userPoints: number
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function ExchangeModal({ product, userPoints, onConfirm, onCancel }: ExchangeModalProps) {
  const [isExchanging, setIsExchanging] = useState(false)
  const [exchangeSuccess, setExchangeSuccess] = useState(false)
  const [orderNo, setOrderNo] = useState('')

  const handleExchange = async () => {
    setIsExchanging(true)
    try {
      await onConfirm()
      setOrderNo(`P${Date.now()}`)
      setExchangeSuccess(true)
    } catch (error) {
      alert('兑换失败，请重试')
    } finally {
      setIsExchanging(false)
    }
  }

  const getProductIcon = () => {
    switch (product.type) {
      case 'physical': return <ShoppingBag size={24} />
      case 'virtual': return <CreditCard size={24} />
      case 'honor': return <Award size={24} />
    }
  }

  const getDeliveryMethod = () => {
    switch (product.type) {
      case 'physical': return '凭工号到公司行政部领取'
      case 'virtual': return 'APP内查看兑换码/一键充值'
      case 'honor': return '行政通知领取，荣誉同步至主页'
    }
  }

  // 兑换成功
  if (exchangeSuccess) {
    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="exchange-modal success" onClick={e => e.stopPropagation()}>
          <div className="success-icon">
            <CheckCircle size={48} />
          </div>
          <h3>兑换成功!</h3>
          <p className="order-no">订单编号: {orderNo}</p>
          
          <div className="success-product">
            <span className="product-emoji">{product.image}</span>
            <span>{product.name}</span>
          </div>

          <div className="delivery-info">
            <h4>领取方式</h4>
            <p>{getDeliveryMethod()}</p>
          </div>

          <div className="points-spent">
            消耗积分: <span>-{product.points}</span>
          </div>

          <div className="remaining-points">
            剩余积分: {userPoints - product.points}
          </div>

          <button className="btn btn-primary" onClick={onCancel}>
            完成
          </button>
        </div>
      </div>
    )
  }

  // 兑换确认
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="exchange-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <h3>确认兑换</h3>
        </div>

        {/* 商品信息 */}
        <div className="exchange-product">
          <div className="product-icon">
            {getProductIcon()}
          </div>
          <div className="product-detail">
            <div className="product-name">{product.name}</div>
            <div className="product-desc">{product.description}</div>
          </div>
        </div>

        {/* 积分信息 */}
        <div className="exchange-points-info">
          <div className="points-row">
            <span>当前积分</span>
            <span className="points-value">{userPoints}</span>
          </div>
          <div className="points-row">
            <span>商品积分</span>
            <span className="points-value minus">-{product.points}</span>
          </div>
          <div className="points-row total">
            <span>兑换后积分</span>
            <span className="points-value">{userPoints - product.points}</span>
          </div>
        </div>

        {/* 警告 */}
        {userPoints - product.points < 0 && (
          <div className="exchange-warning">
            <AlertTriangle size={16} />
            <span>积分不足，无法兑换</span>
          </div>
        )}

        {/* 库存警告 */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="stock-warning">
            <AlertTriangle size={16} />
            <span>库存仅剩 {product.stock} 件</span>
          </div>
        )}

        {/* 领取方式 */}
        <div className="delivery-method">
          <h4>领取方式</h4>
          <p>{getDeliveryMethod()}</p>
        </div>

        {/* 确认提示 */}
        <div className="confirm-tip">
          确认后积分立即扣减，除商品无货外不可撤销
        </div>

        {/* 按钮 */}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleExchange}
            disabled={isExchanging || userPoints < product.points}
          >
            {isExchanging ? (
              <>
                <Loader2 size={16} className="spinning" />
                兑换中...
              </>
            ) : (
              `确认兑换 (${product.points}积分)`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
