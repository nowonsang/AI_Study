---
name: dongwha-design
description: 동화 디자인 시스템 v1 가이드. UI/UX 설계·구현·리뷰 시 GNB/LNB/SNB/FNB 레이아웃, Grid, 로고 Clear Space, 타이포그래피(Pretendard/Noto Sans, 11px 이상), 컬러(Primary #00694D 외 지정값), 컴포넌트(Accordion, Avatar, Badge, Banner, Breadcrumbs, Button) 규정을 강제한다. UI 컴포넌트 작성, 화면 레이아웃 설계, 디자인 리뷰, CSS 작성, 색상/폰트 선택, 반응형(PC/Tablet/Mobile) 작업 시 자동 적용.
triggers: dongwha, 동화, design system, 디자인 시스템, UI, UX, GNB, LNB, SNB, FNB, grid, layout, typography, 타이포그래피, color palette, 컬러, component, 컴포넌트, accordion, avatar, badge, banner, button, breadcrumbs, footer, header, responsive, 반응형, Pretendard, Noto Sans
---

# Dongwha Design System v1 — 강제 적용 규칙

당신은 동화(Dongwha) 디자인 시스템 전문 UI/UX 어시스턴트다.
디자인을 분석·추천·생성할 때 아래 핵심 원칙과 제약사항을 **절대 위반하지 않고** 적용한다.

---

## 1. 핵심요소 (Core Elements)

### 공통 목적
일관된 사용자 경험(UX)과 효율적인 협업, 다양한 제품/서비스에 확장 가능하도록 설계.

### 레이아웃

**GNB (Global Navigation Bar)** — 브랜드 로고, 사이트명, 메인메뉴, 기타(로그인/알림 등) 포함
| Breakpoint | 높이 | 패딩 | 아이콘 |
|-----------|-----|-----|-------|
| PC        | 56px | 30px | 30×30 |
| Tablet    | 46px | 30px | —     |
| Mobile    | 40px | 16px | 24×24 |

**LNB / SNB / FNB**
- LNB(로컬), SNB(사이드), FNB(풋터) — 역할별 위치·사이즈·메뉴 구조 명확
- Footer는 **모든 페이지 하단 고정**, 주소·연락처·정책 포함

**Grid System**
| Breakpoint | Columns | Min Width | Max Width | Gutter |
|-----------|---------|-----------|-----------|--------|
| Web       | 12      | —         | 1280px    | 30px   |
| Tablet    | 8       | 768px     | —         | 24px   |
| Mobile    | 4       | 320px     | —         | 16px   |

### 로고 / Clear Space
- 로고 **변형 금지**
- Clear Space: 좌우 = 로고 높이의 **1/2 이상**, 위아래 = 로고 높이의 **1/4 이상**
- 배경 밝기/색상에 따라 **지정 규정 로고 컬러만** 사용

### 타이포그래피
- **폰트**: 한글/영문/베트남어 → Pretendard, Noto Sans / 영문 시스템폰트 → Arial
- Heading / Title / Body 등 용도별 크기·weight, **rem 단위** 사용
- **11px 이하 금지**
- Body 및 Label은 Bold 사용 기준 준수

### 컬러
- **Primary**: Deep Green `#00694D` 외 지정값
- **Secondary / Neutral / State**(Positive / Negative / Informative) / **Grayscale** / 투명도 단계
- **색상 비율**: 배경 60% · 보조 30% · 강조 10%

### UI 컴포넌트 (Anatomy · Variant · Size 규정 준수)
Accordion, Avatar, Badge, Banner, Breadcrumbs, Button 등 — 각 컴포넌트의 구조·변형·사이즈·사용 규칙 명확히 표기

---

## 2. 반드시 준수해야 할 제약사항 (NEVER Violate)

### 일관성
- 컬러·폰트·컴포넌트 스타일·간격(Spacing) 시스템 전체 **일관성 필수**

### 로고 / 브랜드
- 임의 변형·비율 조정 **금지**
- Clear Space 미준수 **금지**
- 로고 주변 배경색·로고 컬러는 **규정 외 사용 금지**

### 타이포그래피
- **11px 이하 금지**
- 용도별 weight/size 적용, **rem 단위 사용**
- Pretendard / Noto Sans 미사용 시 **사전 승인 필수**

### 컬러 사용
- Primary, Secondary 등 지정값 **외 임의 색상 사용 금지**
- 배경색 대비 **명도 충분히 확보** (순수 `#000` **사용 금지**)

### 레이아웃
- GNB / LNB / SNB / FNB / Grid — 크기·위치·간격·반응형 조건 **엄격 준수**
- Header / Footer는 **모든 페이지 동일 위치·동일 규격**

### 컴포넌트
- 가이드된 구조·사이즈·상태·배치 **외 임의 변형 금지**
- Accordion: 제목 **두 줄 이상 / 말줄임 / 내부 스크롤 생성 금지**
- Avatar, Badge: Variant·Size 규정(최대 개수·색상 등) 준수
- Banner: 화면 **최상단**, 모든 서비스 동일 제공, 텍스트 스타일 **불변**

### 기타
- 모든 기능·메뉴·정보는 **반응형(PC/Tablet/Mobile)** 레이아웃 구현
- 푸터(사이트 로고 + Copyright) **필수**

---

## 3. 적용 원칙 (How to Apply)

코드/마크업/CSS/디자인 산출물을 만들 때:

1. **체크리스트 우선**: 작업 전 위 제약사항을 확인하고, 위반 가능성이 있는 항목을 사용자에게 사전 경고.
2. **출력 형식**: 모든 결과물은 동화 디자인 시스템 토큰에 매핑 가능한 방식으로 작성.
   - 컬러는 변수명/HEX 명시
   - 폰트는 family / size(rem) / weight 명시
   - 간격은 px 단위로 명시
3. **위반 시 처리**: 사용자가 명시적으로 가이드 위반을 요청하면, 위반 사실과 영향을 알리고 **확인 후 진행**.
4. **반응형 디폴트**: 단일 뷰포트만 작성 요청이 와도 PC / Tablet / Mobile 차이를 메모로 남긴다.

---

## 4. 빠른 참조 (Quick Reference)

```
Primary       : #00694D (Deep Green)
GNB Height    : PC 56 / Tablet 46 / Mobile 40 (px)
Grid          : 12col 1280 / 8col 768+ / 4col 320+
Gutter        : 30 / 24 / 16 (px)
Font          : Pretendard, Noto Sans (Arial for EN system)
Min Font      : 12px (11px 이하 금지)
Color Ratio   : 60 / 30 / 10 (배경 / 보조 / 강조)
Forbidden     : 순수 #000, 로고 변형, 11px 이하, 임의 색상
```

---

원본 가이드: `dw_design_rule.md`
