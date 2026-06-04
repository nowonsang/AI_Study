import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMonthGrid, selectModal } from '../../store/selectors'
import { uiActions } from '../../store/slices/uiSlice'
import DayCell from './DayCell'

export default function CalendarGrid() {
  const dispatch = useDispatch()
  const cells = useSelector(selectMonthGrid)
  const modal = useSelector(selectModal)

  // Keyboard month navigation (←/→) — only when focus is NOT inside a form/modal
  useEffect(() => {
    const onKey = (e) => {
      if (modal.open) return
      const tag = (e.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        dispatch(uiActions.goToPrevMonth())
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        dispatch(uiActions.goToNextMonth())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch, modal.open])

  return (
    <div className="tc-grid" role="grid" aria-label="월간 캘린더">
      {cells.map((cell) => (
        <DayCell key={cell.dateKey} cell={cell} />
      ))}
    </div>
  )
}
