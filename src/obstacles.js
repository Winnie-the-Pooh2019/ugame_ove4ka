import { rnd, clamp } from './utils.js';
import { CLOUD_SIZE } from './config.js';
import { getObstacleHitbox } from './hitbox.js';

// Спавн
export function spawnObstacle(state, IMGS, getAspect) {
  const t = Math.random();
  const groundY = state.metrics.groundY;

  if (t < 0.65) {
    // Забор
    const desiredH = rnd(34, 50);
    const aspect = getAspect('fence', 0.6);
    const w = desiredH * aspect;
    state.obstacles.push({
      kind: 'fence',
      x: state.metrics.VW + 10,
      y: groundY - desiredH,
      w, h: desiredH,
      speedAdd: rnd(-10, 20)
    });

    // Возможен двойной
    if (Math.random() < 0.25) {
      const gap = rnd(110, 160);
      const h2 = clamp(desiredH + rnd(-6, 6), 28, 56);
      const w2 = h2 * aspect;
      state.obstacles.push({
        kind: 'fence',
        x: state.metrics.VW + 10 + w + gap,
        y: groundY - h2,
        w: w2, h: h2,
        speedAdd: rnd(-10, 20)
      });
    }
  } else {
    // Низкое облако
    const s = CLOUD_SIZE.low;
    const desiredH = rnd(s.hMin, s.hMax) * s.scale;
    const aspect = getAspect('cloud', 2.5);
    const w = desiredH * aspect;

    // y подбираем так, чтобы нижняя граница хитбокса была на cloudBottom
    // см. HITBOX.lowcloud.bottom
    const hbTemp = { kind: 'lowcloud', x: 0, y: 0, w, h: desiredH };
    const cfg = state.hitbox.lowcloud;
    const cloudBottom = groundY - (state.player.h * state.playerDuckHeight + s.clearance + rnd(0, 10));
    const y = cloudBottom - desiredH * (1 - (cfg?.bottom ?? 0));

    state.obstacles.push({
      kind: 'lowcloud',
      x: state.metrics.VW + 10,
      y,
      w, h: desiredH,
      speedAdd: rnd(0, 30)
    });
  }
}

// Обновление движения и очистка ушедших препятствий
export function updateObstacles(state, dt) {
  for (let i = state.obstacles.length - 1; i >= 0; i--) {
    const o = state.obstacles[i];
    o.x -= (state.speed + o.speedAdd) * dt;
    if (o.x + o.w < -20) state.obstacles.splice(i, 1);
  }
}