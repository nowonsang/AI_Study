import { createSelector } from '@reduxjs/toolkit'
import {
  buildMonthGrid,
  toDateKey,
  todayKey as todayDateKey,
} from '../utils/date'

// ---- raw state -----------------------------------------------------------
export const selectAllTodos = (state) => state.todos.items
export const selectHydrated = (state) => state.todos.hydrated

export const selectCurrentMonth = (state) => state.ui.currentMonth
export const selectSelectedDate = (state) => state.ui.selectedDate
export const selectModal = (state) => state.ui.modal
export const selectToasts = (state) => state.ui.toasts
export const selectWelcomeBannerDismissed = (state) =>
  state.ui.welcomeBannerDismissed
export const selectStorageBlocked = (state) => state.ui.storageBlocked
export const selectEverHadTodos = (state) => state.ui.everHadTodos

// ---- derived -------------------------------------------------------------

/** Group todos by dueDate ('YYYY-MM-DD') for O(1) cell lookup. */
export const selectTodosByDate = createSelector([selectAllTodos], (items) => {
  /** @type {Record<string, typeof items>} */
  const map = {}
  for (const t of items) {
    if (!t?.dueDate) continue
    ;(map[t.dueDate] ??= []).push(t)
  }
  // Sort each bucket: incomplete first, then by startTime, then by createdAt
  for (const key of Object.keys(map)) {
    map[key].sort(sortTodos)
  }
  return map
})

/** Todos for the currently selected date, sorted. */
export const selectTodosForSelectedDate = createSelector(
  [selectTodosByDate, selectSelectedDate],
  (byDate, date) => byDate[date] || [],
)

/**
 * Month grid cells. Each cell has:
 *   { date, dateKey, isCurrentMonth, isToday, isSelected, todos }
 */
export const selectMonthGrid = createSelector(
  [selectCurrentMonth, selectSelectedDate, selectTodosByDate],
  ({ year, month }, selected, byDate) => {
    const today = todayDateKey()
    const dates = buildMonthGrid(year, month)
    return dates.map((d) => {
      const key = toDateKey(d)
      return {
        date: d,
        dateKey: key,
        isCurrentMonth: d.getMonth() + 1 === month && d.getFullYear() === year,
        isToday: key === today,
        isSelected: key === selected,
        todos: byDate[key] || [],
      }
    })
  },
)

/** Lookup a single todo by id (for edit modal). */
export const selectTodoById = (id) =>
  createSelector([selectAllTodos], (items) => items.find((t) => t.id === id))

// ---- helpers -------------------------------------------------------------

function sortTodos(a, b) {
  // 1) incomplete before completed
  if (a.completed !== b.completed) return a.completed ? 1 : -1
  // 2) by startTime (no time => later)
  const aT = a.startTime || '99:99'
  const bT = b.startTime || '99:99'
  if (aT !== bT) return aT < bT ? -1 : 1
  // 3) by createdAt
  return a.createdAt < b.createdAt ? -1 : 1
}
