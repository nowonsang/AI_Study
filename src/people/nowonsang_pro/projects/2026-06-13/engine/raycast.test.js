// 순수 레이캐스팅 엔진 오라클 테스트. Node 내장 러너만 사용 (의존성 0):
//   node --test engine/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeVoxels,
  setVoxel,
  voxelAt,
  castRay,
  forwardVector,
  rightVector,
  rayDirection,
} from './raycast.js';

const closeTo = (a, b, digits = 9) => assert.ok(Math.abs(a - b) < 0.5 * 10 ** -digits, `${a} ≈ ${b}`);
const emptyGrid = () => makeVoxels(8, 8, 8, 0);

test('voxelAt: 경계 밖은 공기(0)', () => {
  const g = emptyGrid();
  assert.equal(voxelAt(g, -1, 0, 0), 0);
  assert.equal(voxelAt(g, 8, 0, 0), 0);
  assert.equal(voxelAt(g, 0, 0, 8), 0);
});

test('setVoxel/voxelAt: set 후 조회', () => {
  const g = emptyGrid();
  setVoxel(g, 3, 4, 5, 2);
  assert.equal(voxelAt(g, 3, 4, 5), 2);
});

test('castRay +x: 거리 2.5, 복셀 (3,0,0), 법선 (-1,0,0)', () => {
  const g = emptyGrid();
  setVoxel(g, 3, 0, 0, 1);
  const hit = castRay(g, 0.5, 0.5, 0.5, 1, 0, 0);
  assert.notEqual(hit, null);
  assert.equal(hit.block, 1);
  assert.deepEqual([hit.ix, hit.iy, hit.iz], [3, 0, 0]);
  assert.deepEqual([hit.nx, hit.ny, hit.nz], [-1, 0, 0]);
  closeTo(hit.distance, 2.5);
});

test('castRay +z: 복셀 (0,0,3), 법선 (0,0,-1)', () => {
  const g = emptyGrid();
  setVoxel(g, 0, 0, 3, 4);
  const hit = castRay(g, 0.5, 0.5, 0.5, 0, 0, 1);
  assert.deepEqual([hit.ix, hit.iy, hit.iz], [0, 0, 3]);
  assert.deepEqual([hit.nx, hit.ny, hit.nz], [0, 0, -1]);
  closeTo(hit.distance, 2.5);
  assert.equal(hit.block, 4);
});

test('castRay -y(아래): 바닥 복셀, 법선 (0,1,0)', () => {
  const g = emptyGrid();
  setVoxel(g, 2, 0, 2, 2);
  const hit = castRay(g, 2.5, 3.5, 2.5, 0, -1, 0);
  assert.deepEqual([hit.ix, hit.iy, hit.iz], [2, 0, 2]);
  assert.deepEqual([hit.nx, hit.ny, hit.nz], [0, 1, 0]);
  closeTo(hit.distance, 2.5);
});

test('설치 좌표 = 히트 + 법선 (인접 빈 칸)', () => {
  const g = emptyGrid();
  setVoxel(g, 3, 0, 0, 1);
  const hit = castRay(g, 0.5, 0.5, 0.5, 1, 0, 0);
  const place = [hit.ix + hit.nx, hit.iy + hit.ny, hit.iz + hit.nz];
  assert.deepEqual(place, [2, 0, 0]);
  assert.equal(voxelAt(g, place[0], place[1], place[2]), 0);
});

test('하늘 방향(블록 없음)이면 null', () => {
  const g = emptyGrid();
  setVoxel(g, 3, 0, 0, 1);
  assert.equal(castRay(g, 0.5, 0.5, 0.5, 0, 1, 0), null);
});

test('maxDist 밖이면 null', () => {
  const g = makeVoxels(64, 4, 4, 0);
  setVoxel(g, 40, 0, 0, 1);
  assert.equal(castRay(g, 0.5, 0.5, 0.5, 1, 0, 0, 5), null);
  assert.notEqual(castRay(g, 0.5, 0.5, 0.5, 1, 0, 0, 64), null);
});

test('forwardVector / rightVector', () => {
  const f0 = forwardVector(0, 0);
  closeTo(f0[0], 0);
  closeTo(f0[1], 0);
  closeTo(f0[2], 1);
  const east = forwardVector(Math.PI / 2, 0);
  closeTo(east[0], 1);
  closeTo(east[2], 0);
  closeTo(forwardVector(0, Math.PI / 2)[1], 1);
  const r = rightVector(0);
  closeTo(r[0], 1);
  closeTo(r[2], 0);
});

test('rayDirection 중앙(1x1) = forward, 단위벡터', () => {
  const cam = { x: 0, y: 0, z: 0, yaw: 0.3, pitch: -0.2, fov: Math.PI / 3 };
  const [dx, dy, dz] = rayDirection(cam, 0, 0, 1, 1);
  const [fx, fy, fz] = forwardVector(cam.yaw, cam.pitch);
  closeTo(dx, fx);
  closeTo(dy, fy);
  closeTo(dz, fz);
  closeTo(Math.hypot(dx, dy, dz), 1);
});

test('rayDirection 모든 픽셀이 단위벡터', () => {
  const cam = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, fov: Math.PI / 3 };
  for (let py = 0; py < 4; py++) {
    for (let px = 0; px < 6; px++) {
      const [dx, dy, dz] = rayDirection(cam, px, py, 6, 4);
      closeTo(Math.hypot(dx, dy, dz), 1);
    }
  }
});
