// AC10 AABB 스윕 물리 오라클 테스트 — Node 내장 러너(node --test).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeVoxels, setVoxel, voxelAt } from './raycast.js';
import {
  GRAVITY,
  PLAYER_SIZE,
  sweepAABB,
  stepPhysics,
  aabbCollides,
} from './physics.js';

const [PW, PH, PD] = PLAYER_SIZE;

/** 박스가 어떤 solid 와도 겹치지 않는지(헬퍼). */
function clearOfSolid(g, pos) {
  return !aabbCollides(g, {
    minx: pos[0],
    miny: pos[1],
    minz: pos[2],
    maxx: pos[0] + PW,
    maxy: pos[1] + PH,
    maxz: pos[2] + PD,
  });
}

// ---------------------------------------------------------------------------
// 1. 중력 포물선 — 자유낙하 가속 + 점프 아치
// ---------------------------------------------------------------------------
test('상수: GRAVITY 양수, PLAYER_SIZE 0.6x1.8x0.6', () => {
  assert.ok(GRAVITY > 0);
  assert.deepEqual(PLAYER_SIZE, [0.6, 1.8, 0.6]);
});

test('중력: 공중 body 가 프레임마다 더 빨리 낙하(가속)하고 y 가 감소', () => {
  // 바닥/벽 없는 빈 공간(전부 공기).
  const g = makeVoxels(8, 64, 8, 0);
  let body = { pos: [4, 40, 4], vel: [0, 0, 0], onGround: false };

  const dt = 1 / 60;
  let prevY = body.pos[1];
  let prevFall = 0; // 직전 프레임의 낙하량(|Δy|)

  for (let i = 0; i < 30; i++) {
    const next = stepPhysics(g, body, {}, dt);
    const y = next.pos[1];

    // y 는 매 프레임 감소(아래로).
    assert.ok(y < prevY, `frame ${i}: y(${y}) 가 이전(${prevY})보다 작아야 함`);

    const fall = prevY - y; // 이번 프레임 낙하량
    if (i > 0) {
      // 가속: 이번 낙하량이 직전 낙하량보다 큼.
      assert.ok(
        fall > prevFall,
        `frame ${i}: 낙하량(${fall})이 가속해 이전(${prevFall})보다 커야 함`,
      );
    }
    // 낙하속도 |vy| 도 단조 증가.
    assert.ok(next.vel[1] < body.vel[1] + 1e-9, '수직속도 vy 가 더 음수(가속)');

    prevFall = fall;
    prevY = y;
    body = next;
  }
});

test('점프: 접지에서 점프하면 올라갔다가 정점 후 하강하는 아치', () => {
  // 바닥(y=0 평면 전체 돌) 위에 선 body.
  const g = makeVoxels(8, 64, 8, 0);
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) setVoxel(g, x, 0, z, 1); // y=0 한 층 바닥
  }
  // 바닥 표면 y=1 위에 서 있음.
  let body = { pos: [4, 1, 4], vel: [0, 0, 0], onGround: true };

  const dt = 1 / 60;
  // 첫 프레임에서 점프.
  body = stepPhysics(g, body, { jump: true }, dt);
  assert.ok(body.vel[1] > 0, '점프 직후 vy 가 위(양수)');

  const ys = [body.pos[1]];
  for (let i = 0; i < 120; i++) {
    body = stepPhysics(g, body, {}, dt);
    ys.push(body.pos[1]);
    if (body.onGround && i > 5) break; // 착지하면 종료
  }

  // 정점(최고 y)이 시작보다 높고, 시작과 끝 사이 어딘가에 있음(아치).
  const peak = Math.max(...ys);
  const peakIdx = ys.indexOf(peak);
  assert.ok(peak > 1 + 0.2, `정점(${peak})이 시작 높이보다 충분히 위`);
  assert.ok(peakIdx > 0, '정점이 출발 직후가 아님(올라가는 구간 존재)');
  assert.ok(peakIdx < ys.length - 1, '정점 이후 하강 구간 존재');

  // 정점 전은 상승(단조 증가에 가깝게), 정점 후는 하강.
  assert.ok(ys[peakIdx] > ys[0], '정점이 출발보다 높음');
  assert.ok(ys[ys.length - 1] < peak, '마지막 높이가 정점보다 낮음(내려옴)');
});

