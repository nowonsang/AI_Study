import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col text-gray-800 antialiased">
      <header className="glass-header sticky top-0 z-50 w-full transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center text-white font-bold text-lg shadow-sm">
                D
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                AI Study
              </span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Hub
              </Link>
              <a
                href="#members-grid"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Members
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="검색"
              >
                <i className="fa-solid fa-magnifying-glass" />
              </button>
              <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 grid place-items-center text-brand-700 font-semibold text-sm">
                D
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Dongwha AI Study · 7명 합동 캘린더 실습
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-gray-400 hover:text-gray-600"
              aria-label="GitHub"
            >
              <i className="fa-brands fa-github text-lg" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-600"
              aria-label="Slack"
            >
              <i className="fa-brands fa-slack text-lg" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
