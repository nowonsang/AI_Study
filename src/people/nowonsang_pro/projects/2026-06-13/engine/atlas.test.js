// AC6 테스처 아틀라스 + 면 방향 셰이딩 오라클 테스트 (node --test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ATLAS,
  FACES,
  faceClass,
  faceShade,
  tileFor,
  sampleBlockColor,
} from './atlas.js';

const avg = (rgb) => (rgb[0] + rgb[1] + rgb[2]) / 3;

test('1) 아틀라스 완전성: 7개 블록 id 모두 존재', () => {
  for (const id of [1, 2, 3, 4, 5, 6, 7]) {
    assert.ok(ATLAS[id], `ATLAS에 블록 ${id} 가 존재해야 함`);
    // 각 블록은 top/side/bottom 타일을 가진다.
    assert.ok(ATLAS[id].top, `블록 ${id} top 타일`);
    assert.ok(ATLAS[id].side, `블록 ${id} side 타일`);
    assert.ok(ATLAS[id].bottom, `블록 ${id} bottom 타일`);
    // 각 타일은 RGB color 를 가진다.
    assert.equal(ATLAS[id].top.color.length, 3);
  }
});

test('FACES: 6면 식별자가 모두 정의됨', () => {
  for (const f of ['+x', '-x', '+y', '-y', '+z', '-z']) {
    assert.ok(FACES[f], `FACES[${f}] 정의`);
  }
  assert.equal(FACES['+y'], 'top');
  assert.equal(FACES['-y'], 'bottom');
  assert.equal(FACES['+x'], 'side');
});

test('faceClass: 면 식별자/분류 정규화', () => {
  assert.equal(faceClass('+y'), 'top');
  assert.equal(faceClass('-y'), 'bottom');
  assert.equal(faceClass('+x'), 'side');
  assert.equal(faceClass('top'), 'top');
  assert.equal(faceClass('side'), 'side');
});

test('2) 면 방향 셰이딩 순서: top > side > bottom', () => {
  const top = faceShade('top');
  const side = faceShade('side');
  const bottom = faceShade('bottom');
  assert.ok(top > side, `top(${top}) > side(${side})`);
  assert.ok(side > bottom, `side(${side}) > bottom(${bottom})`);
  // 범위 0~1.
  for (const v of [top, side, bottom]) {
    assert.ok(v >= 0 && v <= 1, `shade ${v} 는 0~1 범위`);
  }
  // 면 식별자 버전도 동일.
  assert.ok(faceShade('+y') > faceShade('+x'));
  assert.ok(faceShade('+x') > faceShade('-y'));
});

test('3) sampleBlockColor: top 면 밝기 > bottom 면 밝기 (모든 블록)', () => {
  for (const id of [1, 2, 3, 4, 5, 6, 7]) {
    const top = sampleBlockColor(id, 'top');
    const bottom = sampleBlockColor(id, 'bottom');
    assert.ok(
      avg(top) > avg(bottom),
      `블록 ${id}: top avg(${avg(top)}) > bottom avg(${avg(bottom)})`,
    );
    // RGB 3채널 반환.
    assert.equal(top.length, 3);
  }
});

test('sampleBlockColor: shade 계수가 실제로 곱해짐', () => {
  // 돌(1)은 모든 면이 같은 base color → top/bottom 비율이 shade 비율과 같다.
  const base = ATLAS[1].top.color;
  const top = sampleBlockColor(1, 'top');
  const bottom = sampleBlockColor(1, 'bottom');
  assert.equal(top[0], base[0] * faceShade('top'));
  assert.equal(bottom[0], base[0] * faceShade('bottom'));
});

test('tileFor: 미정의 블록은 돌(1)로 폴백', () => {
  const t = tileFor(999, 'top');
  assert.deepEqual(t, ATLAS[1].top);
});

test('잔디(2)는 면별로 다른 타일을 가진다', () => {
  const g = ATLAS[2];
  assert.notDeepEqual(g.top.color, g.bottom.color, '윗면 초록 != 아랫면 흙');
  assert.notDeepEqual(g.top.index, g.side.index, '윗면 != 옆면 타일 인덱스');
});
