// AC9: 청크 스트리밍 오라클 테스트. Node 내장 러너만 사용.
//   node --test tests/streaming.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createChunkManager,
  updateStreaming,
  activeKeys,
  isChunkActive,
  worldToChunk,
  chunkKey,
  parseChunkKey,
} from '../engine/chunks.js';

const CHUNK = 16;

/** 결정성 stub 생성기: 호출 좌표를 기록하는 가짜 청크를 만든다. */
function makeStubGenerator() {
  const calls = [];
  const generate = (cx, cy, cz) => {
    calls.push([cx, cy, cz]);
    return { cx, cy, cz, marker: `chunk-${cx}-${cy}-${cz}` };
  };
  return { generate, calls };
}

test('worldToChunk: 양수/음수/경계 모두 floor 나눗셈으로 매핑', () => {
  assert.deepEqual(worldToChunk(0, 0, 0, CHUNK), [0, 0, 0]);
  assert.deepEqual(worldToChunk(15, 0, 0, CHUNK), [0, 0, 0]);
  assert.deepEqual(worldToChunk(16, 0, 0, CHUNK), [1, 0, 0]);
  assert.deepEqual(worldToChunk(-1, 0, 0, CHUNK), [-1, 0, 0]);
  assert.deepEqual(worldToChunk(-16, 0, 0, CHUNK), [-1, 0, 0]);
  assert.deepEqual(worldToChunk(-17, 0, 0, CHUNK), [-2, 0, 0]);
});

test('chunkKey / parseChunkKey 왕복 (음수 포함)', () => {
  assert.equal(chunkKey(-3, 0, 7), '-3,0,7');
  assert.deepEqual(parseChunkKey('-3,0,7'), [-3, 0, 7]);
});

test('오라클 1: 로드/언로드 발생 — 초기 로드 후 멀리 이동 시 새 로드 + 기존 언로드', () => {
  const { generate, calls } = makeStubGenerator();
  const manager = createChunkManager({ chunkSize: CHUNK, renderDistance: 2, generate });

  // 초기 위치 (청크 0,0,0 부근)에서 첫 스트리밍.
  const first = updateStreaming(manager, { x: 8, y: 8, z: 8 });
  assert.ok(first.loaded.length > 0, '초기 위치에서 loaded > 0 이어야 함');
  assert.equal(first.unloaded.length, 0, '첫 호출에는 언로드할 게 없음');
  // 초기 활성 청크 키들을 기록.
  const initialKeys = new Set(activeKeys(manager));
  assert.ok(initialKeys.has('0,0,0'), '플레이어 청크가 활성에 있어야 함');

  // generate 가 loaded 수만큼 호출됐는지 (stub 생성기 검증).
  assert.equal(calls.length, first.loaded.length);

  // 플레이어를 아주 멀리 이동 (이전 반경과 전혀 겹치지 않도록 충분히 멀리).
  // 청크 0 근처 → 청크 100 근처. R=2 라 절대 겹치지 않음.
  const farPos = { x: 100 * CHUNK + 8, y: 100 * CHUNK + 8, z: 100 * CHUNK + 8 };
  const second = updateStreaming(manager, farPos);

  assert.ok(second.loaded.length > 0, '멀리 이동 후 새 청크 loaded > 0 이어야 함');
  assert.ok(second.unloaded.length > 0, '멀어진 기존 청크 unloaded > 0 이어야 함');

  // 멀어진 초기 청크들은 모두 언로드되어 활성 맵에 없어야 함.
  for (const key of initialKeys) {
    assert.equal(isChunkActiveByKey(manager, key), false, `초기 청크 ${key} 는 언로드돼야 함`);
  }

  // 새 위치 청크가 활성에 있어야 함.
  const [pcx, pcy, pcz] = worldToChunk(farPos.x, farPos.y, farPos.z, CHUNK);
  assert.ok(isChunkActive(manager, pcx, pcy, pcz), '새 플레이어 청크가 활성이어야 함');
});

