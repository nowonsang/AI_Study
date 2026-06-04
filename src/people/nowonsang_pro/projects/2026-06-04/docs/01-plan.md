# Todo 일정관리 웹 — 기획서 v1.0

> **프로젝트**: 캘린더 기반 To-do 일정관리 (v1)
> **작업자**: 노원상 (`nowonsang_pro`, 관리자)
> **프로젝트 폴더**: `src/people/nowonsang_pro/projects/2026-06-04/`
> **작성일**: 2026-06-04
> **파이프라인 단계**: Phase 1 (기획) — 다음 단계: Phase 2 `react-redux-toolkit-builder`
> **버전 범위**: v1 (단일 사용자, localStorage 전용, 백엔드 없음)

---

## 1. 프로젝트 개요

### 1.1 목적
캘린더 위에 To-do를 시각적으로 배치하고, "오늘 무엇을 할지 / 이번 달 무엇이 남았는지"를 한눈에 파악할 수 있는 단일 사용자용 일정관리 도구를 만든다. 별도 로그인·서버 없이 브라우저 localStorage만으로 동작하며, 4-에이전트 파이프라인의 풀시스템 빌드 1회차 산출물이 된다.

### 1.2 타겟 사용자 (페르소나)
| 페르소나 | 설명 | 핵심 욕구 |
|---|---|---|
| **P1. 1인 실무자(주 사용자)** | 직장인·프리랜서·학생. 1일 5~15건의 단순 작업을 관리. | "이번 주 뭐 남았지?" 5초 안에 확인 |
| **P2. 가벼운 플래너 사용자** | 캘린더 앱은 부담스럽고 메모 앱은 부족하다고 느낌. | 클릭 한 번에 "오늘 한 일/안 한 일" 분리 |
| **P3. 데모 시청자(파이프라인 평가자)** | QA 에이전트·리뷰 에이전트·관리자. 빌드 품질 검증용. | 시나리오대로 동작하는지 즉시 확인 |

### 1.3 핵심 가치 제안 (Value Proposition)
- **3초 등록**: 일자 셀 클릭 → 모달 → 제목 입력 → Enter. 그 이상은 v1 범위 외.
- **시각적 밀도**: 월간 뷰에서 일자 셀당 최대 3개 todo 뱃지 + "+N more" 표시로 밀도 인식.
- **로컬-퍼스트**: 인터넷 없이도 동작, 새로고침해도 데이터 유지.
- **완료 토글 1클릭**: 체크박스 한 번으로 완료/미완료 전환, 즉시 시각 반영(취소선·연한 컬러).

### 1.4 성공 지표 (SoS — Definition of Success)
| # | 지표 | 목표 |
|---|---|---|
| K1 | 첫 사용자 onboarding 없이 1분 내 첫 todo 등록 | ✅ |
| K2 | 일정 등록 3클릭 이내 (셀 클릭 → 입력 → 저장) | ✅ |
| K3 | 새로고침 후 데이터 100% 유지 (localStorage) | ✅ |
| K4 | Lighthouse 접근성 점수 ≥ 90 | ✅ |
| K5 | Playwright E2E 시나리오 8개 전부 통과 (Phase 3) | ✅ |

---

## 2. 사용자 시나리오 (User Stories)

| ID | 시나리오 | 우선순위 |
|---|---|---|
| US-01 | As a 1인 실무자, 나는 **오늘 날짜 셀을 클릭하여** todo를 빠르게 추가해 "오늘 할 일을 즉시 기록"하고 싶다. | P0 |
| US-02 | As a 1인 실무자, 나는 **todo를 완료 체크박스로 토글**하여 "처리 진행 상황을 시각적으로 파악"하고 싶다. | P0 |
| US-03 | As a 1인 실무자, 나는 **월 단위로 이전/다음 이동**하여 "장기 일정을 미리 계획·회고"하고 싶다. | P0 |
| US-04 | As a 1인 실무자, 나는 **등록한 todo를 클릭해 수정**하여 "변경된 일정에 즉시 반영"하고 싶다. | P0 |
| US-05 | As a 1인 실무자, 나는 **todo를 삭제**하여 "잘못 만든 항목이나 취소된 일정을 제거"하고 싶다. | P0 |
| US-06 | As a 1인 실무자, 나는 **일자 셀을 클릭해 그날의 모든 todo 리스트 패널**을 보고 "그날의 상세 일정"을 파악하고 싶다. | P0 |
| US-07 | As a 가벼운 플래너 사용자, 나는 **우선순위(low/medium/high)와 카테고리 색상**으로 todo를 분류해 "한눈에 중요도 인식"하고 싶다. | P1 |
| US-08 | As a 1인 실무자, 나는 **시작/종료 시간을 선택적으로 입력**하여 "시간이 정해진 약속도 같이 관리"하고 싶다. | P1 |
| US-09 | As a 1인 실무자, 나는 **"오늘로 이동" 버튼**으로 "임의 월에서 즉시 오늘로 복귀"하고 싶다. | P1 |
| US-10 | As a 데모 시청자, 나는 **빈 상태(데이터 0건)에서도 안내 메시지를 보고** "다음에 무엇을 해야 할지" 인지하고 싶다. | P0 |

---

## 3. 기능 명세 (Functional Specification)

### F-001. 월간 캘린더 뷰 렌더링
- **설명**: 현재 월의 7×N 그리드(첫 주에 전월 말일, 마지막 주에 익월 초일 채움)를 렌더.
- **입력**: `currentMonth: { year:number, month:number }` (Redux ui slice)
- **처리**: `date-fns/startOfMonth` → `eachDayOfInterval(start of first week → end of last week)`로 35~42일 배열 생성. 각 셀에 해당 일자의 todo를 필터링하여 부착.
- **출력**: `DayCell[]` (각 셀: 일자 숫자 + 오늘 강조 + todo 뱃지 ≤3 + "+N more")
- **예외**:
  - E1. `currentMonth`가 잘못된 값 → 오늘 월로 fallback + console.warn
  - E2. 일자별 todo가 4개 이상 → 처음 3개만 뱃지로, 나머지는 "+N more" 표시
- **우선순위**: P0

### F-002. 월 이동 (이전/다음/오늘)
- **설명**: 헤더의 ‹ › 버튼과 "오늘" 버튼으로 월 전환.
- **입력**: 버튼 클릭 이벤트
- **처리**: Redux `ui.setCurrentMonth(prev/next)` dispatch. "오늘" 클릭 시 `new Date()` 기준 월로 set + `selectedDate`도 오늘로.
- **출력**: 새 월 그리드 렌더 + 헤더 텍스트 "2026년 6월" 갱신
- **예외**:
  - E1. 키보드 ←/→로도 월 이동 가능 (단, 입력 포커스가 폼 안이 아닐 때만)
  - E2. 1900년 1월 이전 / 2099년 12월 이후는 버튼 비활성화 (sanity 한계)
- **우선순위**: P0

