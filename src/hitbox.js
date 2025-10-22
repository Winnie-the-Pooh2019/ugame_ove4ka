import { PLAYER_BOX, HITBOX } from './config.js';

// Хитбокс игрока (с учётом пригиба)
export function getPlayerHitbox(p) {
  const bottomY = p.y + p.h - p.h * PLAYER_BOX.bottom;
  const fullH = p.h * (1 - PLAYER_BOX.top - PLAYER_BOX.bottom);
  const h = p.duck ? fullH * PLAYER_BOX.duckHeight : fullH;
  const y = p.duck ? bottomY - h : p.y + p.h * PLAYER_BOX.top;
  const x = p.x + p.w * PLAYER_BOX.left;
  const w = p.w * (1 - PLAYER_BOX.left - PLAYER_BOX.right);
  return { x, y, w, h };
}

// Хитбокс препятствия (с отступами по конфигу)
export function getObstacleHitbox(o) {
  const cfg = HITBOX[o.kind];
  if (!cfg) return { x: o.x, y: o.y, w: o.w, h: o.h };
  const x = o.x + o.w * (cfg.left ?? 0);
  const w = o.w * (1 - (cfg.left ?? 0) - (cfg.right ?? 0));
  const y = o.y + o.h * (cfg.top ?? 0);
  const h = o.h * (1 - (cfg.top ?? 0) - (cfg.bottom ?? 0));
  return { x, y, w, h };
}

// Пересечение AABB
export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}