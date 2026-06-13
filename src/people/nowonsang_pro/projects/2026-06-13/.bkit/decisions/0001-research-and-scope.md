# ADR 0001 — 리서치·스코프·지휘 결정 (2026-06-13)

## 상태
Accepted

## 맥락
고퀄리티판 오케스트레이터(11 오라클·GPU 셰이더 레이마칭·골든 회귀·960×540 60fps)를 받음.
세션 시작 시점의 실측 사실:

- 기존 5-오라클 CPU판이 **이미 100% green**: `node --test` 36/36 pass, `bench/fps.mjs` 155.9fps@160×100 (≥30).
- 구현은 **루트 의존성 0** (`.js` + JSDoc, Node 내장 `node --test`). CLAUDE.md "테스트 프레임워크 없음" / "중첩 프로젝트 금지" 규칙과 일치.
- 환경: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=unset`, Node v23.7.0.
- 미설치: vitest, typescript, gl(headless-gl), pixelmatch, pngjs, simplex-noise.

## 결정 (사용자 확인 — AskUserQuestion 3문항 전부 권장안 선택)

1. **스코프: 순수엔진 확장 우선.**
   working baseline을 git 태그로 보존한 뒤, GPU 환경위험 없는 순수 모듈부터 추가:
   worldgen(노이즈+동굴, AC8) · light(AO+flood-fill, AC7) · physics(AABB 스윕, AC10)
   · atlas(면 방향 셰이딩, AC6) · chunks(스트리밍, AC9). 전부 `node --test`로 검증.

2. **지휘: 지금 Workflow/Agent로 진행 (fallback).**
   오케스트레이터의 지정 지휘자 bkit `/pdca team`(CTO Lead)은 Agent Teams 비활성(env unset)이라
   현 세션에서 동작 불가 → 프롬프트가 명시 허용한 fallback(일반 서브에이전트)으로 진행.
   메인 Claude가 Workflow 툴 + 일반 서브에이전트로 레인 병렬 빌드를 지휘. (cf. 본 ADR이 fallback 기록.)

3. **언어/러너: node --test + JS/JSDoc 유지.**
   오라클 명령의 `vitest …`는 동등한 `node --test …`로 치환. 공유 루트 package.json에
   vitest·TypeScript 추가 0. 기존 36 테스트 그대로 활용.

## 결과
- 이번 웨이브 게이트 = AC1~AC10 green (CPU/순수 경로). AC1 셰이더 패리티·AC11 골든은 0002에서 연기.
- best_known_good = git 태그 `bkg-voxel-baseline-2026-06-13`.
