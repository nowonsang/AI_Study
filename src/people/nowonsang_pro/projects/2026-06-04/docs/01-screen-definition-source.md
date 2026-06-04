---
title: "Todo 일정관리 — 화면정의서 v1.0"
date: "2026-06-04"
author: "노원상 (nowonsang_pro)"
---

# Todo 일정관리 — 화면정의서 v1.0

> **프로젝트**: 캘린더 기반 To-do 일정관리 (Phase 1 산출물)
> **작성자**: 노원상 (`nowonsang_pro`, 관리자)
> **작성일**: 2026-06-04
> **버전**: v1.0
> **대상 독자**: Phase 2 개발자 (`react-redux-toolkit-builder`), Phase 3 QA (`qa-e2e-playwright-reviewer`), Phase 4 리뷰어
> **본 문서 위치**: `src/people/nowonsang_pro/projects/2026-06-04/docs/01-screen-definition.pdf`
> **상세 기획서**: 같은 폴더의 `01-plan.md` 참조

---

## 0. 화면 일람 (Screen Index)

| ID | 화면명 | 상태 | 우선순위 | 와이어프레임 페이지 |
|---|---|---|---|---|
| S-001 | 메인 캘린더 (월 뷰, 데스크탑) | default / empty | P0 | §1 |
| S-002 | Todo 추가 모달 | create-mode | P0 | §2 |
| S-003 | Todo 수정 모달 | edit-mode | P0 | §3 |
| S-004 | 일자 상세 패널 (모바일 Bottom Sheet) | mobile | P0 | §4 |
| S-005 | 빈 상태 (Empty State) | empty | P0 | §5 |
| S-006 | 에러 상태 (Toast + Fallback) | error | P0 | §6 |

---

\pagebreak

## 1. S-001 — 메인 캘린더 (월 뷰, 데스크탑)

### 1.1 화면 정보
- **ID / Path**: `S-001` / `/` (SPA 단일 진입)
- **레이아웃**: 2-column (좌측 캘린더 ⅔ · 우측 일자 패널 ⅓)
- **최소 뷰포트**: 1024px 이상

### 1.2 와이어프레임

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Todo 일정관리                                                  [⚙(v2)]     │  TopBar h=56px
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────┐  ┌─────────────────────┐ │
│  │  ‹   2026년 6월   ›       [오늘]                │  │ 6월 4일 (목)        │ │
│  │  ────────────────────────────────────────────  │  │   3건 (완료 1)       │ │
│  │  일   월   화   수   목   금   토             │  │ ─────────────────── │ │
│  │ ┌──┬──┬──┬──┬──┬──┬──┐                       │  │ [+ 새 일정 추가]    │ │
│  │ │31│ 1│ 2│ 3│ 4│ 5│ 6│                       │  │ ─────────────────── │ │
│  │ │  │● │  │  │●●│  │  │  ← 우선순위 dot      │  │ ☐ 09:00  팀 미팅    │ │
│  │ │  │  │  │  │+1│  │  │  ← "+N more"         │  │   ● high · 업무     │ │
│  │ ├──┼──┼──┼──┼──┼──┼──┤                       │  │ ─────────────────── │ │
│  │ │ 7│ 8│ 9│10│11│12│13│                       │  │ ☐ 14:00  운동 1시간 │ │
│  │ ├──┼──┼──┼──┼──┼──┼──┤                       │  │   ● med · 건강      │ │
│  │ │14│15│16│17│18│19│20│                       │  │ ─────────────────── │ │
│  │ ├──┼──┼──┼──┼──┼──┼──┤                       │  │ ☑̶ ̶0̶9̶:̶3̶0̶  이메일 정리 │ │
│  │ │21│22│23│24│25│26│27│                       │  │   ● low · 업무      │ │
│  │ ├──┼──┼──┼──┼──┼──┼──┤                       │  │                     │ │
│  │ │28│29│30│ 1│ 2│ 3│ 4│  ← 다음달은 opacity 40%│  │                     │ │
│  │ └──┴──┴──┴──┴──┴──┴──┘                       │  │                     │ │
│  └────────────────────────────────────────────────┘  └─────────────────────┘ │
│        CalendarGrid                                       TodoListPanel       │
└──────────────────────────────────────────────────────────────────────────────┘
범례:
   ● = todo dot (priority color)
   ☐ = 미완료 체크박스 · ☑̶ ̶ = 완료(취소선)
   오늘 셀: 2px Primary border · 선택 셀: Primary 8% background
   DayCell 최소 높이 96px
