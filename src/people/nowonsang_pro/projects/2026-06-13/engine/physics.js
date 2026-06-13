// 순수 AABB 스윕 물리 모듈 (축분리 스윕 충돌 + 중력 + 점프 + 계단 스텝업).
// 외부 UI 프레임워크/DOM 의존 없음 (purity 정적스캔으로 단언).
// 좌표계: y = 위(up), x·z = 수평. 복셀 grid 는 raycast.js 의 voxelAt 으로 조회한다.
// solid 판정: voxelAt(g,x,y,z) !== 0.
//
// 단위계: 1 복셀 = 1 단위. dt 는 초. 속도는 단위/초, 중력은 단위/초^2.
//
// AABB(축정렬 경계상자) 표현은 두 가지를 모두 받아들인다:
//   - { minx, miny, minz, maxx, maxy, maxz }
//   - { pos:[x,y,z], size:[w,h,d] }  (pos 는 박스의 최소 모서리)
// 내부적으로는 minx..maxz 형태로 정규화해 다룬다.

import { voxelAt } from './raycast.js';

/** 중력 가속도 (단위/초^2). 아래로 당기므로 vy 에 -GRAVITY*dt 를 누적한다. */
export const GRAVITY = 24;

/** 플레이어 AABB 크기 [폭(x), 높이(y), 깊이(z)]. */
export const PLAYER_SIZE = [0.6, 1.8, 0.6];

/** 점프 시 위로 주는 초기 속도(단위/초). */
export const JUMP_SPEED = 9;

/** 한 번에 스텝업할 수 있는 최대 높이(복셀). */
export const STEP_HEIGHT = 1;

// 수치 안정용 미세 여유. 박스가 면에 정확히 붙을 때 부동소수 오차로 겹쳤다고
// 오판하지 않도록, 또 면에 닿은 뒤 살짝 떼어 놓을 때 사용한다.
const EPS = 1e-4;

/**
 * 다양한 입력을 { minx, miny, minz, maxx, maxy, maxz } 로 정규화한다.
 * @param {object} aabb
 * @returns {{minx:number,miny:number,minz:number,maxx:number,maxy:number,maxz:number}}
 */
function normalizeAABB(aabb) {
  if (aabb.pos && aabb.size) {
    const [px, py, pz] = aabb.pos;
    const [sw, sh, sd] = aabb.size;
    return {
      minx: px,
      miny: py,
      minz: pz,
      maxx: px + sw,
      maxy: py + sh,
      maxz: pz + sd,
    };
  }
  return {
    minx: aabb.minx,
    miny: aabb.miny,
    minz: aabb.minz,
    maxx: aabb.maxx,
    maxy: aabb.maxy,
    maxz: aabb.maxz,
  };
}

/**
 * 주어진 박스가 어떤 solid 복셀과도 겹치는지 검사한다.
 * 박스가 차지하는 복셀 좌표 범위를 floor/ceil 로 구해 전부 확인한다.
 * @param {object} g VoxelGrid
 * @param {{minx:number,miny:number,minz:number,maxx:number,maxy:number,maxz:number}} b
 * @returns {boolean} solid 와 겹치면 true.
 */
export function aabbCollides(g, b) {
  // 면에 정확히 붙은 경우(maxx == 정수 경계)를 겹침으로 치지 않도록 EPS 만큼 수축.
  const x0 = Math.floor(b.minx + EPS);
  const x1 = Math.ceil(b.maxx - EPS) - 1;
  const y0 = Math.floor(b.miny + EPS);
  const y1 = Math.ceil(b.maxy - EPS) - 1;
  const z0 = Math.floor(b.minz + EPS);
  const z1 = Math.ceil(b.maxz - EPS) - 1;

  for (let z = z0; z <= z1; z++) {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (voxelAt(g, x, y, z) !== 0) return true;
      }
    }
  }
  return false;
}

/**
 * 한 축으로 박스를 delta 만큼 이동시키되, solid 와 충돌하면 면 바로 앞에 멈춘다.
 * 큰 delta 라도 한 복셀씩 전진하며 충돌을 검사하므로 터널링이 발생하지 않는다.
 * @param {object} g VoxelGrid
 * @param {{minx:number,miny:number,minz:number,maxx:number,maxy:number,maxz:number}} b 정규화된 박스(이동 시작 위치, solid 와 겹치지 않는다고 가정)
 * @param {'x'|'y'|'z'} axis 이동 축
 * @param {number} delta 이동량
 * @returns {{moved:number, hit:boolean}} 실제 이동량과 충돌 여부.
 */
