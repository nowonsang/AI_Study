# 02 — 개발 노트 (Phase 2 산출물)

> **작성자**: `react-redux-toolkit-builder`
> **작성일**: 2026-06-04
> **입력**: `01-plan.md` v1.0
> **빌드 결과**: `npm run build` ✅ 성공 (vendor ~175 KB, app ~67 KB, 669 ms)

---

## 1. 구현 결정 사항 (Decisions)

### 1.1 Redux Toolkit 슬라이스 2개 (todos / ui)
- 데이터 (`todos`) 와 화면 상태 (`ui`) 를 분리. 이유:
  - `todos`만 localStorage 영속화 대상 → 미들웨어가 `action.type.startsWith('todos/')` 만 필터.
  - `ui` 변경(모달 open, 토스트 등)은 디스크 write 트리거하면 안 됨.
- 이로써 단일 `dispatch` 당 추가 IO 0회 (UI 액션) 또는 1회 (todo 액션) 로 비용 명확.

### 1.2 미들웨어 vs `store.subscribe`
- **미들웨어 선택**. 이유:
  - `action.type` 검사로 todos 액션만 골라낼 수 있어 불필요한 stringify 회피.
  - 실패(QuotaExceeded 등) 시 동일 dispatch 사이클 안에서 `uiActions.setStorageBlocked` + `showToast` 를 즉시 dispatch 가능 (subscribe는 다음 tick).
- `todos/hydrate` 자체는 write 제외 (초기 1회 로드 후 즉시 동일 데이터를 다시 쓰는 낭비 방지).

### 1.3 모달 = 네이티브 `<dialog>`
- 포커스 트랩, 백드롭, ESC 닫기, `inert` 처리가 브라우저 기본으로 제공.
- 별도 focus-trap 라이브러리·portal·a11y 핸들러 없이도 WCAG 가이드 충족.
- 단점: dirty 체크와 ESC 처리는 `onCancel` 이벤트를 `preventDefault` 한 뒤 직접 confirm 흐름을 돌려야 함 → `TodoFormModal`에서 처리.
- 모바일 풀스크린은 CSS 미디어쿼리(640px↓)로 100vw/100vh 적용. JS 분기 없음.

### 1.4 날짜·타임존 안전성
- **`new Date('YYYY-MM-DD')` 절대 사용 금지** (UTC 해석 → KST 9시간 시프트 → 전일 표기 버그).
- `dueDate`는 처음부터 끝까지 `'YYYY-MM-DD'` 문자열로 유지.
  - 비교: 문자열 동등 비교 (`byDate[key]`).
  - 표시용 Date 객체가 필요할 때만 `fromDateKey()` 로 `new Date(y, m-1, d)` 로 변환 (로컬 시각 자정).
- 캘린더 그리드는 `new Date(year, monthIndex, 1)` 기반으로 `date-fns` 의 `startOfMonth`, `endOfMonth`, `startOfWeek`, `endOfWeek`, `eachDayOfInterval` 을 사용.
- "오늘"·"오늘로 이동"·`uiSlice.initialState` 모두 위 헬퍼를 통해 로컬 시각으로 일관 처리.

### 1.5 메모이즈 셀렉터 (Reselect via `@reduxjs/toolkit`)
- `selectTodosByDate`: items → `{ 'YYYY-MM-DD': Todo[] }` 1회 buckettize + 정렬. 한 캘린더 렌더(35~42 셀) 마다 O(N) 의 N=총 todo 수 1회만 비용.
- `selectMonthGrid`: `currentMonth + selectedDate + byDate` 의존성. 월 변경/선택 변경/todos 변경 시에만 재계산.
- `selectTodosForSelectedDate`: 선택된 날짜만 패널에 전달.
- 단순 `state => state.todos.items.filter(...)` 를 셀에서 직접 호출하지 않아 불필요 리렌더 회피.

### 1.6 실행취소 (Undo Delete)
- `removeTodo` 즉시 → `showToast({ action: { kind: 'undo-delete', todo: <snapshot> }})`.
- 토스트 컴포넌트에서 "실행취소" 클릭 시 `restoreTodo(snapshot)` dispatch.
- 4초 auto-dismiss 와 동기. 사용자 체감 5초 ≈ 4초 toast 표시 시간으로 단순화.
- snapshot은 deleted 시점의 전체 객체이므로 `createdAt`/`updatedAt` 유지 → 위치 안정.