### F-003. 일자 셀 클릭 → 일자 상세 패널 오픈
- **설명**: 일자 셀 클릭 시 우측(데스크탑) 또는 하단(모바일) 패널에 그 일자의 todo 전체 리스트 표시.
- **입력**: 일자 셀 클릭
- **처리**: `ui.setSelectedDate(YYYY-MM-DD)` dispatch → `TodoListPanel`이 selector로 해당 날짜 필터링
- **출력**: 선택된 일자(파란 테두리 강조) + 패널에 todo 리스트(시간순 정렬, 완료된 항목은 하단)
- **예외**:
  - E1. todo 0건 → EmptyState ("이 날에는 등록된 일정이 없습니다. + 추가" 버튼)
  - E2. 일자 셀의 todo 뱃지를 직접 클릭 시 → 셀 선택 + 해당 todo 수정 모달 동시 오픈 (stopPropagation 주의)
- **우선순위**: P0

### F-004. Todo 추가 (Create)
- **설명**: 일자 셀의 "+" 버튼 또는 패널의 "+ 새 일정" 버튼 → `TodoFormModal`로 신규 todo 생성.
- **입력**: 제목(필수), 설명(선택), 일자(자동 선택값), 시작/종료 시간(선택), 우선순위(기본 medium), 카테고리(선택)
- **처리**: `todos.addTodo(payload)` dispatch → UUID(`crypto.randomUUID()`) 부여 → `createdAt`/`updatedAt` 자동 → localStorage 즉시 sync
- **출력**: 모달 닫힘 + 캘린더 뱃지 즉시 갱신 + 토스트 "일정이 추가되었습니다"
- **예외**:
  - E1. 제목 공란 → 저장 버튼 disabled + 빨간 헬퍼 텍스트 "제목을 입력해 주세요"
  - E2. 종료시간 < 시작시간 → 헬퍼 텍스트 "종료시간은 시작시간 이후여야 합니다", 저장 차단
  - E3. localStorage QuotaExceeded → 에러 토스트 "저장 용량이 가득 찼습니다" + 모달 유지
- **우선순위**: P0

### F-005. Todo 수정 (Update)
- **설명**: 기존 todo 클릭 → 모달에 기존 값 채워진 상태로 오픈 → 수정 → 저장.
- **입력**: 수정 대상 `todoId` + 변경 필드
- **처리**: `todos.updateTodo({ id, changes })` dispatch → `updatedAt` 갱신 → localStorage sync
- **출력**: 모달 닫힘 + 변경 즉시 반영 + 토스트 "일정이 수정되었습니다"
- **예외**:
  - E1. 일자 변경 시 → 원래 날짜 셀에서 사라지고 새 날짜 셀로 이동
  - E2. 동일 데이터 저장(변경 없음) → updatedAt만 갱신, 토스트는 동일하게 출력
- **우선순위**: P0

### F-006. Todo 삭제 (Delete)
- **설명**: 수정 모달 내 "삭제" 버튼 또는 패널 리스트 아이템 우측 휴지통 아이콘.
- **입력**: 삭제 대상 `todoId`
- **처리**: confirm 다이얼로그("정말 삭제하시겠습니까?") → 확인 → `todos.removeTodo(id)` dispatch → localStorage sync
- **출력**: 패널·캘린더에서 즉시 제거 + 토스트 "삭제되었습니다 (실행취소 5초)"
- **예외**:
  - E1. 실행취소 클릭 → 5초 내 복원 (임시 stash). 5초 경과 시 완전 삭제.
  - E2. confirm 취소 → 변경 없음
- **우선순위**: P0

### F-007. 완료 토글 (Complete/Uncomplete)
- **설명**: 패널 리스트의 체크박스 또는 캘린더 뱃지의 작은 동그라미 클릭으로 즉시 완료 상태 전환.
- **입력**: `todoId`
- **처리**: `todos.toggleComplete(id)` dispatch → `completed` 반전 → `updatedAt` 갱신
- **출력**: 완료 시 취소선 + opacity 0.5 + 캘린더 뱃지 회색화. 미완료 복귀 시 원상.
- **예외**:
  - E1. 완료된 todo도 수정·삭제 가능
  - E2. 완료된 todo는 패널 내에서 하단으로 정렬 이동
- **우선순위**: P0

### F-008. 우선순위·카테고리 시각화
- **설명**: 캘린더 뱃지·패널 리스트 좌측에 우선순위 색 dot 또는 카테고리 색 stripe 표시.
- **입력**: todo의 `priority`, `category`
- **처리**: priority → 색상 매핑 (low: gray-500, medium: primary-500, high: red-500). category → 사전 정의 5색 팔레트 중 선택.
- **출력**: 4px 좌측 stripe + 12px dot
- **예외**:
  - E1. category 없음 → stripe 생략, dot만
  - E2. 우선순위 누락 → medium으로 fallback
- **우선순위**: P1

### F-009. localStorage 영속화
- **설명**: 모든 todo 변경 시 즉시 localStorage 직렬화 저장. 앱 시작 시 역직렬화 복원.
- **입력**: Redux todos slice 전체 상태
- **처리**:
  - **Write**: `todos` reducer 변경마다 미들웨어(또는 `subscribe`)로 `JSON.stringify(state.todos.items)` → `localStorage.setItem(KEY, ...)`
  - **Read**: 앱 시작 시 `localStorage.getItem(KEY)` → parse → `todos.hydrate(items)` 초기 dispatch
  - **KEY**: `ai-study.todo.nowonsang_pro.2026-06-04` (CLAUDE.md §4 + 프로젝트 폴더 날짜 포함)
- **출력**: 새로고침해도 데이터 유지
- **예외**:
  - E1. parse 실패 → `todos = []`로 fallback + console.error + 토스트 "저장 데이터가 손상되어 초기화했습니다"
  - E2. localStorage 비활성(시크릿/quota) → 메모리 only 동작 + 상단 배너 "이번 세션은 저장되지 않습니다"
  - E3. 데이터 스키마 버전 불일치 → §4.5 마이그레이션 정책 적용
- **우선순위**: P0

### F-010. 빈 상태 (Empty State)
- **설명**: todo 0건 시 캘린더·패널 모두 안내 UI 표시.
- **입력**: items.length === 0
- **처리**: 조건부 렌더
- **출력**:
  - **캘린더**: 셀에 뱃지 없음 (정상)
  - **패널 (선택된 일자)**: 일러스트 + "이 날에는 등록된 일정이 없습니다." + Primary CTA "+ 새 일정 추가"
  - **첫 진입 (todos 전체 0건)**: 상단 배너 "환영합니다! 일자 셀을 클릭해 첫 일정을 추가해 보세요."
- **예외**:
  - E1. 첫 일정 추가 직후 배너는 사라짐
- **우선순위**: P0

### F-011. 에러 상태 (Error State)
- **설명**: 시스템 에러 발생 시 사용자에게 명시.
- **입력**: localStorage 에러, 직렬화 에러, 알 수 없는 reducer 예외
- **처리**: React `ErrorBoundary`로 컴포넌트 트리 감싸기 + try/catch in storage middleware
- **출력**:
  - **localStorage 에러**: 토스트(우상단, 4초 자동 닫힘)
  - **렌더 에러**: 전체화면 fallback "문제가 발생했습니다. 새로고침 해주세요." + 새로고침 버튼
- **예외**:
  - E1. 에러 발생 후 사용자 액션은 일단 차단, 새로고침 시 데이터 복원 시도
- **우선순위**: P0

