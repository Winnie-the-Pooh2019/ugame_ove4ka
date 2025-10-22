import { VW, VH, ASSET_PATHS, PROGRESSION } from './config.js';
import { clamp } from './utils.js';
import { loadAssets } from './assets.js';
import { blip } from './audio.js';
import { drawBackground, drawPlayerSheep, drawObstacle } from './draw.js';
import { getPlayerHitbox, getObstacleHitbox, aabb } from './hitbox.js';
import { spawnObstacle, updateObstacles } from './obstacles.js';
import { setupInput } from './input.js';
import { createState, resetGame } from './state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const elScore = document.getElementById('score');
const elHi = document.getElementById('hi');
const elMsg = document.getElementById('msg');
const elPause = document.getElementById('pause');
const elGameOver = document.getElementById('gameover');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const jumpBtn = document.getElementById('jumpBtn');
const duckBtn = document.getElementById('duckBtn');

const state = createState();
let IMGS = {};
let lastTs = performance.now();

// Ассеты
loadAssets(ASSET_PATHS).then(imgs => { IMGS = imgs; });

// DPR
function setupCanvas() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  canvas.style.width = 'min(96vw, 960px)';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
setupCanvas();
window.addEventListener('resize', setupCanvas);

// Input
const input = setupInput(
  {
    onPause: () => {
      if (!state.started || state.gameOver) return;
      state.running = !state.running;
      elPause.classList.toggle('hidden', state.running);
    },
    onRestart: () => {
      if (!state.started) return;
      resetGame(state);
      state.running = true;
      elPause.classList.add('hidden');
      elGameOver.classList.add('hidden');
    },
    onToggleHitbox: () => {
      state.debug.showBoxes = !state.debug.showBoxes;
    }
  },
  { jumpBtn, duckBtn }
);

// Вспомогательное: аспект изображения
function getAspect(key, fallback=1) {
  const img = IMGS[key];
  const w = img?.naturalWidth || img?.width;
  const h = img?.naturalHeight || img?.height;
  return w && h ? w/h : fallback;
}

// Старт/рестарт
startBtn.addEventListener('click', () => {
  state.started = true;
  state.running = true;
  elMsg.classList.add('hidden');
  resetGame(state);
});
restartBtn.addEventListener('click', () => {
  resetGame(state);
  state.running = true;
  elPause.classList.add('hidden');
  elGameOver.classList.add('hidden');
});

elHi.textContent = 'HI ' + state.hiScore.toString();

// Цикл
function update(dt) {
  if (!state.running) return;

  // Ускорение
  state.speed = clamp(state.speed + state.accelPerSec * 60 * dt, 220, state.maxSpeed);
  state.obstInterval = clamp(
    PROGRESSION.obstIntervalBase - (state.speed - PROGRESSION.speedStart) / 900,
    0.55, PROGRESSION.obstIntervalBase
  );

  const p = state.player;
  const wantJump = input.wantJump();
  const wantDuck = input.wantDuck();

  if (wantJump && p.onGround) {
    p.vy = state.jumpVel;
    p.onGround = false;
    blip(880, 0.05, 0.02);
  }
  p.duck = wantDuck && p.onGround;
  if (!p.onGround && wantDuck) p.vy += state.gravity * 0.35 * dt;

  // Физика игрока
  p.vy += state.gravity * dt;
  p.vy = clamp(p.vy, -2000, state.maxFall);
  p.y  += p.vy * dt;

  // Приземление
  const groundY = state.metrics.groundY;
  if (p.y + p.h >= groundY) {
    p.y = groundY - p.h;
    p.vy = 0;
    p.onGround = true;
  } else {
    p.onGround = false;
  }

  // Спавн препятствий
  state.obstTimer -= dt;
  if (state.obstTimer <= 0) {
    state.obstTimer = Math.random() * (state.obstInterval*1.4 - state.obstInterval*0.7) + state.obstInterval*0.7;
    spawnObstacle(state, IMGS, getAspect);
  }

  // Движение препятствий
  updateObstacles(state, dt);

  // Счёт
  state.score += state.speed * dt * 0.05;

  // Столкновения
  const hbPlayer = getPlayerHitbox(p);
  for (const o of state.obstacles) {
    const hbObs = getObstacleHitbox(o);
    if (aabb(hbPlayer, hbObs)) {
      endGame();
      break;
    }
  }

  // HUD
  elScore.textContent = Math.floor(state.score).toString();
  elHi.textContent = 'HI ' + state.hiScore.toString();
}

function render(dt) {
  ctx.clearRect(0, 0, VW, VH);
  drawBackground(ctx, state, dt);
  state.obstacles.forEach(o => drawObstacle(ctx, state, o, IMGS));
  drawPlayerSheep(ctx, state, IMGS);

  // «Z»
  if (state.player.onGround) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = '12px system-ui';
    const t = performance.now() * 0.003;
    ctx.save();
    ctx.translate(state.player.x + 14 + Math.sin(t)*4, state.player.y - 16 - Math.abs(Math.cos(t*2))*2);
    ctx.fillText('z', 0, 0);
    ctx.restore();
  }
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
  lastTs = ts;

  if (state.started && !state.gameOver) update(dt);
  render(dt);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function endGame() {
  state.running = false;
  state.gameOver = true;
  elGameOver.classList.remove('hidden');
  if (Math.floor(state.score) > state.hiScore) {
    state.hiScore = Math.floor(state.score);
    localStorage.setItem('sleepSheep.hi', String(state.hiScore));
    blip(660, 0.08, 0);
    setTimeout(() => blip(990, 0.1, 0), 100);
  } else {
    blip(140, 0.08, -12);
  }
}