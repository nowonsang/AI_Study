// 순수 3D 복셀 레이캐스팅 수학 모듈 (Amanatides-Woo Fast Voxel Traversal).
// 외부 UI 프레임워크/DOM 의존 없음 (purity 테스트로 단언).
// 좌표계: y = 위(up), x·z = 수평. yaw = y축 회전(0이면 +z 응시), pitch = 상하(+면 위).
//
// VoxelGrid: { sx, sy, sz, data:Uint8Array }  — 0 = 공기, 그 외 양수 = 블록 id. index = x + sx*(y + sy*z).
// Camera:    { x, y, z, yaw, pitch, fov }     — fov = 세로 FOV(라디안).
// RayHit:    { block, ix, iy, iz, nx, ny, nz, distance }

export function makeVoxels(sx, sy, sz, fill = 0) {
  const data = new Uint8Array(sx * sy * sz);
  if (fill !== 0) data.fill(fill);
  return { sx, sy, sz, data };
}

export function cloneVoxels(g) {
  return { sx: g.sx, sy: g.sy, sz: g.sz, data: new Uint8Array(g.data) };
}

/** 복셀 조회. 경계 밖은 공기(0) → 광선이 하늘로 빠져나갈 수 있음. */
export function voxelAt(g, x, y, z) {
  if (x < 0 || y < 0 || z < 0 || x >= g.sx || y >= g.sy || z >= g.sz) return 0;
  return g.data[x + g.sx * (y + g.sy * z)];
}

export function setVoxel(g, x, y, z, value) {
  if (x < 0 || y < 0 || z < 0 || x >= g.sx || y >= g.sy || z >= g.sz) return;
  g.data[x + g.sx * (y + g.sy * z)] = value;
}

/**
 * Amanatides-Woo 3D DDA. (ox,oy,oz)에서 (dx,dy,dz) 방향으로 광선을 쏴 첫 solid 복셀을 찾는다.
 * dir 이 단위벡터면 distance 는 유클리드 거리. 하늘로 빠지면(또는 maxDist 초과) null.
 */
export function castRay(g, ox, oy, oz, dx, dy, dz, maxDist = 64) {
  let ix = Math.floor(ox);
  let iy = Math.floor(oy);
  let iz = Math.floor(oz);

  const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
  const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
  const stepZ = dz > 0 ? 1 : dz < 0 ? -1 : 0;

  const tDeltaX = dx === 0 ? Infinity : Math.abs(1 / dx);
  const tDeltaY = dy === 0 ? Infinity : Math.abs(1 / dy);
  const tDeltaZ = dz === 0 ? Infinity : Math.abs(1 / dz);

  let tMaxX = dx === 0 ? Infinity : (dx > 0 ? ix + 1 - ox : ox - ix) * tDeltaX;
  let tMaxY = dy === 0 ? Infinity : (dy > 0 ? iy + 1 - oy : oy - iy) * tDeltaY;
  let tMaxZ = dz === 0 ? Infinity : (dz > 0 ? iz + 1 - oz : oz - iz) * tDeltaZ;

  let nx = 0;
  let ny = 0;
  let nz = 0;
  let t = 0;

  while (t <= maxDist) {
    const v = voxelAt(g, ix, iy, iz);
    if (v > 0) {
      return { block: v, ix, iy, iz, nx, ny, nz, distance: t };
    }
    if (tMaxX <= tMaxY && tMaxX <= tMaxZ) {
      ix += stepX;
      t = tMaxX;
      tMaxX += tDeltaX;
      nx = -stepX;
      ny = 0;
      nz = 0;
    } else if (tMaxY <= tMaxZ) {
      iy += stepY;
      t = tMaxY;
      tMaxY += tDeltaY;
      nx = 0;
      ny = -stepY;
      nz = 0;
    } else {
      iz += stepZ;
      t = tMaxZ;
      tMaxZ += tDeltaZ;
      nx = 0;
      ny = 0;
      nz = -stepZ;
    }
  }
  return null;
}

/** yaw·pitch → 정규화된 시선(forward) 벡터. yaw=0,pitch=0 → (0,0,1). */
export function forwardVector(yaw, pitch) {
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return [cp * Math.sin(yaw), sp, cp * Math.cos(yaw)];
}

/** 카메라 우측(right) 수평 벡터. */
export function rightVector(yaw) {
  return [Math.cos(yaw), 0, -Math.sin(yaw)];
}

/**
 * 화면 픽셀 (px,py) (0..width/height-1)에 대응하는 정규화된 광선 방향.
 * width=height=1, px=py=0 이면 정확히 forward 와 동일.
 */
export function rayDirection(cam, px, py, width, height) {
  const [fx, fy, fz] = forwardVector(cam.yaw, cam.pitch);
  const [rx, ry, rz] = rightVector(cam.yaw);
  // up = cross(forward, right)
  const ux = fy * rz - fz * ry;
  const uy = fz * rx - fx * rz;
  const uz = fx * ry - fy * rx;

  const aspect = width / height;
  const tanF = Math.tan(cam.fov / 2);
  const sxn = (2 * ((px + 0.5) / width) - 1) * aspect * tanF;
  const syn = (1 - 2 * ((py + 0.5) / height)) * tanF;

  const dx = fx + sxn * rx + syn * ux;
  const dy = fy + sxn * ry + syn * uy;
  const dz = fz + sxn * rz + syn * uz;
  const inv = 1 / Math.hypot(dx, dy, dz);
  return [dx * inv, dy * inv, dz * inv];
}