### F-012. 키보드 접근성
- **설명**: 마우스 없이 모든 핵심 기능 사용 가능.
- **입력**: Tab, Shift+Tab, Enter, Esc, ←/→ (월 이동), Space (완료 토글)
- **처리**: 각 인터랙티브 요소에 적절한 `tabIndex`, ARIA role, keydown 핸들러
- **출력**: 시각적 포커스 링(primary 컬러) + screen reader 호환
- **예외**:
  - E1. 모달 오픈 시 포커스 트랩 (Tab이 모달 밖으로 나가지 않음)
  - E2. Esc로 모달 닫기, 닫힌 후 트리거 버튼으로 포커스 복귀
- **우선순위**: P0

### F-013. 반응형 레이아웃
- **설명**: 데스크탑(≥1024px), 태블릿(640~1023px), 모바일(<640px) 대응.
- **입력**: viewport width
- **처리**: Tailwind breakpoint (`sm`, `md`, `lg`)
- **출력**:
  - **데스크탑**: 캘린더 좌측 ⅔ + 패널 우측 ⅓ (2-column)
  - **태블릿**: 캘린더 풀폭 + 패널 하단 sticky
  - **모바일**: 캘린더 풀폭, 패널은 일자 클릭 시 bottom sheet로 슬라이드 업
- **예외**:
  - E1. 모바일에서 모달은 풀스크린 시트
- **우선순위**: P0

### F-014. 토스트 알림
- **설명**: 작업 결과(추가/수정/삭제/에러)를 우상단 토스트로 4초 표시.
- **입력**: `ui.showToast({ type, message })` dispatch
- **처리**: ui slice의 `toast` 상태 + 자동 타임아웃 dismiss
- **출력**: 슬라이드 인/아웃 애니메이션, 최대 3개 stack
- **예외**:
  - E1. 동일 메시지 1초 내 재호출 → debounce (중복 제거)
- **우선순위**: P1

### F-015. (참고) v1 비포함 — 명시적 제외
- 반복 일정, 알림, 멀티 디바이스 동기화, 검색·필터 패널, 공유, 드래그&드롭 일정 이동 → **v2 이후** (§9 참조)

---

## 4. 정보 구조 (Information Architecture)

### 4.1 화면 계층도

```
App (SPA, 단일 진입 index.jsx)
└── CalendarPage (단일 페이지)
    ├── MonthHeader (제목, ‹ ›, "오늘" 버튼)
    ├── CalendarGrid
    │   ├── WeekdayRow (일~토)
    │   └── DayCell × 35~42
    │       ├── DayNumber
    │       └── TodoBadge × 0~3 + "+N more"
    ├── TodoListPanel (선택된 일자)
    │   ├── PanelHeader (날짜 + "+ 새 일정")
    │   ├── TodoListItem × N
    │   └── EmptyState (0건일 때)
    ├── TodoFormModal (개념상 분리, 항상 마운트 + open state)
    ├── ToastContainer
    └── ErrorBoundary (전체 감싸기)
```

### 4.2 라우팅 / 상태 흐름
- SPA 단일 진입점. URL 라우팅 없음 (v1).
- "화면 전환"은 모달·패널의 open/close + selectedDate 변경으로 표현.

**모달 상태 머신**:
```
[closed]
   ↓ (셀 "+", 패널 "+", 뱃지 클릭)
[open: create-mode]   /   [open: edit-mode (todoId 있음)]
   ↓ (저장 성공)         ↓ (저장 성공 / 삭제 성공)
[closed]              [closed]
   ↑ (Esc, X, 배경 클릭)
```

### 4.3 데이터 모델 (TypeScript-like 인터페이스)

```ts
// 핵심 엔터티
interface Todo {
  id: string;              // crypto.randomUUID()
  title: string;           // 1~80자, 필수, trim 처리
  description?: string;    // 0~500자, 선택
  dueDate: string;         // 'YYYY-MM-DD' (date-fns/format), 필수
  startTime?: string;      // 'HH:mm' (24h), 선택
  endTime?: string;        // 'HH:mm' (24h), 선택, startTime 있을 때만 유효
  priority: 'low' | 'medium' | 'high';  // 기본 'medium'
  completed: boolean;      // 기본 false
  category?: CategoryId;   // 사전 정의 5개 중 1개, 선택
  createdAt: string;       // ISO 8601 (e.g. '2026-06-04T09:30:00.000Z')
  updatedAt: string;       // ISO 8601, addTodo/updateTodo/toggleComplete 시마다 갱신
}

type CategoryId = 'work' | 'personal' | 'study' | 'health' | 'other';

interface Category {
  id: CategoryId;
  label: string;          // '업무', '개인', '학습', '건강', '기타'
  color: string;          // CSS hex; v1은 토큰 매핑 (§6 참조)
}

// localStorage 페이로드 (v1)
interface StoragePayloadV1 {
  schemaVersion: 1;
  updatedAt: string;       // 마지막 sync ISO
  items: Todo[];
}
```

### 4.4 카테고리 사전 정의 (v1 고정)
| id | label | 색상 토큰 | 비고 |
|---|---|---|---|
| `work` | 업무 | `#00694D` (Primary) | 기본 |
| `personal` | 개인 | `#3B82F6` (Blue-500) | |
| `study` | 학습 | `#8B5CF6` (Violet-500) | |
| `health` | 건강 | `#10B981` (Emerald-500) | |
| `other` | 기타 | `#6B7280` (Gray-500) | |

### 4.5 localStorage 마이그레이션 정책
- **현재 schemaVersion**: `1`
- **읽기 흐름**:
  1. `getItem(KEY)` → null → 초기화 (`{ schemaVersion:1, items:[], updatedAt:now }`)
  2. parse 성공 + `schemaVersion === 1` → 그대로 사용
  3. parse 성공 + `schemaVersion < 1` → 마이그레이션 함수 적용 (v1엔 없음, v2에서 정의)
  4. parse 실패 OR `schemaVersion > 1` → 알림 토스트 + 백업키(`<KEY>.backup.<timestamp>`)로 옮기고 빈 상태로 시작
- **목적**: 미래 변경(v2: 반복 일정 필드 추가)에 안전한 기반.

---

## 5. 화면 정의 (Screen Definitions)

> 모든 와이어프레임은 ASCII로 표기. 실제 픽셀은 §6 디자인 토큰 기준.

### S-001. 메인 캘린더 (월 뷰) — 데스크탑

**ID**: S-001
**경로**: `/` (SPA 단일)
**상태**: `default` (todos ≥1건), `empty` (0건)

