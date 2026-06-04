export default function EmptyState({ onAdd }) {
  return (
    <div className="tc-empty">
      <div className="tc-empty-icon" aria-hidden="true">📅</div>
      <p>이 날에는 등록된 일정이 없습니다.</p>
      {onAdd && (
        <button type="button" className="tc-btn tc-btn-primary" onClick={onAdd}>
          + 새 일정 추가
        </button>
      )}
    </div>
  )
}