// ---------------------------------------------------------------------------
// 2. 관통 방지(터널링) — 초고속으로 벽에 돌진해도 면 앞에서 멈춤
// ---------------------------------------------------------------------------
test('터널링 방지: 초고속으로 벽에 돌진해도 solid 내부로 들어가지 않음(+x)', () => {
  const g = makeVoxels(64, 8, 8, 0);
  // x=20 에 두께 1, 높이/깊이 전체에 벽.
  for (let y = 0; y < 8; y++) {
    for (let z = 0; z < 8; z++) setVoxel(g, 20, y, z, 1);
  }

  // 벽 바로 앞(x≈10)에서 +x 로 엄청난 속도.
  const start = [10, 2, 3];
  assert.ok(clearOfSolid(g, start), '시작 위치가 solid 와 겹치지 않음');

  const box = {
    minx: start[0],
    miny: start[1],
    minz: start[2],
    maxx: start[0] + PW,
    maxy: start[1] + PH,
    maxz: start[2] + PD,
  };
  // dt 1초에 1000 단위/초 → 한 프레임에 1000칸 이동 시도(벽 한참 너머).
  const res = sweepAABB(g, box, [1000, 0, 0], 1);

  // 최종 박스가 어떤 solid 와도 겹치지 않음.
  assert.ok(clearOfSolid(g, res.pos), '관통 후에도 solid 와 안 겹침');
  // 벽(x=20) 면 바로 앞(maxx <= 20)에서 멈춤.
  assert.ok(res.pos[0] + PW <= 20 + 1e-3, `벽 면(20) 앞에서 멈춤(maxx=${res.pos[0] + PW})`);
  assert.ok(res.pos[0] + PW > 20 - 1, '벽 면 근처까지 전진(면 바로 앞)');
  // 충돌 축 속도는 0 으로 소거.
  assert.equal(res.vel[0], 0, 'x 속도 소거');
});

test('터널링 방지: -x 방향 초고속도 벽 면 뒤에서 멈춤', () => {
  const g = makeVoxels(64, 8, 8, 0);
  for (let y = 0; y < 8; y++) {
    for (let z = 0; z < 8; z++) setVoxel(g, 5, y, z, 1); // x=5 벽
  }
  const start = [40, 2, 3];
  const box = {
    minx: start[0], miny: start[1], minz: start[2],
    maxx: start[0] + PW, maxy: start[1] + PH, maxz: start[2] + PD,
  };
  const res = sweepAABB(g, box, [-1000, 0, 0], 1);
  assert.ok(clearOfSolid(g, res.pos), 'solid 와 안 겹침');
  // 벽의 +x 면은 x=6. minx >= 6.
  assert.ok(res.pos[0] >= 6 - 1e-3, `벽 면(6) 뒤에서 멈춤(minx=${res.pos[0]})`);
  assert.equal(res.vel[0], 0, 'x 속도 소거');
});

test('관통 방지: 낙하 중 바닥을 뚫지 않고 표면 위에 안착(onGround)', () => {
  const g = makeVoxels(8, 64, 8, 0);
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) setVoxel(g, x, 10, z, 1); // y=10 바닥
  }
  // 바닥 한참 위에서 초고속 낙하.
  const box = {
    minx: 4, miny: 50, minz: 4,
    maxx: 4 + PW, maxy: 50 + PH, maxz: 4 + PD,
  };
  const res = sweepAABB(g, box, [0, -10000, 0], 1);
  assert.ok(clearOfSolid(g, res.pos), '바닥을 안 뚫음');
  // 바닥 표면은 y=11. miny >= 11.
  assert.ok(res.pos[1] >= 11 - 1e-3, `바닥 표면(11) 위에 안착(miny=${res.pos[1]})`);
  assert.ok(res.onGround, '바닥 충돌로 onGround=true');
  assert.equal(res.vel[1], 0, '수직속도 소거');
});