#### 와이어프레임 (데스크탑 ≥1024px)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ✨  Todo 일정관리                                            [⚙ 설정?(v2)]  │  ← TopBar (높이 56px, --color-bg-elevated)
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────┐  ┌─────────────────────┐ │
│  │  ‹   2026년 6월   ›       [오늘]                │  │ 6월 4일 (목)        │ │  ← Panel Header
│  │  ────────────────────────────────────────────  │  │   3건 (완료 1)       │ │
│  │  일   월   화   수   목   금   토             │  │ ─────────────────── │ │
│  │ ┌──┬──┬──┬──┬──┬──┬──┐                       │  │ [+ 새 일정 추가]    │ │  ← Primary CTA
│  │ │31│ 1│ 2│ 3│ 4│ 5│ 6│                       │  │ ─────────────────── │ │
│  │ │  │● │  │  │●●│  │  │                       │  │ ☐ 09:00  팀 미팅    │ │
│  │ │  │  │  │  │●+1│ │  │                       │  │   ● high · 업무     │ │
│  │ ├──┼──┼──┼──┼──┼──┼──┤                       │  │ ─────────────────── │ │
│  │ │ 7│ 8│ 9│10│11│12│13│                       │  │ ☐ 14:00  운동 1시간 │ │
│  │ │  │  │  │  │  │  │  │                       │  │   ● med · 건강      │ │
│  │ │  │  │  │  │  │  │  │                       │  │ ─────────────────── │ │
│  │ ├──┼──┼──┼──┼──┼──┼──┤                       │  │ ☑̶ ̶09̶:̶3̶0̶  ̶이̶메̶일̶ ̶정̶리̶ │ │  ← 완료(취소선)
│  │ │14│15│16│17│18│19│20│                       │  │   ● low · 업무      │ │
│  │ │  │  │  │  │  │  │  │                       │  │                     │ │
│  │ ├──┼──┼──┼──┼──┼──┼──┤                       │  │                     │ │
│  │ │21│22│23│24│25│26│27│                       │  │                     │ │
│  │ ├──┼──┼──┼──┼──┼──┼──┤                       │  │                     │ │
│  │ │28│29│30│ 1│ 2│ 3│ 4│ ← 다음달(연한 회색)   │  │                     │ │
│  │ └──┴──┴──┴──┴──┴──┴──┘                       │  │                     │ │
│  └────────────────────────────────────────────────┘  └─────────────────────┘ │
│        CalendarGrid (left 2/3)                          TodoListPanel (right 1/3)
└──────────────────────────────────────────────────────────────────────────────┘
범례: ● = todo dot(우선순위 색), ☐ = 미완료, ☑̶ ̶ = 완료(취소선)
       오늘 셀: 2px Primary 테두리. 선택된 일자: Primary 배경 8%.
       타셀이 다음/이전 달이면 일자 숫자 opacity 0.4.
```

#### 구성 요소 표
| 영역 | 컴포넌트 | 동작 | 비고 |
|---|---|---|---|
| TopBar | `<TopBar/>` | 로고 표시. v1에서는 설정 비활성. | h-14, sticky top-0 |
| MonthHeader | `<MonthHeader/>` | ‹ 클릭 → 이전 달, › → 다음 달, "오늘" → 오늘로 | 키보드 ←/→ 지원 |
| CalendarGrid | `<CalendarGrid/>` | 35~42개 DayCell 렌더 | role="grid" |
| DayCell | `<DayCell date todos isToday isSelected isCurrentMonth/>` | 클릭 → 셀 선택. "+" hover 시 표시 → 클릭 → 추가 모달 | role="gridcell", aria-selected |
| TodoBadge | `<TodoBadge todo/>` | 클릭 → 수정 모달(stopPropagation), 작은 ◯ 클릭 → 완료 토글 | 최대 3개, 그 이상은 "+N" |
| TodoListPanel | `<TodoListPanel selectedDate/>` | 그날의 todo 리스트 | sticky 우측 |
| PanelHeader | `<PanelHeader date count/>` | "+ 새 일정 추가" Primary 버튼 | h-auto |
| TodoListItem | `<TodoListItem todo/>` | 체크박스 토글 + 클릭 시 수정 모달 + 우측 휴지통 | role="listitem" |

#### 인터랙션 흐름
1. 진입 → todos 0건이면 상단에 환영 배너 + 캘린더는 오늘 월
2. 일자 셀 클릭 → 셀 선택(파란 테두리) + 우측 패널 갱신
3. 셀 hover → 우상단 작은 "+" 출현(접근성: aria-label="<날짜>에 일정 추가") → 클릭 시 추가 모달
4. 뱃지 클릭 → 수정 모달, 뱃지의 ◯ 클릭 → 완료 토글
5. 헤더 ‹ › 또는 ←/→ → 월 이동, selectedDate는 유지

#### 상태 변화
- **loading**: 초기 hydration 중 (<100ms 예상) — 스피너 없이 빈 그리드 표시
- **empty**: 전체 0건 → 상단 환영 배너 + 빈 패널 EmptyState
- **error**: localStorage 에러 토스트 + 메모리 only 배너
- **success**: 정상 렌더

---

### S-002. Todo 추가 모달

**ID**: S-002
**상태**: `create-mode`, 부모는 S-001

#### 와이어프레임
```
                ┌──────────────────────────────────────────┐
                │  새 일정 추가                        [×] │  ← Header
                ├──────────────────────────────────────────┤
                │                                          │
                │  제목 *                                  │
                │  ┌────────────────────────────────────┐  │
                │  │ |                                  │  │  ← autoFocus
                │  └────────────────────────────────────┘  │
                │  ⚠ 제목을 입력해 주세요 (validation 시) │
                │                                          │
                │  날짜 *                                  │
                │  ┌────────────────────────────────────┐  │
                │  │ 2026-06-04                  📅     │  │
                │  └────────────────────────────────────┘  │
                │                                          │
                │  시간 (선택)                             │
                │  ┌──────────┐  ┌──────────┐              │
                │  │ 09:00    │~ │ 10:00    │              │
                │  └──────────┘  └──────────┘              │
                │                                          │
                │  우선순위                                │
                │  ( ) 낮음   (●) 보통   ( ) 높음          │
                │                                          │
                │  카테고리 (선택)                         │
                │  [업무] [개인] [학습] [건강] [기타] [없음]│  ← Chip select
                │                                          │
                │  설명 (선택)                             │
                │  ┌────────────────────────────────────┐  │
                │  │                                    │  │
                │  │                                    │  │
                │  └────────────────────────────────────┘  │
                │                                          │
                ├──────────────────────────────────────────┤
                │              [취소]   [저장하기]          │
                └──────────────────────────────────────────┘
                폭: 480px (데스크탑), 100vw (모바일, bottom sheet)
                배경: rgba(0,0,0,0.4) 오버레이
```

#### 구성 요소 표
| 영역 | 컴포넌트 | 동작 |
|---|---|---|
| Header | 제목 + 닫기(X) | X 또는 Esc → 닫기 (변경사항 있으면 confirm) |
| Title Input | `<TextInput required maxLength=80/>` | autoFocus, 공란이면 저장 disabled |
| Date Input | `<DateInput/>` | 셀에서 진입 시 자동 채움, 변경 가능 |
| Time Inputs | `<TimeInput/>` × 2 | 둘 다 선택. 종료 < 시작이면 검증 에러 |
| Priority Radio | `<RadioGroup/>` | 기본 medium |
| Category Chips | `<ChipGroup/>` | single select. "없음" 선택 가능 |
| Description | `<Textarea maxLength=500/>` | 3행 기본 높이 |
| Footer Buttons | `<Button variant=secondary>취소</Button>` + `<Button variant=primary>저장하기</Button>` | 저장 → dispatch + 모달 close |

#### 인터랙션 흐름
- 진입: 일자 셀 "+" 또는 패널 "+ 새 일정 추가" 클릭
- 저장: validate 통과 → `todos.addTodo({...})` → toast → close
- 취소/Esc/X/배경 클릭: 변경 사항 있으면 confirm("변경사항을 버리시겠습니까?")

#### 상태 변화
- **default**: 빈 폼
- **validating**: 제목 공란 또는 시간 역전 시 빨간 헬퍼 + 저장 disabled
- **submitting**: (v1은 동기, 200ms 미만이라 별도 로딩 없음)
- **error**: localStorage QuotaExceeded → 토스트 + 모달 유지

---

### S-003. Todo 상세/수정 모달

**ID**: S-003
**상태**: `edit-mode`, S-002와 동일 UI 구조 + 좌하단 "삭제" 버튼

#### 와이어프레임 차이점
```
                ├──────────────────────────────────────────┤
                │ [🗑 삭제]              [취소]  [저장하기] │  ← Footer 좌측에 삭제
                └──────────────────────────────────────────┘
                Header: "일정 수정"
                Title/Date/Time/... 모두 기존 값 prefill
