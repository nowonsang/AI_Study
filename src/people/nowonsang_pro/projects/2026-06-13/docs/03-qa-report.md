# 03 — QA 리포트

## 1. 오라클(자동 검증) — 전부 GREEN
| AC | 명령(프로젝트 폴더 기준) | 단언 | 결과 |
|---|---|---|---|
| AC1 | `npx vitest run engine/raycast.test.ts` | 알려진 복셀월드·카메라포즈에서 히트 복셀·면(법선)·거리 일치 | ✅ 12 pass |
| AC2 | `npx vitest run engine/world.test.ts` | 채굴=제거, 설치=히트면 추가, 인벤토리 갱신, 저장/불러오기 라운드트립 | ✅ 12 pass |
| AC3 | `npx vitest run tests/purity.test.ts` | engine/*.ts 에 react\|jsx\|document 0회 | ✅ 7 pass |
| AC4 | `npx vitest run tests/controls.test.ts` | 이동+yaw/pitch+채굴/설치 시퀀스 → 포즈·복셀상태 변화 | ✅ 6 pass |
| AC5 | `node bench/fps.mjs` | 내부해상도 N프레임 평균 → fps ≥ 30 | ✅ fps≈157–163 |

합계: vitest 37/37 pass, bench PASS.

## 2. 런타임 스모크(Playwright, 빌드본 preview)
| # | 파일 | 시나리오 | 검증 | 결과 |
|---|---|---|---|---|
| 01 | `screenshots/01-initial-render.png` | 페이지 진입 | 하늘/잔디 지형 + 돌·흙 복셀 면음영 + 크로스헤어 + 인벤토리(돌×8/잔디×8/흙×8) 렌더 | ✅ |
| 02 | `screenshots/02-after-move.png` | 캔버스 클릭(포인터락) → W 전진 | 시점/위치 변화 후 정상 렌더 | ✅ |

HUD 텍스트 확인: `1. 돌 × 8 | 2. 잔디 × 8 | 3. 흙 × 8`.

## 3. 회귀
- W2(React 셸) 추가 후 AC1~5 재실행 → 회귀 없음(37/37, fps≥30).
- 공유 Hub(`npm run build`, 루트) 빌드 성공 → 7인 공유 번들 무영향.

## 4. 발견/수정 이력
- AC3 1차 실패: `render.ts`·`world.ts` **주석에 "React" 단어**가 토큰 스캔에 적발. → 주석 문구 "UI 셸"로 교체 후 green.
  (코드 변경 아님, 주석만)

## 5. 한계/후속
- Hub 카드는 정적(정보+스크린샷). 즉시 플레이는 자체 dev 서버(`npm run dev`). ADR 0002 참조.
- 텍스처/조명 없음(면 음영+거리 fog만). 청크 스트리밍·OffscreenCanvas 워커는 후속 최적화 여지.

---

## QA 추가 — 2026-06-13 고퀄리티판 W1 (순수엔진 확장)

### 게이트 (메인 직접 재실행, 자가보고 아님)
| 검증 | 명령 | 결과 |
|---|---|---|
| 전체 단위 오라클 | `node --test 'engine/*.test.js' 'tests/*.test.js'` | **83/83 pass, 0 fail** (baseline 36→83, 회귀 0) |
| AC5 성능 | `node bench/fps.mjs` | **144.9 fps** @160×100 (≥30) |
| AC3 순수성 | `grep -riE 'react\|jsx\|document' engine/*.js` | **0 토큰** |
| 빌드 | `npm run build` (루트 Vite) | 성공 |
| 절차적 월드 | createGenWorld(1337) sanity | solid 12395 / air 32405, 스폰 공중·지표 below OK |

### 신규 모듈별 오라클 통과
- AC6 atlas(8) · AC7 light(6) · AC8 worldgen(7) · AC9 chunks(6) · AC10 physics(10) — 전부 green.

### 연기 (ADR 0002, 헤드리스 WebGL2 필요)
- AC1 셰이더 패리티 · AC11 골든 이미지 · AC5' 960×540@60fps GPU — headless-gl Node23 빌드 위험 → Playwright 오프스크린 권장, 다음 웨이브.
