import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './components/App'
import './styles/calendar.css'

/**
 * Phase 2 entry point — wraps the Todo calendar in a Redux <Provider>.
 * Mounted by src/people/nowonsang_pro/projects.js as a lazy chunk.
 */
export default function TodoCalendarProject() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