```

#### 인터랙션 흐름
- 진입: 뱃지 클릭 또는 패널 리스트 아이템 클릭
- 삭제: 좌하단 🗑 → confirm("정말 삭제하시겠습니까?") → `todos.removeTodo` → close → toast(실행취소 5초)
- 저장: `todos.updateTodo({id, changes})` → close → toast

---

### S-004. 일자 상세 패널 (모바일 Bottom Sheet)

**ID**: S-004
**상태**: 모바일(<640px)에서 일자 셀 클릭 시 풀폭 슬라이드 업

#### 와이어프레임
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
│  ☑̶ ̶0̶9̶:̶3̶0̶ ̶ ̶이̶메̶일̶ ̶정̶리̶      │
│    ● low · 업무       [🗑] │
└────────────────────────────┘
높이: 60vh 기본, drag로 풀스크린 확장 가능 (v2)
```

---

### S-005. 빈 상태 (Empty State)

**ID**: S-005
**상태**: 전체 todos 0건 또는 선택일 0건

#### 와이어프레임 (선택일 0건)
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
              패널 가운데 정렬, py-12
```

#### 와이어프레임 (첫 진입, 전체 0건 — 상단 환영 배너)
```
┌──────────────────────────────────────────────────────────────┐
│  ✨ 환영합니다! 일자 셀을 클릭해 첫 일정을 추가해 보세요.  [×]│
└──────────────────────────────────────────────────────────────┘
배너 높이 48px, Primary 8% 배경, 우측 닫기 버튼 (localStorage에 dismiss 기록)
```

---

### S-006. 에러 상태 (Error State)

**ID**: S-006

#### 6-A. 토스트형 (localStorage 등 부분 에러)
```
                                              ┌──────────────────────────────┐
                                              │ ⚠ 저장 용량이 가득 찼습니다  │
                                              │   불필요한 일정을 삭제해 주세요│
                                              │                          [×] │
                                              └──────────────────────────────┘
                                              우상단, 4초 자동 닫힘
```

#### 6-B. 전체화면 fallback (ErrorBoundary 캐치)
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
```

---

## 6. UI/UX 디자인 가이드 (동화 디자인 시스템 v1 매핑)

### 6.1 컬러 토큰
| 용도 | 토큰 | 값 | 사용처 |
|---|---|---|---|
| Primary | `var(--color-primary)` | `#00694D` | CTA 버튼, 오늘 셀 테두리, 선택 강조, 우선순위 medium dot |
| Primary Hover | `var(--color-primary-hover)` | `#005A41` | 버튼 hover |
| Primary 8% | `rgba(0,105,77,0.08)` | — | 선택된 셀 배경 |
| Background | `var(--color-bg)` | `#FFFFFF` | 캘린더 셀 |
| Background Elevated | `var(--color-bg-elevated)` | `#FFFFFF` + shadow | TopBar, 모달 |
| Border | `var(--color-border)` | `#E5E7EB` | 셀 구분선 |
| Text Primary | `var(--color-text)` | `#111827` | 본문 |
| Text Secondary | `var(--color-text-secondary)` | `#6B7280` | 부가 정보 (날짜 옆 카운트 등) |
| Danger | `var(--color-danger)` | `#EF4444` | 우선순위 high dot, 삭제 |
| Success | `var(--color-success)` | `#10B981` | 카테고리 health |

> **금지**: `bg-red-500` 같은 임의 색상 클래스 직접 사용 금지. `bg-[var(--color-primary)]` 또는 `style={{ color: 'var(--color-primary)' }}` 형식 사용.

### 6.2 타이포그래피
- **Font Family**: `var(--font-family)` (Pretendard, fallback: -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif)
- **최소 폰트**: 12px (11px 이하 절대 금지)
- **위계**:
  - 페이지 제목: 20px / 700
  - 월 제목 (MonthHeader): 18px / 600
  - DayCell 일자 숫자: 14px / 500
  - TodoBadge 텍스트: 12px / 500 (truncate)
  - 본문: 14px / 400
  - 헬퍼 텍스트: 12px / 400

### 6.3 간격 / 레이아웃
- 8px 그리드 기준 (4, 8, 12, 16, 24, 32, 48)
- DayCell 최소 높이: 96px (데스크탑), 64px (모바일)
- 모달 padding: 24px
- 패널 padding: 16px

### 6.4 반응형 브레이크포인트
| 범위 | 레이아웃 |
|---|---|
| `<640px` (mobile) | 캘린더 풀폭, 패널은 bottom sheet |
| `640~1023px` (tablet) | 캘린더 풀폭, 패널은 하단 sticky 카드 |
| `≥1024px` (desktop) | 2-column (left ⅔ + right ⅓) |

### 6.5 접근성 (WCAG 2.1 AA)
- **컬러 대비**: 본문 ≥4.5:1, 버튼 ≥3:1 (Primary `#00694D` on white = 8.6:1 ✅)
- **키보드**: 모든 인터랙티브 요소 Tab 순회, 포커스 링(2px primary outline) 가시
- **ARIA**:
  - CalendarGrid: `role="grid"`, DayCell: `role="gridcell"`, `aria-selected`, `aria-label="2026년 6월 4일, 3개 일정"`
  - TodoFormModal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
  - Toast: `role="status"`, `aria-live="polite"`
- **포커스 트랩**: 모달 오픈 시 Tab이 모달 밖으로 못 나감, Esc 닫기
- **screen reader 텍스트**: 아이콘 버튼에 `<span class="sr-only">`

### 6.6 마이크로 인터랙션
- 모달 열기: 150ms fade + scale(0.96 → 1)
- 모달 닫기: 100ms fade
- 토스트 슬라이드: 200ms ease-out
- 셀 hover "+" 버튼: 80ms fade
- 완료 토글: 100ms 취소선·opacity 트랜지션
- bottom sheet (모바일): 250ms slide-up ease-out

---

## 7. 기술 스택 & 구현 가이드 (Phase 2 직접 지시)

### 7.1 필수 스택 (확정)
- React 18 + Vite 5 (프로젝트 루트 기 설치)
- React Router 6 — **사용 안 함** (SPA 단일 진입)
- Tailwind 3 — 레이아웃·간격에 자유롭게 사용. **색상은 무조건 CSS 변수 참조**.
- **Redux Toolkit + React-Redux** — 필수. `@reduxjs/toolkit`, `react-redux` `package.json`에 추가.
- `date-fns` (권장) — 추가. 타임존은 **로컬 타임존만 사용** (UTC 변환 금지). `dueDate`는 `YYYY-MM-DD` 문자열로만 저장하여 타임존 이슈 회피.
- `clsx` (선택) — className 조건부 결합용

