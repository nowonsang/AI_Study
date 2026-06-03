# AI Study

Claude Code를 활용한 AI 실습 프로젝트.

## 첫 번째 주제: 서브에이전트로 캘린더 일정관리 시스템 만들기

서브에이전트(sub-agent)를 활용해 역할을 분리하고, 협업 방식으로 프론트엔드 전용 캘린더 앱을 구현합니다.

### 팀 구성 (Sub-Agents)

| 역할 | 책임 |
|------|------|
| 기획자 (Planner) | 요구사항 정의, 기능 명세, 사용자 시나리오 작성 |
| 개발자 (Developer) | 기획서 기반 UI/로직 구현 |
| QA 담당자 (QA) | 기능 검증, 엣지 케이스 테스트, 버그 리포트 |
| 리뷰어 (Reviewer) | 코드 품질·구조·가독성 리뷰 및 개선 제안 |

### 기술 스택

- **백엔드 없음** — 데이터는 브라우저 `localStorage`에 저장
- HTML / CSS / JavaScript (또는 가벼운 프론트 프레임워크)
- 단일 페이지 캘린더 UI

### 주요 기능 (예정)

- 월/주 단위 캘린더 뷰
- 일정 추가 / 수정 / 삭제
- localStorage 기반 데이터 영속화
- 일정 카테고리 / 색상 분류

## 디렉토리 구조

```
AI_Study/
├── .claude/              # Claude Code 권한 및 서브에이전트 설정
├── README.md
├── .gitignore
└── (실습 산출물)
```

## 디자인 스킬

`.claude/skills/dongwha-design/SKILL.md` — 동화 디자인 시스템 v1 가이드.
UI/UX·컴포넌트·CSS·레이아웃 작업 시 자동 호출되어 GNB/Grid/타이포/컬러/컴포넌트 규정을 강제합니다.
원본: `dw_design_rule.md`.

수동 호출도 가능: `/dongwha-design` 또는 "동화 디자인 시스템 적용해서 ..."

## 서브에이전트 사용법

`.claude/agents/` 에 4명의 역할이 정의되어 있습니다.

| 파일 | 역할 |
|------|------|
| `planner.md`   | 기획자 — `docs/plan/spec.md` 작성 |
| `developer.md` | 개발자 — `src/` 하위 구현 |
| `qa.md`        | QA — `docs/qa/` 리포트 작성 |
| `reviewer.md`  | 리뷰어 — `docs/review/` 리뷰 작성 |

호출 예시 (Claude Code 채팅창에서):
- "planner 에이전트로 캘린더 앱 기획서 작성해줘"
- "developer 에이전트로 spec.md 보고 MVP 구현"
- "qa 에이전트로 점검"
- "reviewer 에이전트로 코드 리뷰"

## Claude Code 권한 정책

실습 흐름이 끊기지 않도록 광범위한 allow 목록 + `rm` 계열 deny 로 설정했습니다.

**최초 1회 설정** (Claude의 self-modification 안전장치 때문에 사용자가 직접 적용해야 합니다):

```bash
cp .claude/settings.local.template.json .claude/settings.local.json
```

- 허용: `git`, `npm/pnpm/yarn/bun`, `node/npx`, `mkdir/mv/cp`, `grep/find/cat/...`, Read/Write/Edit/WebFetch/WebSearch 등
- 금지: `rm`, `sudo rm`, `find -delete`, `find -exec rm` (실수 삭제 방지)

`settings.local.json` 자체는 `.gitignore` 로 커밋 제외됩니다. 팀원이 같은 설정을 쓰려면 템플릿만 공유하면 됩니다.
