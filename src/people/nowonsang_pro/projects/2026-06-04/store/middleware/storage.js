import { uiActions } from '../slices/uiSlice'

export const STORAGE_KEY = 'ai-study.todo.nowonsang_pro.2026-06-04'
export const SCHEMA_VERSION = 1

/**
 * Load initial todos from localStorage. Safe against:
 *  - missing key (returns [])
 *  - invalid JSON (returns [], logs)
 *  - schema mismatch (backs up + returns [])
 *  - localStorage disabled / quota issues (returns [])
 */
export function loadInitialTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return []
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      try {
        localStorage.setItem(`${STORAGE_KEY}.backup.${Date.now()}`, raw)
      } catch {
        /* ignore */
      }
      return []
    }
    return Array.isArray(parsed.items) ? parsed.items : []
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[todo] hydrate failed', err)
    return []
  }
}

/**
 * Redux middleware. Persists `state.todos.items` to localStorage whenever
 * an action under the `todos/` namespace is dispatched, except `todos/hydrate`
 * (which would otherwise create an unnecessary write on every load).
 */
export const storageMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  const type = action?.type
  if (typeof type !== 'string') return result

  // ---- M-04: hydrate / addTodo / restoreTodo 시 items가 1건 이상이면
  //            UI 의 everHadTodos 플래그를 영구적으로 true 로 마킹.
  //            이후 모두 삭제되어 items.length === 0 으로 돌아가도
  //            환영 배너가 다시 출현하지 않음.
  if (
    (type === 'todos/hydrate' ||
      type === 'todos/addTodo' ||
      type === 'todos/restoreTodo') &&
    !store.getState().ui.everHadTodos
  ) {
    const items = store.getState().todos.items
    if (Array.isArray(items) && items.length > 0) {
      store.dispatch(uiActions.markEverHadTodos())
    }
  }

  if (type.startsWith('todos/') && type !== 'todos/hydrate') {
    try {
      const { items } = store.getState().todos
      const payload = {
        schemaVersion: SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        items,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      // QuotaExceeded or storage disabled — mark + toast (debounced via uiSlice)
      // eslint-disable-next-line no-console
      console.error('[todo] persist failed', err)
      store.dispatch(uiActions.setStorageBlocked(true))
      store.dispatch(
        uiActions.showToast({
          type: 'error',
          message: '저장 용량이 가득 찼습니다. 불필요한 일정을 삭제해 주세요.',
        }),
      )
    }
  }
  return result
}
