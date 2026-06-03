import { lazy } from 'react'

const AVATAR_BASE = 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars'

/**
 * 멤버 정의
 * - name      : UI 표시용 한글 이름
 * - slug      : 폴더명 / URL path (영문 + _pro)
 * - role      : 역할
 * - accent    : Hub 카드 컬러 키 (Tailwind 색상명)
 * - avatar    : 프로필 이미지 URL (더미 데이터)
 * - Component : 본인 폴더의 main.jsx (lazy)
 */
export const members = [
  {
    name: '노원상',
    slug: 'nowonsang_pro',
    role: '관리자',
    accent: 'brand',
    avatar: `${AVATAR_BASE}/avatar-2.jpg`,
    Component: lazy(() => import('../people/nowonsang_pro/main.jsx')),
  },
  {
    name: '김부영',
    slug: 'kimbuyoung_pro',
    role: '개발자',
    accent: 'blue',
    avatar: `${AVATAR_BASE}/avatar-3.jpg`,
    Component: lazy(() => import('../people/kimbuyoung_pro/main.jsx')),
  },
  {
    name: '이민진',
    slug: 'leeminjin_pro',
    role: '개발자',
    accent: 'indigo',
    avatar: `${AVATAR_BASE}/avatar-1.jpg`,
    Component: lazy(() => import('../people/leeminjin_pro/main.jsx')),
  },
  {
    name: '황준현',
    slug: 'hwangjunhyun_pro',
    role: '개발자',
    accent: 'purple',
    avatar: `${AVATAR_BASE}/avatar-8.jpg`,
    Component: lazy(() => import('../people/hwangjunhyun_pro/main.jsx')),
  },
  {
    name: '김진주',
    slug: 'kimjinju_pro',
    role: '개발자',
    accent: 'pink',
    avatar: `${AVATAR_BASE}/avatar-5.jpg`,
    Component: lazy(() => import('../people/kimjinju_pro/main.jsx')),
  },
  {
    name: '이유경',
    slug: 'leeyukyung_pro',
    role: '개발자',
    accent: 'orange',
    avatar: `${AVATAR_BASE}/avatar-6.jpg`,
    Component: lazy(() => import('../people/leeyukyung_pro/main.jsx')),
  },
  {
    name: '김한빛',
    slug: 'kimhanbit_pro',
    role: '개발자',
    accent: 'teal',
    avatar: `${AVATAR_BASE}/avatar-9.jpg`,
    Component: lazy(() => import('../people/kimhanbit_pro/main.jsx')),
  },
]