```

### 1.3 구성 요소 표
| 영역 | 컴포넌트 | 주요 props | 동작 | 비고 |
|---|---|---|---|---|
| TopBar | `<TopBar/>` | - | 로고 표시, v1은 정적 | sticky top-0 |
| MonthHeader | `<MonthHeader year month/>` | currentMonth | ‹ ›: 월 이동, "오늘": 오늘로 + selectedDate 동기화 | 키보드 ←/→ |
| WeekdayRow | `<WeekdayRow/>` | - | 일~토 헤더 7칸 | 일요일 시작 |
| CalendarGrid | `<CalendarGrid/>` | days[35\|42] | grid-cols-7 렌더 | role="grid" |
| DayCell | `<DayCell date todos isToday isSelected isCurrentMonth/>` | - | 클릭→선택, hover시 "+" 노출 | role="gridcell" |
| TodoBadge | `<TodoBadge todo/>` | - | 클릭→수정모달, ◯클릭→완료토글 | 최대 3개 |
| OverflowBadge | `<OverflowBadge count/>` | - | "+N more" 표시, 클릭→패널 포커스 | tabIndex=0 |
| PanelHeader | `<PanelHeader date count/>` | - | "+ 새 일정 추가" Primary CTA | h-auto |
| TodoListItem | `<TodoListItem todo/>` | - | 체크박스, 클릭→수정, 우측 🗑 | role="listitem" |

### 1.4 인터랙션 흐름
1. **진입**: localStorage 로드 → todos 0건이면 환영 배너 + 오늘 월 + 오늘 selectedDate
2. **셀 클릭**: `ui.setSelectedDate(date)` → 패널 갱신, 셀에 Primary 8% 배경
3. **셀 hover**: 우상단 작은 "+" 페이드 인 → 클릭 시 `ui.openCreateModal({presetDate})`
4. **뱃지 클릭**: `ui.openEditModal({todoId})` (stopPropagation 필수)
5. **뱃지 ◯ 클릭**: `todos.toggleComplete(id)` (stopPropagation 필수)
6. **헤더 ‹ ›**: `ui.goToPrevMonth()` / `goToNextMonth()`. 키보드 ←/→ 동등.
7. **"오늘"**: `ui.goToToday()` — currentMonth + selectedDate 모두 갱신

### 1.5 상태 변화
| 상태 | 트리거 | 표시 |
|---|---|---|
| loading | 앱 마운트 직후 hydration 진행 중 | 빈 그리드 (스피너 없음, <100ms) |
| empty (전체 0건) | items.length === 0 | 상단 환영 배너 + 패널 EmptyState |
| default | 정상 | 표준 렌더 |
| error (storage) | localStorage write 실패 | 토스트 + 상단 "메모리 only" 배너 |

\pagebreak

## 2. S-002 — Todo 추가 모달

### 2.1 화면 정보
- **ID**: `S-002`
- **부모**: S-001 위 오버레이
- **트리거**: DayCell "+" / Panel "+ 새 일정 추가"

### 2.2 와이어프레임

```
                ┌──────────────────────────────────────────┐
                │  새 일정 추가                        [×] │  Header h=56
                ├──────────────────────────────────────────┤
                │                                          │
                │  제목 *                                  │
                │  ┌────────────────────────────────────┐  │
                │  │ |                                  │  │  autoFocus
                │  └────────────────────────────────────┘  │
                │  ⚠ 제목을 입력해 주세요 (validation 시) │  helper text
                │                                          │
                │  날짜 *                                  │
                │  ┌────────────────────────────────────┐  │
                │  │ 2026-06-04                  📅     │  │
                │  └────────────────────────────────────┘  │
                │                                          │
                │  시간 (선택)                             │
                │  ┌──────────┐  ┌──────────┐              │
                │  │ 09:00    │ ~│ 10:00    │              │
                │  └──────────┘  └──────────┘              │
                │                                          │
                │  우선순위                                │
                │  ( ) 낮음   (●) 보통   ( ) 높음          │
                │                                          │
                │  카테고리 (선택)                         │
                │  [업무] [개인] [학습] [건강] [기타] [없음]│  Chip select
                │                                          │
                │  설명 (선택, 최대 500자)                 │
                │  ┌────────────────────────────────────┐  │
                │  │                                    │  │  h=80
                │  │                                    │  │
                │  └────────────────────────────────────┘  │
                │                                          │
                ├──────────────────────────────────────────┤
                │              [취소]   [저장하기]          │  Footer h=64
                └──────────────────────────────────────────┘
                폭: 480px (desktop) · 100vw (mobile bottom sheet)
                Overlay: rgba(0,0,0,0.4)
