import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from 'date-fns'

/**
 * Build the 35~42 day grid for a given month (year + 1-indexed month).
 * Week starts Sunday.
 * Note: uses `new Date(year, monthIndex, 1)` to STAY in local time — never
 * parse 'YYYY-MM-DD' via `new Date(string)` (would shift by timezone).
 */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1)
  const monthStart = startOfMonth(first)
  const monthEnd = endOfMonth(first)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

/** Date -> 'YYYY-MM-DD' in LOCAL timezone (date-fns format respects local). */
export const toDateKey = (d) => format(d, 'yyyy-MM-dd')

/** Parse 'YYYY-MM-DD' into a local Date (Y, M-1, D) — NOT new Date(string). */
export function fromDateKey(key) {
  if (!key || typeof key !== 'string') return null
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** Today as 'YYYY-MM-DD' (local). */
export function todayKey() {
  const d = new Date()
  return toDateKey(d)
}

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

/** Human label for a dateKey: "6월 4일 (목)" */
export function humanDateLabel(key) {
  const d = fromDateKey(key)
  if (!d) return ''
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${m}월 ${day}일 (${WEEKDAYS_KO[d.getDay()]})`
}

/** Human month label: "2026년 6월" */
export function humanMonthLabel(year, month) {
  return `${year}년 ${month}월`
}

/** Validate 'HH:mm' or empty. */
export function isValidTime(s) {
  if (!s) return true
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s)
}

/** Compare two 'HH:mm' strings; returns true if end > start (both required). */
export function isEndAfterStart(start, end) {
  if (!start || !end) return true
  return end > start
}