// ---------------------------------------------------------------------------
// 3. 계단 스텝업 — 높이 1칸 장애물을 자동으로 올라서며 수평 진행 지속
// ---------------------------------------------------------------------------
test('스텝업: 높이 1칸 블록을 향해 이동하면 막히지 않고 올라서서 수평 진행', () => {
  const g = makeVoxels(16, 16, 8, 0);
  // y=0 바닥 전체.
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 8; z++) setVoxel(g, x, 0, z, 1);
  }
  // x>=8 구간은 한 칸 높은 계단 단(y=1) — 올라선 뒤 그 위를 계속 걷는다.
  for (let x = 8; x < 16; x++) {
    for (let z = 0; z < 8; z++) setVoxel(g, x, 1, z, 1);
  }

  // 바닥 표면 y=1 위에서 +x 로 걸어감.
  let body = { pos: [5, 1, 3], vel: [0, 0, 0], onGround: true };
  const dt = 1 / 60;
  const startX = body.pos[0];
  const startY = body.pos[1];

  // 충분한 프레임 동안 +x 로 이동(맵 끝 직전까지).
  for (let i = 0; i < 120; i++) {
    body = stepPhysics(g, body, { move: [4, 0] }, dt);
    assert.ok(clearOfSolid(g, body.pos), `frame ${i}: 항상 solid 와 안 겹침`);
  }

  // 계단(x=8)을 넘어 x 가 유의미하게 증가.
  assert.ok(
    body.pos[0] > 8.0,
    `계단(x=8)을 넘어 수평 진행 지속(x=${body.pos[0]})`,
  );
  // 한 칸 위(y≈2)로 올라섰음.
  assert.ok(
    body.pos[1] > startY + 0.5,
    `한 칸 위로 올라섬(y=${body.pos[1]}, 시작=${startY})`,
  );
  // 계단 위에 안착(y=2 표면).
  assert.ok(body.pos[1] >= 2 - 1e-2, `계단 표면(y=2) 위(y=${body.pos[1]})`);
  assert.ok(body.pos[0] > startX, '전체적으로 x 전진');
});

test('스텝업 불가: 높이 2칸 벽은 못 올라가고 앞에서 멈춤', () => {
  const g = makeVoxels(16, 16, 8, 0);
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 8; z++) setVoxel(g, x, 0, z, 1); // 바닥
  }
  // x=8 에 높이 2칸(y=1,2) 벽.
  for (let z = 0; z < 8; z++) {
    setVoxel(g, 8, 1, z, 1);
    setVoxel(g, 8, 2, z, 1);
  }
  let body = { pos: [5, 1, 3], vel: [0, 0, 0], onGround: true };
  const dt = 1 / 60;
  for (let i = 0; i < 240; i++) {
    body = stepPhysics(g, body, { move: [4, 0] }, dt);
    assert.ok(clearOfSolid(g, body.pos), `frame ${i}: solid 와 안 겹침`);
  }
  // 2칸 벽(x=8) 앞에서 멈춤 — maxx <= 8.
  assert.ok(body.pos[0] + PW <= 8 + 1e-2, `2칸 벽 앞에서 멈춤(maxx=${body.pos[0] + PW})`);
  // 올라가지 못함(여전히 바닥 표면 y≈1).
  assert.ok(body.pos[1] < 1.5, `못 올라감(y=${body.pos[1]})`);
});

test('스텝업: -z 방향 계단도 올라선다(축 대칭성)', () => {
  const g = makeVoxels(8, 16, 16, 0);
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 16; z++) setVoxel(g, x, 0, z, 1); // 바닥
  }
  // z<=6 구간은 한 칸 높은 계단 단(y=1) — -z 로 가면서 올라선다.
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z <= 6; z++) setVoxel(g, x, 1, z, 1);
  }

  let body = { pos: [3, 1, 10], vel: [0, 0, 0], onGround: true };
  const dt = 1 / 60;
  const startZ = body.pos[2];
  for (let i = 0; i < 120; i++) {
    body = stepPhysics(g, body, { move: [0, -4] }, dt);
    assert.ok(clearOfSolid(g, body.pos), `frame ${i}: solid 와 안 겹침`);
  }
  // 계단(z=6 의 -z 쪽) 을 넘어 z 가 유의미하게 감소하고 한 칸 올라섬.
  assert.ok(body.pos[2] < 7, `계단 넘어 -z 진행(z=${body.pos[2]})`);
  assert.ok(body.pos[1] > 1.5, `한 칸 위로(y=${body.pos[1]})`);
  assert.ok(body.pos[2] < startZ, '전체적으로 -z 전진');
});

// ---------------------------------------------------------------------------
// 보조: aabbCollides 정확성 (경계 정밀)
// ---------------------------------------------------------------------------
test('aabbCollides: 면에 정확히 붙은 박스는 겹침이 아님', () => {
  const g = makeVoxels(8, 8, 8, 0);
  setVoxel(g, 4, 0, 0, 1); // x:[4,5) solid
  // maxx == 4 인 박스(면에 정확히 붙음)는 겹침 아님.
  assert.equal(
    aabbCollides(g, { minx: 3, miny: 0, minz: 0, maxx: 4, maxy: 1, maxz: 1 }),
    false,
  );
  // 살짝 침범하면 겹침.
  assert.equal(
    aabbCollides(g, { minx: 3, miny: 0, minz: 0, maxx: 4.5, maxy: 1, maxz: 1 }),
    true,
  );
  assert.equal(voxelAt(g, 4, 0, 0), 1);
});
