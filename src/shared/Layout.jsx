import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <header className="gnb">
        <div className="gnb-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">D</span>
            <span className="brand-name">AI Study</span>
          </Link>
          <nav className="gnb-nav">
            <Link to="/">Hub</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="fnb">
        <div className="fnb-inner">
          <span>© 2026 Dongwha AI Study · 7명 합동 캘린더 실습</span>
        </div>
      </footer>
    </div>
  )
}
