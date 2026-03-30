import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Calendar } from 'lucide-react'
import type { PointsRecord } from '../types/points'
import { getPointsRecords } from '../api/points'
import {
  getPointsRecordIcon,
  getPointsRecordTypeLabel,
  isPointsRecordIncome,
} from '../components/points/pointsRecordMeta'
import {
  isInLocalNaturalMonth,
  isInLocalNaturalWeek,
  isLocalNaturalDay,
} from '../utils/calendarRange'

type FilterType = 'all' | 'today' | 'week' | 'month' | 'income' | 'expense'

const PAGE_SIZE = 50
const MAX_PAGES = 40

export default function PointsRecordsPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<PointsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    ;(async () => {
      const all: PointsRecord[] = []
      try {
        let page = 0
        while (!cancelled && page < MAX_PAGES) {
          const res = await getPointsRecords(page, PAGE_SIZE)
          const chunk = res.content ?? []
          all.push(...chunk)
          const totalPages = res.totalPages ?? 0
          if (chunk.length === 0 || page >= totalPages - 1) break
          page += 1
        }
        if (!cancelled) setRecords(all)
      } catch {
        if (!cancelled) {
          setLoadError('加载失败，请稍后重试')
          setRecords([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredRecords = useMemo(() => {
    const now = new Date()
    return records.filter((record) => {
      const recordDate = new Date(record.createdAt)
      switch (filter) {
        case 'today':
          return isLocalNaturalDay(recordDate, now)
        case 'week':
          return isInLocalNaturalWeek(recordDate, now)
        case 'month':
          return isInLocalNaturalMonth(recordDate, now)
        case 'income':
          return isPointsRecordIncome(record)
        case 'expense':
          return !isPointsRecordIncome(record)
        default:
          return true
      }
    })
  }, [records, filter])

  const totalIncome = useMemo(
    () => filteredRecords.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0),
    [filteredRecords]
  )
  const totalExpense = useMemo(
    () =>
      filteredRecords.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0),
    [filteredRecords]
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="page page-points-center points-records-full-page">
      <div className="publish-header">
        <button
          type="button"
          className="publish-back-btn"
          onClick={() => navigate('/leaderboard', { state: { openPointsCenter: true } })}
          aria-label="返回积分中心"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="publish-header-title">积分明细</div>
        <div style={{ width: 44 }} />
      </div>

      <div className="publish-content points-records-full-page__body">
        {loadError && (
          <div className="section" style={{ padding: 12, marginBottom: 8, background: 'var(--surface-warn)' }}>
            <p style={{ margin: 0 }}>{loadError}</p>
          </div>
        )}

        <div className="points-records-filter-strip points-records-full-page__filters">
          <div className="filter-tabs points-records-filter-tabs">
            <button
              type="button"
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'income' ? 'active' : ''}`}
              onClick={() => setFilter('income')}
            >
              收入
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'expense' ? 'active' : ''}`}
              onClick={() => setFilter('expense')}
            >
              支出
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >
              今日
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >
              本周
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'month' ? 'active' : ''}`}
              onClick={() => setFilter('month')}
            >
              本月
            </button>
          </div>
        </div>

        <div className="detail-stats detail-stats--cards">
          <div className="detail-stat-card detail-stat-card--income">
            <span className="stat-label">收入</span>
            <span className="stat-value">+{totalIncome}</span>
          </div>
          <div className="detail-stat-card detail-stat-card--expense">
            <span className="stat-label">支出</span>
            <span className="stat-value">-{totalExpense}</span>
          </div>
        </div>

        <div className="detail-records points-records-full-page__list">
          {loading ? (
            <div className="no-records">
              <p>加载中...</p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const income = isPointsRecordIncome(record)
              return (
                <div
                  key={record.id}
                  className={`detail-record ${income ? 'income' : 'expense'}`}
                >
                  <div className="record-icon">{getPointsRecordIcon(record.type)}</div>
                  <div className="record-content">
                    <div className="record-header">
                      <span className="record-type">{getPointsRecordTypeLabel(record.type)}</span>
                    </div>
                    <div className="record-desc">{record.description}</div>
                    <div className="record-time">
                      <Calendar size={12} />
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                  <div className="record-amount-stack">
                    <div className={`record-amount ${income ? 'positive' : 'negative'}`}>
                      {income ? '+' : ''}
                      {record.amount}
                    </div>
                    <div className="record-balance">余额 {record.balance}</div>
                  </div>
                </div>
              )
            })
          )}
          {!loading && filteredRecords.length === 0 && (
            <div className="no-records">
              <p>暂无记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
