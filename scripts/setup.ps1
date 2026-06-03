# AI Study - 원클릭 환경 설정 스크립트 (Windows)
# 사용법 1: 탐색기에서 scripts\setup.bat 더블클릭 (권장)
# 사용법 2: PowerShell에서 직접 실행
#          powershell -ExecutionPolicy Bypass -File scripts\setup.ps1

$ErrorActionPreference = "Stop"

function Say  { param($m) Write-Host "▶ $m" -ForegroundColor Blue  }
function Ok   { param($m) Write-Host "✓ $m" -ForegroundColor Green }
function Warn { param($m) Write-Host "⚠ $m" -ForegroundColor Yellow }
function Err  { param($m) Write-Host "✗ $m" -ForegroundColor Red   }

Write-Host ""
Write-Host "=============================================="
Write-Host "  AI Study · Calendar 실습 환경 설정 (Windows)"
Write-Host "=============================================="
Write-Host ""

# 1. OS 체크
if ($env:OS -ne "Windows_NT") {
  Err "이 스크립트는 Windows 전용입니다."
  Write-Host "  macOS 사용자: bash scripts/setup.sh"
  exit 1
}
Ok "Windows 확인됨 ($([System.Environment]::OSVersion.VersionString))"

# 2. winget 확인 (Windows 10 1809+ / Windows 11 기본 탑재)
$winget = Get-Command winget -ErrorAction SilentlyContinue
if (-not $winget) {
  Warn "winget(앱 설치 관리자)이 없습니다."
  Write-Host ""
  Write-Host "  해결 방법:"
  Write-Host "  1. Microsoft Store → 'App Installer' 검색 후 설치"
  Write-Host "  2. 또는 https://nodejs.org 에서 Node.js LTS 직접 설치 후"
  Write-Host "     이 스크립트의 4번 단계(npm install)부터 수동 진행"
  Write-Host ""
  exit 1
}
Ok "winget 확인됨"

# 3. Node.js 확인 + 설치 (LTS)
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Say "Node.js LTS 설치 중... (winget)"
  Write-Host "    설치 중 UAC(관리자 권한) 프롬프트가 뜨면 [예] 클릭"

  winget install --id OpenJS.NodeJS.LTS `
    --silent `
    --accept-source-agreements `
    --accept-package-agreements

  # 현재 세션의 PATH 갱신
  $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath    = [System.Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path    = "$machinePath;$userPath"

  Ok "Node.js 설치 완료"

  # 재확인
  $node = Get-Command node -ErrorAction SilentlyContinue
  if (-not $node) {
    Warn "현재 PowerShell 세션에서 node 명령이 감지되지 않습니다."
    Write-Host "    이 창을 닫고 PowerShell을 새로 열어 다시 실행하세요."
    exit 0
  }
} else {
  $nodeVer   = & node -v
  $nodeMajor = [int](($nodeVer -replace '^v(\d+)\..*$', '$1'))
  if ($nodeMajor -lt 18) {
    Warn "Node.js 버전이 낮습니다 ($nodeVer). v18 이상 권장."
    Write-Host "    업그레이드: winget upgrade OpenJS.NodeJS.LTS"
  } else {
    Ok "Node.js 이미 설치됨 ($nodeVer)"
  }
}

# 4. npm 의존성 설치
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
  Err "npm 명령을 찾을 수 없습니다."
  Write-Host "    PowerShell을 새 창으로 열고 다시 실행하세요."
  exit 1
}

Say "프로젝트 의존성 설치 중... (npm install)"
# 프로젝트 루트로 이동 (scripts 폴더에서 실행되는 경우 대응)
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

& npm install
if ($LASTEXITCODE -ne 0) {
  Err "npm install 실패 (exit $LASTEXITCODE)"
  exit $LASTEXITCODE
}
Ok "의존성 설치 완료"

Write-Host ""
Write-Host "=============================================="
Write-Host "  🎉 설치 완료!"
Write-Host "=============================================="
Write-Host ""
Write-Host "▶ 개발 서버 시작:"
Write-Host "    npm run dev"
Write-Host ""
Write-Host "▶ 브라우저에서 자동으로 http://localhost:5173 이 열립니다."
Write-Host ""
Write-Host "▶ 본인 작업 폴더 (예: 노원상):"
Write-Host "    src\people\nowonsang_pro\Calendar.jsx"
Write-Host ""
