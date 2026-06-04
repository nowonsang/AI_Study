# 04. 리뷰 & 수정 보고서 (Phase 4)

- **작업자**: 노원상 (`nowonsang_pro`, 관리자)
- **날짜**: 2026-06-04
- **프로젝트 폴더**: `src/people/nowonsang_pro/projects/2026-06-04/`
- **리뷰어**: 20년차 IT 리뷰어 (nowonsang-reviewer-qa 에이전트)
- **파이프라인 단계**: Phase 4 (리뷰 + 푸시) — 마지막 단계

---

## 0. 입력 산출물 요약

| 단계 | 파일 | 핵심 |
|---|---|---|
| Phase 1 (기획) | `docs/01-plan.md` | v1 단일 사용자 캘린더 To-do, localStorage 전용, 15개 기능 명세, 14개 AC |
| Phase 2 (개발) | `docs/02-dev-notes.md` | RTK 2-slice (todos/ui) + storageMiddleware + 네이티브 `<dialog>` 모달, 컴포넌트 트리 평면화, 빌드 ✅ |
| Phase 3 (QA) | `docs/03-qa-report.md` | Playwright 22 시나리오 22/22 PASS, Critical 0, Major 5건 (M-01~M-05), Minor 4건 (Mi-01~Mi-04) |
| Phase 3 (증거) | `tests/*.png` (22장), `tests/README.md`, `tests/qa-run.json`, `tests/e2e.spec.mjs` | 자급자족 회귀 스크립트(`node tests/e2e.spec.mjs`)로 재현 가능 |

---

## 1. QA 결과 종합 (리뷰어 재확인)

QA 보고서의 22 시나리오를 모두 재확인. **Phase 4 회귀 재실행(`node tests/e2e.spec.mjs`) 시 22/22 PASS 유지** (회귀 결과는 §5 참조).

| # | 스크린샷 | AC | QA 판정 | 리뷰어 재확인 |
|---|---|---|---|---|
| 01 | `01-home-initial.png` | env | ✅ | ✅ |
| 02 | `02-member-card-nowonsang.png` | env | ✅ | ✅ |
| 03 | `03-project-card-todo.png` | env | ✅ | ✅ |
| 04 | `04-calendar-empty-state.png` | AC-01 | ✅ | ✅ |
| 05 | `05-month-prev.png` | AC-09 | ✅ | ✅ |
| 06 | `06-month-next.png` | AC-09 | ✅ | ✅ |
| 07 | `07-day-selected.png` | AC-02 | ✅ | ✅ |
| 08 | `08-todo-form-open-empty.png` | AC-03 | ✅ | ✅ |
| 09 | `09-todo-form-validation.png` | AC-04 | ✅ | ✅ |
| 10 | `10-todo-form-filled.png` | AC-03 | ✅ | ✅ |
| 11 | `11-todo-saved-panel.png` | AC-03 | ✅ | ✅ |
| 12 | `12-todo-saved-badge.png` | AC-03 | ✅ | ✅ |
| 13 | `13-todo-toggle-complete.png` | AC-06 | ✅ | ✅ |
| 14 | `14-todo-edit-modal.png` | AC-07 | ✅ | ✅ |
| 15 | `15-todo-edit-saved.png` | AC-07 | ✅ | ✅ |
| 16 | `16-todo-delete-confirm.png` | AC-08 | ✅ | ✅ |
| 17 | `17-todo-delete-completed.png` | AC-08 | ✅ (⚠) | ✅ **M-04 적용 후**: 빈 상태로 돌아가도 환영 배너 재출현하지 않음 (의도된 동작 변경) |
| 18 | `18-localstorage-persisted.png` | AC-10 | ✅ | ✅ |
| 19 | `19-todo-form-time-validation.png` | AC-05 | ✅ | ✅ |
| 20 | `20-calendar-badge-overflow.png` | AC-11 | ✅ | ✅ |
| 21 | `21-mobile-responsive-stack.png` | AC-13 | ✅ | ✅ |
| 22 | `22-keyboard-focus-outline.png` | AC-12 | ✅ | ✅ |

---

## 2. 발견 이슈 매핑 & 수정 내역

### ISSUE-001 · M-01 셀 클릭 hit-area 누수 (뱃지 영역이 셀 select 차단) · Severity: High

