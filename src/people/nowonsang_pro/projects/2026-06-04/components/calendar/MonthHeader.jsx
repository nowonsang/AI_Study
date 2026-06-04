import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from '../../store/slices/uiSlice'
import { selectCurrentMonth } from '../../store/selectors'
import { humanMonthLabel } from '../../utils/date'

export default function MonthHeader() {
  const dispatch = useDispatch()
  const { year, month } = useSelector(selectCurrentMonth)

  const atMin = year <= 1900 && month <= 1
  const atMax = year >= 2099 && month >= 12

  return (
    <div className="tc-month-header">
      <button
        type="button"
        className="tc-icon-btn"
        onClick={() => dispatch(uiActions.goToPrevMonth())}
        disabled={atMin}
        aria-label="이전 달"
      >
        ‹
      </button>
      <h2 className="tc-month-title" aria-live="polite">
        {humanMonthLabel(year, month)}
      </h2>
      <button
        type="button"
        className="tc-icon-btn"
        onClick={() => dispatch(uiActions.goToNextMonth())}
        disabled={atMax}
        aria-label="다음 달"
      >
        ›
      </button>
      <button
        type="button"
        className="tc-today-btn"
        onClick={() => dispatch(uiActions.goToToday())}
        aria-label="오늘로 이동"
      >
        오늘
      </button>
    </div>
  )
}
