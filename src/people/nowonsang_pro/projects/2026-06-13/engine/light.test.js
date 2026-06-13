// AC7 조명 모듈 오라클 테스트 — Node 내장 러너.
// 실행: node --test engine/light.test.js

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeVoxels, setVoxel } from './raycast.js';
import { computeAO, floodLight } from './light.js';

// --- 오라클 1: AO 단조 (오목한 곳이 더 어둡다) -------------------------------
test('AO: 오목 모서리가 평면보다 어둡다 (단조성)', () => {
  // 빈 공간에 격리된 single solid 블록 → 모든 면이 완전히 노출(이웃 0개) → AO = 1.
  const flat = makeVoxels(8, 8, 8, 0);
  setVoxel(flat, 4, 4, 4, 1);
  const aoFlat = computeAO(flat, 4, 4, 4, '+y'); // 위 면, 주변 빈 공간
  assert.equal(aoFlat, 1, '격리 블록의 노출면 AO는 1(완전 밝음)');

  // 오목 코너 구성: 같은 블록 +y 면 주변(위쪽 평면)에 solid 이웃을 둔다.
  // +y 면 기준 셀 = (4,5,4). 접선축 = x,z. 그 4변에 solid를 채워 가린다.
  const concave = makeVoxels(8, 8, 8, 0);
  setVoxel(concave, 4, 4, 4, 1);
  setVoxel(concave, 5, 5, 4, 1); // +u
  setVoxel(concave, 3, 5, 4, 1); // -u
  const aoConcave2 = computeAO(concave, 4, 4, 4, '+y'); // 이웃 2개 → 더 어두움
  assert.ok(aoConcave2 < aoFlat, `오목(이웃2) AO(${aoConcave2}) < 평면 AO(${aoFlat})`);

  // 이웃 3개면 더더욱 어둡다 (추가 단조).
  setVoxel(concave, 4, 5, 5, 1); // +v
  const aoConcave3 = computeAO(concave, 4, 4, 4, '+y');
  assert.ok(aoConcave3 < aoConcave2, `이웃3 AO(${aoConcave3}) < 이웃2 AO(${aoConcave2})`);
  assert.ok(aoConcave3 >= 0, 'AO는 0 미만이 되지 않는다');
});

test('AO: 이웃 4면 모두 막히면 가장 어둡다(=0), 1개는 중간', () => {
  const g = makeVoxels(8, 8, 8, 0);
  setVoxel(g, 4, 4, 4, 1);
  // +y 면 기준셀 (4,5,4)의 4변 모두 solid.
  setVoxel(g, 5, 5, 4, 1);
  setVoxel(g, 3, 5, 4, 1);
  setVoxel(g, 4, 5, 5, 1);
  setVoxel(g, 4, 5, 3, 1);
  assert.equal(computeAO(g, 4, 4, 4, '+y'), 0, '4변 모두 가림 → AO 0');

  const g1 = makeVoxels(8, 8, 8, 0);
  setVoxel(g1, 4, 4, 4, 1);
  setVoxel(g1, 5, 5, 4, 1); // 1개만
  const ao1 = computeAO(g1, 4, 4, 4, '+y');
  assert.ok(ao1 > 0 && ao1 < 1, `이웃1 AO는 0과 1 사이여야: ${ao1}`);
});