- **파일**: `src/people/nowonsang_pro/projects/2026-06-04/styles/calendar.css:218-230` 및 `DayCell.jsx`/`TodoBadge.jsx` 구조 확인
- **증상**: 사용자가 셀의 중앙(뱃지가 있는 영역)을 클릭하면 셀 select(`uiActions.setSelectedDate`)가 일어나지 않고 곧바로 뱃지의 edit 모달이 열렸다. QA에서도 18번 시나리오에서 1차 클릭 실패 → day-number 좌표 픽셀 클릭으로 우회한 이력이 있음 (`clickDay()` 함수 주석 참고).
- **근본 원인**: `.tc-badges` 컨테이너가 셀의 거의 전체 가용 폭/높이를 차지하면서 셀 root의 `onClick={handleSelect}` 전에 뱃지의 onClick이 가로채는 구조. 뱃지에 `stopPropagation`이 있어 셀 select 자체가 호출되지 않음.
- **수정 내용**: `calendar.css`에 단 1 ruleset만 추가.
  - `.tc-badges { pointer-events: none; }` — 뱃지 컨테이너의 빈 공간은 모두 pointer-events를 차단해 부모 `.tc-cell`로 클릭이 폴백되도록 함.
  - `.tc-badges > .tc-badge, .tc-badges > .tc-more { pointer-events: auto; }` — 실제 인터랙티브 자식(뱃지/+N more)만 클릭을 다시 받아 기존 edit 모달 흐름 유지.
  - 핵심 diff:
    ```css
    .tc-badges {
      ...
      /* M-01 fix: 뱃지 사이 빈 영역이 셀 클릭(셀 선택)으로 폴백되도록 컨테이너는 pointer-events 차단 */
      pointer-events: none;
    }
    .tc-badges > .tc-badge,
    .tc-badges > .tc-more {
      pointer-events: auto;
    }
    ```
- **검증 방법**: 회귀 E2E의 day-cell click 시나리오(7, 18)가 그대로 PASS. 추가로 뱃지를 직접 클릭하는 14번 시나리오도 PASS(뱃지 자체는 pointer-events:auto이므로 edit 모달 동작 유지).

### ISSUE-002 · M-04 Welcome 배너 items=0 복귀 시 재출현 · Severity: Medium

- **파일**:
  - `store/slices/uiSlice.js` (state·reducer 추가)
  - `store/middleware/storage.js` (hydrate/add/restore 시점에 마킹)
  - `store/selectors.js` (selector 노출)
  - `components/WelcomeBanner.jsx` (가시 조건 보강)
- **증상**: 첫 진입 → todo 1건 추가 → 그 todo 삭제 → items.length=0 복귀 시 환영 배너가 다시 노출됨. (스크린샷 17 참고)
- **근본 원인**: WelcomeBanner의 표시 조건이 `todos.length === 0 && !dismissed` 두 가지뿐이라, 한 번이라도 todo가 존재했던 세션을 구분할 수 없었음.
- **수정 내용**:
  1. `uiSlice.initialState`에 `everHadTodos: false` 필드 + `markEverHadTodos()` reducer 추가.
  2. `storageMiddleware`에서 `todos/hydrate`·`todos/addTodo`·`todos/restoreTodo` 직후 items.length>0이고 아직 마킹되지 않았다면 `uiActions.markEverHadTodos()`를 디스패치. (영구적 one-way set)
  3. `selectors.js`에 `selectEverHadTodos` 추가.
  4. `WelcomeBanner.jsx`의 가시 조건을 `todos.length === 0 && !dismissed && !everHadTodos`로 변경.
- **설계 선택**: 메모리-only(새로고침 시 hydrate가 items.length>0이면 자동 복원, 0이면 다시 처음처럼 표시). dev-notes §6의 "메모리 only" 정책과 일관.
- **검증 방법**: 회귀 시나리오 17의 스크린샷에서 환영 배너가 사라졌음(items=0이지만 같은 세션에서 add→remove 경험이 있어 차단). 시나리오 4(처음 진입, hydrate items=0)에서는 여전히 정상 표시.

### ISSUE-003 · M-05 빈 패널 CTA 중복 노출 · Severity: Medium

