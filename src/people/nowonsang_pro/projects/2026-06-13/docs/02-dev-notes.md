# 02 — 개발 노트 (3D Voxel Raycaster)

## 스택
- React 18 + TypeScript + Vite 5, 테스트 Vitest 2, bench는 Node 23.7 네이티브 TS type-stripping.

## 모듈 구조 (관심사 분리 / 엔진 순수성)
```
engine/raycast.ts   순수 — VoxelGrid, voxelAt/setVoxel, Amanatides–Woo castRay(좌표+법선+거리),
                    forwardVector/rightVector/rayDirection (픽셀당 카메라 광선)
engine/world.ts     순수 — World(voxels+player x,y,z,yaw,pitch), 3D 이동·축분리충돌, applyLook(yaw/pitch),
                    mineBlock(히트복셀 제거)/placeBlock(히트면 인접칸 추가), 인벤토리, serialize/deserialize
engine/render.ts    순수 — 픽셀당 광선 → 저해상 RGBA 프레임버퍼(면 음영 + 거리 fog). DOM 없음.
src/Game.tsx        얇은 셸 — canvas + rAF(dt) + pointerlock 마우스룩 + WASD/Space/Shift + 좌클릭채굴/우클릭설치
src/{App,main}.tsx  마운트
bench/fps.mjs       AC5 — 실제 엔진을 import해 N프레임 평균 프레임타임 측정
```
> engine/*.ts 에는 react/jsx/document 토큰이 0회(주석 포함). purity 테스트로 단언.

## 핵심 구현 결정
- **Amanatides–Woo 3D DDA**: `step=sign(dir)`, `tDelta=|1/dir|`, `tMax=경계거리*tDelta`. 최소 tMax 축 전진,
  **진입 면 법선 = 전진 축의 반대 부호**. dir 단위면 t가 곧 거리.
- **설치 좌표 = 히트복셀 + 법선** (조준한 면 바깥 인접 빈 칸). 채굴 = 히트복셀을 0으로.
- **불변(순수) 함수**: 모든 world 변형은 새 World 반환. grid 변형은 cloneVoxels 후 setVoxel.
- **카메라 광선**: forward/right/up 기저 + FOV·aspect 로 픽셀 광선 생성, 정규화. width=height=1·px=0 → forward.
- **좌표계**: y=up, yaw=y축 회전(0→+z), pitch∈(−π/2,π/2) 클램프.
- **렌더 업스케일**: 내부 256×160 프레임버퍼 → putImageData → CSS `image-rendering: pixelated` 업스케일.
- **저장**: localStorage 키 `ai-study.voxel.nowonsang_pro` (CLAUDE.md §4 슬러그 포함).
- **상대 import 는 `.ts` 확장자 명시** → node/vite/tsc 동시 호환(bench가 .ts 직접 import 가능).

## 오라클 결과
| AC | 명령 | 결과 |
|---|---|---|
| AC1 | `vitest engine/raycast.test.ts` | ✅ 12 |
| AC2 | `vitest engine/world.test.ts` | ✅ 12 |
| AC3 | `vitest tests/purity.test.ts` | ✅ 7 |
| AC4 | `vitest tests/controls.test.ts` | ✅ 6 |
| AC5 | `node bench/fps.mjs` | ✅ fps ≈ 157–163 (≥30) @160×100 |

빌드: `tsc --noEmit` exit 0, `vite build` 성공.

---

## 2026-06-13 리팩터 — 중첩 npm 프로젝트 제거 (루트 공유 전환)

> 사유: CLAUDE.md에 신규 ZERO-TOLERANCE 규칙("프로젝트 안에 프로젝트 금지") 추가.
> 개인 폴더가 자체 `package.json`/`node_modules`/`vite.config.ts`/`tsconfig.json`/lock 을 갖던 구조를
> **루트(`/AI_Study`) 의존성·Vite 공유** 구조로 전환.

변경 내용:
- `engine/*.ts` → `engine/*.js` (타입 제거, 로직 동일 / Amanatides–Woo DDA·월드·렌더 그대로)
- `src/{main,App,Game}.tsx` → `components/Game.jsx` + `index.jsx`(실제 게임 렌더), `src/index.css` → `styles/game.css`(전역 오버라이드 제거, `.vx-*` 로컬 + 토큰 fallback)
- `index.jsx`: 정적 안내 카드 → **실제 플레이 가능한 게임**(루트 React 사용, 중복 React 번들 없음)
- 오라클 테스트: vitest → **Node 내장 `node:test`**(의존성 0). `engine/*.test.js`, `tests/{purity,controls}.test.js`
- `bench/fps.mjs`: `.ts` import → `.js` import
- 삭제: `package.json`, `package-lock.json`, `node_modules/`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/`, 구 `*.ts`/`*.tsx`

재검증 (루트 Node/Vite 만으로):
| AC | 명령 | 결과 |
|---|---|---|
| AC1~4 | `node --test` (engine/ + tests/) | ✅ 36/36 pass |
| AC5 | `node bench/fps.mjs` | ✅ fps ≈ 159.9 (≥30) @160×100 |
| 빌드 | 루트 `npm run build` | ✅ 성공 (게임이 루트 번들에 포함) |

---

## 2026-06-13 — 고퀄리티판 W1: 순수엔진 확장 (Workflow/서브에이전트 fallback)

### 지휘 결정 (ADR 0001/0002)
- 오케스트레이터 지정 지휘자 bkit `/pdca team`은 Agent Teams 비활성(env unset) → **Workflow 툴 + 일반 서브에이전트 fallback**으로 진행(프롬프트 허용). 메인 Claude가 게이트 단일 판정.
- 러너 **node --test + JS/JSDoc 유지**(루트 의존성 0, CLAUDE.md "테스트 프레임워크 없음"/"중첩 프로젝트 금지" 준수). 오라클의 `vitest …`는 동등한 `node --test …`로 치환.
- 스코프: **순수엔진 확장 우선**. GPU 셰이더 패리티(AC1 일부)·골든(AC11)·960×540@60(AC5')는 헤드리스 WebGL 위험으로 **다음 웨이브 연기**(ADR 0002, Playwright 오프스크린 권장).

### 신규 순수 모듈 (5개 병렬 빌드, 각 self-heal to green)
| 모듈 | 오라클 | 핵심 |
|---|---|---|
| `engine/worldgen.js` | AC8 | mulberry32 PRNG + value-noise(2D/3D), 4옥타브 하이트맵(분산>1.0), 3D노이즈 동굴(enclosed-air), 결정적 |
| `engine/light.js` | AC7 | 면 AO(이웃 solid 0~4 → 오목할수록 어두움) + flood-fill 광원 BFS(단조 감쇠·벽 차단) |
| `engine/physics.js` | AC10 | AABB 축분리 스윕(이분탐색으로 초고속 무관통) + 중력/점프 아치 + 1칸 스텝업 |
| `engine/atlas.js` | AC6 | 7블록 아틀라스(면별 타일) + faceShade top1.0>side0.72>bottom0.45 |
| `engine/chunks.js` | AC9 | 주입 생성기 기반 청크 매니저, 체비셰프 R 반경 로드/언로드 |

### 셸 배선 (저위험·빌드검증)
- `world.js`: `createGenWorld(seed)` 신규 export — 절차적 지형+동굴 월드(40×28×40). 기존 `createWorld`/AC2 무영향.
- `render.js`: 로컬 PALETTE/faceShade 제거 → `atlas.sampleBlockColor` 사용(면 방향 셰이딩 일원화).
- `Game.jsx`: 기본/리셋 월드를 `createGenWorld(1337)`로. 비행 조작 유지(중력 셸 배선은 다음 웨이브).

### 게이트 결과 (메인 직접 재실행)
- 전체 `node --test`: **83/83 pass, 0 fail** (baseline 36 → 83, 회귀 0)
- AC5 bench: **144.9 fps** @160×100 (≥30) PASS
- AC3 purity 독립 grep: engine/*.js **0 토큰**
- `npm run build`: 성공 · createGenWorld sanity OK
- 체크포인트 태그: `bkg-voxel-baseline-2026-06-13` → `bkg-voxel-engine-expansion-2026-06-13` → `voxel-shell-wired-2026-06-13`

### 다음 웨이브 (연기 항목)
1. GPU WebGL2 셰이더 레이마칭(render/raymarch) + raycast.js 패리티(AC1) — Playwright 오프스크린 하네스
2. 골든 이미지 회귀(AC11) + 960×540@60fps(AC5')
3. 셸 중력/점프 배선(physics.stepPhysics) + 청크 스트리밍 셸 연동(chunks) + AO/조명(light) 렌더 반영
