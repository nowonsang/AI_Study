// AC9: 청크 스트리밍 매니저. 플레이어 위치 기준으로 시야거리(renderDistance) 안의
// 청크를 로드(없으면 주입된 generate 콜백 호출)하고, 밖의 청크를 언로드한다.
// 외부 UI 프레임워크/DOM 의존 없음 (purity 정적스캔으로 단언).
//
// 독립성: worldgen 을 직접 import 하지 않고 generate(cx,cy,cz) 콜백을 주입받는다.
//         → 테스트에서 stub 생성기로 검증 가능, 병렬 충돌 없음.
//
// ChunkManager: { chunkSize, renderDistance, generate, active: Map<key, chunk> }
//   - chunkSize:      한 청크의 한 변 셀 수 (정수, >0)
//   - renderDistance: 청크 단위 반경 R (체비셰프/박스 거리)
//   - generate:       (cx,cy,cz) => 청크 데이터 (임의 형태) — 매니저는 내용을 해석하지 않음
//   - active:         "cx,cy,cz" 키 → 청크 데이터 맵
//
// 좌표계: 월드 좌표를 chunkSize 로 나눠 내림(floor) → 청크 좌표.

/**
 * 청크 키 문자열. 음수 좌표도 안전하게 구분된다.
 * @param {number} cx
 * @param {number} cy
 * @param {number} cz
 * @returns {string}
 */
export function chunkKey(cx, cy, cz) {
  return `${cx},${cy},${cz}`;
}

/**
 * 키 문자열 → [cx,cy,cz] 정수 배열.
 * @param {string} key
 * @returns {[number, number, number]}
 */
export function parseChunkKey(key) {
  const parts = key.split(',');
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

/**
 * 월드 좌표 (wx,wy,wz) 가 속한 청크 좌표 [cx,cy,cz].
 * floor 나눗셈이라 음수 영역도 연속적으로 매핑된다.
 * @param {number} wx
 * @param {number} wy
 * @param {number} wz
 * @param {number} chunkSize
 * @returns {[number, number, number]}
 */
export function worldToChunk(wx, wy, wz, chunkSize) {
  return [
    Math.floor(wx / chunkSize),
    Math.floor(wy / chunkSize),
    Math.floor(wz / chunkSize),
  ];
}

/**
 * 청크 매니저 생성. 상태는 캡슐화된 객체(active Map)로 보유한다.
 * @param {{ chunkSize:number, renderDistance:number, generate:(cx:number,cy:number,cz:number)=>any }} opts
 * @returns {{ chunkSize:number, renderDistance:number, generate:Function, active:Map<string,any> }}
 */
export function createChunkManager({ chunkSize, renderDistance, generate }) {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive integer');
  }
  if (!Number.isInteger(renderDistance) || renderDistance < 0) {
    throw new Error('renderDistance must be a non-negative integer');
  }
  if (typeof generate !== 'function') {
    throw new Error('generate must be a function (cx,cy,cz) => chunk');
  }
  return {
    chunkSize,
    renderDistance,
    generate,
    active: new Map(),
  };
}

/**
 * 현재 활성 청크 키 목록.
 * @param {{active:Map<string,any>}} manager
 * @returns {string[]}
 */
export function activeKeys(manager) {
  return [...manager.active.keys()];
}

/**
 * 특정 청크가 활성 상태인지.
 * @param {{active:Map<string,any>}} manager
 * @param {number} cx
 * @param {number} cy
 * @param {number} cz
 * @returns {boolean}
 */
export function isChunkActive(manager, cx, cy, cz) {
  return manager.active.has(chunkKey(cx, cy, cz));
}

/**
 * 플레이어 청크 기준 반경 R(체비셰프) 안의 모든 청크 키 집합.
 * (2R+1)^3 개의 키.
 * @param {[number,number,number]} center [pcx,pcy,pcz]
 * @param {number} r
 * @returns {Set<string>}
 */
function desiredKeys([pcx, pcy, pcz], r) {
  const set = new Set();
  for (let dz = -r; dz <= r; dz++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        set.add(chunkKey(pcx + dx, pcy + dy, pcz + dz));
      }
    }
  }
  return set;
}

/**
 * 플레이어 위치 기준으로 스트리밍 갱신.
 * - R 반경(체비셰프) 안에 없는 활성 청크 → 언로드
 * - R 반경 안에 있는데 비활성인 청크 → generate 호출 후 로드
 * 매니저 상태(active Map)를 제자리 갱신하고 같은 매니저 참조를 반환한다.
 *
 * @param {{chunkSize:number,renderDistance:number,generate:Function,active:Map<string,any>}} manager
 * @param {{x:number,y:number,z:number}} playerPos
 * @returns {{ manager:object, loaded:string[], unloaded:string[] }}
 */
export function updateStreaming(manager, playerPos) {
  const r = manager.renderDistance;
  const center = worldToChunk(playerPos.x, playerPos.y, playerPos.z, manager.chunkSize);
  const want = desiredKeys(center, r);

  const loaded = [];
  const unloaded = [];

  // 언로드: 원하지 않는데 활성인 청크.
  for (const key of [...manager.active.keys()]) {
    if (!want.has(key)) {
      manager.active.delete(key);
      unloaded.push(key);
    }
  }

  // 로드: 원하는데 비활성인 청크.
  for (const key of want) {
    if (!manager.active.has(key)) {
      const [cx, cy, cz] = parseChunkKey(key);
      const chunk = manager.generate(cx, cy, cz);
      manager.active.set(key, chunk);
      loaded.push(key);
    }
  }

  return { manager, loaded, unloaded };
}
