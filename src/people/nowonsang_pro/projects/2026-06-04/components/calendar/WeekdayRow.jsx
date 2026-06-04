const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function WeekdayRow() {
  return (
    <div className="tc-weekday-row" role="row">
      {DAYS.map((d, i) => (
        <div
          key={d}
          role="columnheader"
          className="tc-weekday"
          data-day={i}
          aria-label={`${d}요일`}
        >
          {d}
        </div>
      ))}
    </div>
  )
}
