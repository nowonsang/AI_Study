// 순수 프레임버퍼 렌더러. 저해상 RGBA typed-array 에 픽셀당 광선 색을 직접 기록.
// 외부 UI 프레임워크/DOM 의존 없음 — 같은 함수를 UI 셸(putImageData)과 bench(node)가 공용.

import { castRay, rayDirection } from './raycast.js';
import { sampleBlockColor } from './atlas.js';

const SKY = [135, 180, 235];

// 히트 법선(nx,ny,nz) → 아틀라스 면 식별자.
function normalToFace(nx, ny, nz) {
  if (ny > 0) return '+y';
  if (ny < 0) return '-y';
  if (nx > 0) return '+x';
  if (nx < 0) return '-x';
  if (nz > 0) return '+z';
  return '-z';
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
        // 아틀라스: 블록·면별 색 + 면 방향 셰이딩(top>side>bottom)이 이미 반영됨.
        const col = sampleBlockColor(hit.block, normalToFace(hit.nx, hit.ny, hit.nz));
        const fog = Math.max(0.35, 1 - hit.distance / far);
        r = col[0] * fog;
        g = col[1] * fog;
        b = col[2] * fog;
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