### 7.2 컴포넌트 트리 (Phase 2 권장안)
```
src/people/nowonsang_pro/projects/2026-06-04/
├── index.jsx                     ← 진입점. <Provider store={store}><App/></Provider>
├── App.jsx                       ← ErrorBoundary + Layout + HydrationGate
├── components/
│   ├── TopBar.jsx
│   ├── calendar/
│   │   ├── CalendarView.jsx      ← MonthHeader + CalendarGrid 컨테이너
│   │   ├── MonthHeader.jsx
│   │   ├── WeekdayRow.jsx
│   │   ├── CalendarGrid.jsx
│   │   ├── DayCell.jsx
│   │   └── TodoBadge.jsx
│   ├── panel/
│   │   ├── TodoListPanel.jsx
│   │   ├── PanelHeader.jsx
│   │   ├── TodoListItem.jsx
│   │   └── EmptyState.jsx
│   ├── modal/
│   │   ├── TodoFormModal.jsx     ← create + edit 통합
│   │   ├── ModalShell.jsx        ← 포커스 트랩, 오버레이
│   │   └── ConfirmDialog.jsx
│   ├── toast/
│   │   ├── ToastContainer.jsx
│   │   └── Toast.jsx
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── TextInput.jsx
│   │   ├── DateInput.jsx
│   │   ├── TimeInput.jsx
│   │   ├── RadioGroup.jsx
│   │   ├── ChipGroup.jsx
│   │   └── Textarea.jsx
│   └── error/
│       └── ErrorBoundary.jsx
├── store/
│   ├── store.js                  ← configureStore + storage middleware
│   ├── todosSlice.js             ← items, addTodo, updateTodo, removeTodo, toggleComplete, hydrate
│   ├── uiSlice.js                ← currentMonth, selectedDate, modal {open, mode, todoId}, toast[], welcomeBannerDismissed
│   ├── storageMiddleware.js      ← state.todos 변경 감지 → localStorage write
│   └── selectors.js              ← selectTodosByDate, selectTodayTodos, selectMonthGrid 등 memoized
├── styles/
│   └── calendar.css              ← Tailwind로 처리 어려운 그리드/애니메이션
└── docs/                         ← (이 문서가 여기 위치)
```

### 7.3 Redux Store 슬라이스 설계

**todosSlice**:
```ts
state: {
  items: Todo[];          // 모든 todo
  hydrated: boolean;      // localStorage 로드 완료 여부
}
actions:
  - hydrate(items: Todo[])               // 초기 1회
  - addTodo(payload: Omit<Todo, 'id'|'createdAt'|'updatedAt'>)
  - updateTodo({ id, changes })
  - removeTodo(id)
  - toggleComplete(id)
  - restoreTodo(todo: Todo)              // 실행취소용
```

**uiSlice**:
```ts
state: {
  currentMonth: { year:number, month:number };  // 0-indexed month? -> 1-indexed로 통일 (year:2026, month:6)
  selectedDate: string;                          // 'YYYY-MM-DD', 기본 오늘
  modal: { open:boolean; mode:'create'|'edit'; todoId?:string; presetDate?:string };
  toasts: Array<{ id:string; type:'info'|'success'|'error'; message:string }>;
  welcomeBannerDismissed: boolean;
  storageBlocked: boolean;                       // localStorage 비활성 시 true
}
actions:
  - setCurrentMonth({year, month})
  - goToPrevMonth() / goToNextMonth() / goToToday()
  - setSelectedDate(date)
  - openCreateModal(presetDate) / openEditModal(todoId) / closeModal()
  - showToast(toast) / dismissToast(id)
  - dismissWelcomeBanner()
  - setStorageBlocked(boolean)
```

### 7.4 localStorage 키 & 미들웨어
```js
// store/storageMiddleware.js
export const STORAGE_KEY = 'ai-study.todo.nowonsang_pro.2026-06-04';
export const SCHEMA_VERSION = 1;

export const storageMiddleware = store => next => action => {
  const result = next(action);
  if (action.type?.startsWith('todos/')) {
    try {
      const { items } = store.getState().todos;
      const payload = { schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString(), items };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      store.dispatch(uiActions.setStorageBlocked(true));
      store.dispatch(uiActions.showToast({ id: crypto.randomUUID(), type:'error', message:'저장 용량이 가득 찼습니다' }));
    }
  }
  return result;
};

// 앱 시작 시 hydrate
export function loadInitialTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      // 마이그레이션 필요 — v1에서는 백업 후 빈 배열
      localStorage.setItem(`${STORAGE_KEY}.backup.${Date.now()}`, raw);
      return [];
    }
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch (e) {
    console.error('hydrate failed', e);
    return [];
  }
}
```

### 7.5 일자 계산 (date-fns 사용 권장 패턴)
```js
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from 'date-fns';

export function buildMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(first);
  const monthEnd = endOfMonth(first);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });   // 일요일 시작
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export const toDateKey = (d) => format(d, 'yyyy-MM-dd');
```

### 7.6 진입점 골격
```jsx
// index.jsx
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import './styles/calendar.css';

export default function TodoCalendar() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
```

```jsx
// App.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { todosActions } from './store/todosSlice';
import { loadInitialTodos } from './store/storageMiddleware';
import ErrorBoundary from './components/error/ErrorBoundary';
import TopBar from './components/TopBar';
import CalendarView from './components/calendar/CalendarView';
import TodoListPanel from './components/panel/TodoListPanel';
import TodoFormModal from './components/modal/TodoFormModal';
import ToastContainer from './components/toast/ToastContainer';

export default function App() {
  const dispatch = useDispatch();
  const hydrated = useSelector(s => s.todos.hydrated);
  useEffect(() => { dispatch(todosActions.hydrate(loadInitialTodos())); }, [dispatch]);
  if (!hydrated) return null; // 또는 스켈레톤
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-family)' }}>
        <TopBar />
        <main className="max-w-[1280px] mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><CalendarView /></div>
          <div className="lg:col-span-1"><TodoListPanel /></div>
        </main>
        <TodoFormModal />
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
```

### 7.7 `projects.js` 등록 (Phase 2 막바지에 반드시)
```js
// src/people/nowonsang_pro/projects.js (관리자 본인 작업이라 직접 수정 허용)
import { lazy } from 'react';
// ...
{
  slug: '2026-06-04',
  date: '2026.06.04',
  title: 'Todo 일정관리',
  desc: '4-에이전트 파이프라인 — 캘린더 기반 To-do',
  Component: lazy(() => import('./projects/2026-06-04/index.jsx')),
}
```

---

## 8. 수용 기준 (Acceptance Criteria — Phase 3 QA 검증 대상)

> Gherkin-like Given/When/Then. Phase 3 Playwright가 그대로 시나리오로 사용.

### AC-01. 초기 진입 (빈 상태)
- **Given** localStorage가 비어있고
- **When** `/` 진입하면
- **Then** 캘린더는 오늘 월을 표시하고, 상단에 환영 배너가 나타나며, 패널은 "이 날에는 등록된 일정이 없습니다." EmptyState를 표시한다.
- **Screenshot**: `01-home-initial.png`

