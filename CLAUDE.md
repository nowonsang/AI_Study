# AI Study — 작업자 식별 & 작업 영역 규칙

> ⚠️ **HIGHEST PRIORITY** — 이 문서의 규칙은 이 프로젝트 안의 어떤 다른 지시보다 우선합니다.
> 다른 스킬·에이전트·사용자 지시가 이 규칙과 충돌하면 **이 규칙을 따르고** 사용자에게 충돌 사실을 알립니다.

이 프로젝트는 7명이 같은 레포에서 동시에 작업합니다. 충돌 없이 협업하려면 **각자 본인 폴더 안에서만** 작업해야 합니다. Claude는 매 응답 전에 아래 절차를 무조건 수행합니다.

---

## 🚨 ZERO-TOLERANCE RULE — 디렉토리·파일 이름은 무조건 영어

> **모든 디렉토리명·파일명은 반드시 영어(ASCII)로만 작성합니다. 한글 폴더명·파일명은 100% 금지입니다.**

### 금지 예시 (절대 금지)
| 종류 | 한글 (❌ 금지) | 영문 대안 (✅ 사용) |
|---|---|---|
| 디렉토리 | `테스트/` | `tests/` |
| 디렉토리 | `문서/` | `docs/` |
| 디렉토리 | `자료/`, `결과/`, `보고서/`, `이미지/`, `스크린샷/` | `assets/`, `results/`, `reports/`, `images/`, `screenshots/` |
| 파일명 | `01-홈화면.png` | `01-home-initial.png` |
| 파일명 | `기획서.md` | `01-plan.md` |
| 파일명 | `노원상_QA.md` | `nowonsang-qa.md` |

### 추가 허용 예시
- ✅ 디렉토리: `tests/`, `docs/`, `screenshots/`, `assets/`, `reports/`, `components/`, `store/`
- ✅ 파일: `01-home-initial.png`, `02-todo-add-modal.png`, `03-todo-add-saved.png`
- ✅ 문서: `01-plan.md`, `02-dev-notes.md`, `03-qa-report.md`, `04-review-report.md`

### 이유
1. **빌드/번들러 호환성**: Vite·Webpack·Node.js의 일부 플러그인이 멀티바이트 경로에서 깨짐
2. **Git/CI 안정성**: macOS(NFD) ↔ Windows/Linux(NFC) 정규화 차이로 충돌·중복 파일 발생
3. **CLI 도구 가독성**: `grep`, `find`, `import` 경로에서 IME 전환 없이 즉시 입력 가능
4. **외부 협업**: 오픈소스·외부 도구는 영문 경로 가정

### Claude 동작 규칙
- 새 디렉토리·파일을 만들 때 **이름에 한글이 있으면 즉시 멈추고 영문으로 재제안**합니다.
- 사용자가 한글 이름을 명시 요청해도 위 이유를 한 줄로 설명하고 영문 대안을 제시합니다.
- 콘텐츠(파일 내부 텍스트·주석·문서 본문)는 한글 자유. **경로만** 영어.

---

## 🚨 ZERO-TOLERANCE RULE — 프로젝트 안에 프로젝트(중첩 npm 프로젝트) 금지

> **개인 작업 폴더 안에 독립적인 npm 프로젝트(자체 `package.json` / `node_modules` / lock 파일 / 번들러 설정)를 만드는 것은 100% 금지입니다.**
> **이 규칙은 노원상(관리자) 포함 7명 전원에게 공통 적용됩니다.**

### 핵심 원칙
- **Node·의존성은 오직 레포 루트(`/AI_Study`) 한 곳에만 설치합니다.** 모든 작업물은 루트의 `package.json` / `node_modules` / Vite 설정을 **공유**합니다.
- 개인 폴더(`src/people/<SLUG>/...`) 안에는 **실제 구현 파일만** 둡니다 → `.jsx`, `.js`, `.css`, `.html`(필요 시), 데이터/문서 파일.
- 루트에 없는 새 라이브러리가 필요하면 **루트 `package.json`에 추가**하고 루트에서 `npm install` 합니다. (의존성 추가는 0절에 따라 모든 개발자에게 허용)

