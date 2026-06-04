/**
 * Phase 3 QA — Playwright E2E for Todo Calendar (nowonsang_pro / 2026-06-04)
 *
 * Run standalone (no playwright.config.js needed):
 *   node src/people/nowonsang_pro/projects/2026-06-04/tests/e2e.spec.mjs
 *
 * Produces ~22 PNG screenshots in this folder + qa-run.json log.
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:5173'
const PROJECT_URL = `${BASE}/people/nowonsang_pro/2026-06-04`
const STORAGE_KEY = 'ai-study.todo.nowonsang_pro.2026-06-04'

const consoleLog = []
const pageErrors = []
const results = []

function rec(num, file, scenario, ac, result, note = '') {
  results.push({ num, file, scenario, ac, result, note })
  const stamp = `[${num}] ${result} ${file}  — ${scenario}`
  console.log(stamp)
}

async function shot(page, num, label) {
  const file = `${String(num).padStart(2, '0')}-${label}.png`
  await page.screenshot({ path: path.join(HERE, file), fullPage: true })
  return file
}

// Auto-accept all native confirm/alert dialogs unless a one-off override is set
function attachAutoAccept(page) {
  page.on('dialog', async (d) => {
    try { await d.accept() } catch { /* noop */ }
  })
}

async function clearStorage(page) {
  await page.evaluate((k) => {
    try { localStorage.removeItem(k) } catch {}
  }, STORAGE_KEY)
}

async function gotoProject(page) {
  await page.goto(PROJECT_URL, { waitUntil: 'networkidle' })
  // App.jsx returns nothing until hydrated. Wait for MonthHeader.
  await page.waitForSelector('.tc-month-title', { timeout: 8000 })
}

async function setMonth(page, year, month) {
  // Patch redux via window keyboard nav: just dispatch directly through localStorage
  // is not possible. Use the ‹ / › buttons instead.
  const target = year * 12 + month
  const getCur = async () => {
    const txt = await page.locator('.tc-month-title').innerText()
    // "2026년 6월" → 2026, 6
    const m = txt.match(/(\d{4})년\s*(\d{1,2})월/)
    return [parseInt(m[1]), parseInt(m[2])]
  }
  let [y, m] = await getCur()
  let cur = y * 12 + m
  let safety = 240
  while (cur !== target && safety-- > 0) {
    if (cur < target) await page.getByRole('button', { name: '다음 달' }).click()
    else await page.getByRole('button', { name: '이전 달' }).click()
    ;[y, m] = await getCur()
    cur = y * 12 + m
  }
}

async function clickDay(page, dateKey) {
  // dateKey 'YYYY-MM-DD' → click the day-number SPAN inside the cell to avoid
  // accidentally clicking a TodoBadge inside the same gridcell. (The badge has
  // stopPropagation but Playwright's .click() targets the geometric center.)
  const [, , d] = dateKey.split('-').map(Number)
  const cell = page.locator(
    `[role="gridcell"][data-current-month="true"]:has(.tc-day-number:text-is("${d}"))`,
  ).first()
  // Use position click on the cell at upper-left where day number lives.
  // Avoids intercepts from the hover-only "+" button or todo badges.
  const box = await cell.boundingBox()
  if (!box) throw new Error(`day cell ${dateKey} not visible`)
  await page.mouse.click(box.x + 14, box.y + 14)
}

function dayCellLocator(page, dateKey) {
  const [, , d] = dateKey.split('-').map(Number)
  return page.locator(
    `[role="gridcell"][data-current-month="true"]:has(.tc-day-number:text-is("${d}"))`,
  ).first()
}

