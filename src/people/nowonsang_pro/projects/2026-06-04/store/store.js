import { configureStore } from '@reduxjs/toolkit'
import todosReducer from './slices/todosSlice'
import uiReducer from './slices/uiSlice'
import { storageMiddleware } from './middleware/storage'

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) => getDefault().concat(storageMiddleware),
})