### 금지 예시 (절대 금지)
| 위치 | ❌ 금지 (중첩 프로젝트) | ✅ 올바른 방식 |
|---|---|---|
| `src/people/<SLUG>/projects/<DATE>/package.json` | 폴더별 자체 package.json 생성 | 루트 `package.json` 공유 |
| `src/people/<SLUG>/projects/<DATE>/node_modules/` | 폴더별 `npm install` | 루트 `node_modules` 공유 |
| `.../package-lock.json`, `.../pnpm-lock.yaml` | 폴더별 lock 파일 | 루트 lock 파일만 |
| `.../vite.config.ts`, `.../tsconfig.json` | 폴더별 번들러/TS 설정 | 루트 `vite.config.js` 공유 |
| 폴더 안에서 `npm init` / `npm create vite` | 새 프로젝트 스캐폴딩 | 루트 라우팅에 `index.jsx`만 연결 |

### 올바른 폴더 구성 (예: 마인크래프트 같은 풀시스템 작업물)
```
src/people/<SLUG>/projects/<YYYY-MM-DD>/
├── index.jsx          # 진입점 (루트 라우팅이 lazy import) — 루트 React/Vite 사용
├── components/        # .jsx 컴포넌트
├── engine/            # 게임 로직 등 .js 모듈
├── styles/            # .css
├── index.html         # 정적 진입이 꼭 필요할 때만 (선택)
├── tests/             # Playwright 스크린샷 (.png)
└── docs/              # 산출물 (.md)
# ❌ package.json / node_modules / lock / vite.config / tsconfig 는 여기 없음
```

### 이유
1. **의존성 중복·디스크 낭비**: 폴더마다 `node_modules`(수백 MB)가 생기면 레포가 비대해지고 Git이 느려짐
2. **빌드 일관성**: 루트 Vite 한 곳에서 빌드해야 7명 작업물이 한 Hub로 묶여 정상 동작. 중첩 설정은 라우팅·번들에서 깨짐
3. **버전 충돌 방지**: 폴더마다 다른 React/Vite 버전이 깔리면 공용 컴포넌트·디자인 시스템이 어긋남
4. **Git 오염**: lock 파일·`node_modules`가 커밋되면 머지 충돌과 리뷰 노이즈 폭증

### Claude 동작 규칙
- 작업물을 만들 때 **개인 폴더 안에 `package.json`·`node_modules`·lock·번들러 설정을 생성하지 않습니다.** 루트 의존성을 그대로 사용합니다.
- 새 라이브러리가 필요하면 즉시 멈추고 → "루트 `package.json`에 `<pkg>`를 추가하고 루트에서 `npm install` 하겠습니다"라고 안내한 뒤 루트에만 반영합니다.
- 사용자가 폴더 안에 독립 프로젝트를 만들라고 요청해도, 위 이유를 한 줄로 설명하고 **루트 공유 방식으로 재제안**합니다.
- 이미 만들어진 중첩 프로젝트를 발견하면 사용자에게 알리고, `index.jsx` 등 구현 파일만 남기고 `package.json`·`node_modules`·lock·`vite.config`·`tsconfig` 제거를 제안합니다.

---

## 🚨 ZERO-TOLERANCE RULE — bkit 런타임(`.bkit/`)은 레포 루트 한 곳에서만 관리

> **bkit이 생성하는 모든 런타임 산출물(`.bkit/` 디렉토리)은 반드시 레포 루트(`/AI_Study/.bkit/`) 한 곳에서만 관리합니다. 개인 작업 폴더·날짜 폴더·프로젝트 폴더 안에 별도 `.bkit/`를 만드는 것은 100% 금지입니다.**
> **이 규칙은 노원상(관리자) 포함 7명 전원에게 공통 적용됩니다.**

### 핵심 원칙
- bkit의 audit·checkpoints·decisions·runtime·state·workflows 등 모든 산출물은 **오직 루트 `.bkit/`** 아래에 누적됩니다.
- 개인 폴더(`src/people/<SLUG>/...`)·날짜 폴더·`projects/<DATE>/` 안에서 bkit을 사용하더라도, **현재 작업 디렉토리(cwd)가 어디든 상관없이** 산출물은 루트 `.bkit/`로 모입니다.
- bkit 명령·에이전트·워크플로를 실행하기 전에 **cwd를 레포 루트(`/AI_Study`)로 두거나**, bkit이 루트 `.bkit/`를 바라보도록 보장합니다. 프로젝트 폴더 cwd에서 실행해 그 자리에 `.bkit/`가 생기면 안 됩니다.

