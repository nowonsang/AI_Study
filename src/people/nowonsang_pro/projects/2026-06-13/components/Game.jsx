// 얇은 셸: 게임 계산은 전부 순수 엔진 모듈(../engine) 호출. 여기서는 canvas·입력·루프만 담당.
// 루트 React/Vite 번들을 공유한다 (자체 package.json 없음).
import { useEffect, useRef, useState } from 'react';
import { renderFrame } from '../engine/render.js';
import {
  applyInput,
  applyLook,
  createGenWorld,
  deserialize,
  mineBlock,
  placeBlock,
  selectBlock,
  serialize,
} from '../engine/world.js';
import '../styles/game.css';

const STORE_KEY = 'ai-study.voxel.nowonsang_pro';
const WORLD_SEED = 1337;
const INTERNAL_W = 256;
const INTERNAL_H = 160;
const LOOK_SENS = 0.0024;

const KEY_TO_ACTION = {
  KeyW: 'forward',
  KeyS: 'back',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'up',
  ShiftLeft: 'down',
};

const BLOCK_NAMES = { 1: '돌', 2: '잔디', 3: '흙' };

function camOf(w) {
  return { x: w.player.x, y: w.player.y, z: w.player.z, yaw: w.player.yaw, pitch: w.player.pitch, fov: w.fov };
}

export default function Game() {
  const canvasRef = useRef(null);
  const worldRef = useRef(createGenWorld(WORLD_SEED));
  const keysRef = useRef(new Set());
  const lockedRef = useRef(false);
  const [hud, setHud] = useState({ inventory: worldRef.current.inventory, selected: worldRef.current.selectedBlock });
  const [locked, setLocked] = useState(false);

  const syncHud = () =>
    setHud({ inventory: { ...worldRef.current.inventory }, selected: worldRef.current.selectedBlock });

  // 렌더 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const image = ctx.createImageData(INTERNAL_W, INTERNAL_H);
    const buf = image.data;

    let raf = 0;
    let last = performance.now();

    const loop = (now) => {
      let dt = (now - last) / 1000;
      if (dt > 0.25) dt = 0.25; // 스파이럴 방지
      last = now;

      // 눌린 이동 키 적용 (dt 기반)
      let w = worldRef.current;
      for (const code of keysRef.current) {
        const action = KEY_TO_ACTION[code];
        if (action) w = applyInput(w, action, dt);
      }
      worldRef.current = w;

      renderFrame(buf, INTERNAL_W, INTERNAL_H, w.voxels, camOf(w));
      ctx.putImageData(image, 0, 0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  // 키 입력
  useEffect(() => {
    const onDown = (e) => {
      keysRef.current.add(e.code);
      if (e.code === 'Digit1') applySelect(1);
      else if (e.code === 'Digit2') applySelect(2);
      else if (e.code === 'Digit3') applySelect(3);
      if (KEY_TO_ACTION[e.code]) e.preventDefault();
    };
    const onUp = (e) => keysRef.current.delete(e.code);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  });

  const applySelect = (id) => {
    worldRef.current = selectBlock(worldRef.current, id);
    syncHud();
  };

  // 포인터락 마우스룩
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e) => {
      if (!lockedRef.current) return;
      worldRef.current = applyLook(worldRef.current, e.movementX * LOOK_SENS, -e.movementY * LOOK_SENS);
    };
    const onLockChange = () => {
      lockedRef.current = document.pointerLockElement === canvas;
      setLocked(lockedRef.current);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  });

  const onCanvasMouseDown = (e) => {
    if (!lockedRef.current) {
      canvasRef.current?.requestPointerLock();
      return;
    }
    e.preventDefault();
    if (e.button === 0) worldRef.current = mineBlock(worldRef.current);
    else if (e.button === 2) worldRef.current = placeBlock(worldRef.current);
    syncHud();
  };

  const save = () => {
    localStorage.setItem(STORE_KEY, serialize(worldRef.current));
    syncHud();
  };
  const load = () => {
    const s = localStorage.getItem(STORE_KEY);
    if (s) {
      worldRef.current = deserialize(s);
      syncHud();
    }
  };
  const reset = () => {
    worldRef.current = createGenWorld(WORLD_SEED);
    syncHud();
  };

  return (
    <div className="vx-root">
      <h2 className="vx-title">3D Voxel Raycaster — nowonsang_pro</h2>
      <div className="vx-stage">
        <canvas
          ref={canvasRef}
          width={INTERNAL_W}
          height={INTERNAL_H}
          className="vx-canvas"
          onMouseDown={onCanvasMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="vx-crosshair" />
        {!locked && (
          <div className="vx-hint">
            캔버스 클릭 → 마우스룩 시작 · WASD 이동 · Space/Shift 상하 · 좌클릭 채굴 · 우클릭 설치
          </div>
        )}
      </div>
      <div className="vx-hud">
        <div className="vx-inv">
          {[1, 2, 3].map((id) => (
            <span key={id} className={'vx-slot' + (hud.selected === id ? ' vx-slot-on' : '')}>
              {id}. {BLOCK_NAMES[id]} × {hud.inventory[id] ?? 0}
            </span>
          ))}
        </div>
        <div className="vx-actions">
          <button onClick={save}>저장</button>
          <button onClick={load}>불러오기</button>
          <button onClick={reset}>리셋</button>
        </div>
      </div>
    </div>
  );
}
