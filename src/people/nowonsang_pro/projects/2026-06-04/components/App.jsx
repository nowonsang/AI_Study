import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectHydrated } from '../store/selectors'
import { todosActions } from '../store/slices/todosSlice'
import { loadInitialTodos } from '../store/middleware/storage'
import ErrorBoundary from './error/ErrorBoundary'
import TopBar from './TopBar'
import WelcomeBanner from './WelcomeBanner'
import CalendarView from './calendar/CalendarView'
import TodoListPanel from './panel/TodoListPanel'
import TodoFormModal from './modal/TodoFormModal'
import ToastContainer from './toast/ToastContainer'

export default function App() {
  const dispatch = useDispatch()
  const hydrated = useSelector(selectHydrated)

  useEffect(() => {
    dispatch(todosActions.hydrate(loadInitialTodos()))
  }, [dispatch])

  if (!hydrated) {
    return (
      <div className="tc-root">
        <TopBar />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="tc-root">
        <TopBar />
        <main
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: 16,
          }}
        >
          <WelcomeBanner />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: 16,
            }}
            className="tc-layout"
          >
            <CalendarView />
            <TodoListPanel />
          </div>
        </main>
        <TodoFormModal />
        <ToastContainer />
      </div>

      {/* Inline media query for the desktop 2-column layout — keeps the
          component tree free of breakpoint forking. */}
      <style>{`
        @media (min-width: 1024px) {
          .tc-layout {
            grid-template-columns: 2fr 1fr !important;
            align-items: start;
          }
        }
      `}</style>
    </ErrorBoundary>
  )
}
