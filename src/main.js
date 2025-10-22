import { VW, VH, ASSET_PATHS, PROGRESSION, SHEEP_ANIM } from './config.js';
import { clamp } from './utils.js';
import { loadAssets } from './assets.js';
import { blip } from './audio.js';
import { drawBackground, drawPlayerSheep, drawObstacle } from './draw.js';
import { getPlayerHitbox, getObstacleHitbox, aabb } from './hitbox.js';
import { spawnObstacle, updateObstacles } from './obstacles.js';
import { setupInput } from './input.js';
import { createState, resetGame } from './state.js';
import { getPlayer, canEnterName, registerProfile, submitScore, fetchLeaderboard, changeProfile } from './leaderboard.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const elScore = document.getElementById('score');
const elHi = document.getElementById('hi');
const startBtn = document.getElementById('startBtn');
const jumpBtn = document.getElementById('jumpBtn');
const duckBtn = document.getElementById('duckBtn');
const elPlayerName = document.getElementById('playerNameHud');

const lbList = document.getElementById('lbList');
const lbTotal = document.getElementById('lbTotal');

const nameModal = document.getElementById('nameModal');
const nameTitle = document.getElementById('nameTitle');
const nameDesc = document.getElementById('nameDesc');
const nameInput = document.getElementById('nameModalInput');
const groupInput = document.getElementById('groupModalInput');
const nameError = document.getElementById('nameError');
const nameSaveBtn = document.getElementById('nameSaveBtn');
const nameCancelBtn = document.getElementById('nameCancelBtn');

const menuModal = document.getElementById('menuModal');

const failModal = document.getElementById('failModal');
const failCard = document.getElementById('failCard');
const failTitle = document.getElementById('failTitle');
const failBadge = document.getElementById('failBadge');
const failScoreEl = document.getElementById('failScore');
const failRestartBtn = document.getElementById('failRestartBtn');
const failMenuBtn = document.getElementById('failMenuBtn');

const state = createState();
let IMGS = {};
let lastTs = performance.now();

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
    { onToggleHitbox: () => { state.debug.showBoxes = !state.debug.showBoxes; } },
    { jumpBtn, duckBtn }
);

// Helpers: UI
function setNameError(msg='') {
  nameError.textContent = msg || '';
  const isGroup = /групп|group/i.test(msg);
  nameInput.classList.toggle('invalid', !!msg && !isGroup);
  groupInput.classList.toggle('invalid', !!msg && isGroup);
}
function openNameModal(mode='register') {
  nameModal.dataset.mode = mode;
  if (mode === 'register') {
    nameTitle.textContent = 'Введите имя и группу';
    nameDesc.textContent = 'Имя: буквы и пробелы. Группа: буквы, цифры и дефис “-” (автоматически upper-case).';
    nameInput.value = '';
    groupInput.value = '';
  } else {
    const me = getPlayer();
    nameTitle.textContent = 'Сменить имя и/или группу';
    nameDesc.textContent = 'Имя: буквы и пробелы. Группа: буквы, цифры и дефис “-”.';
    nameInput.value = me?.name || '';
    groupInput.value = me?.group || '';
  }
  nameCancelBtn?.classList.toggle('hidden', mode === 'register');

  setNameError('');
  nameModal.classList.remove('hidden');
  menuModal.classList.add('hidden');
  closeFail();
  nameInput.focus();
}
function closeNameModal() { nameModal.classList.add('hidden'); }
function openMenu() { menuModal.classList.remove('hidden'); closeFail(); }
function closeMenu() { menuModal.classList.add('hidden'); }

// Экран поражения
function openFail(score=0, isRecord=false) {
  if (failScoreEl) failScoreEl.textContent = Math.floor(score).toString();
  failBadge?.classList.toggle('hidden', !isRecord);
  failCard?.classList.toggle('record', !!isRecord);
  failModal?.classList.remove('hidden');
  closeMenu();
}
function closeFail() { failModal?.classList.add('hidden'); }

// Форматирование очков: 12 345
function formatScore(n) {
  const s = Math.floor(Number(n) || 0).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // thin space
}

