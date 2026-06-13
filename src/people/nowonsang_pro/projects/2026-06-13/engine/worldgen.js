// 절차적 지형 생성 모듈 (AC8). 순수 ESM JavaScript + JSDoc.
// 외부 의존성 없음. UI 프레임워크/브라우저 전역 사용 금지 (purity 정적스캔 대상).
// 결정성: 시드 기반 PRNG(mulberry32 + xfnv hash)만 사용. 전역 난수 금지.
//
// 블록 id: 1=돌 2=잔디 3=흙 4=나무 5=잎 6=물 7=모래.
// 복셀 grid 는 raycast.js 의 makeVoxels 를 재사용한다.

import { makeVoxels, voxelAt, setVoxel } from './raycast.js';

/** xfnv: 문자열/숫자 시드를 32bit 해시 시드로 변환 (결정적). */
function xfnv(str) {
  let h = 0x811c9dc5 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * mulberry32 PRNG. seed(32bit uint) -> () => float in [0,1).
 * @param {number} seed
 * @returns {() => number}
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 정수 좌표 + 시드 -> [0,1) 결정적 해시값. */
function hash2(seed, x, y) {
  let h = seed >>> 0;
  h = Math.imul(h ^ (x | 0), 0x27d4eb2d) >>> 0;
  h = Math.imul(h ^ (y | 0), 0x165667b1) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/** 정수 3D 좌표 + 시드 -> [0,1) 결정적 해시값. */
function hash3(seed, x, y, z) {
  let h = seed >>> 0;
  h = Math.imul(h ^ (x | 0), 0x27d4eb2d) >>> 0;
  h = Math.imul(h ^ (y | 0), 0x165667b1) >>> 0;
  h = Math.imul(h ^ (z | 0), 0x9e3779b1) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/** smoothstep 보간 가중치 (3t^2 - 2t^3). */
function smooth(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 시드 기반 2D value-noise 생성기.
 * @param {number|string} seed
 * @returns {(x:number, z:number) => number}  반환값 [0,1].
 */
export function makeNoise2D(seed) {
  const s = xfnv(seed);
  return function (x, z) {
    const x0 = Math.floor(x);
    const z0 = Math.floor(z);
    const fx = x - x0;
    const fz = z - z0;
    const sx = smooth(fx);
    const sz = smooth(fz);
    const n00 = hash2(s, x0, z0);
    const n10 = hash2(s, x0 + 1, z0);
    const n01 = hash2(s, x0, z0 + 1);
    const n11 = hash2(s, x0 + 1, z0 + 1);
    const ix0 = lerp(n00, n10, sx);
    const ix1 = lerp(n01, n11, sx);
    return lerp(ix0, ix1, sz); // [0,1]
  };
}

/**
 * 시드 기반 3D value-noise 생성기.
 * @param {number|string} seed
 * @returns {(x:number, y:number, z:number) => number}  반환값 [0,1].
 */
export function makeNoise3D(seed) {
  const s = xfnv(seed);
  return function (x, y, z) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const z0 = Math.floor(z);
    const fx = x - x0;
    const fy = y - y0;
    const fz = z - z0;
    const sx = smooth(fx);
    const sy = smooth(fy);
    const sz = smooth(fz);
    const c000 = hash3(s, x0, y0, z0);
    const c100 = hash3(s, x0 + 1, y0, z0);
    const c010 = hash3(s, x0, y0 + 1, z0);
    const c110 = hash3(s, x0 + 1, y0 + 1, z0);
    const c001 = hash3(s, x0, y0, z0 + 1);
    const c101 = hash3(s, x0 + 1, y0, z0 + 1);
    const c011 = hash3(s, x0, y0 + 1, z0 + 1);
    const c111 = hash3(s, x0 + 1, y0 + 1, z0 + 1);
    const x00 = lerp(c000, c100, sx);
    const x10 = lerp(c010, c110, sx);
    const x01 = lerp(c001, c101, sx);
    const x11 = lerp(c011, c111, sx);
    const y0i = lerp(x00, x10, sy);
    const y1i = lerp(x01, x11, sy);
    return lerp(y0i, y1i, sz); // [0,1]
  };
}

/**
 * @typedef {Object} HeightmapOpts
 * @property {number} [octaves=4]      옥타브 수
 * @property {number} [scale=24]       기본 노이즈 스케일(좌표 나눔)
 * @property {number} [amplitude=20]   1옥타브 진폭(높이 단위)
 * @property {number} [persistence=0.5] 옥타브당 진폭 감쇠
 * @property {number} [lacunarity=2]   옥타브당 주파수 증가
 * @property {number} [baseHeight=8]   하한 오프셋
 */

/**
 * 여러 옥타브를 합쳐 비평탄 2D 하이트맵을 생성.
 * @param {number} sx
 * @param {number} sz
 * @param {number|string} seed
 * @param {HeightmapOpts} [opts]
 * @returns {{sx:number, sz:number, heights:number[]}}
 */
export function generateHeightmap(sx, sz, seed, opts = {}) {
  const octaves = opts.octaves ?? 4;
  const scale = opts.scale ?? 24;
  const amplitude = opts.amplitude ?? 20;
  const persistence = opts.persistence ?? 0.5;
  const lacunarity = opts.lacunarity ?? 2;
  const baseHeight = opts.baseHeight ?? 8;

  const noise = makeNoise2D(seed);
  const heights = new Array(sx * sz);

  for (let z = 0; z < sz; z++) {
    for (let x = 0; x < sx; x++) {
      let amp = amplitude;
      let freq = 1 / scale;
      let sum = 0;
      for (let o = 0; o < octaves; o++) {
        // noise -> [-1,1] 중심화하여 봉우리·골짜기 형성
        const n = noise(x * freq, z * freq) * 2 - 1;
        sum += n * amp;
        amp *= persistence;
        freq *= lacunarity;
      }
      heights[x + sx * z] = Math.round(baseHeight + amplitude + sum);
    }
  }
  return { sx, sz, heights };
}

/**
 * 높이값에 따른 지표면 블록 id 결정.
 * 낮으면 모래(7), 보통이면 잔디(2), 높으면 돌(1).
 * @param {number} height
 * @param {number} [seaLevel=10]
 * @returns {number} 블록 id
 */
export function blockIdForHeight(height, seaLevel = 10) {
  if (height <= seaLevel + 1) return 7; // 모래 (해안/저지대)
  if (height >= seaLevel + 22) return 1; // 돌 (고지대)
  return 2; // 잔디
}

/**
 * 바이옴/높이 기반 표면 블록 id (blockIdForHeight 의 좌표인지 별칭).
 * @param {number} x
 * @param {number} z
 * @param {number} height
 * @param {number|string} seed
 * @returns {number} 블록 id
 */
export function biomeColorAt(x, z, height, seed) {
  const n = makeNoise2D(seed)(x / 40, z / 40);
  const seaLevel = 9 + Math.round(n * 3);
  return blockIdForHeight(height, seaLevel);
}

/**
 * size^3 복셀 청크 생성. 하이트맵으로 지표면을 채우고
 * 3D 노이즈로 지표 아래 동굴(공기 포켓)을 판다. 완전 결정적.
 * @param {number} cx 청크 x 인덱스
 * @param {number} cy 청크 y 인덱스
 * @param {number} cz 청크 z 인덱스
 * @param {number} size 청크 한 변 크기
 * @param {number|string} seed
 * @returns {{sx:number, sy:number, sz:number, data:Uint8Array}}
 */
export function generateChunk(cx, cy, cz, size, seed) {
  const grid = makeVoxels(size, size, size, 0);

  const baseX = cx * size;
  const baseY = cy * size;
  const baseZ = cz * size;

  // 청크별 하이트맵 (월드 좌표 기준으로 결정적)
  const noise2 = makeNoise2D(seed);
  const noise3 = makeNoise3D('cave:' + seed);

  const octaves = 4;
  const scale = 24;
  const amplitude = 18;
  const baseHeight = 6;
  const persistence = 0.5;
  const lacunarity = 2;

  for (let lx = 0; lx < size; lx++) {
    for (let lz = 0; lz < size; lz++) {
      const wx = baseX + lx;
      const wz = baseZ + lz;

      let amp = amplitude;
      let freq = 1 / scale;
      let sum = 0;
      for (let o = 0; o < octaves; o++) {
        const n = noise2(wx * freq, wz * freq) * 2 - 1;
        sum += n * amp;
        amp *= persistence;
        freq *= lacunarity;
      }
      const surface = Math.round(baseHeight + amplitude + sum); // 월드 높이

      const surfaceBlock = blockIdForHeight(surface);

      for (let ly = 0; ly < size; ly++) {
        const wy = baseY + ly;
        if (wy > surface) continue; // 공기(하늘)

        let block;
        if (wy === surface) {
          block = surfaceBlock;
        } else if (wy >= surface - 3) {
          block = 3; // 흙
        } else {
          block = 1; // 돌
        }

        // 동굴: 지표 아래에서만 3D 노이즈가 임계 초과면 공기로 판다.
        if (wy < surface - 1) {
          const cave = noise3(wx * 0.12, wy * 0.12, wz * 0.12);
          if (cave > 0.62) {
            block = 0; // 동굴 공기 포켓
          }
        }

        setVoxel(grid, lx, ly, lz, block);
      }
    }
  }

  return grid;
}

/**
 * 청크 내부에서 상하좌우(또는 6면) 모두 solid 에 둘러싸인 air 포켓이 있는지 검사.
 * (테스트 보조용 결정적 헬퍼)
 * @param {{sx:number, sy:number, sz:number, data:Uint8Array}} g
 * @returns {number} 둘러싸인 air 복셀 개수
 */
export function countEnclosedAir(g) {
  let count = 0;
  for (let z = 1; z < g.sz - 1; z++) {
    for (let y = 1; y < g.sy - 1; y++) {
      for (let x = 1; x < g.sx - 1; x++) {
        if (voxelAt(g, x, y, z) !== 0) continue;
        const neighbors =
          voxelAt(g, x - 1, y, z) > 0 &&
          voxelAt(g, x + 1, y, z) > 0 &&
          voxelAt(g, x, y - 1, z) > 0 &&
          voxelAt(g, x, y + 1, z) > 0 &&
          voxelAt(g, x, y, z - 1) > 0 &&
          voxelAt(g, x, y, z + 1) > 0;
        if (neighbors) count++;
      }
    }
  }
  return count;
}
