import { useDispatch } from 'react-redux'
import { todosActions } from '../../store/slices/todosSlice'
import { uiActions } from '../../store/slices/uiSlice'
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  categoryById,
} from '../../utils/categories'

export default function TodoListItem({ todo }) {
  const dispatch = useDispatch()
  const cat = categoryById(todo.category)
  const dotColor = PRIORITY_COLORS[todo.priority] || PRIORITY_COLORS.medium
  const stripeColor = cat?.color || 'var(--color-border)'

  const handleToggle = (e) => {
    e.stopPropagation()
    dispatch(todosActions.toggleComplete(todo.id))
  }
  const handleOpen = () => dispatch(uiActions.openEditModal(todo.id))
  const handleDelete = (e) => {
    e.stopPropagation()
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    dispatch(todosActions.removeTodo(todo.id))
    dispatch(
      uiActions.showToast({
        type: 'success',
        message: '삭제되었습니다',
        action: { kind: 'undo-delete', todo },
      }),
    )
  }

  const timeStr = todo.startTime
    ? todo.endTime
      ? `${todo.startTime} – ${todo.endTime}`
      : todo.startTime
    : ''

  return (
    <div
      className="tc-item"
      data-completed={todo.completed ? 'true' : 'false'}
      role="listitem"
    >
      <span
        className="tc-item-stripe"
        style={{ background: stripeColor }}
        aria-hidden="true"
      />
      <input
        type="checkbox"
        className="tc-checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        aria-label={`${todo.title} 완료 토글`}
      />
      <div
        className="tc-item-main"
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleOpen()
        }}
        tabIndex={0}
        role="button"
        aria-label={`${todo.title} 수정`}
      >
        {timeStr && <div className="tc-item-time">{timeStr}</div>}
        <div className="tc-item-title">{todo.title}</div>
        <div className="tc-item-meta">
          <span className="tc-dot" style={{ background: dotColor }} aria-hidden="true" />
          <span>{PRIORITY_LABELS[todo.priority]}</span>
          {cat && (
            <>
              <span aria-hidden="true">·</span>
              <span>{cat.label}</span>
            </>
          )}
        </div>
      </div>
      <div className="tc-item-actions">
        <button
          type="button"
          className="tc-icon-trash"
          onClick={handleDelete}
          aria-label={`${todo.title} 삭제`}
        >
          🗑
        </button>
      </div>
    </div>
  )
}
