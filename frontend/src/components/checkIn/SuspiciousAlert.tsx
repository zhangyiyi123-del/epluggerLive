import { AlertTriangle, Clock, Image, RefreshCw, Info } from 'lucide-react'
import type { CheckInRecord } from '../../types/checkIn'

interface SuspiciousAlertProps {
  record: CheckInRecord
  onRequestResubmit?: () => void
}

export default function SuspiciousAlert({ record, onRequestResubmit }: SuspiciousAlertProps) {
  const getSuspiciousReasons = () => {
    const reasons: { icon: typeof Clock; text: string }[] = []
    
    if (record.suspiciousReason) {
      if (record.suspiciousReason.includes('图片')) {
        reasons.push({
          icon: Image,
          text: '上传图片高度相似，疑似重复使用'
        })
      }
      if (record.suspiciousReason.includes('时间')) {
        reasons.push({
          icon: Clock,
          text: '同一时间段内多次提交不同运动类型'
        })
      }
      if (record.suspiciousReason.includes('刷屏')) {
        reasons.push({
          icon: RefreshCw,
          text: '1小时内多次提交打卡记录'
        })
      }
    }
    
    return reasons
  }

  const getStatusConfig = () => {
    switch (record.status) {
      case 'suspicious':
        return {
          type: 'warning',
          title: '打卡记录待审核',
          description: '您的打卡记录已被系统标记为可疑，需要管理员审核确认。',
          actionText: '补充佐证材料',
          actionPrimary: true,
        }
      case 'pending_review':
        return {
          type: 'info',
          title: '审核中',
          description: '您的打卡记录正在等待管理员审核，请耐心等待。',
          actionText: null,
          actionPrimary: false,
        }
      case 'rejected':
        return {
          type: 'error',
          title: '打卡无效',
          description: '管理员审核未通过，请检查打卡记录后重新提交。',
          actionText: '重新打卡',
          actionPrimary: true,
        }
      default:
        return null
    }
  }

  const statusConfig = getStatusConfig()
  const reasons = getSuspiciousReasons()

  if (!statusConfig) return null

  return (
    <div className={`suspicious-alert ${statusConfig.type}`}>
      <div className="suspicious-alert-header">
        <AlertTriangle size={20} />
        <span className="suspicious-alert-title">{statusConfig.title}</span>
      </div>
      
      <p className="suspicious-alert-description">{statusConfig.description}</p>
      
      {reasons.length > 0 && (
        <div className="suspicious-reasons">
          {reasons.map((reason, index) => (
            <div key={index} className="suspicious-reason">
              <reason.icon size={14} />
              <span>{reason.text}</span>
            </div>
          ))}
        </div>
      )}
      
      {statusConfig.actionText && onRequestResubmit && (
        <button 
          className={`suspicious-alert-action ${statusConfig.actionPrimary ? 'btn btn-primary' : 'btn btn-secondary'}`}
          onClick={onRequestResubmit}
        >
          {statusConfig.actionText}
        </button>
      )}
      
      <div className="suspicious-alert-hint">
        <Info size={14} />
        <span>如有疑问，请联系HR或管理员</span>
      </div>
    </div>
  )
}
