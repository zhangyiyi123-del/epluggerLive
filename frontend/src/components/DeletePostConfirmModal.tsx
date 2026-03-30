import { Trash2 } from 'lucide-react'

interface DeletePostConfirmModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}

/**
 * 删除动态确认弹窗，视觉与「我的」页退出登录弹窗一致。
 */
export default function DeletePostConfirmModal({
  open,
  onCancel,
  onConfirm,
}: DeletePostConfirmModalProps) {
  if (!open) return null

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel} role="presentation">
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-content">
          <div className="confirm-dialog-icon" aria-hidden>
            <Trash2 size={22} strokeWidth={2} color="#EF4444" />
          </div>
          <p id="delete-post-confirm-title" className="confirm-dialog-title">
            确认删除这条动态？
          </p>
          <p className="confirm-dialog-message">删除后将无法恢复</p>
        </div>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-btn cancel" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="confirm-dialog-btn confirm" onClick={() => void onConfirm()}>
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
