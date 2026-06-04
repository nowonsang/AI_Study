import MonthHeader from './MonthHeader'
import WeekdayRow from './WeekdayRow'
import CalendarGrid from './CalendarGrid'

export default function CalendarView() {
  return (
    <section className="tc-cal" aria-label="캘린더">
      <MonthHeader />
      <WeekdayRow />
      <CalendarGrid />
    </section>
  )
}
