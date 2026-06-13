// 월드/게임 로직 오라클 테스트. Node 내장 러너만 사용 (의존성 0):
//   node --test engine/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeVoxels, setVoxel, voxelAt } from './raycast.js';
import {
  createWorld,
  mineBlock,
  placeBlock,
  moveForward,
  moveStrafe,
  moveVertical,
  applyLook,
  serialize,
  deserialize,
  PITCH_LIMIT,
} from './world.js';

const closeTo = (a, b, digits = 9) => assert.ok(Math.abs(a - b) < 0.5 * 10 ** -digits, `${a} ≈ ${b}`);

// 플레이어 (0.5,0.5,0.5)에서 동쪽(yaw=π/2) 응시, 전방 (3,0,0)에 돌(1).
function eastFacing() {
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

test('createWorld: 바닥은 solid, 플레이어 발 위치는 공기', () => {
  const w = createWorld();
  assert.ok(voxelAt(w.voxels, 8, 0, 8) > 0);
  assert.equal(voxelAt(w.voxels, Math.floor(w.player.x), Math.floor(w.player.y), Math.floor(w.player.z)), 0);
});

test('mineBlock: 조준 복셀 제거 + 인벤토리 +1', () => {
  const out = mineBlock(eastFacing());
  assert.equal(voxelAt(out.voxels, 3, 0, 0), 0);
  assert.equal(out.inventory[1], 6);
});

test('mineBlock: 입력 월드를 변형하지 않음(불변)', () => {
  const w = eastFacing();
  mineBlock(w);
  assert.equal(voxelAt(w.voxels, 3, 0, 0), 1);
  assert.equal(w.inventory[1], 5);
});

test('mineBlock: 사거리 밖이면 무변화', () => {
  const w = eastFacing();
  const out = mineBlock({ ...w, reach: 1 });
  assert.equal(voxelAt(out.voxels, 3, 0, 0), 1);
});

test('placeBlock: 히트 면(법선 방향)에 설치 + 인벤토리 -1', () => {
  const out = placeBlock(eastFacing());
  assert.equal(voxelAt(out.voxels, 2, 0, 0), 2); // (3,0,0)+(-1,0,0)
  assert.equal(out.inventory[2], 4);
});

test('placeBlock: 재고 0이면 무변화', () => {
  const w = eastFacing();
  const out = placeBlock({ ...w, inventory: { 1: 5, 2: 0 } });
  assert.equal(voxelAt(out.voxels, 2, 0, 0), 0);
});

test('이동: 빈 칸으로 전진', () => {
  const out = moveForward(eastFacing(), 0.3);
  closeTo(out.player.x, 0.8);
});

test('이동: 벽에 막히면 그 축 정지', () => {
  const out = moveForward(eastFacing(), 3); // (3,0,0) 돌에 막힘
  closeTo(out.player.x, 0.5);
});

test('이동: strafe / vertical', () => {
  const w = eastFacing();
  assert.ok(Math.abs(moveStrafe(w, 0.2).player.z - 0.5) > 1e-5);
  closeTo(moveVertical(w, 0.5).player.y, 1.0);
});

test('applyLook: yaw 누적, pitch 클램프', () => {
  const w = eastFacing();
  const out = applyLook(w, 0.5, 10);
  closeTo(out.player.yaw, Math.PI / 2 + 0.5);
  closeTo(out.player.pitch, PITCH_LIMIT);
  closeTo(applyLook(w, 0, -10).player.pitch, -PITCH_LIMIT);
});

test('serialize/deserialize: 동일 월드 복원', () => {
  const w = eastFacing();
  assert.deepEqual(deserialize(serialize(w)), w);
});

test('serialize/deserialize: 채굴 후에도 라운드트립', () => {
  const w = mineBlock(eastFacing());
  assert.deepEqual(deserialize(serialize(w)), w);
});
