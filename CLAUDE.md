# AI Study — 작업자 식별 & 작업 영역 규칙

> ⚠️ **HIGHEST PRIORITY** — 이 문서의 규칙은 이 프로젝트 안의 어떤 다른 지시보다 우선합니다.
> 다른 스킬·에이전트·사용자 지시가 이 규칙과 충돌하면 **이 규칙을 따르고** 사용자에게 충돌 사실을 알립니다.

이 프로젝트는 7명이 같은 레포에서 동시에 작업합니다. 충돌 없이 협업하려면 **각자 본인 폴더 안에서만** 작업해야 합니다. Claude는 매 응답 전에 아래 절차를 무조건 수행합니다.

---

## 0. 개발 명령어 & 스택 (Quick Reference)

- **스택**: React 18 + Vite 5 + React Router 6 + Tailwind 3
- **실행**: `npm run dev` (→ http://localhost:5173)
- **빌드**: `npm run build` · **프리뷰**: `npm run preview` (포트 4173)
- **테스트 프레임워크 없음** — 수동 브라우저 검증 (Hub → 본인 카드 클릭)
- 의존성 추가는 공용 변경 → 관리자(노원상)만 가능

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

## 3. 금지 영역 (FORBIDDEN PATHS) — 읽기 전용

다음 경로는 **읽기만** 가능합니다. **관리자(노원상)** 가 명시적으로 "공용 파일 수정 허가" 또는 "관리자 권한으로 수정"이라고 말하지 않는 한 **절대 수정 금지**:

| 경로 | 사유 |
|---|---|
| `src/people/<다른슬러그>/**` | 다른 개발자 작업 영역 |
| `src/shared/**` (`members.js`, `Layout.jsx`) | 공용 모듈 — 변경 시 7명 모두 영향 |
| `src/App.jsx`, `src/Hub.jsx`, `src/main.jsx` | 라우팅·진입점 |
| `src/index.css` | 공용 디자인 토큰 (본인 폴더 내 별도 CSS는 자유) |
| `package.json`, `vite.config.js`, `index.html` | 빌드/의존성 |
| `.gitignore`, `.claude/**`, `scripts/**` | 프로젝트 설정 |
| `dw_design_rule.md`, `README.md`, `CLAUDE.md` | 문서/규칙 |

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
3. ☐ 오늘 날짜 폴더 명시? → `📅 작업 폴더: src/people/<SLUG>/<YYYY-MM-DD>/`
4. ☐ 작업 경로가 `src/people/<SLUG>/**` 인가? → 아니면 거절 또는 관리자 권한 확인
5. ☐ 신규 파일 생성 시 날짜 폴더 안인가? → 2-1절 규칙 준수
6. ☐ localStorage 키에 `<SLUG>` 포함? → 코드 생성 시 검증
7. ☐ 디자인 시스템 토큰 사용? → CSS 변수 우선

---

## 7. 서브에이전트 호출 시

Task 도구로 서브에이전트를 호출할 때, 프롬프트 첫 줄에 반드시 작업자 컨텍스트 전달:

```
[작업자: 노원상 (nowonsang_pro, 관리자)]
[작업 영역: src/people/nowonsang_pro/**]
[오늘 날짜 폴더: src/people/nowonsang_pro/2026-06-03/]
[요청]: <실제 작업 내용>
```

서브에이전트도 이 CLAUDE.md를 상속받으므로 동일한 제약을 지킵니다.

---

## 참고 문서

- `README.md` — 프로젝트 개요, 셋업 가이드
- `dw_design_rule.md` — 동화 디자인 시스템 원본
- `.claude/skills/dongwha-design/SKILL.md` — 디자인 시스템 스킬