### AC-02. 일자 셀 클릭 → 패널 갱신
- **Given** 진입 상태에서
- **When** 6월 10일 셀을 클릭하면
- **Then** 그 셀이 Primary 8% 배경으로 선택되고 패널 헤더가 "6월 10일 (수) · 0건"으로 바뀐다.
- **Screenshot**: `02-day-selected.png`

### AC-03. Todo 추가 (정상)
- **Given** 6월 10일이 선택된 상태에서
- **When** "+ 새 일정 추가" 버튼을 클릭하고, 제목 "기획 회의" 입력 후 저장하면
- **Then** 모달이 닫히고, 10일 셀에 dot+제목 뱃지가 1개 표시되며, 패널 리스트에 "기획 회의"가 1번으로 나타난다. 토스트 "일정이 추가되었습니다"가 4초간 표시된다.
- **Screenshots**: `03-todo-add-modal.png`, `04-todo-add-saved.png`

### AC-04. Todo 추가 (제목 공란 검증)
- **Given** 추가 모달에서
- **When** 제목 입력 없이 "저장하기"를 시도하면
- **Then** 저장 버튼은 disabled이고, 헬퍼 "제목을 입력해 주세요"가 빨간색으로 표시된다.
- **Screenshot**: `05-add-validation.png`

### AC-05. 시간 입력 검증 (종료 < 시작)
- **Given** 시작 14:00, 종료 13:00 입력 시
- **When** "저장하기"를 시도하면
- **Then** "종료시간은 시작시간 이후여야 합니다" 표시 + 저장 차단.
- **Screenshot**: `06-time-validation.png`

### AC-06. Todo 완료 토글
- **Given** 패널에 "기획 회의"가 있고
- **When** 좌측 체크박스를 클릭하면
- **Then** 즉시 취소선 + opacity 0.5 + 리스트 하단으로 이동. 캘린더 뱃지도 회색화.
- **Screenshot**: `07-todo-completed.png`

### AC-07. Todo 수정
- **Given** "기획 회의"가 등록되어 있고
- **When** 뱃지를 클릭하여 수정 모달에서 제목을 "기획 검토"로 바꾸고 저장하면
- **Then** 뱃지·리스트 모두 "기획 검토"로 바뀐다. `updatedAt`은 갱신된다.
- **Screenshots**: `08-edit-modal.png`, `09-edit-saved.png`

### AC-08. Todo 삭제 + 실행취소
- **Given** "기획 검토"가 등록되어 있고
- **When** 수정 모달에서 "🗑 삭제" 클릭 → confirm 확인하면
- **Then** 패널·캘린더에서 즉시 제거되고, 토스트 "삭제되었습니다 [실행취소]"가 표시된다.
- **And** 5초 내 "실행취소" 클릭하면 todo가 동일 위치에 복원된다.
- **Screenshots**: `10-delete-confirm.png`, `11-delete-toast.png`, `12-undo-restored.png`

### AC-09. 월 이동 (이전/다음/오늘)
- **Given** 6월 월 뷰에서
- **When** ‹ 클릭하면 5월로, › 클릭하면 6월로 돌아가고, "오늘" 클릭하면 오늘 월로 이동한다.
- **Then** 헤더 텍스트와 그리드가 동기화된다. selectedDate는 "오늘" 버튼 클릭 시에만 오늘로 set된다.
- **Screenshot**: `13-month-navigation.png`

### AC-10. localStorage 영속화
- **Given** todo 3건이 등록된 상태에서
- **When** 브라우저를 새로고침(F5)하면
- **Then** 3건이 모두 동일하게 복원되어 표시된다.
- **Screenshot**: `14-after-reload.png`

### AC-11. 뱃지 "+N more" 표시
- **Given** 한 일자에 todo 5건 등록 시
- **When** 캘린더에서 해당 셀을 보면
- **Then** 처음 3건만 뱃지로 보이고, "+2 more"가 4번째 줄에 표시된다.
- **Screenshot**: `15-badge-overflow.png`

### AC-12. 키보드 네비게이션
- **Given** Tab으로 진입 가능한 모든 인터랙티브 요소
- **When** Tab을 반복 누르면
- **Then** TopBar → MonthHeader 버튼들 → DayCell들(첫 셀부터) → 패널 → 모달(열려있을 때) 순서로 포커스 이동하며, 각 포커스에 Primary outline이 가시화된다.
- **And** 모달이 열려있을 때 Esc를 누르면 닫히고 트리거 버튼으로 포커스가 복귀한다.
- **Screenshot**: `16-keyboard-focus.png`

### AC-13. 반응형 (모바일 bottom sheet)
- **Given** viewport 375x812 에서
- **When** 일자 셀 클릭하면
- **Then** 패널이 아닌 bottom sheet가 60vh로 슬라이드 업 한다.
- **Screenshot**: `17-mobile-sheet.png`

### AC-14. 카테고리·우선순위 시각화
- **Given** priority=high + category=work인 todo
- **When** 뱃지·리스트를 보면
- **Then** 좌측 4px primary stripe + 빨간 dot이 표시된다.
- **Screenshot**: `18-priority-category.png`

---

## 9. 범위 외 (Out of Scope — v1 명시적 제외)

다음은 의도적으로 v1에서 제외. v2 backlog로 이관.

| 항목 | v2 이관 사유 |
|---|---|
| 반복 일정 (매주/매월) | RRULE 구현 복잡도 + UI 추가 폼 필요 → 별도 스프린트 |
| 알림/푸시 | Notification API 권한 흐름 + 서비스워커 필요 |
| 멀티 디바이스 동기화 | 백엔드 없음 → v1 범위 밖 |
| 검색 / 필터 패널 | v1은 일자 클릭으로 충분 |
| 카테고리 사용자 정의 | 5종 사전 정의로 충분 |
| 드래그&드롭 일정 이동 | dnd 라이브러리 + 충돌 처리 |
| 공유 / 공동 편집 | 백엔드 + 인증 필요 |
| 다크 모드 | 동화 디자인 시스템 다크 토큰 정의되면 추가 |
| CSV/iCal 내보내기 | UX/포맷 별도 합의 필요 |
| 일/주 뷰 | v1은 월 뷰 + 일자 패널로 충분 (S-004 패널이 일 뷰 역할 수행) |

---

## 10. Phase 2 개발자에게 전달하는 명확한 지시

### 10.1 첫 커밋 단위 제안 (3-step delivery)
| Step | 구현 범위 | 검증 |
|---|---|---|
| **Step 1: Skeleton** | 진입점, Provider, Layout, 빈 CalendarGrid, 빈 TodoListPanel, store 골격 (todos+ui slice, storageMiddleware, hydrate) | `npm run dev` → Hub → 카드 클릭 → 캘린더 빈 그리드 렌더 |
| **Step 2: Core CRUD** | TodoFormModal(create/edit), addTodo/updateTodo/removeTodo/toggleComplete, TodoListPanel 리스트, DayCell 뱃지, localStorage sync | 콘솔에서 redux DevTools로 dispatch 확인 + 새로고침 후 데이터 유지 |
| **Step 3: Polish** | 빈 상태/에러 상태, 토스트, 실행취소, 키보드 네비게이션, 반응형, 카테고리·우선순위 시각화 | AC-01 ~ AC-14 수동 통과 |

