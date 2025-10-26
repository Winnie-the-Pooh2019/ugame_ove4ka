import { clamp, rnd } from './utils.js';
import { CLOUD_SIZE, LOW_CLOUD_DRAW_OFFSET, SHEEP_ANIM } from './config.js';

// Прямоугольник со скруглениями
export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y,   x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x,   y+h, rr);
  ctx.arcTo(x,   y+h, x,   y,   rr);
  ctx.arcTo(x,   y,   x+w, y,   rr);
  ctx.closePath();
}

// Контур облака
export function roundedCloud(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.quadraticCurveTo(x + w*0.1, y, x + w*0.3, y + h*0.3);
  ctx.quadraticCurveTo(x + w*0.5, y - h*0.2, x + w*0.7, y + h*0.35);
  ctx.quadraticCurveTo(x + w*0.9, y, x + w, y + h);
  ctx.closePath();
}

// Мягкая "подушка" на земле
export function drawPillow(ctx, x, y, w, h, alpha=1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#cfe6ff20';
  roundRect(ctx, x, y, w, h, Math.min(6, h/2));
  ctx.fill();
  ctx.restore();
}

// Фон и облака
export function drawBackground(ctx, state, dt) {
  const { VW, VH, groundY } = state.metrics;

  // Звёзды
  if (state.stars.length < 120) {
    for (let i=0; i<6; i++) {
      state.stars.push({ x: Math.random()*VW, y: Math.random()*VH*0.6, r: Math.random()*1.2+0.2, tw: Math.random()*2 });
    }
  }
  state.stars.forEach(s => {
    s.tw += dt * 2;
    const a = 0.35 + Math.sin(s.tw) * 0.25;
    ctx.fillStyle = `rgba(255,255,225,${a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fill();
  });

  // Луна (серп)
  ctx.save();
  ctx.translate(VW - 90, 60);
  ctx.fillStyle = '#f3eacb';
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(-6, -4, 18, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // Фоновые облака
  state.bgCloudTimer -= dt;
  if (state.bgCloudTimer <= 0) {
    state.bgCloudTimer = rnd(state.bgCloudInterval*0.6, state.bgCloudInterval*1.4);
    const s = CLOUD_SIZE.bg;
    state.bgClouds.push({
      x: VW + 80,
      y: rnd(20, 120),
      w: rnd(s.wMin, s.wMax) * s.scale,
      h: rnd(s.hMin, s.hMax) * s.scale,
      spd: rnd(22, 48)
    });
  }
  for (let i=state.bgClouds.length-1; i>=0; i--) {
    const c = state.bgClouds[i];
    c.x -= c.spd * dt;
    if (c.x + c.w < -50) state.bgClouds.splice(i,1);
  }
  state.bgClouds.forEach(c => {
    ctx.save();
    ctx.globalAlpha = 0.18;
    roundedCloud(ctx, c.x, c.y, c.w, c.h);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  });

  // Земля
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 0.5);
  ctx.lineTo(VW, groundY + 0.5);
  ctx.stroke();

  // Подушки
  const pillowSpacing = 120;
  const offset = (performance.now() * 0.06) % pillowSpacing;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let x = -offset; x < VW + pillowSpacing; x += pillowSpacing) {
    drawPillow(ctx, x, groundY - 10, 22, 10, 0.6);
  }
}

// Рисунок с "pixel snapping"
function drawImageSnapped(ctx, img, x, y, w, h) {
  if (SHEEP_ANIM.pixelSnap) {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    x = Math.round(x * dpr) / dpr;
    y = Math.round(y * dpr) / dpr;
  }
  ctx.drawImage(img, x, y, w, h);
}

// Овечка
export function drawPlayerSheep(ctx, state, IMGS) {
  const p = state.player;

  const frames = (SHEEP_ANIM.runFrameKeys || [])
      .map(k => IMGS[k])
      .filter(Boolean);

  const isRunning = p.onGround && !p.duck && state.running;
  const isDuck = p.onGround && p.duck;
  const isJump = !p.onGround;

  let img = null;
  let off = { x: 0, y: 0 };

  if (isDuck && (IMGS.sheepLay || frames[0] || IMGS.sheep)) {
    img = IMGS.sheepLay || frames[0] || IMGS.sheep;
    off = SHEEP_ANIM.layOffset || off;
  } else if (isJump && (IMGS.sheepJump || frames[0] || IMGS.sheep)) {
    img = IMGS.sheepJump || frames[0] || IMGS.sheep;
    off = SHEEP_ANIM.jumpOffset || off;
  } else if (isRunning && frames.length >= 2) {
    const idx = state.anim.runFrame % frames.length;
    img = frames[idx];
    off = (SHEEP_ANIM.offsets && SHEEP_ANIM.offsets[idx]) || off;
  } else {
    img = IMGS.sheep || frames[0];
  }

  if (img) {
    drawImageSnapped(ctx, img, p.x + off.x, p.y + off.y, p.w, p.h);
  } else {
    // Фолбэк, если нет спрайтов
    ctx.fillStyle = '#f6f7fb';
    roundRect(ctx, p.x, p.y, p.w, p.h, 10); ctx.fill();
    ctx.fillStyle = '#e7e9f3';
    roundRect(ctx, p.x+4, p.y+6, p.w-8, p.h-8, 10); ctx.fill();
    const headW = p.w*0.35, headH = p.h*0.52;
    ctx.fillStyle = '#2b2f3f';
    roundRect(ctx, p.x - headW*0.6, p.y + p.h*0.28, headW, headH, 6); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x - headW*0.15, p.y + p.h*0.32);
    ctx.quadraticCurveTo(p.x - headW*0.35, p.y + p.h*0.18, p.x - headW*0.5, p.y + p.h*0.3);
    ctx.quadraticCurveTo(p.x - headW*0.28, p.y + p.h*0.42, p.x - headW*0.15, p.y + p.h*0.32);
    ctx.fill();
    ctx.fillStyle = '#2b2f3f';
    const legW = 4, legH = 12;
    ctx.fillRect(p.x + p.w*0.2, p.y + p.h - legH, legW, legH);
    ctx.fillRect(p.x + p.w*0.62, p.y + p.h - legH, legW, legH);
  }

  // Тень
  const shadowY = state.metrics.groundY + 4;
  const shadowW = clamp(36 + (p.y < state.metrics.groundY - p.h ? 10 : 0), 30, 52);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(p.x + p.w/2, shadowY, shadowW/2, 4, 0, 0, Math.PI*2);
  ctx.fill();
}

// Препятствия
export function drawObstacle(ctx, state, o, IMGS) {
  if (o.kind === 'fence') {
    const img = IMGS.fence;
    if (img) ctx.drawImage(img, o.x, o.y, o.w, o.h);
    else {
      ctx.fillStyle = '#6d4f32';
      roundRect(ctx, o.x, o.y, o.w, o.h, 4); ctx.fill();
      ctx.fillStyle = '#7a5a3a';
      const railH = 6;
      roundRect(ctx, o.x - 6, o.y + o.h*0.25, o.w + 12, railH, 3); ctx.fill();
      roundRect(ctx, o.x - 6, o.y + o.h*0.62, o.w + 12, railH, 3); ctx.fill();
    }
  } else if (o.kind === 'lowcloud') {
    const img = IMGS.cloud;
    const drawY = o.y + LOW_CLOUD_DRAW_OFFSET;
    if (img) {
      ctx.save(); ctx.globalAlpha = 0.9;
      ctx.drawImage(img, o.x, drawY, o.w, o.h);
      ctx.restore();
    } else {
      ctx.save(); ctx.globalAlpha = 0.9;
      roundedCloud(ctx, o.x, drawY, o.w, o.h);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
    }
  }
}