// Скелетон-лидерборд
function showLbLoading(count = 8) {
  lbList.classList.add('loading');
  lbList.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const li = document.createElement('li');
    li.className = 'lb-item skeleton';
    li.innerHTML = `
      <div class="rank">—</div>
      <div class="who">
        <span class="name">██████████</span>
        <span class="group">████</span>
      </div>
      <div class="score">0000</div>
    `;
    lbList.appendChild(li);
  }
}

// Рендер лидерборда (glass версии)
function renderLeaderboardUI(top10 = [], total = 0) {
  lbList.classList.remove('loading');
  lbList.innerHTML = '';

  const me = getPlayer();

  top10.forEach((item, idx) => {
    const li = document.createElement('li');
    const topClass = idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : '';
    const isMe = me && item.name === me.name;

    li.className = `lb-item ${topClass} ${isMe ? 'me' : ''}`.trim();
    li.innerHTML = `
      <div class="rank">${idx + 1}</div>
      <div class="who">
        <span class="name" title="${item.name}">${item.name}</span>
        ${item.group ? `<span class="group" title="${item.group}">${item.group}</span>` : ''}
      </div>
      <div class="score" title="${item.score}">${formatScore(item.score)}</div>
    `;
    lbList.appendChild(li);
  });

  lbTotal.textContent = `Участников: ${total}`;
}

async function refreshLeaderboard() {
  showLbLoading(8);
  try {
    const { top10, total } = await fetchLeaderboard(10);
    renderLeaderboardUI(top10, total);
  } catch {
    renderLeaderboardUI([], 0);
  }
}

function applyPlayerUI() {
  const p = getPlayer();
  const hi = p?.best ? Math.floor(p.best) : 0;
  state.hiScore = hi;
  elHi.textContent = 'HI ' + hi;

  const header = p ? `${p.group} · ${p.name}` : '—';
  elPlayerName.textContent = header;
  elPlayerName.title = p ? 'Нажмите, чтобы изменить имя/группу' : 'Укажите имя и группу';
}

// Сохранение профиля
async function submitName() {
  const mode = nameModal.dataset.mode || 'register';
  const rawName = nameInput.value || '';
  const rawGroup = groupInput.value || '';
  setNameError('');
  nameSaveBtn.disabled = true;

  try {
    if (mode === 'register') {
      const res = await registerProfile(rawName, rawGroup);
      if (!res.ok) {
        if (res.reason === 'NAME_TAKEN') return setNameError('Такое имя уже занято.');
        if (res.reason === 'BAD_NAME' || res.reason === 'EMPTY_NAME') return setNameError('Недопустимое имя. Разрешены буквы и пробел.');
        if (res.reason === 'BAD_GROUP' || res.reason === 'EMPTY_GROUP') return setNameError('Недопустимая группа. Разрешены буквы, цифры и дефис “-”.');
        return setNameError('Не удалось сохранить. Попробуйте позже.');
      }
      closeNameModal();
      applyPlayerUI();
      await refreshLeaderboard();
      openMenu();
    } else {
      const res = await changeProfile(rawName, rawGroup);
      if (!res.ok) {
        if (res.reason === 'NAME_TAKEN') return setNameError('Такое имя уже занято.');
        if (res.reason === 'BAD_NAME' || res.reason === 'EMPTY_NAME') return setNameError('Недопустимое имя. Разрешены буквы и пробел.');
        if (res.reason === 'BAD_GROUP' || res.reason === 'EMPTY_GROUP') return setNameError('Недопустимая группа. Разрешены буквы, цифры и дефис “-”.');
        if (res.reason === 'NO_SESSION') return setNameError('Сессия не найдена. Перезагрузите страницу.');
        return setNameError('Не удалось изменить. Попробуйте позже.');
      }
      closeNameModal();
      applyPlayerUI();
      await refreshLeaderboard();
      if (!state.started || state.gameOver) openMenu();
    }
  } finally {
    nameSaveBtn.disabled = false;
  }
}