test('오라클 2: 시야거리 — 반경 R 안의 모든 청크가 활성, 수 = (2R+1)^3', () => {
  const R = 2;
  const { generate } = makeStubGenerator();
  const manager = createChunkManager({ chunkSize: CHUNK, renderDistance: R, generate });

  const pos = { x: 8, y: 8, z: 8 }; // 청크 0,0,0
  updateStreaming(manager, pos);

  const [pcx, pcy, pcz] = worldToChunk(pos.x, pos.y, pos.z, CHUNK);
  const expectedCount = (2 * R + 1) ** 3;

  // 활성 청크 수가 정확히 (2R+1)^3 (하한 이상이며 동시에 정확히 이 값).
  assert.equal(manager.active.size, expectedCount, `활성 청크 수는 ${expectedCount} 여야 함`);
  assert.ok(manager.active.size >= expectedCount, '활성 청크 수 하한 충족');

  // 반경 안의 모든 청크가 빠짐없이 활성인지 (체비셰프 거리 <= R).
  for (let dz = -R; dz <= R; dz++) {
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        assert.ok(
          isChunkActive(manager, pcx + dx, pcy + dy, pcz + dz),
          `청크 (${pcx + dx},${pcy + dy},${pcz + dz}) 가 활성이어야 함`,
        );
      }
    }
  }

  // 반경 바로 밖(R+1)의 청크는 비활성.
  assert.equal(isChunkActive(manager, pcx + (R + 1), pcy, pcz), false, 'R+1 청크는 비활성');
});

test('오라클 3: 먼 청크 언로드 — 한 칸 이동 시 가장자리 청크가 활성 맵에서 제거', () => {
  const R = 2;
  const { generate } = makeStubGenerator();
  const manager = createChunkManager({ chunkSize: CHUNK, renderDistance: R, generate });

  // 청크 0,0,0 에서 시작.
  updateStreaming(manager, { x: 8, y: 8, z: 8 });

  // 가장 -x 가장자리에 있던 청크 (-R, 0, 0) 는 현재 활성.
  assert.ok(isChunkActive(manager, -R, 0, 0), '이동 전 -R 가장자리 청크는 활성');

  // +x 방향으로 청크 한 칸 이동 (청크 1,0,0 로). 이제 반경은 [-R+1 .. R+1].
  const moved = updateStreaming(manager, { x: 1 * CHUNK + 8, y: 8, z: 8 });

  // 새 가장자리 (R+1, 0, 0) 로드됨.
  assert.ok(moved.loaded.includes(chunkKey(R + 1, 0, 0)), '+x 새 가장자리 청크 로드');
  // 옛 가장자리 (-R, 0, 0) 는 R 밖으로 벗어나 언로드됨.
  assert.ok(moved.unloaded.includes(chunkKey(-R, 0, 0)), '-R 가장자리 청크 언로드');
  assert.equal(isChunkActive(manager, -R, 0, 0), false, '언로드된 청크는 활성 맵에 없어야 함');

  // 한 칸 이동이므로 슬랩 한 장씩만 교체: loaded·unloaded 각각 (2R+1)^2 개.
  const slab = (2 * R + 1) ** 2;
  assert.equal(moved.loaded.length, slab);
  assert.equal(moved.unloaded.length, slab);
  // 활성 총수는 변함없이 (2R+1)^3 유지.
  assert.equal(manager.active.size, (2 * R + 1) ** 3);
});

test('재호출 멱등성: 같은 위치 재스트리밍 시 loaded·unloaded 모두 0', () => {
  const { generate } = makeStubGenerator();
  const manager = createChunkManager({ chunkSize: CHUNK, renderDistance: 2, generate });
  updateStreaming(manager, { x: 8, y: 8, z: 8 });
  const again = updateStreaming(manager, { x: 8, y: 8, z: 8 });
  assert.equal(again.loaded.length, 0);
  assert.equal(again.unloaded.length, 0);
});

/** 키 문자열로 직접 활성 여부 확인하는 보조 (오라클 1에서 사용). */
function isChunkActiveByKey(manager, key) {
  return manager.active.has(key);
}