```

### 2.3 구성 요소 표
| 필드 | 컴포넌트 | 검증 |
|---|---|---|
| 제목 | `<TextInput required maxLength=80/>` | 공란 불가, trim |
| 날짜 | `<DateInput required/>` | YYYY-MM-DD, 1900~2099 |
| 시작시간 | `<TimeInput/>` | HH:mm (24h), 선택 |
| 종료시간 | `<TimeInput/>` | startTime 있을 때만, 종료>시작 |
| 우선순위 | `<RadioGroup options=[low\|medium\|high]/>` | 기본 medium |
| 카테고리 | `<ChipGroup options=[work, personal, study, health, other, none]/>` | single, 기본 none |
| 설명 | `<Textarea maxLength=500/>` | 0~500자 |
| 저장 | `<Button variant=primary/>` | 모든 검증 통과 시 enabled |
| 취소 | `<Button variant=secondary/>` | 변경사항 있으면 confirm |

### 2.4 인터랙션 흐름
- **진입**: 모달 페이드+스케일 150ms, 제목 input autoFocus
- **저장(성공)**: `todos.addTodo({...})` → close → 토스트 "일정이 추가되었습니다"
- **저장(실패-검증)**: 헬퍼 텍스트 빨간색 표시, 저장 disabled
- **Esc/X/배경**: 변경사항 없으면 즉시 close, 있으면 confirm("변경사항을 버리시겠습니까?")
- **포커스 트랩**: Tab이 모달 안에서만 순회. 닫힐 때 트리거 버튼으로 복귀.

### 2.5 상태 변화
| 상태 | 트리거 |
|---|---|
| default | 빈 폼, 저장 disabled |
| dirty | 어느 필드든 입력 발생 |
| validating | 검증 실패 (제목 공란, 시간 역전, 글자 수 초과) |
| submitting | (v1은 동기, <50ms) |
| error | localStorage QuotaExceeded → 토스트 + 모달 유지 |

\pagebreak

## 3. S-003 — Todo 수정 모달

### 3.1 화면 정보
- **ID**: `S-003`
- **트리거**: TodoBadge 클릭 · TodoListItem 클릭
- **UI 기본 구조 = S-002**. 차이점만 명시.

### 3.2 와이어프레임 (footer 차이)

```
                ├──────────────────────────────────────────┤
                │ [🗑 삭제]              [취소]  [저장하기] │
                └──────────────────────────────────────────┘
                Header: "일정 수정"
                모든 필드는 기존 todo 값으로 prefill
                createdAt은 표시만 (수정 불가)
```

### 3.3 인터랙션 흐름
- **진입**: 기존 값 prefill, dirty = false
- **저장**: `todos.updateTodo({id, changes})` → close → 토스트 "일정이 수정되었습니다"
- **삭제**: confirm("정말 삭제하시겠습니까?") → `todos.removeTodo(id)` → close → 토스트 "삭제되었습니다 [실행취소]"
- **실행취소**: 5초 내 클릭 시 `todos.restoreTodo(stash)` → 동일 위치 복원

\pagebreak

## 4. S-004 — 일자 상세 패널 (모바일 Bottom Sheet)

### 4.1 화면 정보
- **ID**: `S-004`
- **트리거 환경**: viewport width < 640px
- **트리거 액션**: 일자 셀 클릭

### 4.2 와이어프레임

```
                          ┌────────────────────────────┐
                          │      ━━━━━━ (drag handle)  │
                          │                            │
                          │  6월 4일 (목)         [×]  │
                          │  3건 (완료 1)              │
                          │  ──────────────────────    │
                          │  [+ 새 일정 추가]          │
                          │  ──────────────────────    │
                          │  ☐ 09:00  팀 미팅          │
                          │    ● high · 업무      [🗑] │
                          │  ──────────────────────    │
                          │  ☐ 14:00  운동 1시간       │
                          │    ● med · 건강       [🗑] │
                          │  ──────────────────────    │
                          │  ☑̶ ̶0̶9̶:̶3̶0̶  이메일 정리    │
                          │    ● low · 업무       [🗑] │
                          │                            │
                          └────────────────────────────┘
                          height: 60vh (v1 고정), slide-up 250ms
                          닫기: X · drag-down · 배경 클릭