### 1.7 디자인 토큰 준수
- 모든 색상: `var(--color-primary)`, `var(--color-primary-dark)`, `var(--color-primary-light)`, `var(--color-text)`, `var(--color-text-secondary)`, `var(--color-border)`, `var(--color-bg)`, `var(--color-bg-alt)`.
- 보조 색 (red `#ef4444`, blue `#3b82f6`, emerald `#10b981`, violet `#8b5cf6`, gray `#6b7280`) 은 §6.1 매핑값을 그대로 사용 (Danger / 카테고리 색).
- Tailwind 의 임의 색상 클래스 (`bg-red-500` 등) 미사용. 레이아웃은 CSS 모듈 1개 (`styles/calendar.css`) 로 통합 — Tailwind 빌드는 영향 없음.
- 최소 폰트 12px 준수 (헬퍼/뱃지 텍스트 = 12px).

### 1.8 키보드 & 접근성
- 모달: 네이티브 `<dialog>` → Tab 트랩, ESC 닫기 (커스텀 dirty confirm).
- 캘린더: `<div role="gridcell" tabIndex={0}>` + Enter/Space 로 셀 선택. 월 이동은 윈도우 레벨 `keydown` 으로 ←/→ (모달 열려있거나 입력 포커스면 무시).
- 모든 아이콘 버튼에 `aria-label` (X, +, 🗑, ‹, ›, 토스트 닫기).
- 토스트 컨테이너 `role="region"`, 각 토스트 `role="status" aria-live="polite"`.

### 1.9 컴포넌트 트리 — 평면 디렉토리
- `components/calendar/`, `components/panel/`, `components/modal/`, `components/toast/`, `components/error/` 로 도메인별 그룹화.
- 공통 입력 컴포넌트(`Button`, `TextInput` 등)는 `TodoFormModal` 한 곳에서만 쓰여 따로 추출하지 않음 (YAGNI). v2에서 두 번째 폼이 등장하면 그때 분리.

---

## 2. 상태 설계 (State Shape)

```ts
{
  todos: {
    items: Todo[],
    hydrated: boolean,           // false → 빈 화면(스플래시), true → 본 화면
  },
  ui: {
    currentMonth: { year:number, month:number },   // 1-indexed
    selectedDate: 'YYYY-MM-DD',
    modal: { open, mode:'create'|'edit', todoId, presetDate },
    toasts: Array<{ id, type, message, action?, createdAt }>,
    welcomeBannerDismissed: boolean,
    storageBlocked: boolean,
  }
}
```

**예시 (`localStorage` 페이로드)**:
```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-06-04T10:30:00.000Z",
  "items": [
    { "id":"…", "title":"기획 회의", "dueDate":"2026-06-04",
      "startTime":"09:00", "endTime":"10:00", "priority":"high",
      "completed":false, "category":"work",
      "createdAt":"…", "updatedAt":"…" }
  ]
}
```

---

## 3. Slice · Selector 카탈로그

### todosSlice (`store/slices/todosSlice.js`)
| Action | Payload | 효과 |
|---|---|---|
| `todos/hydrate` | `Todo[]` | 초기 1회 로드 (write 안 함) |
| `todos/addTodo` | `{ title, description?, dueDate, startTime?, endTime?, priority, category? }` | id/createdAt/updatedAt 자동 부여 후 push |
| `todos/updateTodo` | `{ id, changes }` | merge + `updatedAt` 갱신 |
| `todos/removeTodo` | `id` | 배열에서 제거 |
| `todos/toggleComplete` | `id` | `completed` 반전 |
| `todos/restoreTodo` | `Todo` | undo용. 동일 id 이미 있으면 무시 |

