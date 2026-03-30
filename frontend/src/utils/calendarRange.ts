/**
 * 本地时区下的「自然日 / 自然周 / 自然月」边界，与运动/正向记录、排行榜（周一为周起始）一致。
 */

export function startOfLocalDay(reference: Date = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), reference.getDate())
}

/** 本周一 0:00（ISO 周：周一为一周开始） */
export function startOfLocalWeekMonday(reference: Date = new Date()): Date {
  const startOfToday = startOfLocalDay(reference)
  const dayIndexFromMonday = (reference.getDay() + 6) % 7
  const start = new Date(startOfToday)
  start.setDate(start.getDate() - dayIndexFromMonday)
  return start
}

/** 当月 1 日 0:00 */
export function startOfLocalMonth(reference: Date = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1)
}

export function isLocalNaturalDay(recordDate: Date, reference: Date = new Date()): boolean {
  if (Number.isNaN(recordDate.getTime())) return false
  const start = startOfLocalDay(reference)
  const next = new Date(start)
  next.setDate(next.getDate() + 1)
  return recordDate >= start && recordDate < next
}

export function isInLocalNaturalWeek(recordDate: Date, reference: Date = new Date()): boolean {
  if (Number.isNaN(recordDate.getTime())) return false
  return recordDate >= startOfLocalWeekMonday(reference)
}

export function isInLocalNaturalMonth(recordDate: Date, reference: Date = new Date()): boolean {
  if (Number.isNaN(recordDate.getTime())) return false
  return recordDate >= startOfLocalMonth(reference)
}
