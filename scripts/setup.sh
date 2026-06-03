#!/usr/bin/env bash
# AI Study - 원클릭 환경 설정 스크립트 (macOS)
# 사용법: bash scripts/setup.sh
set -e

BLUE="\033[0;34m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m"

say()  { printf "${BLUE}▶${NC} %s\n" "$*"; }
ok()   { printf "${GREEN}✓${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}⚠${NC} %s\n" "$*"; }
err()  { printf "${RED}✗${NC} %s\n" "$*"; }

echo ""
echo "=============================================="
echo "  AI Study · Calendar 실습 환경 설정"
echo "=============================================="
echo ""

# 1. OS 체크
if [[ "$OSTYPE" != "darwin"* ]]; then
  err "이 스크립트는 macOS 전용입니다."
  echo ""
  echo "  • Windows 사용자  → scripts\\setup.bat 더블클릭"
  echo "  • Linux 사용자    → README 의 [수동 설치] 섹션 참고"
  echo ""
  exit 1
fi
ok "macOS 확인됨"

# 2. Xcode Command Line Tools (Homebrew 필수)
if ! xcode-select -p &>/dev/null; then
  say "Xcode Command Line Tools 설치 중... (팝업이 뜨면 [설치] 클릭)"
  xcode-select --install || true
  warn "설치 완료 후 다시 이 스크립트를 실행하세요."
  exit 0
fi
ok "Xcode Command Line Tools 확인됨"

# 3. Homebrew
if ! command -v brew &>/dev/null; then
  say "Homebrew 설치 중... (관리자 비밀번호 입력이 필요할 수 있습니다)"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Apple Silicon brew PATH 등록
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    BREW_SHELLENV='eval "$(/opt/homebrew/bin/brew shellenv)"'
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
    BREW_SHELLENV='eval "$(/usr/local/bin/brew shellenv)"'
  fi

  # zsh 프로파일에 영구 등록
  if [[ -n "$BREW_SHELLENV" ]] && ! grep -q "brew shellenv" "$HOME/.zprofile" 2>/dev/null; then
    echo "$BREW_SHELLENV" >> "$HOME/.zprofile"
    ok "Homebrew PATH를 ~/.zprofile에 등록"
  fi
else
  ok "Homebrew 이미 설치됨 ($(brew --version | head -1))"
fi

# 4. Node.js (LTS)
if ! command -v node &>/dev/null; then
  say "Node.js 설치 중... (brew install node)"
  brew install node
else
  NODE_VER=$(node -v)
  NODE_MAJOR=${NODE_VER#v}; NODE_MAJOR=${NODE_MAJOR%%.*}
  if (( NODE_MAJOR < 18 )); then
    warn "Node.js 버전이 낮습니다 ($NODE_VER). v18 이상 권장 → brew upgrade node"
  else
    ok "Node.js 이미 설치됨 ($NODE_VER)"
  fi
fi

# 5. npm 의존성
say "프로젝트 의존성 설치 중... (npm install)"
npm install
ok "의존성 설치 완료"

echo ""
echo "=============================================="
echo "  🎉 설치 완료!"
echo "=============================================="
echo ""
echo "▶ 개발 서버 시작:"
echo "    npm run dev"
echo ""
echo "▶ 브라우저에서 자동으로 http://localhost:5173 이 열립니다."
echo ""
echo "▶ 본인 작업 폴더 (예: 노원상):"
echo "    src/people/nowonsang_pro/Calendar.jsx"
echo ""