function sweepAxis(g, b, axis, delta) {
  if (delta === 0) return { moved: 0, hit: false };

  const minK = axis === 'x' ? 'minx' : axis === 'y' ? 'miny' : 'minz';
  const maxK = axis === 'x' ? 'maxx' : axis === 'y' ? 'maxy' : 'maxz';

  const sign = delta > 0 ? 1 : -1;
  let remaining = Math.abs(delta);
  let moved = 0;
  let hit = false;

  // 한 스텝당 최대 1 복셀(1.0 단위)만 전진해 매 복셀 경계에서 충돌을 검사한다.
  while (remaining > 0) {
    const step = Math.min(remaining, 1);
    const tryB = { ...b };
    tryB[minK] += sign * step;
    tryB[maxK] += sign * step;

    if (aabbCollides(g, tryB)) {
      // 이 step 안에서 충돌 직전까지의 허용 이동량을 이분 탐색으로 구한다.
      // [0, step] 구간에서 "겹치지 않는" 최대 거리를 찾는다(터널링 방지).
      let lo = 0; // 항상 겹치지 않음(시작 위치)
      let hi = step; // 겹침
      for (let iter = 0; iter < 40; iter++) {
        const mid = (lo + hi) / 2;
        const probe = { ...b };
        probe[minK] += sign * mid;
        probe[maxK] += sign * mid;
        if (aabbCollides(g, probe)) hi = mid;
        else lo = mid;
      }
      // 면에서 살짝 떨어뜨려 부동소수 오차로 겹치지 않게 한다.
      const allow = Math.max(0, lo - EPS);
      b[minK] += sign * allow;
      b[maxK] += sign * allow;
      moved += sign * allow;
      hit = true;
      break;
    }

    // 충돌 없으면 실제로 이동을 확정.
    b[minK] = tryB[minK];
    b[maxK] = tryB[maxK];
    moved += sign * step;
    remaining -= step;
  }

  return { moved, hit };
}

/**
 * 축분리 AABB 스윕. x → z → y 순으로 각 축을 독립적으로 스윕하며 터널링을 방지한다.
 * @param {object} g VoxelGrid
 * @param {object} aabb 시작 박스 ({minx..maxz} 또는 {pos,size}).
 * @param {[number,number,number]} vel 속도 [vx,vy,vz].
 * @param {number} dt 시간 간격(초).
 * @returns {{pos:[number,number,number], vel:[number,number,number], onGround:boolean}}
 *          pos 는 이동 후 박스의 최소 모서리, vel 은 충돌로 소거된 후 속도.
 */
export function sweepAABB(g, aabb, vel, dt) {
  const b = normalizeAABB(aabb);
  let [vx, vy, vz] = vel;
  let onGround = false;

  // 수평(x, z) 먼저 스윕 — 벽에 막히면 해당 축 속도를 0 으로.
  const rx = sweepAxis(g, b, 'x', vx * dt);
  if (rx.hit) vx = 0;

  const rz = sweepAxis(g, b, 'z', vz * dt);
  if (rz.hit) vz = 0;

  // 수직(y) 스윕 — 아래로 가다 막히면 바닥(onGround), 위로 가다 막히면 천장.
  const ry = sweepAxis(g, b, 'y', vy * dt);
  if (ry.hit) {
    if (vy < 0) onGround = true;
    vy = 0;
  }

  return {
    pos: [b.minx, b.miny, b.minz],
    vel: [vx, vy, vz],
    onGround,
  };
}

/**
 * 한 박스가 바닥(바로 아래 복셀)에 닿아 있는지 검사한다(접지 판정용).
 * @param {object} g VoxelGrid
 * @param {{minx:number,miny:number,minz:number,maxx:number,maxy:number,maxz:number}} b
 * @returns {boolean}
 */
function isOnGround(g, b) {
  const probe = { ...b, miny: b.miny - EPS * 2, maxy: b.miny };
  return aabbCollides(g, probe);
}

