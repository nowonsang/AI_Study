// AC4: 입력 시퀀스(이동 + yaw/pitch + 채굴/설치)가 포즈·복셀 상태를 바꾸고 불변성을 지키는지.
// Node 내장 러너만 사용 (의존성 0): node --test engine/ tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeVoxels, setVoxel, voxelAt } from '../engine/raycast.js';
import { applyInput, applyLook } from '../engine/world.js';

const closeTo = (a, b, digits = 9) => assert.ok(Math.abs(a - b) < 0.5 * 10 ** -digits, `${a} ≈ ${b}`);

// (0.5,0.5,0.5)에서 동쪽(yaw=π/2) 응시, 전방 (3,0,0)에 돌(1).
function w0() {
  const voxels = makeVoxels(8, 8, 8, 0);
  setVoxel(voxels, 3, 0, 0, 1);
  return {
    voxels,
    player: { x: 0.5, y: 0.5, z: 0.5, yaw: Math.PI / 2, pitch: 0 },
    inventory: { 1: 5, 2: 5 },
    selectedBlock: 2,
    reach: 5,
    fov: Math.PI / 3,
  };
}

function solidCount(w) {
  let n = 0;
  for (let i = 0; i < w.voxels.data.length; i++) if (w.voxels.data[i] > 0) n++;
  return n;
}

test('forward/right/up 시퀀스 → x,y,z 모두 변화', () => {
  const start = w0();
  let w = start;
  for (const a of ['forward', 'right', 'up']) w = applyInput(w, a, 0.1);
  assert.ok(w.player.x > start.player.x);
  assert.ok(w.player.y > start.player.y);
  assert.ok(Math.abs(w.player.z - start.player.z) > 0.05);
});

test('입력은 원본을 변형하지 않고 새 월드를 반환', () => {
  const start = w0();
  const next = applyInput(start, 'forward', 0.1);
  assert.notEqual(next, start);
  closeTo(start.player.x, 0.5);
});

test('마우스룩: yaw 누적, pitch 누적', () => {
  const looked = applyLook(w0(), 0.2, -0.1);
  closeTo(looked.player.yaw, Math.PI / 2 + 0.2);
  closeTo(looked.player.pitch, -0.1);
});

test('mine → 대상 복셀 제거, solid 개수 -1, 인벤토리 +1', () => {
  const start = w0();
  const before = solidCount(start);
  const mined = applyInput(start, 'mine', 0);
  assert.equal(voxelAt(mined.voxels, 3, 0, 0), 0);
  assert.equal(solidCount(mined), before - 1);
  assert.equal(mined.inventory[1], 6);
});

test('place → 인접 면에 추가, solid 개수 +1, 인벤토리 -1', () => {
  const start = w0();
  const before = solidCount(start);
  const placed = applyInput(start, 'place', 0);
  assert.equal(voxelAt(placed.voxels, 2, 0, 0), 2);
  assert.equal(solidCount(placed), before + 1);
  assert.equal(placed.inventory[2], 4);
});

test('mine 후 place 라운드 시퀀스', () => {
  let w = w0();
  w = applyInput(w, 'mine', 0); // (3,0,0) 제거
  assert.equal(voxelAt(w.voxels, 3, 0, 0), 0);
  // (3,0,0) 제거 후 같은 시선에 닿는 solid 가 사거리(5) 안에 없음 → 변화 없음
  const after = applyInput(w, 'place', 0);
  assert.equal(after, w);
});
