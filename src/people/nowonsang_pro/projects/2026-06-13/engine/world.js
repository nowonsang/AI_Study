// 3D 복셀 월드 상태 + 게임 로직. 전부 순수 함수(불변): 새 World 를 반환하고 입력을 변형하지 않는다.
// 외부 UI 프레임워크/DOM 의존 없음 (purity 테스트로 단언).
//
// PlayerPose: { x, y, z, yaw, pitch }
// World:      { voxels, player, inventory, selectedBlock, reach, fov }
// InputAction: 'forward'|'back'|'left'|'right'|'up'|'down'|'mine'|'place'

import { castRay, cloneVoxels, forwardVector, makeVoxels, rightVector, setVoxel, voxelAt } from './raycast.js';

export const DEFAULT_STEP = { moveSpeed: 4 }; // 초당 셀
export const PITCH_LIMIT = Math.PI / 2 - 0.02;

/** 기본 월드: 바닥 평면(잔디) + 흩뿌린 블록 몇 개. 플레이어는 +z 응시. */
export function createWorld() {
  const sx = 16;
  const sy = 8;
  const sz = 16;
  const voxels = makeVoxels(sx, sy, sz, 0);
  // y=0 바닥 전체 잔디(2)
  for (let z = 0; z < sz; z++) {
    for (let x = 0; x < sx; x++) {
      setVoxel(voxels, x, 0, z, 2);
    }
  }
  // 장식 블록 (돌 1, 흙 3)
  setVoxel(voxels, 8, 1, 11, 1);
  setVoxel(voxels, 9, 1, 11, 1);
  setVoxel(voxels, 8, 2, 11, 3);
  setVoxel(voxels, 4, 1, 6, 1);
  return {
    voxels,
    player: { x: 8.5, y: 2.5, z: 4.5, yaw: 0, pitch: 0 },
    inventory: { 1: 8, 2: 8, 3: 8 },
    selectedBlock: 1,
    reach: 5,
    fov: Math.PI / 3,
  };
}

function withPlayer(w, player) {
  return { ...w, player };
}

/** (x,y,z) 위치가 빈 칸(공기)이면 true. */
export function isFree(g, x, y, z) {
  return voxelAt(g, Math.floor(x), Math.floor(y), Math.floor(z)) === 0;
}

/** 임의 변위(dx,dy,dz)를 축 분리 충돌 처리로 적용. */
export function moveBy(w, dx, dy, dz) {
  const p = w.player;
  let nx = p.x;
  let ny = p.y;
  let nz = p.z;
  if (isFree(w.voxels, p.x + dx, ny, nz)) nx = p.x + dx;
  if (isFree(w.voxels, nx, p.y + dy, nz)) ny = p.y + dy;
  if (isFree(w.voxels, nx, ny, p.z + dz)) nz = p.z + dz;
  return withPlayer(w, { ...p, x: nx, y: ny, z: nz });
}

/** yaw 기준 수평 전진(음수=후진). pitch 무시(걷기). */
export function moveForward(w, dist) {
  const [fx, , fz] = forwardVector(w.player.yaw, 0);
  return moveBy(w, fx * dist, 0, fz * dist);
}

/** yaw 기준 좌우 평행이동. dist>0 = 오른쪽. */
export function moveStrafe(w, dist) {
  const [rx, , rz] = rightVector(w.player.yaw);
  return moveBy(w, rx * dist, 0, rz * dist);
}

/** 수직 이동(비행). dist>0 = 위로. */
export function moveVertical(w, dist) {
  return moveBy(w, 0, dist, 0);
}

/** 시점 변경. yaw 누적, pitch 누적 후 클램프. */
export function applyLook(w, dYaw, dPitch) {
  const p = w.player;
  let pitch = p.pitch + dPitch;
  if (pitch > PITCH_LIMIT) pitch = PITCH_LIMIT;
  if (pitch < -PITCH_LIMIT) pitch = -PITCH_LIMIT;
  return withPlayer(w, { ...p, yaw: p.yaw + dYaw, pitch });
}

/** 조준한 광선의 첫 복셀 히트(사거리 제한). */
export function aim(w) {
  const p = w.player;
  const [dx, dy, dz] = forwardVector(p.yaw, p.pitch);
  return castRay(w.voxels, p.x, p.y, p.z, dx, dy, dz, w.reach);
}

/** 조준 복셀 채굴: 제거 + 인벤토리 +1. 없거나 사거리 밖이면 무변화. */
export function mineBlock(w) {
  const hit = aim(w);
  if (!hit || hit.distance > w.reach || hit.block <= 0) return w;
  const voxels = cloneVoxels(w.voxels);
  setVoxel(voxels, hit.ix, hit.iy, hit.iz, 0);
  const inventory = { ...w.inventory };
  inventory[hit.block] = (inventory[hit.block] || 0) + 1;
  return { ...w, voxels, inventory };
}

/** 조준 면(법선 방향 인접 빈 칸)에 selectedBlock 설치 + 인벤토리 -1. */
export function placeBlock(w) {
  const block = w.selectedBlock;
  if ((w.inventory[block] || 0) <= 0) return w;
  const hit = aim(w);
  if (!hit || hit.distance > w.reach) return w;
  const tx = hit.ix + hit.nx;
  const ty = hit.iy + hit.ny;
  const tz = hit.iz + hit.nz;
  if (voxelAt(w.voxels, tx, ty, tz) !== 0) return w; // 빈 칸만
  // 플레이어가 서 있는 셀에는 설치 금지
  if (tx === Math.floor(w.player.x) && ty === Math.floor(w.player.y) && tz === Math.floor(w.player.z)) return w;
  const voxels = cloneVoxels(w.voxels);
  setVoxel(voxels, tx, ty, tz, block);
  const inventory = { ...w.inventory };
  inventory[block] = inventory[block] - 1;
  return { ...w, voxels, inventory };
}

export function selectBlock(w, blockId) {
  return { ...w, selectedBlock: blockId };
}

/** 입력 액션 1개를 dt(초) 기준 적용. UI 셸과 controls 테스트 공용. */
export function applyInput(w, action, dt, cfg = DEFAULT_STEP) {
  const d = cfg.moveSpeed * dt;
  switch (action) {
    case 'forward':
      return moveForward(w, d);
    case 'back':
      return moveForward(w, -d);
    case 'left':
      return moveStrafe(w, -d);
    case 'right':
      return moveStrafe(w, d);
    case 'up':
      return moveVertical(w, d);
    case 'down':
      return moveVertical(w, -d);
    case 'mine':
      return mineBlock(w);
    case 'place':
      return placeBlock(w);
    default:
      return w;
  }
}

/** 월드를 JSON 문자열로 직렬화. */
export function serialize(w) {
  return JSON.stringify({
    sx: w.voxels.sx,
    sy: w.voxels.sy,
    sz: w.voxels.sz,
    data: Array.from(w.voxels.data),
    player: w.player,
    inventory: w.inventory,
    selectedBlock: w.selectedBlock,
    reach: w.reach,
    fov: w.fov,
  });
}

/** JSON 문자열에서 월드 복원(라운드트립). */
export function deserialize(s) {
  const o = JSON.parse(s);
  const voxels = { sx: o.sx, sy: o.sy, sz: o.sz, data: Uint8Array.from(o.data) };
  return {
    voxels,
    player: o.player,
    inventory: o.inventory,
    selectedBlock: o.selectedBlock,
    reach: o.reach,
    fov: o.fov,
  };
}