- **파일**: `src/people/nowonsang_pro/projects/2026-06-04/components/panel/TodoListPanel.jsx`
- **증상**: 패널이 EmptyState일 때 패널 헤더 바로 아래의 `tc-btn-block "+ 새 일정 추가"` 버튼과 EmptyState 내부 동일 라벨 버튼이 동시에 노출 → CTA 중복.
- **근본 원인**: TodoListPanel의 헤더 + 버튼이 todo 유무와 무관하게 항상 렌더되었고, EmptyState는 자체 CTA를 별도로 제공.
- **수정 내용**: `TodoListPanel.jsx`에 `isEmpty = todos.length === 0` 도입, **isEmpty가 true일 때만 헤더의 block 버튼을 숨김**. EmptyState 내부 CTA는 그대로 유지(시각적 위계 명확). 1건 이상 등록되면 헤더 버튼이 다시 노출되어 빠른 추가 가능.
- **검증 방법**: 시나리오 4(빈 패널)에서 CTA 1개, 시나리오 11(1건 등록 후)에서 헤더 block 버튼이 정상 노출됨을 스크린샷으로 확인.

### ISSUE-004 · Mi-01 토스트 stack 폭 불균일 · Severity: Low

- **파일**: `src/people/nowonsang_pro/projects/2026-06-04/styles/calendar.css:617-633`
- **증상**: 우상단 토스트 stack에서 "삭제되었습니다 [실행취소]"가 다른 토스트보다 좁아 보였음.
- **수정 내용**: `.tc-toast`의 `min-width: 240px` → `min-width: 280px`. max-width 360px는 유지. QA 보고서 권장값 그대로 반영.
- **검증 방법**: 회귀 시나리오 16(토스트 stack 캡쳐) 정렬 일관성 확인.

### 미수정 (의도적 유보)

| ID | Severity | 사유 |
|---|---|---|
| M-02 / M-03 | Medium | `index.html`의 `<html lang="ko">`는 **공용 파일**. CLAUDE.md §3 금지 영역. 관리자 권한이라도 다른 6명에게 영향이 있어 별도 합의 필요. 본 회차에서는 보류, "8. 잔여 리스크"로 이관. |
| Mi-02 | Low | 패널 헤더 vs EmptyState 버튼의 폰트 weight 미세 차이. 두 버튼 모두 `tc-btn tc-btn-primary` 베이스를 그대로 사용 중이고 브라우저 렌더 차이로 보임. M-05 수정으로 동시에 노출되지 않으므로 시각 비교 자체가 사라져 실효성 낮음. |
| Mi-03 | Low | React Router future flag는 공용 `src/App.jsx` 영역. 별도 PR 권장. |
| Mi-04 | Low | `<dialog>` 백드롭 클릭 close 동작 검증은 본 회차에 추가하지 않음 (QA 후속 회차 권장). 기능 자체는 `TodoFormModal.jsx`에 존재함을 코드로 확인. |

---

## 3. QA 미발견 추가 개선

이번 회차에서 신규 발견·수정한 항목은 없음. M-01~M-05 + Mi-01 처리에 집중. 향후 회차(v1.1)에서 다음을 권장 (잔여 리스크 §8):

- `aria-live="polite"` 영역에 todo 추가/수정/삭제 시 스크린리더용 메시지 출력 (현재는 토스트만 `role="status"`).
- 셀의 가상 포커스 그리드(↑↓←→로 셀 간 이동) — dev-notes §6에서도 v2 backlog로 이관됨.

---

## 4. 디자인 시스템 / 규칙 준수 점검

- [x] 모든 색상이 `var(--color-...)` 또는 §6.1 매핑값(`#ef4444`, `#3b82f6`, `#8b5cf6`, `#10b981`, `#6b7280`) 사용 — 수정한 calendar.css도 동일 정책 유지
- [x] 11px 이하 폰트 없음 (가장 작은 폰트 12px = `.tc-badge`, `.tc-field-error`)
- [x] localStorage 키에 `nowonsang_pro` 포함 (`ai-study.todo.nowonsang_pro.2026-06-04`)
- [x] **본인 폴더(`src/people/nowonsang_pro/**`) 외 파일 수정 0건** (수정 중 `.gitignore` 1줄 변경이 감지되어 즉시 `git checkout`으로 원복함 — §7 위반 체크리스트 참조)
- [x] 모든 디렉토리/파일명 영문 ASCII (`components/`, `store/`, `styles/`, `tests/`, `docs/`, 스크린샷 `<순번>-<screen>-<checkpoint>.png`)
- [x] Tailwind 임의 색상 클래스(`bg-red-500` 등) 미사용