### uiSlice (`store/slices/uiSlice.js`)
| Action | 효과 |
|---|---|
| `ui/setCurrentMonth` | 임의 월 set (1900~2099 sanity) |
| `ui/goToPrevMonth`, `goToNextMonth`, `goToToday` | 월 이동 (`goToToday` 는 selectedDate 도 오늘로) |
| `ui/setSelectedDate` | 'YYYY-MM-DD' |
| `ui/openCreateModal(presetDate?)`, `openEditModal(todoId)`, `closeModal` | 모달 상태 |
| `ui/showToast({ type, message, action? })` | id 자동 부여, 1초 내 동일 message dedupe, 최대 3개 stack |
| `ui/dismissToast(id)` | 제거 |
| `ui/dismissWelcomeBanner` | 환영 배너 닫기 |
| `ui/setStorageBlocked(bool)` | 저장 실패 시 배너 노출 |

### selectors (`store/selectors.js`)
| Selector | 메모 | 비고 |
|---|---|---|
| `selectAllTodos` | n | raw items |
| `selectHydrated` | n | App.jsx 의 첫 렌더 게이트 |
| `selectCurrentMonth` / `selectSelectedDate` / `selectModal` / `selectToasts` / `selectWelcomeBannerDismissed` / `selectStorageBlocked` | n | raw |
| `selectTodosByDate` | **Y** | items → `{ key: Todo[] }`, 셀별 정렬 |
| `selectMonthGrid` | **Y** | cell 배열 (date, dateKey, isCurrentMonth, isToday, isSelected, todos) |
| `selectTodosForSelectedDate` | **Y** | 패널 전용 |
| `selectTodoById(id)` | factory | 필요 시 사용 (현 코드는 미사용 — TodoFormModal이 `allTodos`에서 직접 find) |

---

## 4. 컴포넌트 트리

```
index.jsx (Provider)
└── App.jsx (hydrate + ErrorBoundary)
    ├── TopBar
    ├── <main>
    │   ├── WelcomeBanner            (전체 0건 + storageBlocked)
    │   └── .tc-layout
    │       ├── CalendarView
    │       │   ├── MonthHeader      (‹ › 오늘)
    │       │   ├── WeekdayRow
    │       │   └── CalendarGrid
    │       │       └── DayCell × 35~42
    │       │           ├── tc-day-number
    │       │           ├── tc-cell-add (hover)
    │       │           └── TodoBadge × ≤3 + "+N more"
    │       └── TodoListPanel
    │           ├── PanelHeader (날짜 + 카운트)
    │           ├── "+ 새 일정 추가" 버튼
    │           └── TodoListItem × N  OR  EmptyState
    ├── TodoFormModal (<dialog>, 항상 마운트)
    └── ToastContainer (4초 auto-dismiss)
```

---

## 5. localStorage 키

- **KEY**: `ai-study.todo.nowonsang_pro.2026-06-04`
- **schemaVersion**: `1`
- **저장 시점**: 모든 `todos/*` 액션 (단, `todos/hydrate` 제외)
- **마이그레이션**: `schemaVersion !== 1` → 백업키 (`<KEY>.backup.<timestamp>`) 로 옮기고 빈 배열로 시작.
- **에러 시**: `console.error` + `storageBlocked=true` + 토스트.

---

## 6. 01-plan.md 대비 차이 / 조정 사항

| 영역 | 조정 | 사유 |
|---|---|---|
| 컴포넌트 분리 | `common/` (Button, TextInput …) 미생성 | TodoFormModal 1곳에서만 사용 → YAGNI. v2에서 재사용 발생 시 분리. |
| 라이브러리 | `clsx` 설치는 하였으나 실제 import 없음 | 조건부 class 가 인라인 `data-*` 속성으로 해결됨. 향후 사용 가능성 위해 dep 유지. |
| 셀 키보드 | ←/→ 로 월 이동만 구현. ↑/↓/← /→ 로 셀 포커스 이동은 미구현 | 셀 35~42개 grid 포커스 trap 복잡도 vs v1 가치 trade-off. Tab/Enter/Space 로 충분. |
| Undo 타이머 | 4초 (토스트 자동 닫힘과 동기) | 별도 5초 stash 매니저 도입은 과설계. snapshot 은 토스트 dismiss 와 함께 폐기. |
| 모바일 bottom sheet | 현재는 패널이 캘린더 아래로 흘러내림(stack) + 모달은 풀스크린 | 진정한 bottom sheet 드래그/슬라이드는 별도 라이브러리 필요. v1 수용기준 통과 (모바일에서 패널·모달 모두 가시) |
| Welcome banner dismiss 영속화 | 메모리 only (새로고침 후 다시 표시) | 데이터 0건 가정 자체가 짧은 onboarding 윈도우 → 영속화 가치 낮음. v2 검토. |
| Storage blocked 감지 | persist 시점 실패만 감지 | hydrate 시 disable 감지는 try/catch 로 silent fallback. 사용자 체감 시점(저장)에서 알림. |

