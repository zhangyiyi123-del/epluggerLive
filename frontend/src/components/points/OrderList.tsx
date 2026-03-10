import { Package, Gift, CreditCard, Clock, CheckCircle, X, Truck, Ban } from 'lucide-react'
import type { Order, OrderStatus } from '../../types/points'

interface OrderListProps {
  orders: Order[]
  onCancel?: (orderId: string) => void
}

export default function OrderList({ orders, onCancel }: OrderListProps) {
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'delivered': return <Truck size={16} />
      case 'completed': return <CheckCircle size={16} />
      case 'cancelled': return <Ban size={16} />
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '待发放'
      case 'delivered': return '已发放'
      case 'completed': return '已完成'
      case 'cancelled': return '已取消'
    }
  }

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'delivered': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'disabled'
    }
  }

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'physical': return <Package size={16} />
      case 'virtual': return <CreditCard size={16} />
      case 'honor': return <Gift size={16} />
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (orders.length === 0) {
    return (
      <div className="order-list empty">
        <div className="empty-icon">📦</div>
        <p>暂无兑换记录</p>
        <p className="empty-hint">快去商城兑换喜欢的商品吧</p>
      </div>
    )
  }

  return (
    <div className="order-list">
      {orders.map(order => (
        <div key={order.id} className="order-item">
          {/* 订单头部 */}
          <div className="order-header">
            <span className="order-no">{order.orderNo}</span>
            <span className={`order-status ${getStatusClass(order.status)}`}>
              {getStatusIcon(order.status)}
              {getStatusLabel(order.status)}
            </span>
          </div>

          {/* 商品信息 */}
          <div className="order-product">
            <span className="product-emoji">{order.product.image}</span>
            <div className="product-info">
              <div className="product-name">
                {getProductIcon(order.product.type)}
                {order.product.name}
              </div>
              <div className="product-type">
                {order.product.type === 'physical' ? '实物' : 
                 order.product.type === 'virtual' ? '虚拟' : '荣誉'}
              </div>
            </div>
            <div className="product-points">
              -{order.pointsSpent}分
            </div>
          </div>

          {/* 领取码 */}
          {order.pickupCode && (
            <div className="pickup-code">
              <span className="code-label">领取码:</span>
              <span className="code-value">{order.pickupCode}</span>
            </div>
          )}

          {/* 订单时间 */}
          <div className="order-time">
            <span>兑换时间: {formatDate(order.redeemedAt)}</span>
            {order.deliveredAt && (
              <span>发放时间: {formatDate(order.deliveredAt)}</span>
            )}
          </div>

          {/* 取消按钮 */}
          {order.status === 'pending' && onCancel && (
            <button 
              className="cancel-order-btn"
              onClick={() => onCancel(order.id)}
            >
              <X size={14} />
              取消订单
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
