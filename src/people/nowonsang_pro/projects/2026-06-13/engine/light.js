// 순수 복셀 조명 모듈 (AO + 광원 BFS 전파). 외부 UI/DOM/프레임워크 의존 없음.
// 복셀 API는 ./raycast.js 재사용. 0 = 공기, 그 외 양수 = solid.
// AO(Ambient Occlusion): 면 주변 이웃 solid 개수로 어둡기 계수 산출.
// floodLight: 공기 복셀을 통해 광원 레벨을 BFS로 전파(거리마다 1 감쇠), solid는 차단.

import { voxelAt } from './raycast.js';

/**
 * 면(face) 법선 방향. 6면:
 *  '+x' '-x' '+y' '-y' '+z' '-z'  (또는 'px','nx',... 별칭 허용)
 * @type {Record<string, [number,number,number]>}
 */
const FACE_NORMALS = {
  '+x': [1, 0, 0], px: [1, 0, 0],
  '-x': [-1, 0, 0], nx: [-1, 0, 0],
  '+y': [0, 1, 0], py: [0, 1, 0],
  '-y': [0, -1, 0], ny: [0, -1, 0],
  '+z': [0, 0, 1], pz: [0, 0, 1],
  '-z': [0, 0, -1], nz: [0, 0, -1],
};

/**
 * 면의 두 접선축(법선과 직교하는 두 단위축)을 반환.
 * @param {[number,number,number]} n 법선
 * @returns {[[number,number,number],[number,number,number]]} [u, v]
 */
function tangents(n) {
  const [nx, ny, nz] = n;
  // 법선이 y축이면 접선은 x,z. x축이면 y,z. z축이면 x,y.
  if (nx !== 0) return [[0, 1, 0], [0, 0, 1]];
  if (ny !== 0) return [[1, 0, 0], [0, 0, 1]];
  return [[1, 0, 0], [0, 1, 0]];
}

/**
 * 면 AO 계수. 해당 복셀의 face 면이 바깥(법선 방향)으로 노출돼 있다고 보고,
 * 법선 방향으로 한 칸 나간 평면(면이 바라보는 빈 공간)에서
 * 면을 둘러싼 이웃 solid 개수를 세어 어둡기를 계산한다.
 *
 * 검사 대상: 면 바깥쪽 평면의 4 변(edge) 이웃. solid가 많을수록(오목할수록) 어둡다.
 * 반환: 1 = 완전 밝음(이웃 없음) ~ 0 = 가장 어두움(이웃 가득).
 *
 * @param {{sx:number,sy:number,sz:number,data:Uint8Array}} grid
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {string} face '+x'|'-x'|'+y'|'-y'|'+z'|'-z'
 * @returns {number} AO 계수 [0,1]
 */
export function computeAO(grid, x, y, z, face) {
  const n = FACE_NORMALS[face];
  if (!n) throw new Error(`computeAO: unknown face "${face}"`);
  const [nx, ny, nz] = n;
  // 면 바깥쪽 한 칸(법선 방향)을 기준 셀로 삼는다.
  const ox = x + nx;
  const oy = y + ny;
  const oz = z + nz;

  const [u, v] = tangents(n);
  // 면 평면의 4 변(edge) 이웃: +u, -u, +v, -v. solid면 가림(occlude).
  let occ = 0;
  const dirs = [
    [u[0], u[1], u[2]],
    [-u[0], -u[1], -u[2]],
    [v[0], v[1], v[2]],
    [-v[0], -v[1], -v[2]],
  ];
  for (const d of dirs) {
    if (voxelAt(grid, ox + d[0], oy + d[1], oz + d[2]) !== 0) occ += 1;
  }
  // occ: 0~4. 4변 모두 막히면 0(가장 어두움), 없으면 1(밝음).
  return 1 - occ / 4;
}

/**
 * 좌표 정수 3D를 단일 키로 패킹. (BFS 방문맵 키)
 * @param {number} x @param {number} y @param {number} z
 * @returns {string}
 */
function key(x, y, z) {
  return `${x},${y},${z}`;
}

/** 6-이웃 오프셋. */
const NEIGHBORS = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1],
];

/**
 * BFS flood-fill 광원 전파. 공기 복셀을 통해 광원 레벨을 퍼뜨리고
 * BFS 깊이(전파 칸수)마다 1씩 감쇠한다. solid 복셀은 빛을 막는다(전파 안 됨).
 * 여러 광원이 있으면 각 셀은 도달 가능한 최대 레벨을 가진다(밝은 쪽 우선).
 *
 * 햇빛(여러 소스를 최상단에 두고 level 높게)과 블록광(점광원) 공용.
 *
 * @param {{sx:number,sy:number,sz:number,data:Uint8Array}} grid
 * @param {Array<{x:number,y:number,z:number,level:number}>} sources 광원 목록
 * @param {{minLevel?:number}} [opts] minLevel: 이 값 이하로는 전파 중단(기본 0)
 * @returns {Map<string,number>} "x,y,z" -> 광량 레벨(>= minLevel+? 단조 감소)
 */
export function floodLight(grid, sources, opts = {}) {
  const minLevel = opts.minLevel ?? 0;
  /** @type {Map<string, number>} */
  const light = new Map();
  /** @type {Array<[number,number,number,number]>} */
  let frontier = [];

  // 시드: 광원이 공기 셀이고 level이 더 높을 때만 등록.
  for (const s of sources) {
    const lvl = s.level | 0;
    if (lvl <= minLevel) continue;
    if (!inBounds(grid, s.x, s.y, s.z)) continue;
    if (voxelAt(grid, s.x, s.y, s.z) !== 0) continue; // solid 광원 셀은 전파 시작점 무효
    const k = key(s.x, s.y, s.z);
    const prev = light.get(k);
    if (prev === undefined || lvl > prev) {
      light.set(k, lvl);
      frontier.push([s.x, s.y, s.z, lvl]);
    }
  }

  // BFS 레벨별 처리: 매 깊이마다 1씩 감쇠.
  while (frontier.length > 0) {
    /** @type {Array<[number,number,number,number]>} */
    const next = [];
    for (const [cx, cy, cz, cl] of frontier) {
      const nl = cl - 1; // 이웃으로 갈 때 1 감쇠
      if (nl <= minLevel) continue;
      for (const [dx, dy, dz] of NEIGHBORS) {
        const nx = cx + dx;
        const ny = cy + dy;
        const nz = cz + dz;
        if (!inBounds(grid, nx, ny, nz)) continue;
        if (voxelAt(grid, nx, ny, nz) !== 0) continue; // solid 차단
        const k = key(nx, ny, nz);
        const prev = light.get(k);
        if (prev === undefined || nl > prev) {
          light.set(k, nl);
          next.push([nx, ny, nz, nl]);
        }
      }
    }
    frontier = next;
  }

  return light;
}

/**
 * 경계 내부 여부.
 * @param {{sx:number,sy:number,sz:number}} g
 * @param {number} x @param {number} y @param {number} z
 * @returns {boolean}
 */
function inBounds(g, x, y, z) {
  return x >= 0 && y >= 0 && z >= 0 && x < g.sx && y < g.sy && z < g.sz;
}