---

## 7. 알려진 제약 / 트레이드오프

1. **모달 dirty confirm**: 변경사항이 있을 때 ESC/X/배경 클릭 시 `window.confirm` 사용. 디자인 토큰을 따르는 커스텀 컨펌은 v2 과제.
2. **삭제 confirm**: 동일하게 `window.confirm`. Phase 3 QA는 이 다이얼로그도 스크린샷에 잡힐 수 있음 (브라우저 native UI).
3. **반복 일정·검색·드래그 이동·다크 모드**: 명시적 v2 backlog (§9).
4. **localStorage write 동기 stringify**: v1 규모(수백 건)에서는 충분. v2 에서 throttle/debounce 권장.
5. **`<dialog>` 브라우저 호환성**: Chrome/Edge/Safari/Firefox 모두 지원 (2022+). 구형 브라우저(IE/구 Safari)는 비지원 — 본 프로젝트 범위 밖.
6. **Tailwind 의존 최소화**: 레이아웃 1개 (App.jsx 의 `.tc-layout` grid) 외에는 Tailwind 클래스 사용 안 함. 디자인 토큰 강제를 위한 CSS 변수 기반 BEM-ish 클래스(`tc-*`)로 통합 — 다른 멤버 폴더와 스타일 충돌 가능성 최소.

---

## 8. 다음 Phase (QA) 체크 포인트

`qa-e2e-playwright-reviewer` 가 우선 확인할 항목:

1. **AC-01 초기 진입**: localStorage 비어있을 때 환영 배너 + 빈 패널 EmptyState 표시 — `tests/01-home-initial.png`
2. **AC-03 추가 모달**: 일자 셀 클릭 → "+" hover → 클릭 → `<dialog>` 가 native modal 로 띄워짐. 백드롭이 클릭 가능해야 함.
3. **AC-04 / AC-05 폼 검증**: 제목 공란 → 저장 disabled + 빨간 헬퍼. 종료 < 시작 → 헬퍼 + 저장 disabled. `aria-invalid="true"` 가 input 에 붙는지 확인.
4. **AC-06 완료 토글**: 체크박스 클릭 → `opacity 0.55` + `text-decoration: line-through`. 정렬상 패널 하단으로 이동.
5. **AC-08 삭제 + 실행취소**: window.confirm → 확인 → 토스트 우상단 "실행취소" 버튼 → 클릭 시 동일 위치 복원. 4초 후 자동 사라짐 + 복원 불가.
6. **AC-09 월 이동**: ‹ › 클릭, 키보드 ←/→ (캘린더 영역 포커스 또는 body), "오늘" 버튼 → selectedDate 도 오늘로 set.
7. **AC-10 새로고침 영속화**: F5 후 동일 데이터 복원 확인 + DevTools Application 탭에서 키 `ai-study.todo.nowonsang_pro.2026-06-04` 확인.
8. **AC-11 +N more**: 한 셀에 5건 등록 → 처음 3건 뱃지 + "+2 more" 텍스트.
9. **AC-12 키보드 포커스 링**: Tab 순환에서 모든 인터랙티브 요소(버튼/셀/입력/체크박스/뱃지)에 Primary outline.
10. **AC-13 반응형**: 1280→375 viewport 변경 시 캘린더 아래로 패널 스택, 모달은 풀스크린.
11. **AC-14 시각화**: priority=high + category=work todo → 좌측 4px primary stripe + 빨간 dot.

**진입 경로 (QA용)**:
```
http://localhost:5173 → 홈 (Hub) → "노원상" 카드 → "Todo 일정관리" (2026.06.04) → 캘린더 렌더
```

**localStorage 초기화 방법** (QA가 빈 상태 테스트 시):
```js
// 브라우저 DevTools Console
localStorage.removeItem('ai-study.todo.nowonsang_pro.2026-06-04')
location.reload()
```

---

**[Phase 2 완료]** — 다음: `qa-e2e-playwright-reviewer`.