```

### 4.3 구성 요소 표
| 영역 | 동작 |
|---|---|
| Drag Handle | 시각적 표시 only (v1은 실제 drag-resize 미구현, v2) |
| Header | 일자 + 카운트 + 닫기(X) |
| CTA | "+ 새 일정 추가" Primary 풀폭 |
| List | TodoListItem 반복. 완료 항목은 하단으로 자동 정렬. |

### 4.4 상태 변화
| 상태 | 표시 |
|---|---|
| 0건 | EmptyState (S-005 참조) |
| 1~N건 | 미완료 → 완료 순 정렬 |
| 닫힘 | sheet 사라지고 캘린더만 표시 |

\pagebreak

## 5. S-005 — 빈 상태 (Empty State)

### 5.1 5-A. 선택일 0건 (패널 내)

```
                              ┌─────────────────────────┐
                              │                         │
                              │         📅              │
                              │   (아이콘 일러스트)     │
                              │                         │
                              │  이 날에는 등록된       │
                              │  일정이 없습니다.       │
                              │                         │
                              │   [+ 새 일정 추가]      │
                              │                         │
                              └─────────────────────────┘
                              가운데 정렬, py-12
                              메시지: 14px / Text Secondary
                              CTA: Primary
```

### 5.2 5-B. 첫 진입 (전체 0건, 상단 환영 배너)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✨ 환영합니다! 일자 셀을 클릭해 첫 일정을 추가해 보세요.        [×]    │
└──────────────────────────────────────────────────────────────────────────┘
배너 높이 48px, Primary 8% 배경, 우측 닫기 버튼.
닫기 시 localStorage에 dismiss 플래그 저장 (uiSlice.welcomeBannerDismissed).
첫 일정 추가 시 자동 dismiss.
```

### 5.3 상태 트리거 매트릭스
| items.length | selectedDate todo 수 | 표시 |
|---|---|---|
| 0 | 0 | 환영 배너 + 패널 EmptyState 5-A |
| ≥1 | 0 | 패널 EmptyState 5-A만 |
| ≥1 | ≥1 | 일반 리스트 |

\pagebreak

## 6. S-006 — 에러 상태

### 6.1 6-A. 토스트형 (localStorage 등 부분 에러)

```
                                                  ┌──────────────────────────────┐
                                                  │ ⚠ 저장 용량이 가득 찼습니다  │
                                                  │   불필요한 일정을 삭제해 주세요│
                                                  │                          [×] │
                                                  └──────────────────────────────┘
                                                  우상단, 4초 자동 닫힘
                                                  최대 3개 stack (위에서 아래로)
```

### 6.2 6-B. 전체화면 fallback (ErrorBoundary 캐치)

```
              ┌──────────────────────────────────┐
              │              ⚠                   │
              │                                  │
              │   문제가 발생했습니다.            │
              │   잠시 후 다시 시도해 주세요.     │
              │                                  │
              │      [새로고침]                  │
              │                                  │
              │ (개발자 도구로 상세 확인)         │
              └──────────────────────────────────┘
              가운데 정렬, viewport 전체
              "새로고침" 클릭 → window.location.reload()
```

### 6.3 에러 분류 매트릭스
| 에러 종류 | 처리 | 사용자 메시지 |
|---|---|---|
| localStorage QuotaExceeded | 토스트 6-A | "저장 용량이 가득 찼습니다" |
| localStorage 비활성 (시크릿) | 상단 배너 + 메모리 only 동작 | "이번 세션은 저장되지 않습니다" |
| JSON parse 실패 (손상) | 백업 후 빈 상태 + 토스트 | "저장 데이터가 손상되어 초기화했습니다" |
| 렌더 에러 (React) | ErrorBoundary 6-B | "문제가 발생했습니다. 잠시 후 다시 시도해 주세요." |

