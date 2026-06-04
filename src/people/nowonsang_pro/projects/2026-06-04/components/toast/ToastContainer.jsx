import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectToasts } from '../../store/selectors'
import { uiActions } from '../../store/slices/uiSlice'
import { todosActions } from '../../store/slices/todosSlice'

const AUTO_DISMISS_MS = 4000

export default function ToastContainer() {
  const dispatch = useDispatch()
  const toasts = useSelector(selectToasts)

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(uiActions.dismissToast(t.id)), AUTO_DISMISS_MS),
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, dispatch])

  if (toasts.length === 0) return null

  return (
    <div className="tc-toasts" role="region" aria-label="알림">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="tc-toast"
          data-type={t.type}
          role="status"
          aria-live="polite"
        >
          <span className="tc-toast-msg">{t.message}</span>
          {t.action?.kind === 'undo-delete' && (
            <button
              type="button"
              onClick={() => {
                dispatch(todosActions.restoreTodo(t.action.todo))
                dispatch(uiActions.dismissToast(t.id))
                dispatch(
                  uiActions.showToast({ type: 'info', message: '복원되었습니다' }),
                )
              }}
            >
              실행취소
            </button>
          )}
          <button
            type="button"
            className="tc-toast-close"
            onClick={() => dispatch(uiActions.dismissToast(t.id))}
            aria-label="알림 닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