// Слушатели модалок
nameSaveBtn.addEventListener('click', submitName);
nameCancelBtn.addEventListener('click', () => {
  if (canEnterName()) {
    setNameError('Чтобы начать игру, укажите имя и группу.');
    nameInput.focus();
  } else {
    closeNameModal();
    openMenu();
  }
});
[nameInput, groupInput].forEach(inp => {
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submitName(); }
    else if (e.key === 'Escape') {
      const mode = nameModal.dataset.mode || 'register';
      if (mode === 'change') { e.preventDefault(); nameCancelBtn.click(); }
    }
  });
});

// Смена профиля по клику на HUD
elPlayerName?.addEventListener('click', () => {
  const me = getPlayer();
  if (!me) return openNameModal('register');
  openNameModal('change');
});

// Кнопки модалки поражения
failRestartBtn?.addEventListener('click', () => {
  closeFail();
  state.started = true;
  state.running = true;
  state.gameOver = false;
  resetGame(state);
});
failMenuBtn?.addEventListener('click', () => {
  closeFail();
  openMenu();
});

// Старт
startBtn.addEventListener('click', async () => {
  if (canEnterName()) return openNameModal('register');
  state.started = true;
  state.running = true;
  state.gameOver = false;
  closeMenu();
  resetGame(state);
});

// Инициализация UI
applyPlayerUI();
refreshLeaderboard().catch(()=>{});
if (canEnterName()) openNameModal('register'); else openMenu();

// Вспомогательное: аспект изображения
function getAspect(key, fallback=1) {
  const img = IMGS[key];
  const w = img?.naturalWidth || img?.width;
  const h = img?.naturalHeight || img?.height;
  return w && h ? w/h : fallback;
}

// Гейм-цикл
function update(dt) {
  if (!state.running) return;

  // Ускорение
  state.speed = clamp(state.speed + state.accelPerSec * 60 * dt, 220, state.maxSpeed);
  state.obstInterval = clamp(
      PROGRESSION.obstIntervalBase - (state.speed - PROGRESSION.speedStart) / 900,
      PROGRESSION.minObstInterval,
      PROGRESSION.obstIntervalBase
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

  // Анимация бега
  const framesAvail = (SHEEP_ANIM.runFrameKeys.map(k => IMGS[k]).filter(Boolean).length) || 1;
  if (p.onGround && !p.duck && framesAvail >= 2) {
    const scale = Math.max(1, state.speed / PROGRESSION.speedStart);
    const fps = SHEEP_ANIM.runBaseFps + SHEEP_ANIM.speedFpsGain * (scale - 1);
    const cyclesPerSec = fps / framesAvail;
    state.anim.runPhase = (state.anim.runPhase + dt * cyclesPerSec) % 1;
    state.anim.runFrame = Math.floor(state.anim.runPhase * framesAvail) % framesAvail;
  } else {
    state.anim.runPhase = 0;
    state.anim.runFrame = 0;
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
  const myBest = getPlayer()?.best || 0;
  elScore.textContent = Math.floor(state.score).toString();
  elHi.textContent = 'HI ' + myBest;
}

function render(dt) {
  ctx.clearRect(0, 0, VW, VH);
  drawBackground(ctx, state, dt);
  state.obstacles.forEach(o => drawObstacle(ctx, state, o, IMGS));
  drawPlayerSheep(ctx, state, IMGS);

  // «Z»
  if (state.player.onGround) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = '12px var(--font-ui)';
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

async function endGame() {
  state.running = false;
  state.gameOver = true;

  const finalizedScore = Math.floor(state.score);
  const prevBest = getPlayer()?.best || 0;

  let bestFromServer = prevBest;
  try {
    const { best } = await submitScore(finalizedScore);
    bestFromServer = Number(best) || prevBest;

    const isRecord = finalizedScore > prevBest && bestFromServer === finalizedScore;
    if (isRecord) { blip(660, 0.08, 0); setTimeout(() => blip(990, 0.1, 0), 100); }
    else { blip(140, 0.08, -12); }

    await refreshLeaderboard();
    openFail(finalizedScore, isRecord);
  } catch {
    await refreshLeaderboard().catch(()=>{});
    openFail(finalizedScore, false);
  }
}