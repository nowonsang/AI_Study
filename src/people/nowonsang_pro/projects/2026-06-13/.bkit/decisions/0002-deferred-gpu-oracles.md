# ADR 0002 — GPU/headless 오라클 연기 (2026-06-13)

## 상태
Accepted (deferred, not rejected)

## 맥락
고퀄리티판은 GPU WebGL2 셰이더 레이마칭 + CPU 패리티(AC1 일부) + 헤드리스 골든 이미지 회귀(AC11)
+ 960×540 바닥 해상도 60fps(AC5')를 요구. 이들은 헤드리스 WebGL2 런타임에 종속.

실측 위험:
- `gl`(headless-gl)은 네이티브 모듈. **Node 23.7 + macOS prebuild 부재 → 소스 빌드 실패 위험 큼.**
- 대안 Playwright(이미 설치됨) 오프스크린 캔버스는 가능하나, GPU 셰이더·골든 PNG 파이프라인 전체를
  세우는 비용/시간이 크고 본 웨이브(순수엔진 확장)의 범위를 벗어남.

## 결정
다음 4개를 **다음 웨이브로 연기**(기각 아님). 현 웨이브는 CPU/순수 경로로 동등 가치를 먼저 확보.

| 연기 항목 | 사유 | 재개 조건 |
|---|---|---|
| AC1 셰이더 패리티 (GPU↔raycast.js ε일치) | 헤드리스 WebGL2 필요 | render 하네스 확정 후 |
| AC6 GPU 셰이딩 경로 | 〃 (AC6 데이터/면셰이딩은 atlas.js로 본 웨이브 충족) | 〃 |
| AC11 골든 이미지 회귀 | headless-gl/Playwright 골든 파이프라인 필요 | 하네스 확정 후 |
| AC5' 960×540@60fps | GPU 렌더러 필요 (현재 CPU bench는 AC5 green) | GPU 렌더러 도입 후 |

## 재개 시 권장 하네스
headless-gl 대신 **Playwright 오프스크린 캔버스**(이미 설치)로 골든/fps 측정 — Node23 네이티브 빌드 회피.
