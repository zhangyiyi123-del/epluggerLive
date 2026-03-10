import { useState } from 'react'
import { Coins, Gift, ShoppingBag, History, ChevronLeft } from 'lucide-react'
import type { Product, Order, UserPoints } from '../types/points'
import { MOCK_PRODUCTS, MOCK_USER_POINTS, MOCK_ORDERS, LEVEL_CONFIGS } from '../types/points'
import ProductCard from '../components/points/ProductCard'
import ExchangeModal from '../components/points/ExchangeModal'
import OrderList from '../components/points/OrderList'
import PointsDetailModal from '../components/points/PointsDetailModal'

type MallTab = 'mall' | 'orders'

type ProductFilter = 'all' | 'physical' | 'virtual' | 'honor' | 'affordable'

interface PointsMallPageProps {
  /** 从排行/积分中心进入时传入，点击返回会调用 */
  onBack?: () => void
}

export default function PointsMallPage({ onBack }: PointsMallPageProps) {
  const [activeTab, setActiveTab] = useState<MallTab>('mall')
  const [productFilter, setProductFilter] = useState<ProductFilter>('all')
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [userPoints, setUserPoints] = useState<UserPoints>(MOCK_USER_POINTS)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // 根据等级获取可兑换的积分范围
  const getUserExchangeRange = () => {
    const levelConfig = LEVEL_CONFIGS[userPoints.level - 1]
    return { min: levelConfig.minExchangeValue, max: levelConfig.maxExchangeValue }
  }

  // 过滤商品
  const filteredProducts = products.filter(product => {
    // 过滤等级
    if (userPoints.level < product.minLevel) return false
    
    // 过滤类型
    if (productFilter !== 'all') {
      if (productFilter === 'affordable') {
        const range = getUserExchangeRange()
        return product.points >= range.min && 
               product.points <= range.max && 
               product.stock > 0 &&
               product.status === 'available'
      }
      return product.type === productFilter
    }
    
    // 全部时只显示可兑换的
    return product.stock > 0 && product.status === 'available'
  })

  // 按积分排序
  const sortedProducts = [...filteredProducts].sort((a, b) => a.points - b.points)

  // 处理兑换
  const handleExchange = async (product: Product) => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 扣减积分
    setUserPoints(prev => ({
      ...prev,
      availablePoints: prev.availablePoints - product.points,
      totalUsedPoints: prev.totalUsedPoints + product.points
    }))

    // 创建订单
    const newOrder = {
      id: `o${Date.now()}`,
      orderNo: `P${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12)}`,
      product,
      pointsSpent: product.points,
      status: 'pending' as const,
      redeemedAt: new Date().toISOString(),
      userName: '我',
      userId: userPoints.userId,
      pickupCode: product.type === 'physical' ? `PK${Date.now().toString().slice(-6)}` : undefined
    }

    setOrders([newOrder, ...orders])

    // 更新商品库存
    setProducts(prev => prev.map(p => 
      p.id === product.id 
        ? { ...p, stock: p.stock - 1 }
        : p
    ))
  }

  // 取消订单
  const handleCancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    if (!confirm('确定要取消订单吗？取消后积分将原路返回。')) return

    // 恢复积分
    setUserPoints(prev => ({
      ...prev,
      availablePoints: prev.availablePoints + order.pointsSpent,
      totalUsedPoints: prev.totalUsedPoints - order.pointsSpent
    }))

    // 恢复库存
    setProducts(prev => prev.map(p => 
      p.id === order.product.id 
        ? { ...p, stock: p.stock + 1 }
        : p
    ))

    // 更新订单状态
    setOrders(prev => prev.map(o => 
      o.id === orderId 
        ? { ...o, status: 'cancelled' as const }
        : o
    ))
  }

  const getFilterLabel = (filter: ProductFilter) => {
    switch (filter) {
      case 'all': return '全部'
      case 'physical': return '实物'
      case 'virtual': return '虚拟'
      case 'honor': return '荣誉'
      case 'affordable': return '我能换'
    }
  }

  return (
    <div className={`page ${onBack ? 'page-points-mall-with-header' : ''}`}>
      {/* 参考积分中心：顶部标题 + 返回按钮 */}
      {onBack && (
        <div className="publish-header">
          <button type="button" className="publish-back-btn" onClick={onBack}>
            <ChevronLeft size={22} />
          </button>
          <div className="publish-header-title">积分商城</div>
          <div style={{ width: 44 }} />
        </div>
      )}

      <div className="points-mall-page">
      {/* 头部积分展示 */}
      <div className="mall-header">
        <div className="mall-header-content">
          <div className="header-left">
            <Coins size={24} />
            <div className="header-points">
              <span className="points-label">我的积分</span>
              <span className="points-value">{userPoints.availablePoints}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="level-badge">Lv{userPoints.level}</div>
          </div>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="mall-tabs">
        <button 
          className={`mall-tab ${activeTab === 'mall' ? 'active' : ''}`}
          onClick={() => setActiveTab('mall')}
        >
          <ShoppingBag size={18} />
          <span>积分商城</span>
        </button>
        <button 
          className={`mall-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <History size={18} />
          <span>兑换记录</span>
          {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
        </button>
      </div>

      {/* 商城内容 */}
      {activeTab === 'mall' && (
        <div className="mall-content">
          {/* 商品筛选 */}
          <div className="product-filters">
            {(['all', 'affordable', 'physical', 'virtual', 'honor'] as ProductFilter[]).map(filter => (
              <button
                key={filter}
                className={`filter-pill ${productFilter === filter ? 'active' : ''}`}
                onClick={() => setProductFilter(filter)}
              >
                {getFilterLabel(filter)}
              </button>
            ))}
          </div>

          {/* 商品列表 */}
          <div className="product-grid">
            {sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                userPoints={userPoints.availablePoints}
                userLevel={userPoints.level}
                onExchange={setSelectedProduct}
              />
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="empty-mall">
              <Gift size={48} />
              <p>暂无符合条件的商品</p>
              <p className="hint">提升等级或积累更多积分来兑换商品</p>
            </div>
          )}
        </div>
      )}

      {/* 订单记录 */}
      {activeTab === 'orders' && (
        <div className="orders-content">
          <OrderList 
            orders={orders} 
            onCancel={handleCancelOrder}
          />
        </div>
      )}

      {/* 兑换弹窗 */}
      {selectedProduct && (
        <ExchangeModal
          product={selectedProduct}
          userPoints={userPoints.availablePoints}
          onConfirm={() => handleExchange(selectedProduct)}
          onCancel={() => setSelectedProduct(null)}
        />
      )}

      {/* 积分明细弹窗 */}
      {showDetailModal && (
        <PointsDetailModal onClose={() => setShowDetailModal(false)} />
      )}
      </div>
    </div>
  )
}