---

## 5. 빌드 & 회귀 검증

### 5.1 `npm run build` — ✅ 통과
```
✓ 404 modules transformed.
dist/assets/index-DPFrudgL.css   20.11 kB │ gzip:  4.55 kB
dist/assets/index-3Y10dSVE.js    67.10 kB │ gzip: 22.80 kB  (app)
dist/assets/index-4haRuS6_.js   174.96 kB │ gzip: 56.96 kB  (vendor)
✓ built in 642ms
```

### 5.2 회귀 E2E (`node tests/e2e.spec.mjs`) — ✅ 22/22 PASS
```
✅ 01 [env]    Hub 첫 화면 로드
✅ 02 [env]    노원상 멤버 페이지 진입
✅ 03 [env]    Todo 일정관리 카드 노출
✅ 04 [AC-01]  초기 진입 — 환영 배너 + EmptyState
✅ 05 [AC-09]  이전 달(‹) — 2026-05
✅ 06 [AC-09]  다음 달(›) — 2026-07
✅ 07 [AC-02]  6/15 셀 클릭 → 패널 갱신 + 셀 강조
✅ 08 [AC-03]  + 새 일정 추가 → 모달 오픈
✅ 09 [AC-04]  제목 공란 → 저장 disabled + 헬퍼
✅ 10 [AC-03]  입력 완료 → 저장 활성
✅ 11 [AC-03]  저장 후 패널 리스트 반영
✅ 12 [AC-03]  캘린더 셀에 뱃지 표시
✅ 13 [AC-06]  체크박스 토글 → data-completed=true
✅ 14 [AC-07]  뱃지 클릭 → 수정 모달 prefill
✅ 15 [AC-07]  수정 저장 → 제목 갱신
✅ 16 [AC-08]  window.confirm + 토스트(실행취소)
✅ 17 [AC-08]  삭제 후 빈 상태 복귀  (★ M-04로 환영 배너 차단됨)
✅ 18 [AC-10]  새로고침 후 데이터 유지
✅ 19 [AC-05]  종료시간 < 시작시간 → 에러
✅ 20 [AC-11]  5건 → 뱃지 3 + "+2 more"
✅ 21 [AC-13]  375x812 모바일 — 1-column 스택
✅ 22 [AC-12]  Tab 포커스 outline 가시화

Console messages: 30  (전부 RR v6→v7 future flag — 공용 코드, 본 프로젝트 무관)
Page errors: 0
```

> 스크린샷 22장은 본 수정 사항을 반영하여 재생성됨. `tests/qa-run.json`도 갱신.

---

## 6. 수정 파일 목록 (절대 경로)

본인 폴더 안 신규 또는 수정 파일:

| 종류 | 파일 |
|---|---|
| 수정 (CSS) | `/Users/dongwha-itdongwha/AI_Study/src/people/nowonsang_pro/projects/2026-06-04/styles/calendar.css` |
| 수정 (Redux slice) | `/Users/dongwha-itdongwha/AI_Study/src/people/nowonsang_pro/projects/2026-06-04/store/slices/uiSlice.js` |
| 수정 (Redux middleware) | `/Users/dongwha-itdongwha/AI_Study/src/people/nowonsang_pro/projects/2026-06-04/store/middleware/storage.js` |
| 수정 (selectors) | `/Users/dongwha-itdongwha/AI_Study/src/people/nowonsang_pro/projects/2026-06-04/store/selectors.js` |
| 수정 (component) | `/Users/dongwha-itdongwha/AI_Study/src/people/nowonsang_pro/projects/2026-06-04/components/WelcomeBanner.jsx` |
| 수정 (component) | `/Users/dongwha-itdongwha/AI_Study/src/people/nowonsang_pro/projects/2026-06-04/components/panel/TodoListPanel.jsx` |
| 신규 (Phase 4 문서) | `/Users/dongwha-itdongwha/AI_Study/src/people/nowonsang_pro/projects/2026-06-04/docs/04-review-report.md` |
| 재생성 (회귀) | `/Users/dongwha-itdongwha/AI_Study/src/people/nowonsang_pro/projects/2026-06-04/tests/*.png` (22장) + `tests/qa-run.json` |

---

