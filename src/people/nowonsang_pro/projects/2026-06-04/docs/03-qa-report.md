# 03 — QA Report (Phase 3)

> **작성자**: `qa-e2e-playwright-reviewer`
> **작성일**: 2026-06-04
> **입력**: `01-plan.md` (v1.0), `02-dev-notes.md`
> **테스트 산출물**: `tests/*.png` (22장), `tests/README.md`, `tests/qa-run.json`, `tests/e2e.spec.mjs`
> **다음 단계**: `nowonsang-reviewer-qa` (Phase 4) — 본 보고서의 "리뷰어 권고 Top 3"부터 처리

---

## 1. 테스트 환경

| 항목 | 값 |
|---|---|
| 작업자 | 노원상 (`nowonsang_pro`, 관리자) |
| 프로젝트 | Todo 일정관리 (`/people/nowonsang_pro/2026-06-04`) |
| 실행 일자 | 2026-06-04 (현지 시각) |
| Dev 서버 | `http://localhost:5173` (백그라운드 기동) |
| Playwright | 1.60.0 |
| 브라우저 | Chromium (headless) |
| 데스크탑 뷰포트 | 1280 × 900 |
| 모바일 뷰포트 | 375 × 812 |
| 테스트 스크립트 | `tests/e2e.spec.mjs` (Playwright Node API, 표준 runner 미사용) |
| 캡쳐 위치 | `src/people/nowonsang_pro/projects/2026-06-04/tests/` |
| localStorage 키 | `ai-study.todo.nowonsang_pro.2026-06-04` (검증 완료) |

실행 명령:
```bash
node src/people/nowonsang_pro/projects/2026-06-04/tests/e2e.spec.mjs
```

> 표준 `@playwright/test` runner 대신 단일 Node 스크립트를 사용한 이유: 본 프로젝트가 멀티-멤버 mono-repo 구조이고, 다른 멤버 폴더와의 충돌을 피하기 위해 프로젝트 루트에 `playwright.config.js`를 추가하지 않았다. `playwright` npm 패키지만 devDep으로 추가하여 자급자족 실행.

---

## 2. 테스트 범위 & 결과 요약

| 구분 | 수치 |
|---|---|
| 총 시나리오 | 22 |
| 통과 (✅) | 22 |
| 주의/개선 (⚠️ 권고) | 5 (별도 이슈 항목 — 통과는 했으나 v2 개선 권장) |
| 치명 (🚨 Critical) | 0 |
| 페이지 에러 (`pageerror`) | 0 |
| 콘솔 에러 | 0 |
| 콘솔 워닝 | 12 (전부 React Router v6→v7 future flag — 공용 코드 issue, 본 프로젝트 무관) |

전체 시나리오 표는 `tests/README.md` 참조.

---

## 3. AC-01 ~ AC-14 매핑 결과

