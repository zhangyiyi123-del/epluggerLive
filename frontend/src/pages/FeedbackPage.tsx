import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { submitFeedback } from '../api/feedback'

export default function FeedbackPage() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  const handleSubmit = async () => {
    const text = content.trim()
    if (!text) {
      setSubmitError('请填写反馈内容')
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      await submitFeedback(text)
      setSuccessOpen(true)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const closeSuccessAndLeave = () => {
    setSuccessOpen(false)
    navigate('/profile', { replace: true })
  }

  return (
    <div className="page page-feedback">
      <div className="publish-header">
        <button type="button" className="publish-back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={22} />
        </button>
        <div className="publish-header-title">问题反馈</div>
        <div style={{ width: 44 }} />
      </div>

      <div className="publish-content feedback-page-body">
        <p className="feedback-page-hint">
          描述你遇到的问题或建议，我们会尽快查看。
        </p>
        <label className="feedback-page-label" htmlFor="feedback-content">
          反馈内容 <span className="feedback-required">*</span>
        </label>
        <textarea
          id="feedback-content"
          className="feedback-textarea"
          rows={8}
          maxLength={8000}
          placeholder="例如：某功能无法使用、界面建议、积分疑问等"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (submitError) setSubmitError(null)
          }}
          disabled={submitting}
          aria-invalid={!!submitError}
        />
        <div className="feedback-char-count">{content.length} / 8000</div>

        {submitError && (
          <p className="feedback-inline-error" role="alert">
            {submitError}
          </p>
        )}

        <button
          type="button"
          className="btn btn-primary feedback-submit-btn"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '提交中…' : '提交反馈'}
        </button>
      </div>

      {successOpen && (
        <div
          className="confirm-dialog-overlay"
          onClick={closeSuccessAndLeave}
          role="presentation"
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-success-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-dialog-content">
              <div className="confirm-dialog-icon confirm-dialog-icon--success" aria-hidden>
                <CheckCircle2 size={26} strokeWidth={2} />
              </div>
              <p id="feedback-success-title" className="confirm-dialog-title">
                提交成功
              </p>
              <p className="confirm-dialog-message">
                感谢你的反馈，我们会尽快查看和处理。
              </p>
            </div>
            <div className="confirm-dialog-actions confirm-dialog-actions--single">
              <button
                type="button"
                className="confirm-dialog-btn confirm-dialog-btn--success-ok"
                onClick={closeSuccessAndLeave}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