/**
 * 물리 한 프레임 적분: 중력 + 점프 + 수평이동 + 스윕 충돌 + 계단 스텝업.
 * @param {object} g VoxelGrid
 * @param {{pos:[number,number,number], vel:[number,number,number], onGround:boolean}} body
 *        pos 는 박스 최소 모서리.
 * @param {{jump?:boolean, move?:[number,number]}} input
 *        jump = true 이면 접지 상태에서 위로 점프, move = [mx,mz] 수평 목표 속도.
 * @param {number} dt 시간 간격(초).
 * @param {[number,number,number]} [size=PLAYER_SIZE] 박스 크기.
 * @returns {{pos:[number,number,number], vel:[number,number,number], onGround:boolean}}
 */
export function stepPhysics(g, body, input = {}, dt = 1 / 60, size = PLAYER_SIZE) {
  const [sw, sh, sd] = size;
  let [px, py, pz] = body.pos;
  let [vx, vy, vz] = body.vel;

  const move = input.move || [0, 0];
  // 수평 속도는 입력으로 직접 설정(즉각 반응형). 수직은 누적.
  vx = move[0];
  vz = move[1];

  // 점프: 접지 상태에서만 위로 속도를 준다.
  if (input.jump && body.onGround) {
    vy = JUMP_SPEED;
  }

  // 중력 적용.
  vy -= GRAVITY * dt;

  // 시작 박스.
  const startBox = {
    minx: px,
    miny: py,
    minz: pz,
    maxx: px + sw,
    maxy: py + sh,
    maxz: pz + sd,
  };

  // --- 1차 스윕 ---
  const res = sweepAABB(g, startBox, [vx, vy, vz], dt);
  let [nx, ny, nz] = res.pos;
  let nvx = res.vel[0];
  let nvy = res.vel[1];
  let nvz = res.vel[2];
  let onGround = res.onGround;

  // --- 계단 스텝업 ---
  // 수평 이동이 벽에 막혀(요청한 수평 속도가 있는데 위치가 거의 안 변함) 정지했고,
  // 접지 상태라면, 한 칸(STEP_HEIGHT) 올라가서 같은 수평 이동을 다시 시도한다.
  const wantedHoriz = Math.hypot(vx, vz) > EPS;
  const horizMoved = Math.hypot(nx - px, nz - pz);
  const blocked = wantedHoriz && horizMoved < Math.hypot(vx, vz) * dt - EPS;

  if (blocked && (onGround || body.onGround)) {
    // 박스를 STEP_HEIGHT 만큼 올린 위치에서 다시 수평 스윕을 시도.
    const lifted = {
      minx: px,
      miny: py + STEP_HEIGHT,
      minz: pz,
      maxx: px + sw,
      maxy: py + sh + STEP_HEIGHT,
      maxz: pz + sd,
    };

    // 올린 자리 자체가 막혀 있지 않은 경우에만 스텝업 시도.
    if (!aabbCollides(g, lifted)) {
      // 올린 상태에서 수평만 스윕(중력은 아래에서 별도 처리).
      const stepRes = sweepAABB(g, lifted, [vx, 0, vz], dt);
      const stepHoriz = Math.hypot(
        stepRes.pos[0] - px,
        stepRes.pos[2] - pz,
      );

      // 올라가서 수평 진행이 실제로 가능해졌으면 스텝업 채택.
      if (stepHoriz > horizMoved + EPS) {
        const lb = {
          minx: stepRes.pos[0],
          miny: stepRes.pos[1],
          minz: stepRes.pos[2],
          maxx: stepRes.pos[0] + sw,
          maxy: stepRes.pos[1] + sh,
          maxz: stepRes.pos[2] + sd,
        };
        // 올라선 칸 위에서 아래로 살짝 내려 계단 표면에 안착시킨다.
        const settle = sweepAxis(g, lb, 'y', -(STEP_HEIGHT + EPS));
        nx = lb.minx;
        ny = lb.miny;
        nz = lb.minz;
        nvx = stepRes.vel[0];
        nvz = stepRes.vel[2];
        nvy = 0;
        onGround = settle.hit || isOnGround(g, lb);
      }
    }
  }

  // 최종 접지 보정: 스윕에서 바닥에 닿았거나 바로 아래가 solid 면 onGround.
  if (!onGround) {
    const finalBox = {
      minx: nx,
      miny: ny,
      minz: nz,
      maxx: nx + sw,
      maxy: ny + sh,
      maxz: nz + sd,
    };
    if (nvy <= 0 && isOnGround(g, finalBox)) {
      onGround = true;
      if (nvy < 0) nvy = 0;
    }
  }

  return {
    pos: [nx, ny, nz],
    vel: [nvx, nvy, nvz],
    onGround,
  };
}
