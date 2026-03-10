import { useState, useEffect } from 'react'
import { Coins, Gift, ShoppingBag, History, ChevronLeft } from 'lucide-react'
import type { Product, Order, UserPoints } from '../types/points'
import { MOCK_USER_POINTS, LEVEL_CONFIGS } from '../types/points'
import ProductCard from '../components/points/ProductCard'
import ExchangeModal from '../components/points/ExchangeModal'
import OrderList from '../components/points/OrderList'
import PointsDetailModal from '../components/points/PointsDetailModal'
import { getProducts, getMyOrders, placeOrder, getPointsMe } from '../api/points'

type MallTab = 'mall' | 'orders'

type ProductFilter = 'all' | 'physical' | 'virtual' | 'honor' | 'affordable'

interface PointsMallPageProps {
  /** 从排行/积分中心进入时传入，点击返回会调用 */
  onBack?: () => void
}

export default function PointsMallPage({ onBack }: PointsMallPageProps) {
  const [activeTab, setActiveTab] = useState<MallTab>('mall')
  const [productFilter, setProductFilter] = useState<ProductFilter>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [userPoints, setUserPoints] = useState<UserPoints>(MOCK_USER_POINTS)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProducts(), getMyOrders(0, 50), getPointsMe()]).then(([prods, ordsRes, points]) => {
      setProducts(prods ?? [])
      setOrders(ordsRes.content ?? [])
      if (points) setUserPoints(points)
    }).finally(() => setLoading(false))
  }, [])

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

  const loadData = () => {
    getProducts().then(setProducts)
    getMyOrders(0, 50).then((r) => setOrders(r.content))
    getPointsMe().then((p) => p && setUserPoints(p))
  }

  const handleExchange = async (product: Product) => {
    try {
      const newOrder = await placeOrder(product.id)
      if (newOrder) {
        setOrders((prev) => [newOrder, ...prev])
        loadData()
        setSelectedProduct(null)
      } else {
        alert('兑换失败，请检查积分或库存')
      }
    } catch {
      alert('兑换失败，请重试')
    }
  }

  const handleCancelOrder = (_orderId: string) => {
    // 后端暂无取消订单接口，仅前端占位
    if (confirm('确定要取消订单吗？取消后积分将原路返回。（当前版本暂不支持取消）')) return
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

          {loading && (
            <div className="empty-mall">
              <p>加载中...</p>
            </div>
          )}
          {!loading && sortedProducts.length === 0 && (
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