// --- 오라클 2: 광원 단조 감쇠 -------------------------------------------------
test('floodLight: 거리에 따라 단조 감소하며 충분히 멀면 strictly 감소', () => {
  // 한 줄(z축)로 뚫린 빈 공간에 단일 광원.
  const g = makeVoxels(1, 1, 20, 0); // x=1,y=1,z=20 → (0,0,z) 일렬 공기 통로
  const src = { x: 0, y: 0, z: 0, level: 15 };
  const light = floodLight(g, [src]);

  const at = (z) => light.get(`0,0,${z}`);

  // 광원 셀 자체 = 15
  assert.equal(at(0), 15, '광원 셀 레벨 = 15');

  // 단조 감소: 거리 d1 < d2 이면 level(d1) >= level(d2)
  for (let z = 0; z < 15; z++) {
    const a = at(z);
    const b = at(z + 1);
    assert.ok(a !== undefined, `z=${z} 는 방문되어야 함`);
    if (b !== undefined) {
      assert.ok(a >= b, `단조: level(${z})=${a} >= level(${z + 1})=${b}`);
    }
  }

  // 충분히 떨어진 두 셀은 strictly 감소.
  const near = at(2);
  const far = at(8);
  assert.ok(near !== undefined && far !== undefined, '두 셀 모두 방문');
  assert.ok(near > far, `strictly 감소: near(z=2)=${near} > far(z=8)=${far}`);

  // 정확한 감쇠 확인: level - 거리.
  assert.equal(at(1), 14);
  assert.equal(at(5), 10);

  // 0 미만으로 내려가지 않음 (도달 못한 끝쪽은 미방문/undefined).
  for (const [, lvl] of light) {
    assert.ok(lvl >= 0, `레벨은 0 이상: ${lvl}`);
  }
  // 레벨 15면 z=15에서 0 도달 → z=15는 미방문(0 이하 전파 중단).
  assert.equal(at(15), undefined, 'level 0 도달 셀은 전파되지 않아 미방문');
});

// --- 오라클 3: solid 벽 차단 --------------------------------------------------
test('floodLight: solid 벽 뒤 공기 셀에는 빛이 전파되지 않는다', () => {
  // 통로: (0,0,0)광원 .. (0,0,2)벽 .. (0,0,3)은 벽 뒤 격리 공기.
  const g = makeVoxels(1, 1, 5, 0);
  setVoxel(g, 0, 0, 2, 1); // 벽
  const light = floodLight(g, [{ x: 0, y: 0, z: 0, level: 15 }]);

  assert.ok(light.get('0,0,0') !== undefined, '광원 셀은 빛 있음');
  assert.ok(light.get('0,0,1') !== undefined, '벽 앞 셀은 빛 도달');
  assert.equal(light.get('0,0,2'), undefined, '벽 셀(solid)에는 빛 없음');
  assert.equal(light.get('0,0,3'), undefined, '벽 뒤 격리 공기 셀에 빛 전파 안 됨');
  assert.equal(light.get('0,0,4'), undefined, '벽 뒤 끝 셀도 빛 없음');
});

test('floodLight: 우회 경로가 있으면 벽 뒤에도 (감쇠된) 빛이 돌아간다', () => {
  // 2x1x3 격자. z=1 평면에서 x=0만 벽, x=1은 열림 → 빛이 x=1로 우회해 z=2 도달.
  const g = makeVoxels(2, 1, 3, 0);
  setVoxel(g, 0, 0, 1, 1); // (0,*,1) 벽
  const light = floodLight(g, [{ x: 0, y: 0, z: 0, level: 15 }]);
  // (0,0,2)는 (0,0,0)→(1,0,0)→(1,0,1)→(1,0,2)→(0,0,2) 경로(4칸)로 도달.
  const v = light.get('0,0,2');
  assert.ok(v !== undefined && v > 0, `우회 경로로 빛 도달: ${v}`);
  assert.ok(v < 15, '우회는 더 감쇠됨');
});

test('floodLight: 다중 광원은 셀별 최대 레벨을 취한다', () => {
  const g = makeVoxels(1, 1, 11, 0);
  const light = floodLight(g, [
    { x: 0, y: 0, z: 0, level: 15 },
    { x: 0, y: 0, z: 10, level: 15 },
  ]);
  // 중앙 z=5: 두 광원에서 각 5칸 → 둘 다 10. 동일.
  assert.equal(light.get('0,0,5'), 10);
  // z=1: 왼쪽광원 14 vs 오른쪽광원 15-9=6 → max 14.
  assert.equal(light.get('0,0,1'), 14);
});
