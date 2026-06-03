import { lazy } from 'react'

/**
 * 멤버 정의
 * - name : UI 표시용 한글 이름
 * - slug : 폴더명 / URL path (영문 + _pro)
 * - role : 역할
 * - Component : 본인 폴더의 Calendar.jsx (lazy)
 */
export const members = [
  {
    name: '노원상',
    slug: 'nowonsang_pro',
    role: '관리자',
    Component: lazy(() => import('../people/nowonsang_pro/Calendar.jsx')),
  },
  {
    name: '김부영',
    slug: 'kimbuyoung_pro',
    role: '개발자',
    Component: lazy(() => import('../people/kimbuyoung_pro/Calendar.jsx')),
  },
  {
    name: '이민진',
    slug: 'leeminjin_pro',
    role: '개발자',
    Component: lazy(() => import('../people/leeminjin_pro/Calendar.jsx')),
  },
  {
    name: '황준현',
    slug: 'hwangjunhyun_pro',
    role: '개발자',
    Component: lazy(() => import('../people/hwangjunhyun_pro/Calendar.jsx')),
  },
  {
    name: '김진주',
    slug: 'kimjinju_pro',
    role: '개발자',
    Component: lazy(() => import('../people/kimjinju_pro/Calendar.jsx')),
  },
  {
    name: '이유경',
    slug: 'leeyukyung_pro',
    role: '개발자',
    Component: lazy(() => import('../people/leeyukyung_pro/Calendar.jsx')),
  },
  {
    name: '김한빛',
    slug: 'kimhanbit_pro',
    role: '개발자',
    Component: lazy(() => import('../people/kimhanbit_pro/Calendar.jsx')),
  },
]
