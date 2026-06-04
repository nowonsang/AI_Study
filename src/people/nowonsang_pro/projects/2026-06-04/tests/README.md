# Phase 3 QA — 스크린샷 인덱스

- **작업자**: 노원상 (`nowonsang_pro`, 관리자)
- **프로젝트**: Todo 일정관리 (`/people/nowonsang_pro/2026-06-04`)
- **테스트 일자**: 2026-06-04
- **Playwright**: 1.60.0 / Chromium (headless)
- **데스크탑 뷰포트**: 1280 × 900 · **모바일 뷰포트**: 375 × 812
- **콘솔 에러**: 0 / **페이지 에러**: 0 (콘솔 워닝은 React Router v6→v7 future flag 안내뿐)
- **시나리오 통과율**: 22 / 22 (100%)
- **실행 스크립트**: `tests/e2e.spec.mjs` (run: `node src/people/nowonsang_pro/projects/2026-06-04/tests/e2e.spec.mjs`)
- **상세 로그**: `tests/qa-run.json`

> 결과 컬럼: ✅ 통과 · ⚠️ 경미한 개선 필요 · ❌ 실패

| # | 파일 | AC | 시나리오 | 검증 항목 | 결과 |
|---|---|---|---|---|---|
| 01 | `01-home-initial.png` | env | Hub 첫 진입 | `/` 경로 정상 렌더, 멤버 카드 7개 노출 | ✅ |
| 02 | `02-member-card-nowonsang.png` | env | 노원상 멤버 페이지 | 작업 목록 헤더 + 카드 노출 | ✅ |
| 03 | `03-project-card-todo.png` | env | Todo 일정관리 카드 노출 | 2026.06.04 라벨 + 진입 가능 | ✅ |
| 04 | `04-calendar-empty-state.png` | AC-01 | 초기 진입(2026-06) — 빈 상태 | 환영 배너 + 패널 EmptyState 동시 표시 | ✅ |
| 05 | `05-month-prev.png` | AC-09 | 이전 달(‹) 클릭 | 헤더 "2026년 5월"로 갱신 | ✅ |
| 06 | `06-month-next.png` | AC-09 | 다음 달(›) 클릭 | 헤더 "2026년 7월"로 갱신 | ✅ |
| 07 | `07-day-selected.png` | AC-02 | 6/15 셀 클릭 | 셀 `data-selected=true` + 패널 "6월 15일 (월)" | ✅ |
| 08 | `08-todo-form-open-empty.png` | AC-03 | 모달 오픈 | `<dialog>` 표시, 헤더 "새 일정 추가" | ✅ |
| 09 | `09-todo-form-validation.png` | AC-04 | 제목 공란 | 저장 disabled + 헬퍼 "제목을 입력해 주세요" | ✅ |
| 10 | `10-todo-form-filled.png` | AC-03 | 입력 완료 상태 | 저장 활성, 카테고리 "업무" pressed | ✅ |
| 11 | `11-todo-saved-panel.png` | AC-03 | 저장 후 패널 | "기획 회의" 리스트 아이템 + 토스트 | ✅ |
| 12 | `12-todo-saved-badge.png` | AC-03 | 캘린더 6/15 셀 | 뱃지 1개 + 좌측 stripe(primary) + 빨간 high dot | ✅ |
| 13 | `13-todo-toggle-complete.png` | AC-06 | 체크박스 토글 | 패널 아이템 `data-completed=true` (취소선) | ✅ |
| 14 | `14-todo-edit-modal.png` | AC-07 | 뱃지 클릭 → 수정 모달 | 헤더 "일정 수정", 모든 값 prefill | ✅ |
| 15 | `15-todo-edit-saved.png` | AC-07 | 제목 변경 후 저장 | 패널·뱃지 모두 "기획 검토"로 갱신 | ✅ |
| 16 | `16-todo-delete-confirm.png` | AC-08 | 삭제 confirm 다이얼로그 | `window.confirm("정말 삭제하시겠습니까?")` + 토스트 3개 stack(추가/수정/삭제+실행취소) | ✅ |
| 17 | `17-todo-delete-completed.png` | AC-08 | 삭제 완료 + 빈 상태 | 패널 0건 EmptyState + 환영 배너 재출현 (의도적, dev-notes §6 참조) | ✅ (⚠ 참고) |
| 18 | `18-localstorage-persisted.png` | AC-10 | 새로고침 후 데이터 유지 | localStorage 키 `ai-study.todo.nowonsang_pro.2026-06-04` 유지, 패널 "운동 1시간" 복원 | ✅ |
| 19 | `19-todo-form-time-validation.png` | AC-05 | 종료 < 시작 시간 | 헬퍼 "종료시간은 시작시간 이후여야 합니다" + 저장 disabled | ✅ |
| 20 | `20-calendar-badge-overflow.png` | AC-11 | 한 셀에 5건 | 뱃지 3개 + "+2 more" 표시 | ✅ |
| 21 | `21-mobile-responsive-stack.png` | AC-13 | 375x812 모바일 뷰포트 | 캘린더 위 / 패널 아래 1-column 스택 | ✅ |
| 22 | `22-keyboard-focus-outline.png` | AC-12 | Tab 5회 이동 | 활성 요소에 outline 가시화 | ✅ |

## 미커버 / 부분 커버 AC

| AC | 상태 | 비고 |
|---|---|---|
| AC-08 (Undo) | 부분 | confirm 수락·토스트의 "실행취소" 버튼 노출은 확인 ✅. 실제 "실행취소" 클릭 후 복원 동작은 본 회차에 미테스트 (코드 리뷰로 `restoreTodo` 액션 존재 확인). 추후 시나리오로 추가 권장. |
| AC-13 (Bottom Sheet) | 부분 | 모바일에서 패널은 정상 노출되지만 dev-notes §6의 명시대로 **드래그·슬라이드 bottom sheet UX는 미구현(정적 스택)**. 기획서 S-004의 60vh 슬라이드업과 다름. |
| AC-14 (priority + category 시각화) | 묵시적 | 스크린샷 12·14·15에서 priority=high 빨간 dot + category=work primary stripe 가시. 별도 시나리오 분리 없이 통합 검증. |

## 알려진 콘솔 워닝 (앱 코드와 무관)

```
React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. (×N)
React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. (×N)
```
공용 `App.jsx` (관리자만 수정 가능 영역)의 BrowserRouter 설정에서 비롯. 본 프로젝트 폴더와 무관. 향후 공용 셋업에서 `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` 플래그로 해소 가능.
