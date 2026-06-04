import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from '../../store/slices/uiSlice'
import { todosActions } from '../../store/slices/todosSlice'
import {
  selectAllTodos,
  selectModal,
  selectSelectedDate,
} from '../../store/selectors'
import {
  CATEGORIES,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from '../../utils/categories'
import { isEndAfterStart, isValidTime } from '../../utils/date'

const PRIORITIES = ['low', 'medium', 'high']

function emptyForm(date) {
  return {
    title: '',
    description: '',
    dueDate: date,
    startTime: '',
    endTime: '',
    priority: 'medium',
    category: '',
  }
}

function fromTodo(todo) {
  return {
    title: todo.title || '',
    description: todo.description || '',
    dueDate: todo.dueDate,
    startTime: todo.startTime || '',
    endTime: todo.endTime || '',
    priority: todo.priority || 'medium',
    category: todo.category || '',
  }
}

export default function TodoFormModal() {
  const dispatch = useDispatch()
  const modal = useSelector(selectModal)
  const selectedDate = useSelector(selectSelectedDate)
  const allTodos = useSelector(selectAllTodos)

  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const submitTriedRef = useRef(false)

  const editingTodo = useMemo(() => {
    if (modal.mode !== 'edit' || !modal.todoId) return null
    return allTodos.find((t) => t.id === modal.todoId) || null
  }, [modal.mode, modal.todoId, allTodos])

  const [form, setForm] = useState(emptyForm(selectedDate))
  const [touched, setTouched] = useState({})
  const initialFormRef = useRef(form)

  // open/close the native <dialog>
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (modal.open && !dlg.open) {
      // reset form according to mode
      const next =
        modal.mode === 'edit' && editingTodo
          ? fromTodo(editingTodo)
          : emptyForm(modal.presetDate || selectedDate)
      setForm(next)
      setTouched({})
      submitTriedRef.current = false
      initialFormRef.current = next
      try {
        dlg.showModal()
      } catch {
        /* already open in some browsers */
      }
      // autofocus title
      setTimeout(() => titleRef.current?.focus(), 30)
    } else if (!modal.open && dlg.open) {
      dlg.close()
    }
  }, [modal.open, modal.mode, modal.presetDate, editingTodo, selectedDate])

  // Edge case: edit-mode opened but todo got deleted externally — close.
  useEffect(() => {
    if (modal.open && modal.mode === 'edit' && !editingTodo) {
      dispatch(uiActions.closeModal())
    }
  }, [modal.open, modal.mode, editingTodo, dispatch])

  const isDirty = useMemo(() => {
    const a = initialFormRef.current
    return Object.keys(a).some((k) => a[k] !== form[k])
  }, [form])

  const titleError =
    !form.title.trim() ? '제목을 입력해 주세요' : null
  const timeFormatError =
    !isValidTime(form.startTime) || !isValidTime(form.endTime)
      ? '시간 형식은 HH:mm 입니다'
      : null
  const timeOrderError =
    !timeFormatError && !isEndAfterStart(form.startTime, form.endTime)
      ? '종료시간은 시작시간 이후여야 합니다'
      : null

  const canSubmit = !titleError && !timeFormatError && !timeOrderError

  const handleClose = (force = false) => {
    if (!force && isDirty) {
      if (!window.confirm('변경사항을 버리시겠습니까?')) return
    }
    dispatch(uiActions.closeModal())
  }

  // Close on dialog "cancel" event (Esc key) — intercept to honor dirty check
  const handleCancelEvent = (e) => {
    e.preventDefault()
    handleClose(false)
  }

  // Click on backdrop closes (only when target IS the dialog itself).
  const handleClickBackdrop = (e) => {
    if (e.target === dialogRef.current) handleClose(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submitTriedRef.current = true
    setTouched({ title: true, startTime: true, endTime: true })
    if (!canSubmit) return
    if (modal.mode === 'edit' && editingTodo) {
      dispatch(
        todosActions.updateTodo({
          id: editingTodo.id,
          changes: {
            title: form.title,
            description: form.description || undefined,
            dueDate: form.dueDate,
            startTime: form.startTime || undefined,
            endTime: form.endTime || undefined,
            priority: form.priority,
            category: form.category || undefined,
          },
        }),
      )
      dispatch(
        uiActions.showToast({ type: 'success', message: '일정이 수정되었습니다' }),
      )
    } else {
      dispatch(
        todosActions.addTodo({
          title: form.title,
          description: form.description,
          dueDate: form.dueDate,
          startTime: form.startTime,
          endTime: form.endTime,
          priority: form.priority,
          category: form.category,
        }),
      )
      dispatch(uiActions.setSelectedDate(form.dueDate))
      dispatch(
        uiActions.showToast({ type: 'success', message: '일정이 추가되었습니다' }),
      )
    }
    dispatch(uiActions.closeModal())
  }

  const handleDelete = () => {
    if (!editingTodo) return
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    const todoSnapshot = editingTodo
    dispatch(todosActions.removeTodo(editingTodo.id))
    dispatch(uiActions.closeModal())
    dispatch(
      uiActions.showToast({
        type: 'success',
        message: '삭제되었습니다',
        action: { kind: 'undo-delete', todo: todoSnapshot },
      }),
    )
  }

  const showTitleError =
    titleError && (touched.title || submitTriedRef.current)
  const showTimeError =
    (timeFormatError || timeOrderError) &&
    (touched.startTime || touched.endTime || submitTriedRef.current)

  return (
    <dialog
      ref={dialogRef}
      className="tc-dialog"
      aria-labelledby="tc-dialog-title"
      onCancel={handleCancelEvent}
      onClick={handleClickBackdrop}
    >
      <form onSubmit={handleSubmit} noValidate>
        <header className="tc-dialog-header">
          <h2 id="tc-dialog-title">
            {modal.mode === 'edit' ? '일정 수정' : '새 일정 추가'}
          </h2>
          <button
            type="button"
            className="tc-icon-btn"
            onClick={() => handleClose(false)}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="tc-dialog-body">
          {/* Title */}
          <div className="tc-field">
            <label htmlFor="tc-title">
              제목<span className="tc-required">*</span>
            </label>
            <input
              ref={titleRef}
              id="tc-title"
              className="tc-input"
              type="text"
              maxLength={80}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              aria-invalid={!!showTitleError}
              aria-describedby={showTitleError ? 'tc-title-err' : undefined}
              required
            />
            {showTitleError && (
              <div id="tc-title-err" className="tc-field-error">
                {titleError}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="tc-field">
            <label htmlFor="tc-date">
              날짜<span className="tc-required">*</span>
            </label>
            <input
              id="tc-date"
              className="tc-input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              required
            />
          </div>

          {/* Time */}
          <div className="tc-field">
            <label>시간 (선택)</label>
            <div className="tc-row">
              <input
                className="tc-input"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
                onBlur={() => setTouched((t) => ({ ...t, startTime: true }))}
                aria-label="시작 시간"
              />
              <span className="tc-tilde" aria-hidden="true">
                ~
              </span>
              <input
                className="tc-input"
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
                onBlur={() => setTouched((t) => ({ ...t, endTime: true }))}
                aria-label="종료 시간"
              />
            </div>
            {showTimeError && (
              <div className="tc-field-error">
                {timeFormatError || timeOrderError}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="tc-field">
            <label>우선순위</label>
            <div className="tc-radios" role="radiogroup">
              {PRIORITIES.map((p) => (
                <label key={p}>
                  <input
                    type="radio"
                    name="tc-priority"
                    value={p}
                    checked={form.priority === p}
                    onChange={() => setForm((f) => ({ ...f, priority: p }))}
                  />
                  <span
                    className="tc-dot"
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: PRIORITY_COLORS[p],
                    }}
                    aria-hidden="true"
                  />
                  {PRIORITY_LABELS[p]}
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="tc-field">
            <label>카테고리 (선택)</label>
            <div className="tc-chips" role="group">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className="tc-chip"
                  aria-pressed={form.category === c.id}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      category: f.category === c.id ? '' : c.id,
                    }))
                  }
                >
                  <span
                    className="tc-dot"
                    style={{ background: c.color }}
                    aria-hidden="true"
                  />
                  {c.label}
                </button>
              ))}
              <button
                type="button"
                className="tc-chip"
                aria-pressed={!form.category}
                onClick={() => setForm((f) => ({ ...f, category: '' }))}
              >
                없음
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="tc-field">
            <label htmlFor="tc-desc">설명 (선택)</label>
            <textarea
              id="tc-desc"
              className="tc-textarea"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
        </div>

        <footer className="tc-dialog-footer">
          {modal.mode === 'edit' && (
            <button
              type="button"
              className="tc-btn tc-btn-danger"
              onClick={handleDelete}
            >
              🗑 삭제
            </button>
          )}
          <span className="tc-spacer" />
          <button
            type="button"
            className="tc-btn tc-btn-secondary"
            onClick={() => handleClose(false)}
          >
            취소
          </button>
          <button
            type="submit"
            className="tc-btn tc-btn-primary"
            disabled={!canSubmit}
          >
            저장하기
          </button>
        </footer>
      </form>
    </dialog>
  )
}
