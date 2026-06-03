import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { projects } from './projects.js'

const SLUG = 'hwangjunhyun_pro'
const NAME = '황준현'
const ROLE = '개발자'

function ProjectsHub() {
  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          📅 {NAME}의 작업 모음
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {ROLE} · <code className="text-xs">{SLUG}</code>
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map(({ slug, date, title, desc }) => (
          <li key={slug}>
            <Link
              to={slug}
              className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
            >
              <div className="text-xs font-medium tracking-wider text-brand-600 uppercase">
                {date}
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {title}
              </div>
              <p className="mt-1 text-sm text-gray-500">{desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProjectNotFound() {
  return (
    <div className="py-16 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        존재하지 않는 회차
      </h2>
      <p className="text-gray-500 mb-4">
        해당 날짜의 작품이 등록되어 있지 않습니다.
      </p>
      <Link
        to={`/people/${SLUG}`}
        className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← {NAME} 작업 목록으로
      </Link>
    </div>
  )
}

function ProjectFrame({ children, project }) {
  return (
    <div className="py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link to={`/people/${SLUG}`} className="hover:text-brand-600">
          {NAME}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {project.date} · {project.title}
        </span>
      </nav>
      {children}
    </div>
  )
}

function CurrentProjectRoute({ project }) {
  const { Component } = project
  return (
    <ProjectFrame project={project}>
      <Component />
    </ProjectFrame>
  )
}

export default function Calendar() {
  useLocation()
  return (
    <Routes>
      <Route index element={<ProjectsHub />} />
      {projects.map((project) => (
        <Route
          key={project.slug}
          path={project.slug}
          element={<CurrentProjectRoute project={project} />}
        />
      ))}
      <Route path="*" element={<ProjectNotFound />} />
    </Routes>
  )
}