| AC | 시나리오 핵심 | 결과 | 증거 | 비고 |
|---|---|---|---|---|
| AC-01 | 초기 진입 빈 상태 | ✅ 통과 | 04 | 환영 배너 + 패널 EmptyState 동시 |
| AC-02 | 일자 셀 클릭 → 패널 갱신 | ✅ 통과 | 07 | `data-selected=true` + 패널 헤더 갱신 |
| AC-03 | Todo 추가 정상 | ✅ 통과 | 08·10·11·12 | 모달 오픈 → 입력 → 저장 → 캘린더·패널 반영 |
| AC-04 | 제목 공란 검증 | ✅ 통과 | 09 | 저장 disabled + 헬퍼 노출 |
| AC-05 | 종료 < 시작 시간 검증 | ✅ 통과 | 19 | "종료시간은 시작시간 이후여야 합니다" 헬퍼 |
| AC-06 | 완료 토글 | ✅ 통과 | 13 | `data-completed=true` + 취소선 |
| AC-07 | Todo 수정 | ✅ 통과 | 14·15 | 뱃지 클릭 → prefill → 저장 → 갱신 |
| AC-08 | Todo 삭제 + 실행취소 | ✅ 부분 통과 | 16·17 | confirm + 토스트 "실행취소" 버튼 노출까지 검증. **클릭 후 복원 동작은 미테스트**(권고 #1) |
| AC-09 | 월 이동 (이전/다음/오늘) | ✅ 통과 | 05·06 | "오늘" 버튼 → selectedDate=today 동작은 코드 리뷰 검증 |
| AC-10 | localStorage 영속화 | ✅ 통과 | 18 | F5 후 데이터 복원 + 스키마 키 확인 |
| AC-11 | "+N more" 뱃지 오버플로 | ✅ 통과 | 20 | 5건 → 뱃지 3 + "+2 more" |
| AC-12 | 키보드 네비게이션 | ✅ 통과 | 22 | Tab 이동 시 outline 가시화. 모달 포커스 트랩은 `<dialog>` 네이티브로 자동 |
| AC-13 | 반응형 (모바일 bottom sheet) | ⚠️ 부분 | 21 | 모바일에서 패널 노출은 됨. **드래그형 bottom sheet UX는 미구현(정적 스택)** — dev-notes §6에서 v2 backlog로 명시 |
| AC-14 | 우선순위·카테고리 시각화 | ✅ 통과 | 12·14·15 | high priority=빨간 dot, work category=primary stripe 가시 |

---

## 4. 발견된 이슈 (리뷰어에게 전달할 수정 요청)

### 🚨 Critical
> 없음. 핵심 CRUD·영속화·검증·접근성 모두 동작.

---

### ⚠️ Major (Phase 4 권고 처리)

#### M-01 — 일자 셀 빈 영역 hit-area가 좁아 클릭 누락이 쉬움
- **재현 경로**:
  1. 6월 15일에 todo 1건 등록 후
  2. 데스크탑 환경에서 셀의 중앙(뱃지 위) 임의 클릭
- **현재 동작**: 셀 중앙은 뱃지 영역이라 셀 select 대신 **뱃지의 edit-modal**이 열린다. 사용자는 "셀을 선택하려 했는데 수정창이 뜨는" 혼란을 겪을 수 있음. (테스트에서도 본 이슈로 18번 시나리오가 1차 실패 → 좌상단 day-number 픽셀 좌표 클릭으로 우회)
- **기대 동작**: 셀의 비-뱃지 영역(빈 공간/배경) 클릭은 일관되게 셀 선택. 뱃지 클릭만 edit 모달.
- **추정 원인 파일**: `components/calendar/DayCell.jsx` (셀 root에 `onClick={handleSelect}`), `styles/calendar.css` 의 `.tc-cell` 레이아웃 → 뱃지가 셀의 너비를 거의 다 차지하여 hit area가 줄어듦
- **수정 제안**:
  - `DayCell` root 자체는 select 책임만 두고, badges 영역은 별도 sibling으로 분리하여 셀의 위쪽 절반(또는 day-number row)을 항상 select 가능한 영역으로 보장.
  - 또는 `.tc-cell > .tc-badges`에 `pointer-events: none`을 두고 각 `.tc-badge`만 `pointer-events: auto`로 다시 켜기 → 뱃지 사이 빈 공간이 셀 select로 폴백되도록.
- **증거**: 테스트 18 1차 실패 trace (`18-localstorage-persisted.png` 1차 캡쳐가 의도치 않은 edit 모달 오픈 상태). 최종 통과본은 day-number 픽셀 좌표 클릭으로 회피.

#### M-02 — 시간 입력 표시가 브라우저 로케일(AM/PM)에 종속
- **재현 경로**: 추가/수정 모달의 시작·종료 시간 input(`<input type="time">`)
- **현재 동작**: 시스템 로케일이 en-US인 경우 "09:00 AM / 02:00 PM"으로 표시됨 (스크린샷 14, 19)
- **기대 동작**: 기획서는 24시간 표기를 전제 ("14:00 ~ 15:00"). 한국어 사용자 환경(`<html lang="ko">`)에서도 일관된 24h 표기가 바람직.
- **추정 원인 파일**: `index.html` 또는 `main.jsx`의 `<html lang>` 미설정, 그리고 `<input type="time">`은 브라우저 native UI라 lang 속성만 잡아도 일부 브라우저에서 24h로 강제됨
- **수정 제안**:
  1. `index.html`의 `<html>` 태그에 `lang="ko"` 명시 (공용 파일 — 관리자 수정 필요)
  2. 시각화 텍스트(`tc-item-time`)는 이미 "09:00 – 10:00" 형식으로 24h 표시 중이라 입력만 보완하면 됨
  3. 또는 input을 `<input type="text" pattern="[0-2][0-9]:[0-5][0-9]" placeholder="HH:mm">`로 교체(자유도↑, 검증 추가 필요)

#### M-03 — `<input type="date">`의 날짜 포맷 동일 이슈 (MM/DD/YYYY)
- **재현 경로**: 추가/수정 모달의 날짜 input
- **현재 동작**: "06/15/2026" 형식 표시 (스크린샷 14·19)
- **기대 동작**: 한국 사용자에게는 "2026-06-15" 또는 "2026/06/15"가 친숙. 내부 저장은 ISO `YYYY-MM-DD`로 정상.
- **수정 제안**: M-02와 동일 — `<html lang="ko">` 설정 또는 커스텀 날짜 피커 도입(v2)

#### M-04 — Welcome 배너가 items=0 복귀 시 재출현 (의도된 트레이드오프이나 UX 노이즈)
- **재현 경로**:
  1. todo 1개 추가 (배너 사라짐)
  2. 그 todo 삭제 (items.length=0)
  3. → 환영 배너 재출현 (스크린샷 16)
- **현재 동작**: dev-notes §6에서 "메모리 only / 새로고침마다 재표시" 설계로 명시. 따라서 같은 세션 내에서도 0건 복귀 시 다시 보임.
- **기대 동작 (UX 권장)**: 한 세션 내에서 이미 한 번 todo가 생성된 적이 있으면 배너 재출현 차단 — sessionStorage에 "ever-had-items" 플래그.
- **추정 원인 파일**: `components/WelcomeBanner.jsx`의 조건 `{todos.length === 0 && !dismissed && ...}`
- **수정 제안**: `uiSlice`에 `everHadTodos: boolean` 추가, `todos/addTodo`가 처음 발생할 때 `true`로 set. 배너 표시 조건을 `todos.length === 0 && !dismissed && !everHadTodos`로 변경.

#### M-05 — 패널 헤더 + EmptyState에 "+ 새 일정 추가" 버튼이 동시 노출 (중복 CTA)
- **재현 경로**: 패널이 EmptyState일 때 (todo 0건 상태)
- **현재 동작**: 패널 헤더 바로 아래 큰 primary 버튼 1개 + EmptyState 영역 안에 동일 라벨 버튼 1개 = **총 2개의 동일 CTA 노출** (스크린샷 04·17·22)
- **기대 동작**: EmptyState 안에만 CTA를 두거나(시각적 위계 명확), 패널 헤더의 버튼만 유지하고 EmptyState는 텍스트+일러스트만.
- **추정 원인 파일**: `components/panel/TodoListPanel.jsx` (조건 없이 항상 헤더 버튼 노출) + `components/panel/EmptyState.jsx` (자체 CTA)
- **수정 제안**: EmptyState 시 패널 헤더의 큰 primary 버튼을 숨기거나 보조 outline 스타일로 격하.

---

### ℹ️ Minor (선택 개선)

#### Mi-01 — 토스트 stack 시각적 위치
스크린샷 16에서 토스트 3개가 우상단 stack 노출. 디자인은 잘 동작하나, "삭제되었습니다 [실행취소]" 토스트가 다른 토스트보다 짧아 정렬이 약간 어긋나 보임. `tc-toast`에 `min-width: 280px`를 명시하면 일관됨.

#### Mi-02 — "+ 새 일정 추가" 버튼 글자 색
패널 헤더의 primary 버튼이 EmptyState의 동명 버튼과 폰트 weight·크기가 미세하게 다름(헤더 버튼이 살짝 굵음). `tc-btn` 베이스 스타일이 두 곳에서 동일하게 적용되도록 통일 권장.

#### Mi-03 — Pre-existing React Router v7 future warning
공용 `src/App.jsx`(관리자만 수정 가능)의 `<BrowserRouter>`에 future flag 미설정. 본 프로젝트와 직접 무관하지만 관리자가 한 번에 정리 가능:
```jsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

#### Mi-04 — `<dialog>` 백드롭 클릭 close 동작은 검증 미진행
모달의 X·취소·Esc·저장은 검증되었으나, 오버레이(백드롭) 클릭 close 흐름은 본 회차에 미캡쳐. 코드에는 `handleClickBackdrop`이 존재하나 dirty 체크 흐름 함께 회귀 검증 권장.

---

## 5. 콘솔 / 네트워크 / 페이지 에러 로그

```text
pageerror: 0
console.error: 0
console.warning: 12 (전부 React Router v6→v7 future flag 안내, 본 프로젝트와 무관)
```

상세는 `tests/qa-run.json`의 `consoleLog`·`pageErrors` 배열 참조.

---

## 6. 디자인 시스템 준수 점검

| 점검 항목 | 결과 | 비고 |
|---|---|---|
| Primary `#00694D` 사용 (CTA, 오늘 셀, 선택 강조) | ✅ | 캡쳐 04·07·11에서 확인 |
| 임의 Tailwind 색상 클래스(`bg-red-500` 등) 미사용 | ✅ | `styles/calendar.css`는 CSS 변수와 디자인 시스템 매핑값만 사용 |
| 11px 이하 폰트 미사용 | ✅ | 가장 작은 텍스트(뱃지·헬퍼)가 12px (CSS line 234, 267) |
| 카테고리 색 매핑 (work=primary, personal=blue, study=violet, health=emerald, other=gray) | ✅ | `utils/categories.js`가 §4.4 표와 일치 |
| 모달 (`<dialog>`) 네이티브 사용 — 포커스 트랩 자동 | ✅ | dev-notes §1.3 결정 사항 검증 |
| 토스트 `role="status"` aria-live | ✅ (코드 확인) | 스크린샷 16에서 3개 토스트 노출 |
| 캘린더 셀 `role="gridcell"` + `aria-selected` | ✅ | DayCell.jsx 검증 |

---

## 7. 리뷰어를 위한 우선순위 권고 (Phase 4 처리 순서)

> **모두 본인 폴더 `src/people/nowonsang_pro/projects/2026-06-04/` 내부 수정으로 처리 가능**. (M-02·M-03·Mi-03는 공용 파일이라 관리자 권한 별도 결정 필요.)

### Top 1 — 셀 클릭 hit-area 분리 (M-01) 🔧
사용자가 셀의 빈 공간 클릭 시 의도치 않게 edit 모달이 열리는 문제. 빈도가 높고 UX 혼란이 큰 핵심 결함. `DayCell.jsx` + `calendar.css` 의 hit area 재설계로 해결. **공용 파일 수정 불필요, 본인 폴더만으로 해결 가능.**

### Top 2 — Welcome 배너 재출현 차단 (M-04) 🔧
items 0건 복귀 시 환영 배너가 반복 노출되는 UX 노이즈. `uiSlice`에 `everHadTodos` 플래그 한 줄 + `WelcomeBanner.jsx` 조건 한 줄 수정. 30분 이내 해결 가능.

### Top 3 — 빈 패널의 CTA 중복 정리 (M-05) 🎨
패널 헤더와 EmptyState에 동일 "+ 새 일정 추가" 버튼이 동시 노출. `TodoListPanel.jsx`에서 todo 0건일 때 헤더 버튼을 숨기거나, EmptyState 자체 버튼 제거. 5분 작업.

### 추가 권고 (시간 여유 시)
- M-02·M-03: `index.html`의 `<html lang="ko">` 추가 (관리자 권한 1줄 변경)
- AC-08의 Undo 동작 추가 검증을 Phase 4 후 회귀 시 함께
- Mi-03 React Router future flag 활성화

---

**[Phase 3 종료]** — Phase 4 `nowonsang-reviewer-qa`가 본 보고서의 M-01·M-04·M-05를 우선 처리 후, 회귀 검증으로 `tests/e2e.spec.mjs`를 재실행 권장.
