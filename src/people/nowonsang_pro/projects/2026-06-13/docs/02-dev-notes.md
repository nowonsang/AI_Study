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