async function fillModalAndSave(page, { title, startTime, endTime, priority, category }) {
  if (title !== undefined) await page.locator('#tc-title').fill(title)
  if (startTime) await page.locator('input[aria-label="시작 시간"]').fill(startTime)
  if (endTime) await page.locator('input[aria-label="종료 시간"]').fill(endTime)
  if (priority) await page.locator(`input[name="tc-priority"][value="${priority}"]`).check()
  if (category) await page.locator('.tc-chip', { hasText: category }).click()
  await page.locator('dialog[open] .tc-btn-primary').click()
  // Wait dialog to close (the <dialog> stays in DOM, only `open` attribute toggles)
  await page.waitForFunction(() => !document.querySelector('dialog.tc-dialog')?.open, null, { timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(150)
}

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  attachAutoAccept(page)
  page.on('console', (msg) => consoleLog.push({ type: msg.type(), text: msg.text() }))
  page.on('pageerror', (err) => pageErrors.push(String(err)))

  // ---- 01 Hub initial ---------------------------------------------------
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  // Clear storage on first hit (before going into the app)
  await page.evaluate((k) => { try { localStorage.removeItem(k) } catch {} }, STORAGE_KEY)
  await page.waitForTimeout(150)
  await shot(page, 1, 'home-initial')
  rec(1, '01-home-initial.png', 'Hub 첫 화면 로드', 'env', '✅')

  // ---- 02 Member card / page --------------------------------------------
  await page.locator('a[href="/people/nowonsang_pro"]').first().click()
  await page.waitForLoadState('networkidle')
  await shot(page, 2, 'member-card-nowonsang')
  rec(2, '02-member-card-nowonsang.png', '노원상 멤버 페이지 진입 (작업 목록)', 'env', '✅')

  // ---- 03 Todo project card ---------------------------------------------
  // Already on the ProjectsHub list — capture the card visibility before entering
  const todoCard = page.locator('a', { hasText: 'Todo 일정관리' }).first()
  await todoCard.scrollIntoViewIfNeeded()
  await shot(page, 3, 'project-card-todo')
  rec(3, '03-project-card-todo.png', 'Todo 일정관리 카드 노출 확인', 'env', '✅')

  // Enter the project
  await todoCard.click()
  await page.waitForSelector('.tc-month-title', { timeout: 8000 })
  // Make sure storage is clean
  await clearStorage(page)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.tc-month-title')

  // ---- 04 Empty calendar (AC-01) ----------------------------------------
  // Force navigation to 2026-06 so screenshots are deterministic.
  await setMonth(page, 2026, 6)
  await shot(page, 4, 'calendar-empty-state')
  // Verify welcome banner present and panel empty state visible
  const hasWelcome = await page.locator('.tc-banner', { hasText: '환영합니다' }).count()
  const hasEmpty = await page.locator('.tc-panel').getByText(/등록된 일정이 없습니다/).count()
  rec(4, '04-calendar-empty-state.png',
    '초기 진입(2026-06) — 환영 배너 + 패널 EmptyState',
    'AC-01',
    hasWelcome > 0 && hasEmpty > 0 ? '✅' : '⚠️',
    `welcomeBanner=${hasWelcome}, emptyState=${hasEmpty}`,
  )

  // ---- 05 Prev month -----------------------------------------------------
  await page.getByRole('button', { name: '이전 달' }).click()
  await page.waitForTimeout(120)
  await shot(page, 5, 'month-prev')
  const monthAfterPrev = await page.locator('.tc-month-title').innerText()
  rec(5, '05-month-prev.png', '이전 달(‹) — 2026-05 이동', 'AC-09',
    /2026년\s*5월/.test(monthAfterPrev) ? '✅' : '❌',
    `header="${monthAfterPrev}"`)

  // ---- 06 Next month (back to 6, then to 7) ------------------------------
  await page.getByRole('button', { name: '다음 달' }).click()
  await page.getByRole('button', { name: '다음 달' }).click()
  await page.waitForTimeout(120)
  await shot(page, 6, 'month-next')
  const monthAfterNext = await page.locator('.tc-month-title').innerText()
  rec(6, '06-month-next.png', '다음 달(›) — 2026-07 이동', 'AC-09',
    /2026년\s*7월/.test(monthAfterNext) ? '✅' : '❌',
    `header="${monthAfterNext}"`)
  // Back to 2026-06 for deterministic tests
  await setMonth(page, 2026, 6)

  // ---- 07 Day selected ---------------------------------------------------
  await clickDay(page, '2026-06-15')
  await page.waitForTimeout(120)
  await shot(page, 7, 'day-selected')
  const panelHeader = await page.locator('.tc-panel-header h2').innerText()
  const cellSelected = await dayCellLocator(page, '2026-06-15').getAttribute('data-selected')
  rec(7, '07-day-selected.png', '6월 15일 셀 클릭 → 패널 갱신 + 셀 강조', 'AC-02',
    cellSelected === 'true' && /6월\s*15일/.test(panelHeader) ? '✅' : '⚠️',
    `panel="${panelHeader}", cellSelected=${cellSelected}`)

  // ---- 08 Open empty modal ------------------------------------------------
  await page.locator('.tc-panel .tc-btn-primary', { hasText: '새 일정 추가' }).first().click()
  await page.waitForSelector('dialog[open]', { timeout: 3000 })
  await page.waitForTimeout(200)
  await shot(page, 8, 'todo-form-open-empty')
  const dialogTitleNew = await page.locator('#tc-dialog-title').innerText()
  rec(8, '08-todo-form-open-empty.png', '+ 새 일정 추가 → 모달 오픈 (비어 있음)', 'AC-03',
    dialogTitleNew === '새 일정 추가' ? '✅' : '⚠️',
    `dialogTitle="${dialogTitleNew}"`)

  // ---- 09 Validation — empty title submit -------------------------------
  // Try to submit with empty title. Button is disabled by design; click anyway
  // to capture the disabled state; then blur to show error helper.
  const saveBtn = page.locator('dialog[open] .tc-btn-primary')
  const saveDisabled = await saveBtn.isDisabled()
  // Make the field touched to surface the helper
  await page.locator('#tc-title').focus()
  await page.locator('#tc-title').blur()
  await page.waitForTimeout(100)
  await shot(page, 9, 'todo-form-validation')
  const helperVisible = await page.locator('.tc-field-error', { hasText: '제목을 입력해' }).count()
  rec(9, '09-todo-form-validation.png',
    '제목 공란 상태 — 저장 disabled + 헬퍼 노출',
    'AC-04',
    saveDisabled && helperVisible > 0 ? '✅' : '⚠️',
    `saveDisabled=${saveDisabled}, helper=${helperVisible}`)

  // ---- 10 Filled form ---------------------------------------------------
  await page.locator('#tc-title').fill('기획 회의')
  await page.locator('input[name="tc-priority"][value="high"]').check()
  await page.locator('input[aria-label="시작 시간"]').fill('09:00')
  await page.locator('input[aria-label="종료 시간"]').fill('10:00')
  await page.locator('.tc-chip', { hasText: '업무' }).click()
  await page.waitForTimeout(100)
  await shot(page, 10, 'todo-form-filled')
  const saveEnabledAfter = !(await saveBtn.isDisabled())
  rec(10, '10-todo-form-filled.png',
    '제목·우선순위·시간·카테고리 입력 → 저장 활성',
    'AC-03',
    saveEnabledAfter ? '✅' : '❌',
    `saveEnabled=${saveEnabledAfter}`)

  // ---- 11 Saved → panel ------------------------------------------------
  await saveBtn.click()
  await page.waitForFunction(() => !document.querySelector('dialog.tc-dialog')?.open, null, { timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(200)
  await shot(page, 11, 'todo-saved-panel')
  const itemInPanel = await page.locator('.tc-panel .tc-item-title', { hasText: '기획 회의' }).count()
  rec(11, '11-todo-saved-panel.png',
    '저장 후 패널 리스트에 "기획 회의" 표시',
    'AC-03',
    itemInPanel > 0 ? '✅' : '❌',
    `panel item count=${itemInPanel}`)

  // ---- 12 Badge on calendar cell --------------------------------------
  // selectedDate may have moved to dueDate (2026-06-15)
  await shot(page, 12, 'todo-saved-badge')
  const badgeCount = await dayCellLocator(page, '2026-06-15').locator('.tc-badge').count()
  rec(12, '12-todo-saved-badge.png',
    '캘린더 6/15 셀에 뱃지 1개 표시',
    'AC-03',
    badgeCount >= 1 ? '✅' : '❌',
    `badgeCount=${badgeCount}`)

  // ---- 13 Toggle complete -----------------------------------------------
  const checkbox = page.locator('.tc-panel .tc-item .tc-checkbox').first()
  await checkbox.check()
  await page.waitForTimeout(150)
  await shot(page, 13, 'todo-toggle-complete')
  const completedAttr = await page.locator('.tc-panel .tc-item').first().getAttribute('data-completed')
  rec(13, '13-todo-toggle-complete.png',
    '체크박스 토글 → data-completed=true',
    'AC-06',
    completedAttr === 'true' ? '✅' : '❌',
    `data-completed=${completedAttr}`)
  // un-toggle for downstream
  await checkbox.uncheck()
  await page.waitForTimeout(80)

  // ---- 14 Edit modal opens with prefilled values ------------------------
  // Click the badge on the day cell (not the panel item, to validate badge → edit)
  await dayCellLocator(page, '2026-06-15').locator('.tc-badge').first().click()
  await page.waitForSelector('dialog[open]', { timeout: 3000 })
  await page.waitForTimeout(200)
  await shot(page, 14, 'todo-edit-modal')
  const editTitle = await page.locator('#tc-title').inputValue()
  const editHeader = await page.locator('#tc-dialog-title').innerText()
  rec(14, '14-todo-edit-modal.png',
    '뱃지 클릭 → 수정 모달 + 기존 값 prefill',
    'AC-07',
    editHeader === '일정 수정' && editTitle === '기획 회의' ? '✅' : '⚠️',
    `header="${editHeader}", title="${editTitle}"`)

  // ---- 15 Edit save -----------------------------------------------------
  await page.locator('#tc-title').fill('기획 검토')
  await page.locator('dialog[open] .tc-btn-primary').click()
  await page.waitForFunction(() => !document.querySelector('dialog.tc-dialog')?.open, null, { timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(200)
  await shot(page, 15, 'todo-edit-saved')
  const renamed = await page.locator('.tc-panel .tc-item-title', { hasText: '기획 검토' }).count()
  rec(15, '15-todo-edit-saved.png',
    '수정 저장 → 제목 "기획 검토"로 반영',
    'AC-07',
    renamed > 0 ? '✅' : '❌',
    `renamed=${renamed}`)

  // ---- 16 Delete confirm (capture during confirm) ----------------------
  // We need to capture BEFORE accepting. Detach auto-accept first.
  page.removeAllListeners('dialog')
  let confirmText = ''
  let toastCaught = ''
  const dialogPromise = new Promise((resolve) => {
    page.once('dialog', async (d) => {
      confirmText = d.message()
      await page.waitForTimeout(150) // small visual delay
      await d.accept()
      resolve()
    })
  })
  // Open edit modal first
  await page.locator('.tc-panel .tc-item-main').first().click()
  await page.waitForSelector('dialog[open]', { timeout: 3000 })
  // Click delete inside the modal → triggers window.confirm
  await page.locator('dialog[open] .tc-btn-danger').click()
  await dialogPromise
  // Capture the screenshot of state right after confirm acceptance:
  // toast should be visible
  await page.waitForTimeout(200)
  await shot(page, 16, 'todo-delete-confirm')
  // Try to read toast
  toastCaught = await page.locator('.tc-toast').first().innerText().catch(() => '')
  rec(16, '16-todo-delete-confirm.png',
    'window.confirm 메시지 검증 + 토스트(실행취소) 노출',
    'AC-08',
    /삭제하시겠습니까/.test(confirmText) ? '✅' : '⚠️',
    `confirm="${confirmText}", toast="${toastCaught.replace(/\n/g, ' ')}"`)
  // Re-attach auto-accept for downstream
  attachAutoAccept(page)

  // ---- 17 Delete completed (toast dismissed) ---------------------------
  // Force toast to disappear by waiting >4s OR dismissing via × button
  await page.waitForTimeout(4500)
  await shot(page, 17, 'todo-delete-completed')
  const itemsAfterDelete = await page.locator('.tc-panel .tc-item').count()
  const emptyAfter = await page.locator('.tc-panel').getByText(/등록된 일정이 없습니다/).count()
  rec(17, '17-todo-delete-completed.png',
    '삭제 완료 + 빈 상태 복귀',
    'AC-08',
    itemsAfterDelete === 0 && emptyAfter > 0 ? '✅' : '⚠️',
    `items=${itemsAfterDelete}, emptyVisible=${emptyAfter}`)

  // Re-create a todo for the persistence test
  await page.locator('.tc-panel .tc-btn-primary', { hasText: '새 일정 추가' }).first().click()
  await page.waitForSelector('dialog[open]')
  await fillModalAndSave(page, { title: '운동 1시간', priority: 'medium', category: '건강', startTime: '14:00', endTime: '15:00' })

  // ---- 18 Persistence after reload (AC-10) -----------------------------
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.tc-month-title', { timeout: 8000 })
  await setMonth(page, 2026, 6)
  await clickDay(page, '2026-06-15')
  await page.waitForTimeout(150)
  await shot(page, 18, 'localstorage-persisted')
  const persisted = await page.locator('.tc-panel .tc-item-title', { hasText: '운동 1시간' }).count()
  const storageRaw = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)
  rec(18, '18-localstorage-persisted.png',
    '새로고침 후 데이터 유지 (localStorage)',
    'AC-10',
    persisted > 0 && storageRaw && storageRaw.includes('운동 1시간') ? '✅' : '❌',
    `panel=${persisted}, storageHas=${!!(storageRaw && storageRaw.includes('운동 1시간'))}`)

  // ---- 19 Time validation (AC-05) --------------------------------------
  await page.locator('.tc-panel .tc-btn-primary', { hasText: '새 일정 추가' }).first().click()
  await page.waitForSelector('dialog[open]')
  await page.locator('#tc-title').fill('잘못된 시간')
  await page.locator('input[aria-label="시작 시간"]').fill('14:00')
  await page.locator('input[aria-label="종료 시간"]').fill('13:00')
  await page.locator('input[aria-label="종료 시간"]').blur()
  await page.waitForTimeout(120)
  await shot(page, 19, 'todo-form-time-validation')
  const timeErr = await page.locator('.tc-field-error', { hasText: '종료시간' }).count()
  const saveDisabled2 = await page.locator('dialog[open] .tc-btn-primary').isDisabled()
  rec(19, '19-todo-form-time-validation.png',
    '종료시간 < 시작시간 — 에러 + 저장 disabled',
    'AC-05',
    timeErr > 0 && saveDisabled2 ? '✅' : '⚠️',
    `timeErr=${timeErr}, saveDisabled=${saveDisabled2}`)
  // Close modal (dirty → confirm auto-accept)
  await page.locator('dialog[open] .tc-btn-secondary').click()
  await page.waitForFunction(() => !document.querySelector('dialog.tc-dialog')?.open, null, { timeout: 3000 }).catch(() => {})

  // ---- 20 Badge overflow (+N more, AC-11) ------------------------------
  // Programmatically inject 5 todos for 2026-06-20 via localStorage and reload.
  await page.evaluate(([key, payload]) => {
    localStorage.setItem(key, payload)
  }, [STORAGE_KEY, JSON.stringify({
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    items: [
      { id: 't1', title: '회의 A', dueDate: '2026-06-20', priority: 'high', completed: false, category: 'work', createdAt: '2026-06-20T01:00:00.000Z', updatedAt: '2026-06-20T01:00:00.000Z', startTime: '09:00', endTime: '09:30' },
      { id: 't2', title: '회의 B', dueDate: '2026-06-20', priority: 'medium', completed: false, category: 'work', createdAt: '2026-06-20T02:00:00.000Z', updatedAt: '2026-06-20T02:00:00.000Z', startTime: '10:00', endTime: '10:30' },
      { id: 't3', title: '점심 약속', dueDate: '2026-06-20', priority: 'low', completed: false, category: 'personal', createdAt: '2026-06-20T03:00:00.000Z', updatedAt: '2026-06-20T03:00:00.000Z', startTime: '12:00', endTime: '13:00' },
      { id: 't4', title: '운동', dueDate: '2026-06-20', priority: 'medium', completed: false, category: 'health', createdAt: '2026-06-20T04:00:00.000Z', updatedAt: '2026-06-20T04:00:00.000Z', startTime: '18:00', endTime: '19:00' },
      { id: 't5', title: '리포트 제출', dueDate: '2026-06-20', priority: 'high', completed: false, category: 'study', createdAt: '2026-06-20T05:00:00.000Z', updatedAt: '2026-06-20T05:00:00.000Z', startTime: '20:00', endTime: '21:00' },
    ],
  })])
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.tc-month-title')
  await setMonth(page, 2026, 6)
  await page.waitForTimeout(150)
  await shot(page, 20, 'calendar-badge-overflow')
  const cell20 = dayCellLocator(page, '2026-06-20')
  const visibleBadges = await cell20.locator('.tc-badge').count()
  const moreText = await cell20.locator('.tc-more').innerText().catch(() => '')
  rec(20, '20-calendar-badge-overflow.png',
    '한 셀에 todo 5건 → 뱃지 3개 + "+2 more"',
    'AC-11',
    visibleBadges === 3 && /\+2/.test(moreText) ? '✅' : '⚠️',
    `visibleBadges=${visibleBadges}, more="${moreText}"`)

  // ---- 21 Mobile bottom sheet / responsive (AC-13) ----------------------
  await context.close()
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const mPage = await mobileCtx.newPage()
  attachAutoAccept(mPage)
  mPage.on('console', (msg) => consoleLog.push({ type: msg.type(), text: '[mobile] ' + msg.text() }))
  mPage.on('pageerror', (err) => pageErrors.push('[mobile] ' + String(err)))
  await mPage.goto(PROJECT_URL, { waitUntil: 'networkidle' })
  await mPage.waitForSelector('.tc-month-title', { timeout: 8000 })
  await setMonth(mPage, 2026, 6)
  await clickDay(mPage, '2026-06-20')
  await mPage.waitForTimeout(200)
  await shot(mPage, 21, 'mobile-responsive-stack')
  // Verify the panel is stacked (single column layout): grid-template-columns should NOT include "2fr 1fr"
  const gridCols = await mPage.locator('.tc-layout').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  const panelVisible = await mPage.locator('.tc-panel').isVisible()
  rec(21, '21-mobile-responsive-stack.png',
    '375x812 모바일 — 캘린더 위, 패널 아래 (스택)',
    'AC-13',
    panelVisible && !gridCols.includes(' ') ? '✅' :
    panelVisible ? '⚠️' : '❌',
    `gridCols="${gridCols}", panelVisible=${panelVisible}`)

  // ---- 22 Keyboard focus visibility (AC-12) -----------------------------
  // Back to desktop for the focus shot
  await mobileCtx.close()
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page2 = await ctx2.newPage()
  attachAutoAccept(page2)
  page2.on('console', (msg) => consoleLog.push({ type: msg.type(), text: '[d2] ' + msg.text() }))
  page2.on('pageerror', (err) => pageErrors.push('[d2] ' + String(err)))
  await page2.goto(PROJECT_URL, { waitUntil: 'networkidle' })
  await page2.waitForSelector('.tc-month-title')
  // Tab a few times into the calendar area
  for (let i = 0; i < 5; i++) await page2.keyboard.press('Tab')
  await page2.waitForTimeout(150)
  await shot(page2, 22, 'keyboard-focus-outline')
  // Check that document.activeElement has a primary outline
  const outline = await page2.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    const s = getComputedStyle(el)
    return { tag: el.tagName, cls: el.className, outlineStyle: s.outlineStyle, outlineColor: s.outlineColor, outlineWidth: s.outlineWidth }
  })
  rec(22, '22-keyboard-focus-outline.png',
    'Tab 키 이동 — 포커스 outline 가시화',
    'AC-12',
    outline && outline.outlineStyle && outline.outlineStyle !== 'none' ? '✅' : '⚠️',
    `active=${JSON.stringify(outline)}`)

  await ctx2.close()
  await browser.close()

  // Write JSON log
  fs.writeFileSync(
    path.join(HERE, 'qa-run.json'),
    JSON.stringify({
      ranAt: new Date().toISOString(),
      baseUrl: PROJECT_URL,
      results,
      consoleLog,
      pageErrors,
    }, null, 2),
    'utf8',
  )

  console.log('\n=== SUMMARY ===')
  for (const r of results) {
    console.log(`${r.result} ${r.num.toString().padStart(2, '0')} [${r.ac}] ${r.scenario}`)
  }
  console.log('\nConsole messages:', consoleLog.length)
  console.log('Page errors:', pageErrors.length)
})().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
