import { Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Layout from './shared/Layout.jsx'
import Hub from './Hub.jsx'
import { members } from './shared/members.js'

function Loading() {
  return <div className="loading">로딩 중…</div>
}

function NotFound() {
  return (
    <div className="not-found">
      <h2>404</h2>
      <p>페이지를 찾을 수 없습니다.</p>
      <Link to="/">← Hub으로</Link>
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
