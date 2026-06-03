# AI Study · 7명 합동 캘린더 실습

Claude Code 를 활용해 **7명이 동시에** 각자의 캘린더 작품을 만드는 React 실습 프로젝트.
한 개의 Hub 페이지에서 모든 작품으로 진입할 수 있습니다.

---

## 👥 팀

폴더·URL은 영문 슬러그(`이름_pro`), UI 표시 이름은 한글 유지.

| 이름 | 역할 | 슬러그 (폴더/URL) | 권한 |
|------|------|------|------|
| 노원상 | **관리자** | `nowonsang_pro` | 본인 폴더 + 공용 파일 |
| 김부영 | 개발자 | `kimbuyoung_pro` | 본인 폴더만 |
| 이민진 | 개발자 | `leeminjin_pro` | 본인 폴더만 |
| 황준현 | 개발자 | `hwangjunhyun_pro` | 본인 폴더만 |
| 김진주 | 개발자 | `kimjinju_pro` | 본인 폴더만 |
| 이유경 | 개발자 | `leeyukyung_pro` | 본인 폴더만 |
| 김한빛 | 개발자 | `kimhanbit_pro` | 본인 폴더만 |

각 멤버는 **자기 슬러그 폴더 안의 `Calendar.jsx`만** 수정하면 충돌 없이 동시 개발이 가능합니다.
(한글 파일명은 OS·빌드·URL 인코딩 이슈가 잦아 영문으로 통일했습니다.)

---

## 🚀 빠른 시작 — OS별 원클릭 설치

> 아무것도 설치되어 있지 않다고 가정합니다. 본인 OS에 맞는 한 줄만 실행하면 끝.

### 🍎 macOS

터미널을 열고 프로젝트 폴더에서:

```bash
bash scripts/setup.sh
```

자동 처리되는 항목:
1. Xcode Command Line Tools 확인
2. **Homebrew** 설치 (없을 때)
3. **Node.js LTS** 설치 (`brew install node`)
4. **npm install** — React, Vite, React Router 의존성

### 🪟 Windows 10 / 11

**방법 A (가장 쉬움)** — 탐색기에서 `scripts\setup.bat` **더블클릭**

**방법 B** — PowerShell 창을 열고:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

자동 처리되는 항목:
1. **winget**(앱 설치 관리자) 확인 — Windows 10 1809+ / 11에 기본 탑재
2. **Node.js LTS** 설치 (`winget install OpenJS.NodeJS.LTS`)
3. **npm install** — React, Vite, React Router 의존성

> 💡 winget 이 없다면 Microsoft Store 에서 **"App Installer"** 를 먼저 설치하거나,
> https://nodejs.org 에서 Node.js LTS 를 직접 받은 뒤 `npm install` 만 실행하세요.

### 🐧 Linux (수동)

1. 패키지 매니저로 Node.js 18+ 설치 (예: `sudo apt install nodejs npm`)
2. `npm install && npm run dev`

---

### ▶️ 설치 끝났으면

OS 무관 동일:

```bash
npm run dev
```

브라우저에서 자동으로 `http://localhost:5173` 이 열리고, 7명의 카드가 보이는 Hub 화면이 나타납니다.

---

## 📁 프로젝트 구조

```
AI_Study/
├── index.html               # 진입 HTML
├── package.json             # 의존성
├── vite.config.js           # Vite 설정
├── scripts/
│   └── setup.sh             # 원클릭 환경 설정
├── src/
│   ├── main.jsx             # React 진입점
│   ├── App.jsx              # 라우트 정의
│   ├── Hub.jsx              # ⭐ 메인 인덱스 (7명 진입)
│   ├── index.css            # 동화 디자인 시스템 적용
│   ├── shared/
│   │   ├── Layout.jsx       # GNB + Footer 공통 레이아웃
│   │   └── members.js       # 7명 멤버 정의 (이 파일 절대 수정 금지)
│   └── people/                  # ⭐ 각자의 작업 공간 (영문 슬러그)
│       ├── nowonsang_pro/Calendar.jsx     # 노원상
│       ├── kimbuyoung_pro/Calendar.jsx    # 김부영
│       ├── leeminjin_pro/Calendar.jsx     # 이민진
│       ├── hwangjunhyun_pro/Calendar.jsx  # 황준현
│       ├── kimjinju_pro/Calendar.jsx      # 김진주
│       ├── leeyukyung_pro/Calendar.jsx    # 이유경
│       └── kimhanbit_pro/Calendar.jsx     # 김한빛
├── .claude/
│   ├── settings.local.template.json   # Claude Code 권한 템플릿
│   └── skills/
│       └── dongwha-design/SKILL.md    # 동화 디자인 시스템 스킬
├── dw_design_rule.md
├── .gitignore
└── README.md
```

