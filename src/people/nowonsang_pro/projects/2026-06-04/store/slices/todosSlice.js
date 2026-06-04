import { createSlice, nanoid } from '@reduxjs/toolkit'

/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} dueDate          // 'YYYY-MM-DD' (timezone-safe string)
 * @property {string} [startTime]      // 'HH:mm'
 * @property {string} [endTime]        // 'HH:mm'
 * @property {'low'|'medium'|'high'} priority
 * @property {boolean} completed
 * @property {string} [category]       // 'work'|'personal'|'study'|'health'|'other'
 * @property {string} createdAt        // ISO 8601
 * @property {string} updatedAt        // ISO 8601
 */

/** @type {{ items: Todo[], hydrated: boolean }} */
const initialState = {
  items: [],
  hydrated: false,
}

const nowIso = () => new Date().toISOString()

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    /** Initial localStorage hydration (called once on mount). */
    hydrate: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : []
      state.hydrated = true
    },

    /** Add a new todo. Payload omits id/createdAt/updatedAt. */
    addTodo: {
      reducer(state, action) {
        state.items.push(action.payload)
      },
      prepare(input) {
        const now = nowIso()
        return {
          payload: {
            id: nanoid(),
            title: input.title.trim(),
            description: input.description?.trim() || undefined,
            dueDate: input.dueDate, // 'YYYY-MM-DD'
            startTime: input.startTime || undefined,
            endTime: input.endTime || undefined,
            priority: input.priority || 'medium',
            completed: false,
            category: input.category || undefined,
            createdAt: now,
            updatedAt: now,
          },
        }
      },
    },

    /** Update an existing todo. */
    updateTodo: (state, action) => {
      const { id, changes } = action.payload
      const idx = state.items.findIndex((t) => t.id === id)
      if (idx === -1) return
      const next = { ...state.items[idx], ...changes, updatedAt: nowIso() }
      if (typeof next.title === 'string') next.title = next.title.trim()
      if (typeof next.description === 'string') {
        next.description = next.description.trim() || undefined
      }
      state.items[idx] = next
    },

    /** Remove a todo by id. */
    removeTodo: (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload)
    },

    /** Toggle completion state. */
    toggleComplete: (state, action) => {
      const t = state.items.find((x) => x.id === action.payload)
      if (!t) return
      t.completed = !t.completed
      t.updatedAt = nowIso()
    },

    /** Restore a previously removed todo (undo). Inserts at original position by createdAt order. */
    restoreTodo: (state, action) => {
      const todo = action.payload
      if (!todo || state.items.some((t) => t.id === todo.id)) return
      state.items.push(todo)
    },
  },
})

export const todosActions = todosSlice.actions
export default todosSlice.reducer
