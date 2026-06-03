import { Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Layout from './shared/Layout.jsx'
import Hub from './Hub.jsx'
import { members } from './shared/members.js'

function Loading() {
  return (
    <div className="py-16 text-center text-gray-500">
      <i className="fa-solid fa-spinner fa-spin mr-2" />
      로딩 중…
    </div>
  )
}

function NotFound() {
  return (
    <div className="py-16 text-center">
      <h2 className="text-5xl font-extrabold text-brand-500 mb-2">404</h2>
      <p className="text-gray-500 mb-4">페이지를 찾을 수 없습니다.</p>
      <Link
        to="/"
        className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <i className="fa-solid fa-arrow-left mr-2 text-xs" />
        Hub으로
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Hub />} />
          {members.map(({ slug, Component }) => (
            <Route
              key={slug}
              path={`/people/${slug}`}
              element={<Component />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