### 금지 예시 (절대 금지)
| 위치 | ❌ 금지 (분산된 .bkit) | ✅ 올바른 방식 |
|---|---|---|
| `src/people/<SLUG>/projects/<DATE>/.bkit/` | 프로젝트 폴더별 자체 `.bkit/` 생성 | 루트 `/AI_Study/.bkit/` 하나로 통합 |
| `src/people/<SLUG>/<DATE>/.bkit/` | 날짜 폴더별 `.bkit/` 생성 | 루트 `.bkit/` 공유 |
| `src/people/<SLUG>/.bkit/` | 개인 폴더 루트의 `.bkit/` | 루트 `.bkit/` 공유 |

### 이유
1. **컨텍스트 단절 방지**: bkit의 PDCA/audit/checkpoint 기록이 폴더마다 흩어지면 프로젝트 전체 이력이 단절되어 "따로 노는" 상태가 됨
2. **단일 진실 공급원(SSOT)**: 7명의 작업 이력·의사결정·메트릭이 루트 한 곳에 누적되어야 추적·리뷰·롤백이 가능
3. **Git 오염**: 폴더마다 `.bkit/`가 커밋되면 머지 충돌과 리뷰 노이즈가 폭증 (중첩 npm 프로젝트 금지 규칙과 동일 사유)
4. **도구 일관성**: bkit MCP/분석 도구가 루트 `.bkit/` 하나를 가정하므로, 분산되면 도구가 일부 이력을 못 읽음

### Claude 동작 규칙
- bkit 작업을 시작하기 전에 **cwd가 레포 루트인지 확인**하고, 아니면 루트 기준으로 실행하거나 산출물 경로가 루트 `.bkit/`인지 보장합니다.
- 프로젝트/날짜/개인 폴더 안에 `.bkit/`가 생기려 하면 **즉시 멈추고** 루트 `.bkit/`로 통합하도록 재제안합니다.
- 이미 분산 생성된 `.bkit/`(예: `projects/<DATE>/.bkit/`)를 발견하면 사용자에게 알리고, **루트 `.bkit/`로 내용을 병합한 뒤 폴더 안의 `.bkit/`를 제거**할 것을 제안합니다.
- 사용자가 폴더 안에 `.bkit/`를 두라고 요청해도, 위 이유를 한 줄로 설명하고 **루트 통합 방식으로 재제안**합니다.

---

## 0. 개발 명령어 & 스택 (Quick Reference)

