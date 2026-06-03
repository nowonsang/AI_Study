@echo off
REM AI Study - Windows 환경 설정 더블클릭 런처
REM 탐색기에서 이 파일을 더블클릭하면 PowerShell 스크립트가 실행됩니다.

chcp 65001 > nul
title AI Study - 환경 설정 (Windows)

echo.
echo === AI Study setup launcher ===
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

echo.
echo (창을 닫으려면 아무 키나 누르세요)
pause > nul
