import { apiRequest } from './client'

export async function submitFeedback(content: string): Promise<{ id: number; ok: boolean }> {
  const result = await apiRequest<{ id: number; ok: boolean }>('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
  if (!result.ok) {
    throw new Error(result.error.message || '提交失败')
  }
  return result.data
}
