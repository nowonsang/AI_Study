import { useDispatch, useSelector } from 'react-redux'
import {
  selectSelectedDate,
  selectTodosForSelectedDate,
} from '../../store/selectors'
import { uiActions } from '../../store/slices/uiSlice'
import { humanDateLabel } from '../../utils/date'
import TodoListItem from './TodoListItem'
import EmptyState from './EmptyState'

export default function TodoListPanel() {
  const dispatch = useDispatch()
  const selected = useSelector(selectSelectedDate)
  const todos = useSelector(selectTodosForSelectedDate)

  const completedCount = todos.filter((t) => t.completed).length
  const handleAdd = () => dispatch(uiActions.openCreateModal(selected))

  const isEmpty = todos.length === 0

  return (
    <aside className="tc-panel" aria-label="선택된 날짜의 일정">
      <div className="tc-panel-header">
        <h2>{humanDateLabel(selected)}</h2>
        <p>
          {todos.length}건
          {todos.length > 0 && ` (완료 ${completedCount})`}
        </p>
      </div>
      {/* M-05 fix: todo 0건이면 헤더 + 버튼은 숨기고 EmptyState 자체의 단일 CTA만 노출 */}
      {!isEmpty && (
        <button
          type="button"
          className="tc-btn tc-btn-primary tc-btn-block"
          onClick={handleAdd}
        >
          + 새 일정 추가
        </button>
      )}
      {isEmpty ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <div className="tc-list" role="list">
          {todos.map((t) => (
            <TodoListItem key={t.id} todo={t} />
          ))}
        </div>
      )}
    </aside>
  )
}
