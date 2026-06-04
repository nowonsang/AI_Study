import { useDispatch } from 'react-redux'
import { uiActions } from '../../store/slices/uiSlice'
import TodoBadge from './TodoBadge'
import { humanDateLabel } from '../../utils/date'

const MAX_BADGES = 3

export default function DayCell({ cell }) {
  const dispatch = useDispatch()
  const { date, dateKey, isCurrentMonth, isToday, isSelected, todos } = cell

  const handleSelect = () => {
    dispatch(uiActions.setSelectedDate(dateKey))
  }
  const handleAdd = (e) => {
    e.stopPropagation()
    dispatch(uiActions.setSelectedDate(dateKey))
    dispatch(uiActions.openCreateModal(dateKey))
  }
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }

  const visible = todos.slice(0, MAX_BADGES)
  const overflow = todos.length - visible.length

  const ariaLabel =
    `${humanDateLabel(dateKey)}, ${todos.length}개 일정` +
    (isToday ? ', 오늘' : '') +
    (isSelected ? ', 선택됨' : '')

  return (
    <div
      role="gridcell"
      tabIndex={0}
      className="tc-cell"
      data-selected={isSelected ? 'true' : 'false'}
      data-today={isToday ? 'true' : 'false'}
      data-current-month={isCurrentMonth ? 'true' : 'false'}
      aria-selected={isSelected}
      aria-label={ariaLabel}
      onClick={handleSelect}
      onKeyDown={handleKey}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span className="tc-day-number">{date.getDate()}</span>
      </div>
      <button
        type="button"
        className="tc-cell-add"
        onClick={handleAdd}
        aria-label={`${humanDateLabel(dateKey)}에 일정 추가`}
        tabIndex={-1}
      >
        +
      </button>
      <div className="tc-badges">
        {visible.map((t) => (
          <TodoBadge key={t.id} todo={t} />
        ))}
        {overflow > 0 && (
          <div className="tc-more" aria-label={`외 ${overflow}건 더`}>
            +{overflow} more
          </div>
        )}
      </div>
    </div>
  )
}