\pagebreak

## 7. 디자인 토큰 적용 매핑

| 사용처 | 토큰 | 값 |
|---|---|---|
| Primary CTA / 오늘 셀 border / medium dot | `var(--color-primary)` | `#00694D` |
| Primary hover | `var(--color-primary-hover)` | `#005A41` |
| 선택 셀 배경 | `rgba(0,105,77,0.08)` | — |
| 본문 텍스트 | `var(--color-text)` | `#111827` |
| 보조 텍스트 (카운트, 헬퍼) | `var(--color-text-secondary)` | `#6B7280` |
| 셀 / 모달 구분선 | `var(--color-border)` | `#E5E7EB` |
| 위험 (high dot, 삭제 hover) | `var(--color-danger)` | `#EF4444` |
| 성공 (health category) | `var(--color-success)` | `#10B981` |
| Font Family | `var(--font-family)` | Pretendard |
| 최소 폰트 크기 | — | 12px (11px 이하 금지) |

> **규칙**: Tailwind 임의 색상 클래스(`bg-red-500`) 금지. 반드시 `bg-[var(--color-primary)]` 형식.

\pagebreak

## 8. QA 시나리오 ↔ 스크린샷 매핑 (Phase 3 입력)

| # | 파일명 | AC | 화면 | 시나리오 |
|---|---|---|---|---|
| 01 | `01-home-initial.png` | AC-01 | S-001 | 초기 진입, 빈 상태 (환영 배너 + 빈 패널) |
| 02 | `02-day-selected.png` | AC-02 | S-001 | 일자 셀 클릭 후 패널 갱신 |
| 03 | `03-todo-add-modal.png` | AC-03 | S-002 | 추가 모달 오픈 (autoFocus) |
| 04 | `04-todo-add-saved.png` | AC-03 | S-001 | 추가 완료 → 캘린더 뱃지 + 패널 리스트 |
| 05 | `05-add-validation.png` | AC-04 | S-002 | 제목 공란 검증 (저장 disabled + 헬퍼) |
| 06 | `06-time-validation.png` | AC-05 | S-002 | 종료시간 < 시작시간 검증 |
| 07 | `07-todo-completed.png` | AC-06 | S-001 | 완료 토글 → 취소선·하단 정렬·뱃지 회색화 |
| 08 | `08-edit-modal.png` | AC-07 | S-003 | 수정 모달 prefill |
| 09 | `09-edit-saved.png` | AC-07 | S-001 | 수정 후 캘린더 반영 |
| 10 | `10-delete-confirm.png` | AC-08 | S-003 | 삭제 confirm 다이얼로그 |
| 11 | `11-delete-toast.png` | AC-08 | S-001 | 삭제 후 실행취소 토스트 |
| 12 | `12-undo-restored.png` | AC-08 | S-001 | 실행취소 후 동일 위치 복원 |
| 13 | `13-month-navigation.png` | AC-09 | S-001 | 이전/다음 월 이동 |
| 14 | `14-after-reload.png` | AC-10 | S-001 | 새로고침 후 데이터 복원 |
| 15 | `15-badge-overflow.png` | AC-11 | S-001 | "+N more" 표시 |
| 16 | `16-keyboard-focus.png` | AC-12 | S-001 / S-002 | 키보드 Tab 포커스 outline 가시 |
| 17 | `17-mobile-sheet.png` | AC-13 | S-004 | 모바일 bottom sheet 슬라이드 |
| 18 | `18-priority-category.png` | AC-14 | S-001 | priority + category 시각화 |

**총 18장**. Phase 3에서 `프로젝트폴더/tests/`에 영문 kebab-case 파일명으로 저장.

---

## 9. 변경 이력

| 버전 | 일자 | 작성자 | 변경 내역 |
|---|---|---|---|
| 1.0 | 2026-06-04 | 노원상 (nowonsang_pro) | 최초 작성 (4-에이전트 파이프라인 Phase 1 산출물) |

---

**[문서 끝]** — 상세 기능 명세·데이터 모델·Redux 설계·구현 가이드는 같은 폴더의 `01-plan.md` 참조.
