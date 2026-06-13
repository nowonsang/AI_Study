import { lazy } from 'react'

/**
 * 회차별 작품 레지스트리
 * - slug : URL path (`/people/nowonsang_pro/<slug>`)
 * - date : 화면 표시용 날짜 라벨
 * - title : 작품/시스템 이름
 * - desc : 한 줄 설명 (허브 카드에 노출)
 * - Component : 해당 회차 폴더의 index.jsx (lazy)
 *
 * 새 회차 추가 = 이 배열에 한 줄 + `projects/<slug>/index.jsx` 생성
 */
export const projects = [
  {
    slug: '2026-06-13',
    date: '2026.06.13',
    title: '3D Voxel Raycaster',
    desc: 'React+TS 3D 복셀 레이캐스팅 마인크래프트 (Amanatides–Woo, 순수 엔진)',
    Component: lazy(() => import('./projects/2026-06-13/index.jsx')),
  },
  {
    slug: '2026-06-04',
    date: '2026.06.04',
    title: 'Todo 일정관리',
    desc: '캘린더 기반 To-do 일정관리 시스템',
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
