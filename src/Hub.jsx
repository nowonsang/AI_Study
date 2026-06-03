import { Link } from 'react-router-dom'
import { members } from './shared/members.js'

function getInitial(name) {
  return name?.charAt(0) ?? '?'
}

export default function Hub() {
  return (
    <>
      {/* Hero */}
      <section id="hero-section" className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full bg-brand-500 h-4 text-[10px] text-white font-bold flex items-center justify-center uppercase tracking-wider">
              Jun
            </div>
            <div className="text-lg font-bold text-gray-800 leading-none mt-1">
              03
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Calendar Hub
          </h1>
        </div>
        <p className="text-lg text-gray-500 max-w-2xl">
          7명이 각자 만든 캘린더 작품을 확인하세요. 개인별 작업 공간에서 진행된
          프로젝트 결과물입니다.
        </p>
      </section>

      {/* Members Grid */}
      <section id="members-grid" className="mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map(({ name, slug, role }) => {
            const isAdmin = role === '관리자'
            return (
              <Link
                key={slug}
                to={`/people/${slug}`}
                className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 relative overflow-hidden flex flex-col h-full no-underline"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-700 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                  <span
                    className={
                      isAdmin
                        ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100'
                        : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200'
                    }
                  >
                    {role}
                  </span>
                  <div
                    className={
                      isAdmin
                        ? 'w-10 h-10 rounded-full bg-brand-500 text-white grid place-items-center font-bold'
                        : 'w-10 h-10 rounded-full bg-brand-50 text-brand-700 grid place-items-center font-bold border border-brand-100'
                    }
                  >
                    {getInitial(name)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
                <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block mb-6 w-fit border border-gray-100">
                  {slug}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <span className="inline-flex items-center text-sm font-medium text-gray-600 group-hover:text-brand-600 transition-colors">
                    캘린더 보기
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
                <code>{'src/people/<본인슬러그>_pro/Calendar.jsx'}</code>
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
              <p className="text-gray-700 mt-1">
                해당 파일만 수정하면 됩니다.{' '}
                <span className="font-semibold text-red-500">
                  다른 사람 폴더는 건드리지 마세요.
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 grid place-items-center text-gray-600 font-semibold text-sm border border-gray-200">
              3
            </div>
            <div>
              <p className="text-gray-700 mt-1">
                localStorage 키는 슬러그를 포함해 사용:{' '}
                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200 text-sm">
                  {'ai-study.events.<슬러그>'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