---

## 🤖 Claude Code 자동 라우팅 (`CLAUDE.md`)

`CLAUDE.md` 는 매 세션 자동 로드되는 **최우선 규칙**입니다.
사용자가 본인을 소개하면 (예: "나는 노원상팀 20년차 IT 기획자야") Claude 는:

1. 한글 이름 → 슬러그 자동 매핑 (`노원상` → `nowonsang_pro`)
2. 응답 첫 줄에 `✅ 작업자: 노원상 (nowonsang_pro, 관리자)` 명시
3. **본인 폴더만** 수정, 다른 사람 폴더·공용 파일은 읽기 전용
4. 위반 요청 시 거절 + 사유 안내
5. **관리자(노원상)** 만 명시적 요청 시 공용 파일 수정 가능

서브에이전트(Task 도구) 호출에도 같은 규칙이 상속됩니다.

## 🧑‍💻 작업 규칙 (7명 동시 개발)

### 절대 규칙
1. **자기 이름 폴더만 수정**합니다. 다른 사람 폴더는 보기만!
2. `src/Hub.jsx`, `src/App.jsx`, `src/shared/*`, `src/index.css` 는 **공용 파일** — 관리자(노원상)만 수정 가능.
3. `package.json` 에 라이브러리 추가가 필요하면 팀에 공유 후 일괄 적용.

### localStorage 키 규칙
슬러그를 키에 포함시키면 다른 멤버 데이터와 섞이지 않습니다.

```js
const KEY = `ai-study.events.nowonsang_pro`
localStorage.setItem(KEY, JSON.stringify(events))
```

### URL
- Hub: `http://localhost:5173/`
- 본인 페이지: `http://localhost:5173/people/nowonsang_pro`

---

## 🎨 디자인 스킬

`.claude/skills/dongwha-design/SKILL.md` — 동화 디자인 시스템 v1 가이드.
UI/CSS 작업 시 Claude Code가 자동으로 호출해 GNB/Grid/타이포/컬러/컴포넌트 규정을 강제합니다.
원본: `dw_design_rule.md`.

기본 토큰은 이미 `src/index.css`에 반영되어 있습니다 (`--color-primary: #00694D`, Pretendard 폰트, 반응형 GNB 등).

---

## 🛡 Claude Code 권한 정책

실습 흐름이 끊기지 않도록 광범위 allow + `rm` 계열 deny 로 설정했습니다.

**최초 1회 적용** (안전장치로 사용자가 직접 복사해야 합니다):

```bash
cp .claude/settings.local.template.json .claude/settings.local.json
```

- 허용: `git`, `npm/pnpm/yarn/bun`, `node/npx`, `mkdir/mv/cp`, 검색 도구, Read/Write/Edit/WebFetch/WebSearch 등
- 금지: `rm`, `sudo rm`, `find -delete` (실수 삭제 방지)

`settings.local.json` 자체는 `.gitignore` 로 커밋 제외됩니다.

---

## 📚 학습 포인트

이 실습으로 익히게 되는 것:
- React + Vite 기본 구조
- React Router 로 멀티 페이지 구성
- localStorage 로 백엔드 없이 데이터 영속화
- 디자인 시스템 토큰 사용 (CSS 변수)
- Claude Code 와 협업하며 컴포넌트 만들기
- 여러 명이 한 레포에서 충돌 없이 작업하는 폴더 전략