### 10.2 구현 우선순위 (P0부터)
1. **P0 (Step 1~2)**: F-001 ~ F-007, F-009 ~ F-013 (핵심 CRUD + 영속화 + 반응형)
2. **P1 (Step 3)**: F-008 (시각화), F-014 (토스트), 우선순위·카테고리, 실행취소
3. **P1 키보드/접근성**: F-012 (Step 3 끝에 검증)

### 10.3 주의사항 (rework 방지)

#### ⚠️ 날짜·타임존
- **절대 `new Date(string)`로 'YYYY-MM-DD' 파싱하지 말 것**. ("2026-06-04" → UTC 00:00 → 한국 시간 09:00 → 전날로 밀림)
- 항상 `date-fns/parseISO` 또는 `new Date(year, monthIndex, day)`로 명시 생성.
- `dueDate`는 무조건 `'YYYY-MM-DD'` 문자열로 저장·비교. Date 객체로 변환하는 순간 타임존 위험.
- 비교는 `format(date, 'yyyy-MM-dd') === todo.dueDate` 형태.

#### ⚠️ localStorage 직렬화
- 매 dispatch마다 stringify는 부담일 수 있으나, v1 규모(수백 건 미만)에서는 충분. v2에서 throttle 검토.
- 미들웨어는 `todos/`로 시작하는 액션에서만 동작. UI 액션에서는 write 안 함.

#### ⚠️ localStorage 키
- **반드시** `ai-study.todo.nowonsang_pro.2026-06-04` (CLAUDE.md §4 + 프로젝트 폴더 날짜 포함). 하드코딩하지 말고 `STORAGE_KEY` 상수로.

#### ⚠️ 디자인 토큰
- Tailwind 임의 색상 클래스(`bg-red-500`, `text-blue-600` 등) **사용 금지**.
- `bg-[var(--color-primary)]`, `text-[var(--color-text-secondary)]` 형식 사용.
- 11px 이하 폰트 **금지** (`text-[10px]` 안 됨).

#### ⚠️ Redux DevTools
- `configureStore`는 기본으로 dev tools 활성화. Phase 3 QA가 디버깅 시 사용.

#### ⚠️ ErrorBoundary
- React 18 + 함수형 컴포넌트에서도 ErrorBoundary는 클래스 컴포넌트로 작성해야 함.

#### ⚠️ 모달 & 포커스 트랩
- 단순 구현이라면 `<dialog>` 네이티브 요소 활용 가능 (브라우저 지원 ✅, 포커스 트랩 자동). v1 권장.

#### ⚠️ `package.json` 추가 패키지
Phase 2에서 다음을 추가 (자유롭게 추가 가능 — CLAUDE.md §3 예외):
- `@reduxjs/toolkit`, `react-redux`, `date-fns` (필수)
- `clsx` (선택, 권장)

#### ⚠️ `projects.js` 등록
Phase 2 종료 전 반드시 `src/people/nowonsang_pro/projects.js`에 항목 추가 (관리자 본인 작업이라 허용). Hub에서 클릭 가능해야 Phase 3 QA가 진입 가능.

#### ⚠️ Phase 3 진입 조건 (Phase 2 → Phase 3)
- `npm run dev` 실행 시 `http://localhost:5173`에서 Hub 진입 → "Todo 일정관리" 카드 클릭 → 화면 정상 렌더
- AC-01 (초기 진입)이 수동으로 통과
- `docs/02-dev-notes.md` 작성 완료 (어떤 컴포넌트가 어디에 있는지 / 알려진 한계 / 의존성 추가 내역)

### 10.4 권장 디렉토리 트리 (재확인)
```
src/people/nowonsang_pro/projects/2026-06-04/
├── index.jsx                ← Provider + App
├── App.jsx
├── components/
├── store/
├── styles/
├── tests/                   ← Phase 3에서 .png 저장
└── docs/
    ├── 01-plan.md           ← (이 문서)
    ├── 01-screen-definition-source.md  ← PDF 원본
    ├── 01-screen-definition.pdf        ← 변환물
    ├── 02-dev-notes.md      ← Phase 2 산출
    ├── 03-qa-report.md      ← Phase 3 산출
    └── 04-review-report.md  ← Phase 4 산출
```

---

## 부록 A. localStorage 페이로드 예시

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-06-04T10:30:00.000Z",
  "items": [
    {
      "id": "0193f5e8-7c11-7000-8000-000000000001",
      "title": "팀 미팅",
      "description": "Q3 OKR 리뷰",
      "dueDate": "2026-06-04",
      "startTime": "09:00",
      "endTime": "10:00",
      "priority": "high",
      "completed": false,
      "category": "work",
      "createdAt": "2026-06-04T08:00:00.000Z",
      "updatedAt": "2026-06-04T08:00:00.000Z"
    },
    {
      "id": "0193f5e8-7c11-7000-8000-000000000002",
      "title": "운동 1시간",
      "dueDate": "2026-06-04",
      "startTime": "14:00",
      "endTime": "15:00",
      "priority": "medium",
      "completed": false,
      "category": "health",
      "createdAt": "2026-06-04T08:05:00.000Z",
      "updatedAt": "2026-06-04T08:05:00.000Z"
    }
  ]
}
```

## 부록 B. Phase 3 QA 시나리오 ↔ 스크린샷 매핑 (전체)

| # | 파일명 | AC | 시나리오 한 줄 |
|---|---|---|---|
| 01 | `01-home-initial.png` | AC-01 | 초기 진입 빈 상태 |
| 02 | `02-day-selected.png` | AC-02 | 일자 셀 클릭 후 패널 갱신 |
| 03 | `03-todo-add-modal.png` | AC-03 | 추가 모달 오픈 |
| 04 | `04-todo-add-saved.png` | AC-03 | 추가 완료 후 캘린더 반영 |
| 05 | `05-add-validation.png` | AC-04 | 제목 공란 검증 |
| 06 | `06-time-validation.png` | AC-05 | 시간 역전 검증 |
| 07 | `07-todo-completed.png` | AC-06 | 완료 토글 후 |
| 08 | `08-edit-modal.png` | AC-07 | 수정 모달 (prefill) |
| 09 | `09-edit-saved.png` | AC-07 | 수정 후 캘린더 |
| 10 | `10-delete-confirm.png` | AC-08 | confirm 다이얼로그 |
| 11 | `11-delete-toast.png` | AC-08 | 삭제 후 실행취소 토스트 |
| 12 | `12-undo-restored.png` | AC-08 | 실행취소 후 복원 |
| 13 | `13-month-navigation.png` | AC-09 | 다른 월로 이동 |
| 14 | `14-after-reload.png` | AC-10 | 새로고침 후 복원 |
| 15 | `15-badge-overflow.png` | AC-11 | "+N more" 표시 |
| 16 | `16-keyboard-focus.png` | AC-12 | 포커스 outline |
| 17 | `17-mobile-sheet.png` | AC-13 | 모바일 bottom sheet |
| 18 | `18-priority-category.png` | AC-14 | priority+category 시각화 |

**총 18장**. Phase 3 `tests/README.md`는 위 표를 그대로 가져다 결과(✅/⚠/❌) 컬럼만 추가하면 됨.

---

**[Phase 1 종료]** — 다음: `react-redux-toolkit-builder`가 이 문서를 입력으로 받아 Phase 2 개발 시작.
