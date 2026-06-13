// AC5: 내부 렌더 해상도 기준 N프레임 평균 프레임타임 → fps >= 30 단언.
// 순수 .js 엔진 모듈을 직접 import (루트 의존성 공유, 별도 패키지 없음). 실행: node bench/fps.mjs
import { createWorld } from '../engine/world.js';
import { renderFrame } from '../engine/render.js';

const W = Number(process.env.BENCH_W ?? 160);
const H = Number(process.env.BENCH_H ?? 100);
const FRAMES = Number(process.env.BENCH_FRAMES ?? 120);
const WARMUP = 20;

const world = createWorld();
const buf = new Uint8ClampedArray(W * H * 4);
const cam = { x: world.player.x, y: world.player.y, z: world.player.z, yaw: 0, pitch: 0, fov: world.fov };

function frame(i) {
  // 매 프레임 시점을 조금씩 돌려 실제 플레이/캐시 무효화 흉내
  cam.yaw = i * 0.02;
  cam.pitch = Math.sin(i * 0.05) * 0.2;
  renderFrame(buf, W, H, world.voxels, cam);
}

for (let i = 0; i < WARMUP; i++) frame(i);

let sink = 0;
const t0 = performance.now();
for (let i = 0; i < FRAMES; i++) {
  frame(i);
  sink += buf[(i * 37) % buf.length];
}
const t1 = performance.now();

const avgMs = (t1 - t0) / FRAMES;
const fps = 1000 / avgMs;
console.log(`res=${W}x${H} frames=${FRAMES} avgFrameTime=${avgMs.toFixed(3)}ms fps=${fps.toFixed(1)} (sink=${sink})`);

if (fps >= 30) {
  console.log('AC5 PASS');
  process.exit(0);
} else {
  console.error(`AC5 FAIL: fps ${fps.toFixed(1)} < 30`);
  process.exit(1);
}
