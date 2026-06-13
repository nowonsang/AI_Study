// AC8 절차적 지형 오라클 테스트. Node 내장 러너만 사용.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  mulberry32,
  makeNoise2D,
  makeNoise3D,
  generateHeightmap,
  blockIdForHeight,
  biomeColorAt,
  generateChunk,
  countEnclosedAir,
} from './worldgen.js';

/** 배열 분산(population variance). */
function variance(arr) {
  const n = arr.length;
  let mean = 0;
  for (const v of arr) mean += v;
  mean /= n;
  let s = 0;
  for (const v of arr) s += (v - mean) * (v - mean);
  return s / n;
}

test('mulberry32 결정성: 같은 시드 -> 같은 수열', () => {
  const a = mulberry32(12345);
  const b = mulberry32(12345);
  for (let i = 0; i < 100; i++) {
    const va = a();
    assert.equal(va, b());
    assert.ok(va >= 0 && va < 1, 'PRNG 출력은 [0,1)');
  }
});

test('makeNoise2D / makeNoise3D: 범위 [0,1] & 결정적', () => {
  const n2 = makeNoise2D('seedA');
  const n2b = makeNoise2D('seedA');
  const n3 = makeNoise3D(99);
  const n3b = makeNoise3D(99);
  for (let i = 0; i < 50; i++) {
    const x = i * 0.37;
    const z = i * 0.91;
    const v = n2(x, z);
    assert.equal(v, n2b(x, z));
    assert.ok(v >= 0 && v <= 1, `noise2 in range: ${v}`);
    const w = n3(x, z * 0.5, z);
    assert.equal(w, n3b(x, z * 0.5, z));
    assert.ok(w >= 0 && w <= 1, `noise3 in range: ${w}`);
  }
  // 다른 시드면 결과가 달라야 함
  const other = makeNoise2D('seedB');
  let diff = false;
  for (let i = 0; i < 20; i++) {
    if (other(i * 1.3, i * 0.7) !== n2(i * 1.3, i * 0.7)) {
      diff = true;
      break;
    }
  }
  assert.ok(diff, '다른 시드는 다른 노이즈를 내야 함');
});

// 오라클 1: 하이트맵 분산 > 임계 (평탄하지 않음)
test('오라클1 - 하이트맵 분산 > 1.0 (비평탄)', () => {
  const hm = generateHeightmap(32, 32, 'terrain', {});
  assert.equal(hm.heights.length, 32 * 32);
  const v = variance(hm.heights);
  assert.ok(v > 1.0, `높이 분산이 임계 초과여야 함: variance=${v}`);
  // 최소/최대가 실제로 다름
  const min = Math.min(...hm.heights);
  const max = Math.max(...hm.heights);
  assert.ok(max - min >= 2, `높이 범위가 존재해야 함: ${min}..${max}`);
});

test('blockIdForHeight / biomeColorAt: 유효 블록 id 반환', () => {
  assert.equal(blockIdForHeight(5), 7); // 저지대 모래
  assert.equal(blockIdForHeight(15), 2); // 잔디
  assert.equal(blockIdForHeight(40), 1); // 고지대 돌
  const valid = new Set([1, 2, 7]);
  for (let h = 0; h < 60; h++) {
    assert.ok(valid.has(blockIdForHeight(h)), `유효 표면 블록: h=${h}`);
    assert.ok(valid.has(biomeColorAt(h, h * 2, h, 'seed')), 'biomeColorAt 유효');
  }
});

// 오라클 2: 동굴(둘러싸인 air 포켓) 존재
test('오라클2 - generateChunk 내부에 동굴 air 포켓 1개 이상', () => {
  const g = generateChunk(0, 0, 0, 32, 'caves');
  const enclosed = countEnclosedAir(g);
  assert.ok(enclosed >= 1, `둘러싸인 air 포켓이 존재해야 함: count=${enclosed}`);

  // 청크가 전부 공기/전부 solid 가 아닌지 (지형이 실제로 채워짐)
  let air = 0;
  let solid = 0;
  for (const v of g.data) {
    if (v === 0) air++;
    else solid++;
  }
  assert.ok(air > 0 && solid > 0, `air=${air} solid=${solid} 둘 다 존재`);
});

// 오라클 3: 결정성 — 같은 인자 동일, 다른 시드 다름
test('오라클3 - generateChunk 결정성 & 시드 민감도', () => {
  const a = generateChunk(1, 0, 2, 24, 'world-1');
  const b = generateChunk(1, 0, 2, 24, 'world-1');
  assert.equal(a.data.length, b.data.length);
  assert.deepEqual(
    Array.from(a.data),
    Array.from(b.data),
    '같은 (cx,cy,cz,size,seed) -> data 완전 동일'
  );

  const c = generateChunk(1, 0, 2, 24, 'world-2');
  let differs = false;
  for (let i = 0; i < a.data.length; i++) {
    if (a.data[i] !== c.data[i]) {
      differs = true;
      break;
    }
  }
  assert.ok(differs, '다른 시드 -> data 가 달라야 함');
});

test('generateChunk: 청크 차원이 size^3', () => {
  const g = generateChunk(0, 0, 0, 16, 's');
  assert.equal(g.sx, 16);
  assert.equal(g.sy, 16);
  assert.equal(g.sz, 16);
  assert.equal(g.data.length, 16 * 16 * 16);
});
