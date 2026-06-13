// 순수 프레임버퍼 렌더러. 저해상 RGBA typed-array 에 픽셀당 광선 색을 직접 기록.
// 외부 UI 프레임워크/DOM 의존 없음 — 같은 함수를 UI 셸(putImageData)과 bench(node)가 공용.

import { castRay, rayDirection } from './raycast.js';

// 블록 id 별 기본 색(RGB). 0 미사용.
const PALETTE = [
  [0, 0, 0],
  [150, 150, 158], // 1 돌
  [110, 180, 85], // 2 잔디
  [165, 120, 72], // 3 흙
  [90, 140, 200], // 4 물
];

const SKY = [135, 180, 235];

// 면(법선)별 밝기 — 윗면 밝고 옆/아랫면 어둡게(입체감).
function faceShade(nx, ny, nz) {
  if (ny > 0) return 1; // 윗면
  if (ny < 0) return 0.45; // 아랫면
  if (nz !== 0) return 0.8; // 남북면
  return 0.62; // 동서면
}

/**
 * 한 프레임을 buf(RGBA, length=width*height*4)에 렌더. 각 픽셀마다 광선 1개.
 * 충돌하면 면 밝기 + 거리 감쇠, 미충돌이면 하늘색.
 */
export function renderFrame(buf, width, height, grid, cam) {
  const far = 48;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const [dx, dy, dz] = rayDirection(cam, px, py, width, height);
      const hit = castRay(grid, cam.x, cam.y, cam.z, dx, dy, dz, far);
      let r;
      let g;
      let b;
      if (hit) {
        const base = PALETTE[hit.block] ?? PALETTE[1];
        const shade = faceShade(hit.nx, hit.ny, hit.nz);
        const fog = Math.max(0.35, 1 - hit.distance / far);
        const k = shade * fog;
        r = base[0] * k;
        g = base[1] * k;
        b = base[2] * k;
      } else {
        r = SKY[0];
        g = SKY[1];
        b = SKY[2];
      }
      const idx = (py * width + px) * 4;
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = 255;
    }
  }
}
