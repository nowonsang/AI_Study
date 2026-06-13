# 04 — 리뷰 & 마감 리포트

## 완료 판정 (오라클 exit code = 0)
| AC | 명령 | exit | 지표 |
|---|---|---|---|
| AC1 | `vitest run engine/raycast.test.ts` | 0 | 12 pass |
| AC2 | `vitest run engine/world.test.ts` | 0 | 12 pass |
| AC3 | `vitest run tests/purity.test.ts` | 0 | 7 pass |
| AC4 | `vitest run tests/controls.test.ts` | 0 | 6 pass |
| AC5 | `node bench/fps.mjs` | 0 | fps≈161 (≥30) @160×100 |

→ **5/5 green. 루프 종료 신호 충족.** 추가로 `tsc --noEmit`(0) · `vite build`(성공) · 루트 공유 `npm run build`(성공).

## 불변 제약 점검
- [x] engine/*.ts 에 react/jsx/document 0회 (AC3로 단언)
- [x] 실시간 1인칭 3D(WASD + 마우스 yaw/pitch + 좌채굴/우설치 + 인벤토리 + 저장/불러오기), 메인 루프 rAF
- [x] 게임 계산은 순수 모듈, 셸은 canvas/입력/루프만
- [x] 모든 디렉토리·파일명 영어(ASCII)
- [x] localStorage 키에 슬러그 포함(`ai-study.voxel.nowonsang_pro`)

## 산출물
```
projects/2026-06-13/
  engine/{raycast,world,render}.ts + {raycast,world}.test.ts
  tests/{purity,controls}.test.ts + README.md
  bench/fps.mjs
  src/{Game,App,main}.tsx + index.css
  index.html · index.jsx(Hub 카드) · tsconfig/vite.config/package.json
  screenshots/{01-initial-render,02-after-move}.png
  docs/{01-…(research는 .bkit),02-dev-notes,03-qa-report,04-review-report}.md
projects.js  ← 2026-06-13 항목 등록
```
> 01-plan 류 기획/리서치는 오케스트레이터 계약에 따라 `.bkit/`(decisions/workflows/state/audit/checkpoints)에 기록.

## 수정 이력(이 사이클)
1. 목표가 2D→3D 복셀로 변경 → 엔진/테스트 전면 3D(Amanatides–Woo) 재작성.
2. AC3 1차 red(주석 내 "React" 단어) → 주석만 "UI 셸"로 교체 → green. (회귀 검사 통과)

## 본인 폴더 외 변경
- 수정: `src/people/nowonsang_pro/projects.js` (본인 영역) — Hub 카드 1줄 등록.
- 공유 파일(src/shared, App.jsx 등) 변경 **없음**. 루트 빌드 검증으로 7인 무영향 확인.

## 배포(브랜치 푸시) — 사용자 승인 대기
- 제안 브랜치: `nowonsang-team/voxel-raycast-2026-06-13`
- 변경 파일: 본 프로젝트 신규 파일 + `projects.js` 1줄. `git push` 는 CLAUDE.md §8 규정상 **승인 후** 진행.

---

## 리뷰 추가 — 2026-06-13 고퀄리티판 W1 마감

### 변경 요약
- 신규 순수 모듈 5종(worldgen/light/physics/atlas/chunks) + 각 node --test. 셸 배선(createGenWorld 지형, atlas 렌더).
- 공유 파일(src/shared, App.jsx, index.css, vite.config) **변경 0** → 7인 무영향. 루트 의존성 추가 0(node --test 유지).
- 본인 폴더 외 수정: `src/people/nowonsang_pro/projects.js` 1줄(desc 갱신) — 본인 카탈로그, 허용 범위.

### 체크리스트 (CLAUDE.md §8 Phase 4)
- [x] 본인 폴더 외 파일 수정 없음 (projects.js 본인 카탈로그 제외)
- [x] projects.js 등록/갱신 완료
- [x] tests/·docs/ 산출물 존재 (+ .bkit/decisions ADR 0001·0002, plan.yaml, state, audit)
- [x] 문서 01~04 존재 + 본 웨이브 추가 기록
- [x] `npm run build` 성공

### 체크포인트 / best_known_good (git 태그)
`bkg-voxel-baseline-2026-06-13` → `bkg-voxel-engine-expansion-2026-06-13` → `voxel-shell-wired-2026-06-13`

### 종료 판정
오케스트레이터 종료조건(11 오라클 전부 green)은 **미충족** — 사용자 결정으로 **여기서 마감**(옵션 2). 순수엔진 경로 10/11 green, GPU 오라클 2종은 ADR 0002로 명시 연기. `git push`는 §8 규정상 **사용자 승인 후**.