## 7. 위반 체크리스트 (푸시 전 필수)

- [x] 본인 폴더(`src/people/nowonsang_pro/**`) 외 파일 수정 0건
  - 작업 중 `.gitignore` 1줄(`.claude/settings.local.json` 무시 해제)이 감지되어 즉시 `git checkout -- .gitignore`로 원복함. 현재 `git diff --name-only` 결과는 본인 폴더 + `package.json`(CLAUDE.md §3 예외) + `package-lock.json` 뿐.
- [x] `src/people/nowonsang_pro/projects.js`에 프로젝트 등록 완료 (`slug: '2026-06-04', title: 'Todo 일정관리'`)
- [x] `tests/`·`docs/` 양쪽 폴더 모두 산출물 존재
  - tests: 22 PNG + README.md + qa-run.json + e2e.spec.mjs
  - docs: 01-plan.md, 02-dev-notes.md, 03-qa-report.md, 04-review-report.md (본 문서)
- [x] 4개 문서(`01~04-*.md`) 모두 작성됨
- [x] `npm run build` 성공 (642 ms)
- [x] 모든 신규 경로 영문 ASCII
- [x] localStorage 키 형식 `ai-study.todo.nowonsang_pro.2026-06-04` 유지

---

## 8. 잔여 리스크 + 다음 회차 권장사항

### 잔여 (v1.0 미해결)
1. **M-02 / M-03**: `<input type="time">`, `<input type="date">`의 AM/PM·MM/DD 포맷이 브라우저 로케일 종속. 해결 위해서는 `index.html`의 `<html lang="ko">` 명시(공용 파일 1줄)가 가장 비용 효율적. 별도 관리자 합의 후 별도 PR 권장.
2. **Mi-03**: React Router v6→v7 future flag는 공용 `App.jsx` 영역. 본 프로젝트 무관이지만 콘솔 워닝 12건 발생 중. 공용 정리 PR 권장.
3. **모바일 bottom sheet UX**: dev-notes §6에서 v2 backlog로 명시 (현재는 정적 스택).
4. **AC-08 Undo 실 동작 검증**: 토스트 실행취소 버튼 노출까지만 자동화 검증. 실제 클릭 후 복원 시나리오는 e2e.spec.mjs에 미포함. 다음 회차에서 추가 권장.
5. **`<dialog>` 백드롭 클릭 close**: 코드는 존재하나 회귀 검증 없음. 다음 회차 추가 권장.

### v1.1 후보 (작은 개선)
- Welcome 배너 dismiss·`everHadTodos`의 localStorage 영속화 (현 메모리 only)
- 셀 그리드 키보드 네비게이션(↑↓←→로 셀 간 포커스 이동)
- Toast의 `aria-live="polite"`에 더해 추가/삭제 즉시 안내 메시지

---

## 9. 푸시 정보

- **브랜치명**: `nowonsang-team/todo-calendar-2026-06-04`
- **커밋 메시지 초안**:
  ```
  review: todo-calendar bugfix & docs (2026-06-04)

  - M-01: DayCell 뱃지 사이 빈 영역이 셀 select로 폴백되도록 pointer-events 분리
  - M-04: uiSlice.everHadTodos + storageMiddleware 마킹으로 환영 배너 재출현 차단
  - M-05: 빈 패널의 헤더 block 버튼 숨김 (EmptyState 단일 CTA만 유지)
  - Mi-01: 토스트 min-width 240→280px 통일
  - Phase 1~3 산출물 + Phase 4 04-review-report.md 동봉
  - 회귀 E2E 22/22 PASS, npm run build OK
  ```
- **origin 리모트**: `https://nowonsang-pro@github.com/nowonsang/AI_Study.git` (확인 완료)
- **변경 파일 수**: `git status --short` 기준 본인 폴더 내 다수 신규 + `package.json`/`package-lock.json`/`projects.js`/`index.jsx` 수정. 푸시 직전 사용자에게 정확한 수치 보고.
- **상태**: **푸시 보류, 사용자 승인 대기** (CLAUDE.md §8 — Phase 4 푸시 전 사용자 명시 승인 필수)

---

**[Phase 4 종료 — 푸시 대기]** — 사용자 승인 후 `git checkout -b nowonsang-team/todo-calendar-2026-06-04` → 커밋 → `git push -u origin ...` 진행.