- **스택**: React 18 + Vite 5 + React Router 6 + Tailwind 3
- **실행**: `npm run dev` (→ http://localhost:5173)
- **빌드**: `npm run build` · **프리뷰**: `npm run preview` (포트 4173)
- **테스트 프레임워크 없음** — 수동 브라우저 검증 (Hub → 본인 카드 클릭)
- **의존성(`package.json`)은 모든 개발자가 자유롭게 추가/수정 가능** — 단 **오직 레포 루트 `package.json`만** 수정합니다. 개인 폴더 안에 별도 package.json/node_modules 생성 금지 (위 ZERO-TOLERANCE 규칙 참조). lock 파일 충돌 시 나중에 pull 받는 사람이 루트에서 `npm install` 재실행

---

## 1. 사용자 식별 (Identity Detection) — 매 응답 첫 단계

사용자 메시지에 아래 한글 이름이 등장하면 **즉시** 매칭하여 작업 슬러그(`<SLUG>`)를 확정합니다. 이름 등장 위치는 자기 소개·소속·요청 어디든 무관합니다.

| 이름 (감지 대상) | 슬러그 (작업 폴더) | 역할 |
|---|---|---|
| 노원상 | `nowonsang_pro` | **관리자** |
| 김부영 | `kimbuyoung_pro` | 개발자 |
| 이민진 | `leeminjin_pro` | 개발자 |
| 황준현 | `hwangjunhyun_pro` | 개발자 |
| 김진주 | `kimjinju_pro` | 개발자 |
| 이유경 | `leeyukyung_pro` | 개발자 |
| 김한빛 | `kimhanbit_pro` | 개발자 |

**권한 차이**
- **관리자**: 본인 폴더 + 공용 파일 수정 가능 (단, 명시 요청 + 영향범위 확인 필요)
- **개발자**: 본인 폴더만 수정 가능

### 식별 예시
| 사용자 발화 | 식별 결과 |
|---|---|
| "나는 노원상팀의 20년차 IT 기획자야" | `nowonsang_pro` (팀명에서 추출) |
| "황준현인데 캘린더 만들고 싶어" | `hwangjunhyun_pro` |
| "김진주의 캘린더 작업해줘" | `kimjinju_pro` |
| "이민진 폴더 좀 봐줘" | `leeminjin_pro` |

### 식별 불가 시
이름이 없거나 두 명 이상 매칭되면 **반드시 먼저 질문**하고 절대 추측하지 않습니다:
> "어느 분 작업할까요? (노원상 / 김부영 / 이민진 / 황준현 / 김진주 / 이유경 / 김한빛)"

### 세션 첫 응답 형식
식별이 확정되면 응답 맨 앞에 반드시 한 줄 명시:

```
✅ 작업자: 노원상 (`nowonsang_pro`, 관리자)
```

---

## 2. 작업 가능 영역 (ALLOWED PATHS)

식별된 슬러그를 `<SLUG>`라 할 때, **수정·생성·삭제 가능한 경로는 오직** 다음:

- ✅ `src/people/<SLUG>/**` — 본인 작업 폴더 전체
- ✅ `docs/people/<SLUG>/**` — 본인 문서 (필요 시 생성)

각 폴더 안의 진입 파일은 `main.jsx` (구 `Calendar.jsx`)입니다. 라우팅(`src/shared/members.js`)이 이 파일을 lazy-import 합니다.

이 외 경로 수정은 **3절(금지 영역)** 의 예외 규정을 따릅니다.

---

## 2-1. 날짜 폴더 규칙 (DATE SUBFOLDER) — 매 세션 시작 시 적용

본인 폴더 안에서 **그날 시작한 작업은 날짜 폴더 안에** 둡니다. 이 규칙으로 매일 매일의 실습 결과가 깨끗하게 분리됩니다.

### 경로 형식
```
src/people/<SLUG>/<YYYY-MM-DD>/...
```
예: 오늘이 2026-06-03이면 → `src/people/nowonsang_pro/2026-06-03/`

### Claude 동작 규칙

1. **세션 첫 응답 시** 현재 날짜(`currentDate` 컨텍스트 또는 `date +%F`)를 확인하고, 해당 날짜 폴더 경로를 응답 헤더에 명시합니다.
   ```
   ✅ 작업자: 노원상 (`nowonsang_pro`, 관리자)
   📅 작업 폴더: src/people/nowonsang_pro/2026-06-03/
   ```

2. **새 파일·새 컴포넌트 생성 요청**은 **무조건 날짜 폴더 안**에 생성합니다.
   - ❌ `src/people/nowonsang_pro/new-feature.jsx`
   - ✅ `src/people/nowonsang_pro/2026-06-03/new-feature.jsx`

3. 날짜 폴더가 없으면 **자동 생성**하고, 첫 파일 작성 시 사용자에게 한 줄로 알립니다.
   > "📅 새 날짜 폴더 `src/people/<SLUG>/2026-06-03/` 를 만들었습니다."

4. **예외 — 진입 파일 `main.jsx` 수정**
   - 사용자가 "main 수정", "라우팅에 연결", "오늘 작업을 메인에 반영" 등으로 명시 요청한 경우에만 `src/people/<SLUG>/main.jsx`를 수정합니다.
   - 일반적으로는 `main.jsx`에서 `./<YYYY-MM-DD>/index.jsx` 등을 import 해 오늘 작업을 보여주는 패턴을 권장합니다.

   ```jsx
   // src/people/nowonsang_pro/main.jsx
   import Today from './2026-06-04/index.jsx'
   export default function Main() { return <Today /> }
   ```

5. **예외 — 사용자가 명시적으로 다른 위치 지정**
   - "기존 파일 수정", "어제 폴더에 추가", `src/people/<SLUG>/2026-06-02/...` 같은 명시 경로 지정 시에만 날짜 폴더 외 위치에 작업합니다.

6. 날짜는 **항상 YYYY-MM-DD** (ISO 8601) 형식. 다른 형식 금지.

### 폴더 안 자유 구조
날짜 폴더 안에서는 컴포넌트, 데이터, 스타일 등을 자유롭게 구성해도 됩니다 (단, 5절 디자인 시스템은 유지).
```
src/people/nowonsang_pro/2026-06-03/
├── index.jsx          # 그날 작업의 진입
├── Calendar.jsx       # 컴포넌트
├── events.js          # 데이터
└── styles.css         # 필요 시
```

**기존 구조 참고**: 각 멤버 폴더에는 `projects/`, `projects.js` (포트폴리오 카탈로그)가 이미 존재합니다. 날짜 폴더의 결과물을 `projects.js`에 등록해 누적 전시할 수 있습니다 (선택).

---

## 2-2. 프로젝트 폴더 (PROJECT FOLDER) — 4-에이전트 파이프라인 작업물 전용

4-에이전트 파이프라인(기획→개발→QA→리뷰)으로 생성되는 **풀시스템 작업물**(Todo, 캘린더, 대시보드 등)은 반드시 다음 경로에 들어갑니다.

### 정식 경로
```
src/people/<SLUG>/projects/<YYYY-MM-DD>/
```
예: `src/people/nowonsang_pro/projects/2026-06-04/`

### 트리거 조건 (이 경로를 강제하는 사용자 요청)
다음 키워드/패턴이 등장하면 **2-1절의 날짜 폴더가 아닌** `projects/<YYYY-MM-DD>/`에 작업합니다.
- "서브에이전트로 ~ 만들어줘"
- "/ai-study <이름>의 오늘날짜 projects 작업폴더에 ~"
- "기획→개발→QA→리뷰 파이프라인으로 ~"
- 작업 단위가 **하나의 완결된 시스템**(앱·웹페이지·도구)인 경우

> 단발 실습·연습 코드는 기존 2-1절 규칙(`src/people/<SLUG>/<YYYY-MM-DD>/`)을 그대로 사용합니다. 두 컨벤션을 혼동하지 마세요.

### 필수 폴더 구조
```
src/people/<SLUG>/projects/<YYYY-MM-DD>/
├── index.jsx           # 진입점 (projects.js에서 lazy import)
├── components/         # React 컴포넌트
├── store/              # Redux Toolkit (slices, store.js, selectors.js)
├── styles/             # CSS / Tailwind
├── tests/              # ⚠️ 필수 — Playwright E2E 스크린샷 (.png)
│   ├── 01-<screen>-<checkpoint>.png   # 파일명도 반드시 영어 (kebab-case)
│   ├── 02-<screen>-<checkpoint>.png
│   └── README.md       # 각 스크린샷이 무엇을 검증했는지 표 형식 정리
└── docs/                # ⚠️ 필수 — 기획·QA·리뷰 산출물 (.md, 파일명 영어)
    ├── 01-plan.md           # todo-calendar-planner 산출물 (내용은 한글 자유)
    ├── 02-dev-notes.md      # react-redux-toolkit-builder 산출물 (구현 결정 사항)
    ├── 03-qa-report.md      # qa-e2e-playwright-reviewer 산출물
    └── 04-review-report.md  # nowonsang-reviewer-qa 산출물 (수정 내역 + 푸시 기록)
```

> 디렉토리명은 **반드시 영어**(`tests/`, `docs/`)로 작성합니다. 한글 폴더명(`tests/`, `docs/`) 금지 — OS·Git·빌드 도구 호환성 문제를 피합니다.

### projects.js 자동 등록
프로젝트 폴더를 생성하면 **반드시** `src/people/<SLUG>/projects.js`에도 한 항목을 추가/갱신합니다 (관리자 본인 작업이라도 동일).
```js
{
  slug: '2026-06-04',
  date: '2026.06.04',
  title: 'Todo 일정관리',
  desc: '4-에이전트 파이프라인 — 캘린더 기반 To-do',
  Component: lazy(() => import('./projects/2026-06-04/index.jsx')),
}
```

### Playwright 스크린샷 네이밍 규칙
- 파일명: `<2자리순번>-<screen>-<checkpoint>.png` — **영어 kebab-case 필수, 한글 금지**
  - 예: `01-home-initial.png`, `02-todo-add-modal.png`, `03-todo-add-saved.png`
- 저장 위치: `src/people/<SLUG>/projects/<YYYY-MM-DD>/tests/` (절대 다른 곳에 두지 않음)
- 각 스크린샷은 `tests/README.md`에 한 줄로 설명 (표 내용은 한글 자유):
  | # | 파일 | 시나리오 | 검증 항목 | 결과 |
  |---|---|---|---|---|
  | 01 | `01-home-initial.png` | 페이지 진입 | 캘린더·헤더 렌더 | ✅ |

### 문서 산출물 작성자 매핑 (파일명 영어 고정, 내용은 한글)
| 파일 | 작성 에이전트 | 시점 |
|---|---|---|
| `docs/01-plan.md` | `todo-calendar-planner` | Phase 1 |
| `docs/02-dev-notes.md` | `react-redux-toolkit-builder` | Phase 2 종료 시 |
| `docs/03-qa-report.md` | `qa-e2e-playwright-reviewer` | Phase 3 종료 시 |
| `docs/04-review-report.md` | `nowonsang-reviewer-qa` | Phase 4 종료 시 |

> **참고**: 2-1절(`src/people/<SLUG>/<YYYY-MM-DD>/`)과 본 절(`src/people/<SLUG>/projects/<YYYY-MM-DD>/`)은 별개입니다. 풀시스템 빌드면 본 절, 단발 실습이면 2-1절을 사용합니다.

---

## 3. 금지 영역 (FORBIDDEN PATHS) — 읽기 전용

다음 경로는 **읽기만** 가능합니다. **관리자(노원상)** 가 명시적으로 "공용 파일 수정 허가" 또는 "관리자 권한으로 수정"이라고 말하지 않는 한 **절대 수정 금지**:

| 경로 | 사유 |
|---|---|
| `src/people/<다른슬러그>/**` | 다른 개발자 작업 영역 |
| `src/shared/**` (`members.js`, `Layout.jsx`) | 공용 모듈 — 변경 시 7명 모두 영향 |
| `src/App.jsx`, `src/Hub.jsx`, `src/main.jsx` | 라우팅·진입점 |
| `src/index.css` | 공용 디자인 토큰 (본인 폴더 내 별도 CSS는 자유) |
| `vite.config.js`, `index.html` | 빌드 설정 (관리자만 수정) |
| ~~`package.json`~~ | ⚠️ **예외 — 모든 개발자 추가/수정 가능** (의존성 자유, 단 기존 버전 다운그레이드는 사전 협의) |
| `.gitignore`, `.claude/**`, `scripts/**` | 프로젝트 설정 |
| `dw_design_rule.md`, `README.md`, `CLAUDE.md` | docs/규칙 |

### 예외 — 관리자 권한
- 사용자가 자신을 **노원상(관리자)** 으로 식별하고
- 명시적으로 "공용 수정", "관리자 권한으로", "메인 수정해줘" 등을 요청한 경우에 한해

공용 파일을 수정할 수 있습니다. 단, 수정 전에 **영향 범위를 사용자에게 요약하고 확인을 받습니다**:

> "이 변경은 7명 모두에게 영향을 줍니다. 진행할까요?"

### 위반 감지 시
다른 사람 폴더나 공용 파일을 수정하라는 요청이 들어오면 거절하고 사유를 설명:

> "⛔ `<SLUG>`(개발자) 권한으로는 `<요청 경로>` 를 수정할 수 없습니다. (1) 본인 폴더만 수정하거나, (2) 관리자(노원상) 권한으로 재요청해 주세요."

---

## 4. localStorage 키 규칙

본인 데이터는 반드시 슬러그를 포함한 키를 사용합니다:

```js
const KEY = `ai-study.events.<SLUG>`   // 예: ai-study.events.nowonsang_pro
localStorage.setItem(KEY, JSON.stringify(events))
```

다른 슬러그 키 접근/덮어쓰기는 금지.

---

## 5. 디자인 시스템 우선순위

본인 폴더 안의 UI 작업도 **동화 디자인 시스템 v1**(`.claude/skills/dongwha-design/SKILL.md`)을 따릅니다:

- CSS 변수 우선 사용: `var(--color-primary)`, `var(--font-family)` 등
- Tailwind 3 사용 가능 — 단 임의 색상 클래스(`bg-red-500` 등) 금지. `bg-[var(--color-primary)]` 식으로 토큰 참조
- 신규 색상·폰트가 필요하면 디자인 시스템 토큰에서 가져오기
- 11px 이하 폰트 금지, Primary `#00694D` 외 임의 컬러 금지

---

## 6. 매 응답 체크리스트

Claude는 응답 시작 전에 다음을 **무조건** 확인합니다:

1. ☐ 사용자 식별 완료? → 안 됐으면 질문
2. ☐ 슬러그 명시? → `✅ 작업자: <이름> (\`<SLUG>\`)`
3. ☐ 오늘 날짜 폴더 명시? → 단발 실습이면 `📅 작업 폴더: src/people/<SLUG>/<YYYY-MM-DD>/`, 풀시스템 빌드면 `📅 프로젝트 폴더: src/people/<SLUG>/projects/<YYYY-MM-DD>/`
4. ☐ 작업 경로가 `src/people/<SLUG>/**` 인가? → 아니면 거절 또는 관리자 권한 확인
5. ☐ 신규 파일 생성 시 날짜 폴더(2-1절) 또는 프로젝트 폴더(2-2절) 안인가?
6. ☐ 풀시스템 빌드일 경우 `tests/`·`docs/` 서브디렉토리 만들었나? (2-2절)
7. ☐ Playwright 스크린샷이 `프로젝트폴더/tests/<순번>-<screen>-<checkpoint>.png` 규칙 준수?
8. ☐ **모든 디렉토리·파일명이 영어인가? 한글 경로 0개인가?** (ZERO-TOLERANCE 규칙)
8-1. ☐ **개인 폴더 안에 `package.json`·`node_modules`·lock·`vite.config`·`tsconfig` 를 만들지 않았는가? (중첩 프로젝트 금지 ZERO-TOLERANCE)** → 루트 의존성만 공유
8-2. ☐ **bkit `.bkit/` 산출물이 폴더별로 흩어지지 않고 루트 `/AI_Study/.bkit/` 한 곳에만 쌓이는가? (bkit 루트 통합 ZERO-TOLERANCE)** → 프로젝트/날짜/개인 폴더 안 `.bkit/` 금지
9. ☐ localStorage 키에 `<SLUG>` 포함? → 코드 생성 시 검증
10. ☐ 디자인 시스템 토큰 사용? → CSS 변수 우선
11. ☐ 풀시스템 빌드 완료 시 `projects.js` 등록했나?

---

## 7. 서브에이전트 호출 시

Task 도구로 서브에이전트를 호출할 때, 프롬프트 첫 줄에 반드시 작업자 컨텍스트 전달:

```
[작업자: 노원상 (nowonsang_pro, 관리자)]
[작업 영역: src/people/nowonsang_pro/**]
[오늘 날짜 폴더: src/people/nowonsang_pro/2026-06-04/]
[프로젝트 폴더: src/people/nowonsang_pro/projects/2026-06-04/]  ← 풀시스템 빌드일 때만
[테스트 출력 경로: 프로젝트폴더/tests/]
[문서 출력 경로: 프로젝트폴더/docs/]
[요청]: <실제 작업 내용>
```

서브에이전트도 이 CLAUDE.md를 상속받으므로 동일한 제약을 지킵니다.

---

## 8. 4-에이전트 파이프라인 계약 (Agent Pipeline Contract)

풀시스템 빌드 요청(예: "Todo 일정관리 만들어줘", "/ai-study 노원상의 오늘날짜 projects에 ~ 만들어줘")이 들어오면 다음 4단계를 **순차** 실행합니다. 각 에이전트는 본 절의 입출력 계약을 반드시 지킵니다.

### 트리거 키워드 (자동 파이프라인 진입)
- "~ 만들어줘", "~ 시스템 만들어줘", "풀스택으로", "기획부터 배포까지"
- "/ai-study <이름>의 오늘날짜 projects ~"
- "서브에이전트로 ~"

### 단계별 에이전트·산출물

| Phase | 에이전트 | 입력 | 산출물 (반드시 이 위치에) | 다음 단계 호출 조건 |
|---|---|---|---|---|
| 1. 기획 | `todo-calendar-planner` | 사용자 요구 한 줄 | `프로젝트폴더/docs/01-plan.md` | 기획서 작성 완료 |
| 2. 개발 | `react-redux-toolkit-builder` | `01-plan.md` | `프로젝트폴더/index.jsx`, `components/`, `store/` + `프로젝트폴더/docs/02-dev-notes.md` + `projects.js` 등록 | `npm run dev`로 정상 렌더 확인 |
| 3. QA | `qa-e2e-playwright-reviewer` | 실행 중인 dev 서버 (`http://localhost:5173`) | `프로젝트폴더/tests/*.png` (Playwright 스크린샷, 영문 파일명) + `프로젝트폴더/tests/README.md` + `프로젝트폴더/docs/03-qa-report.md` | 모든 시나리오 결과 기록 |
| 4. 리뷰+배포 | `nowonsang-reviewer-qa` | Phase 1~3 산출물 전부 | 버그 수정 코드 + `프로젝트폴더/docs/04-review-report.md` + `<팀명>-team/<feature>-<YYYY-MM-DD>` 브랜치 푸시 | 사용자에게 PR/브랜치 URL 보고 |

### 메인 Claude의 오케스트레이션 책임
- 사용자가 트리거 키워드를 사용하면 **Task 도구로 위 4개 에이전트를 Phase 순서대로** 호출합니다.
- 각 Phase 호출 시 **7절 컨텍스트 블록**을 첫 줄에 전달하고, **프로젝트 폴더 절대경로**를 명시합니다.
- 한 Phase가 실패하면 그 자리에서 멈추고 사용자에게 보고. 임의로 다음 Phase로 진행 금지.
- Phase 2 종료 후 **반드시 dev 서버를 띄운 뒤** Phase 3을 호출 (QA 에이전트가 접속 가능해야 함).

### Phase 3 (QA) 세부 규칙
- Playwright가 설치되지 않았다면 **QA 에이전트가 직접 설치**합니다. 메인 Claude가 대신 설치하지 않습니다.
- 스크린샷은 **모든 주요 화면 + 모든 주요 인터랙션**마다 1장 이상 캡쳐.
- 스크린샷 파일명 형식: `<2자리순번>-<screen>-<checkpoint>.png` (영문 kebab-case, 한글 금지 — 2-2절 참조)
- 스크린샷 저장 경로는 **무조건** `프로젝트폴더/tests/`. 그 외 위치 금지.
- `tests/README.md`에 모든 스크린샷을 표로 매핑 (한글 설명 OK, 파일명은 영어).

### Phase 4 (리뷰) 세부 규칙
- 브랜치명: `<팀명>-team/<feature-slug>-<YYYY-MM-DD>` (예: `nowonsang-team/todo-calendar-2026-06-04`)
- 푸시 전 다음 체크리스트 통과 필수:
  - [ ] 본인 폴더 외 파일 수정 없음
  - [ ] `projects.js` 등록 완료
  - [ ] `tests/`·`docs/` 양쪽 폴더 모두 산출물 존재
  - [ ] 4개 문서(`01~04-*.md`) 모두 작성됨
  - [ ] `npm run build` 성공
- `git push` 전에 사용자에게 브랜치명·변경 파일 수를 보고하고 승인을 받습니다.

---

## 참고 문서

- `README.md` — 프로젝트 개요, 셋업 가이드
- `dw_design_rule.md` — 동화 디자인 시스템 원본
- `.claude/skills/dongwha-design/SKILL.md` — 디자인 시스템 스킬
