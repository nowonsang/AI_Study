/**
 * v1 fixed category palette. Colors map to design tokens where possible,
 * supplementary hex values for non-token swatches (per plan §4.4 & §6.1).
 */
export const CATEGORIES = [
  { id: 'work', label: '업무', color: 'var(--color-primary)' },
  { id: 'personal', label: '개인', color: '#3B82F6' },
  { id: 'study', label: '학습', color: '#8B5CF6' },
  { id: 'health', label: '건강', color: '#10B981' },
  { id: 'other', label: '기타', color: '#6B7280' },
]

export const PRIORITY_COLORS = {
  low: '#6B7280',
  medium: 'var(--color-primary)',
  high: '#EF4444',
}

export const PRIORITY_LABELS = {
  low: '낮음',
  medium: '보통',
  high: '높음',
}

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null
}
