import { Link } from 'react-router-dom'
import { members } from './shared/members.js'

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

const accentClass = {
  brand: {
    gradient: 'from-brand-400 to-brand-600',
    badge: 'bg-brand-50 text-brand-700 border-brand-100',
    hover: 'group-hover:text-brand-600',
  },
  blue: {
    gradient: 'from-blue-400 to-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    hover: 'group-hover:text-blue-600',
  },
  indigo: {
    gradient: 'from-indigo-400 to-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    hover: 'group-hover:text-indigo-600',
  },
  purple: {
    gradient: 'from-purple-400 to-purple-600',
    badge: 'bg-purple-50 text-purple-700 border-purple-100',
    hover: 'group-hover:text-purple-600',
  },
  pink: {
    gradient: 'from-pink-400 to-pink-600',
    badge: 'bg-pink-50 text-pink-700 border-pink-100',
    hover: 'group-hover:text-pink-600',
  },
  orange: {
    gradient: 'from-orange-400 to-orange-600',
    badge: 'bg-orange-50 text-orange-700 border-orange-100',
    hover: 'group-hover:text-orange-600',
  },
  teal: {
    gradient: 'from-teal-400 to-teal-600',
    badge: 'bg-teal-50 text-teal-700 border-teal-100',
    hover: 'group-hover:text-teal-600',
  },
}

function getInitial(name) {
  return name?.charAt(0) ?? '?'
}

function MemberAvatar({ name, avatar, badgeClass }) {
  if (avatar) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }
  return (
    <div
      className={`w-10 h-10 rounded-full grid place-items-center font-bold border ${badgeClass}`}
    >
      {getInitial(name)}
    </div>
  )
}

export default function Hub() {
  const today = new Date()
  const month = MONTHS[today.getMonth()]
  const day = String(today.getDate()).padStart(2, '0')

  return (
    <>
      {/* Hero */}
      <section id="hero-section" className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full bg-red-500 h-4 text-[10px] text-white font-bold flex items-center justify-center uppercase tracking-wider">
              {month}
            </div>
            <div className="text-lg font-bold text-gray-800 leading-none mt-1">
              {day}
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            AI Study 실습 허브
          </h1>
        </div>
        <p className="text-lg text-gray-500 max-w-2xl">
          7명이 함께 진행하는 주차별 실습 공간입니다. 각자의 작업 폴더에서
          이번 주 실습 과제를 진행하고, 결과를 공유합니다.
        </p>
        <div className="mt-6 inline-flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-600 text-white">
            1주차
          </span>
          <span className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">6월 4일 주제</span>
            <span className="mx-2 text-gray-300">·</span>
            서브 에이전트로 캘린더 기반 To-do 관리 시스템 만들기
          </span>
        </div>
      </section>

      {/* Members Grid */}
      <section id="members-grid" className="mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map(({ name, slug, role, accent, avatar }) => {
            const c = accentClass[accent] ?? accentClass.brand
            return (
              <Link
                key={slug}
                to={`/people/${slug}`}
                className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 relative overflow-hidden flex flex-col h-full no-underline"
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.badge}`}
                  >
                    {role}
                  </span>
                  <MemberAvatar name={name} avatar={avatar} badgeClass={c.badge} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
                <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block mb-6 w-fit border border-gray-100">
                  {slug}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <span
                    className={`inline-flex items-center text-sm font-medium text-gray-600 transition-colors ${c.hover}`}
                  >
                    실습 보기
                    <i className="fa-solid fa-arrow-right ml-2 text-xs transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Instructions */}
      <section
        id="instructions"
        className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-terminal text-gray-400" /> 각 자리에서
          시작하기
        </h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 grid place-items-center text-gray-600 font-semibold text-sm border border-gray-200">
              1
            </div>
            <div>
              <p className="text-gray-700 mb-2">본인 폴더로 이동:</p>
              <div className="bg-gray-800 text-gray-200 rounded-lg p-3 font-mono text-sm overflow-x-auto shadow-inner">
                <code>{'src/people/<본인슬러그>_pro/main.jsx'}</code>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                <i className="fa-solid fa-circle-info mr-1" /> 예: 노원상 →{' '}
                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200">
                  nowonsang_pro
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 grid place-items-center text-gray-600 font-semibold text-sm border border-gray-200">
              2
            </div>
            <div>
              <p className="text-gray-700 mb-2">날짜별로 시작할 때는 본인 폴더 안에 날짜 폴더를 생성:</p>
              <div className="bg-gray-800 text-gray-200 rounded-lg p-3 font-mono text-sm overflow-x-auto shadow-inner">
                <code>{'src/people/<본인슬러그>_pro/<YYYY-MM-DD>/'}</code>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                <i className="fa-solid fa-circle-info mr-1" /> 예:{' '}
                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200">
                  nowonsang_pro/2026-06-03/
                </span>{' '}
                — Claude는 해당 날짜 폴더 하위에서만 작업합니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 grid place-items-center text-gray-600 font-semibold text-sm border border-gray-200">
              3
            </div>
            <div>
              <p className="text-gray-700 mt-1">
                해당 파일만 수정하면 됩니다.{' '}
                <span className="font-semibold text-red-500">
                  다른 사람 폴더는 건드리지 마세요.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
