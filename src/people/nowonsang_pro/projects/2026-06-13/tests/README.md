# tests/ — 오라클(자동 검증)

이 폴더는 /goal 정의에 따라 **헤드리스 오라클 테스트**를 담는다.
중첩 npm 프로젝트 금지 규칙에 맞춰 **vitest 의존성을 제거**하고 **Node 내장 러너(`node:test`)** 로 전환했다.
(CLAUDE.md §2-2의 Playwright 스크린샷 용도와 다름. 런타임 스크린샷은 `../screenshots/` 에 있음.)

| 파일 | 대응 AC | 검증 내용 |
|---|---|---|
| `purity.test.js` | AC3 | engine/*.js 에 react/jsx/document 토큰·import 0회 |
| `controls.test.js` | AC4 | 입력 시퀀스(이동+yaw/pitch+채굴/설치) → 포즈·복셀 상태 변화, 불변성 |

엔진 테스트는 `../engine/*.test.js`(AC1 raycast, AC2 world)에 위치.

## 실행 (별도 패키지 설치 불필요 — 루트 Node 만 사용)
```
node --test          # AC1~4 (engine/ + tests/ 의 *.test.js 자동 검색, 36 케이스)
node bench/fps.mjs   # AC5 (fps >= 30)
```
> 게임 자체는 루트 Vite/React 로 구동: 레포 루트에서 `npm run dev` → Hub → nowonsang_pro → 2026-06-13 카드.

## 런타임 스크린샷 (`../screenshots/`)
| # | 파일 | 시나리오 | 결과 |
|---|---|---|---|
| 01 | `01-initial-render.png` | 진입 렌더(지형+복셀+HUD) | ✅ |
| 02 | `02-after-move.png` | 포인터락 후 W 전진 | ✅ |
