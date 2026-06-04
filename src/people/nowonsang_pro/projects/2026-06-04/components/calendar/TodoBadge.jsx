import { useDispatch } from 'react-redux'
import { uiActions } from '../../store/slices/uiSlice'
import { PRIORITY_COLORS, categoryById } from '../../utils/categories'

export default function TodoBadge({ todo }) {
  const dispatch = useDispatch()
  const cat = categoryById(todo.category)
  const dotColor = PRIORITY_COLORS[todo.priority] || PRIORITY_COLORS.medium
  const stripeColor = cat?.color || dotColor

  return (
    <button
      type="button"
      className="tc-badge"
      data-completed={todo.completed ? 'true' : 'false'}
      style={{ borderLeftColor: stripeColor }}
      onClick={(e) => {
        e.stopPropagation()
        dispatch(uiActions.openEditModal(todo.id))
      }}
      aria-label={`${todo.title} 수정`}
      title={todo.title}
    >
      <span className="tc-dot" style={{ background: dotColor }} aria-hidden="true" />
      <span className="tc-badge-title">{todo.title}</span>
    </button>
  )
}
