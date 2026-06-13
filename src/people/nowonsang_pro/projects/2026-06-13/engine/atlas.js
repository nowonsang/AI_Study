// 순수 텍스처 아틀라스 + 면 방향 셰이딩 모듈 (AC6).
// 외부 UI 프레임워크/DOM 의존 없음 — 순수 데이터 + 함수 (purity 정적스캔 대상).
//
// 블록 id 의미: 1=돌 2=잔디 3=흙 4=나무 5=잎 6=물 7=모래.
// 면(face)별로 다른 타일을 가질 수 있다(예: 잔디 윗면 초록 / 옆면 흙섞임 / 아랫면 흙).
//
// 타일 정의(Tile): { color:[r,g,b], index:number }
//   - color : 0~255 RGB (아틀라스 미사용 시 단색 폴백)
//   - index : 아틀라스 타일 인덱스(가로 16타일 그리드 가정, u = index%16, v = floor(index/16))

/** 6면 식별자. 키 = 면 id, 값 = top/bottom/side 분류. */
export const FACES = Object.freeze({
  '+x': 'side',
  '-x': 'side',
  '+y': 'top',
  '-y': 'bottom',
  '+z': 'side',
  '-z': 'side',
});

/** 면 분류 3종. */
export const FACE_CLASS = Object.freeze({ TOP: 'top', SIDE: 'side', BOTTOM: 'bottom' });

/**
 * 면 식별자('+y' 등) 또는 분류('top' 등)를 받아 분류(top/side/bottom)로 정규화.
 * @param {string} face
 * @returns {'top'|'side'|'bottom'}
 */
export function faceClass(face) {
  if (face === 'top' || face === 'side' || face === 'bottom') return face;
  const c = FACES[face];
  return c || 'side';
}

/**
 * 면 방향 셰이딩 계수 (0~1).
 * 윗면(top, +y) 가장 밝고 → 옆면(side, ±x/±z) → 아랫면(bottom, -y) 가장 어둡다.
 * @param {string} face '+y'|'-y'|'+x'|'-x'|'+z'|'-z'|'top'|'side'|'bottom'
 * @returns {number}
 */
export function faceShade(face) {
  const c = faceClass(face);
  if (c === 'top') return 1.0;
  if (c === 'bottom') return 0.45;
  return 0.72; // side
}

/** 타일 정의 헬퍼. */
function tile(color, index) {
  return { color, index };
}

/**
 * 블록 id -> 면별 타일 정의 매핑.
 * 각 블록은 { top, side, bottom } 타일을 가진다(면별로 다른 타일 허용).
 * 단색 블록은 세 면이 같은 타일을 공유한다.
 */
export const ATLAS = Object.freeze({
  // 1 돌 — 전면 동일한 회색.
  1: Object.freeze({
    name: 'stone',
    top: tile([150, 150, 158], 1),
    side: tile([150, 150, 158], 1),
    bottom: tile([150, 150, 158], 1),
  }),
  // 2 잔디 — 윗면 초록 / 옆면 흙섞인 초록 / 아랫면 흙.
  2: Object.freeze({
    name: 'grass',
    top: tile([110, 180, 85], 2),
    side: tile([130, 150, 90], 18),
    bottom: tile([165, 120, 72], 3),
  }),
  // 3 흙 — 전면 갈색.
  3: Object.freeze({
    name: 'dirt',
    top: tile([165, 120, 72], 3),
    side: tile([165, 120, 72], 3),
    bottom: tile([165, 120, 72], 3),
  }),
  // 4 나무(통나무) — 윗·아랫면 나이테, 옆면 껍질.
  4: Object.freeze({
    name: 'wood',
    top: tile([170, 140, 90], 4),
    side: tile([120, 90, 55], 20),
    bottom: tile([170, 140, 90], 4),
  }),
  // 5 잎 — 전면 짙은 초록.
  5: Object.freeze({
    name: 'leaves',
    top: tile([70, 130, 60], 5),
    side: tile([70, 130, 60], 5),
    bottom: tile([70, 130, 60], 5),
  }),
  // 6 물 — 전면 파랑.
  6: Object.freeze({
    name: 'water',
    top: tile([90, 140, 200], 6),
    side: tile([90, 140, 200], 6),
    bottom: tile([90, 140, 200], 6),
  }),
  // 7 모래 — 전면 모래색.
  7: Object.freeze({
    name: 'sand',
    top: tile([220, 205, 150], 7),
    side: tile([220, 205, 150], 7),
    bottom: tile([220, 205, 150], 7),
  }),
});

/**
 * 블록 id + 면의 타일 정의 조회. 없으면 돌(1)의 동일 면으로 폴백.
 * @param {number} blockId
 * @param {string} face
 * @returns {{color:number[], index:number}}
 */
export function tileFor(blockId, face) {
  const c = faceClass(face);
  const block = ATLAS[blockId] || ATLAS[1];
  return block[c];
}

/**
 * 면 방향 셰이딩을 곱한 최종 면 색(RGB, 0~255).
 * top 면이 bottom 면보다 항상 밝다(같은 base color일 때 shade 차이).
 * @param {number} blockId
 * @param {string} face
 * @returns {number[]} [r,g,b]
 */
export function sampleBlockColor(blockId, face) {
  const { color } = tileFor(blockId, face);
  const k = faceShade(face);
  return [color[0] * k, color[1] * k, color[2] * k];
}
