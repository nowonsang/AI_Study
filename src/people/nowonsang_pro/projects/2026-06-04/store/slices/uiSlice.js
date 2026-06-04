import { createSlice, nanoid } from '@reduxjs/toolkit'

/**
 * Today as 'YYYY-MM-DD' using LOCAL timezone (never UTC).
 */
function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayYM() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 } // 1-indexed
}

const initialState = {
  currentMonth: todayYM(),                                  // { year, month (1-12) }
  selectedDate: todayKey(),                                 // 'YYYY-MM-DD'
  modal: { open: false, mode: 'create', todoId: null, presetDate: null },
  toasts: [],                                               // { id, type, message, action? }
  welcomeBannerDismissed: false,
  storageBlocked: false,
  /**
   * M-04 fix: 사용자가 한 번이라도 todo를 보유한 적이 있으면 true.
   * 이후 items=0 상태로 돌아가도 환영 배너가 다시 뜨지 않도록 가드.
   * App.jsx의 hydrate 직후 + todos/addTodo 직후에 set한다.
   * (메모리 only — 새로고침 시 hydrate가 items.length>0이면 자동 복원)
   */
  everHadTodos: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentMonth(state, action) {
      const { year, month } = action.payload
      if (
        typeof year === 'number' &&
        typeof month === 'number' &&
        month >= 1 &&
        month <= 12 &&
        year >= 1900 &&
        year <= 2099
      ) {
        state.currentMonth = { year, month }
      }
    },
    goToPrevMonth(state) {
      const { year, month } = state.currentMonth
      if (month === 1) {
        if (year <= 1900) return
        state.currentMonth = { year: year - 1, month: 12 }
      } else {
        state.currentMonth = { year, month: month - 1 }
      }
    },
    goToNextMonth(state) {
      const { year, month } = state.currentMonth
      if (month === 12) {
        if (year >= 2099) return
        state.currentMonth = { year: year + 1, month: 1 }
      } else {
        state.currentMonth = { year, month: month + 1 }
      }
    },
    goToToday(state) {
      state.currentMonth = todayYM()
      state.selectedDate = todayKey()
    },
    setSelectedDate(state, action) {
      // expects 'YYYY-MM-DD'
      if (typeof action.payload === 'string') {
        state.selectedDate = action.payload
      }
    },
    openCreateModal: {
      reducer(state, action) {
        state.modal = {
          open: true,
          mode: 'create',
          todoId: null,
          presetDate: action.payload?.presetDate || state.selectedDate,
        }
      },
      prepare(presetDate) {
        return { payload: { presetDate: presetDate || null } }
      },
    },
    openEditModal(state, action) {
      state.modal = {
        open: true,
        mode: 'edit',
        todoId: action.payload,
        presetDate: null,
      }
    },
    closeModal(state) {
      state.modal = { open: false, mode: 'create', todoId: null, presetDate: null }
    },
    showToast: {
      reducer(state, action) {
        // Debounce duplicates within 1 second
        const recent = state.toasts.find(
          (t) => t.message === action.payload.message,
        )
        if (recent) return
        state.toasts.push(action.payload)
        // Cap at 3 stacked toasts
        if (state.toasts.length > 3) state.toasts.shift()
      },
      prepare({ type = 'info', message, action }) {
        return {
          payload: {
            id: nanoid(),
            type,
            message,
            action: action || null,
            createdAt: Date.now(),
          },
        }
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    dismissWelcomeBanner(state) {
      state.welcomeBannerDismissed = true
    },
    setStorageBlocked(state, action) {
      state.storageBlocked = !!action.payload
    },
    /** M-04: 한 번이라도 todo가 존재했음을 표시. 한 번 true가 되면 다시 false로 돌리지 않음. */
    markEverHadTodos(state) {
      state.everHadTodos = true
    },
  },
})

export const uiActions = uiSlice.actions
export default uiSlice.reducer
