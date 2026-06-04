import { lazy } from 'react'

/**
 * 회차별 작품 레지스트리
 * - slug : URL path (`/people/kimbuyoung_pro/<slug>`)
 * - date : 화면 표시용 날짜 라벨
 * - title : 작품/시스템 이름
 * - desc : 한 줄 설명 (허브 카드에 노출)
 * - Component : 해당 회차 폴더의 index.jsx (lazy)
 *
 * 새 회차 추가 = 이 배열에 한 줄 + `projects/<slug>/index.jsx` 생성
 */
export const projects = [
  {
    slug: '2026-06-04',
    date: '2026.06.04',
    title: '캘린더',
    desc: '서브 에이전트로 캘린더 기반 To-do 관리 시스템 만들기',
    Component: lazy(() => import('./projects/2026-06-04/index.jsx')),
  },
  {
    slug: '2026-06-17',
    date: '2026.06.17',
    title: '(예정)',
    desc: '두 번째 회차 — 주제 미정',
    Component: lazy(() => import('./projects/2026-06-17/index.jsx')),
  },
]
