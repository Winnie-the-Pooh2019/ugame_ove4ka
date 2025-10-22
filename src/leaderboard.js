// Клиентский слой лидерборда: localStorage для игрока + обращение к серверу
const API_BASE = '/api';
const KEY_PLAYER = 'sleepSheep.player';
const KEY_HI     = 'sleepSheep.hi';

// Имя: буквы + пробелы; Группа: буквы/цифры + дефис (UPPER)
const NAME_RE  = /^[A-Za-zА-Яа-яЁё]+(?: [A-Za-zА-Яа-яЁё]+)*$/u;
const GROUP_RE = /^[A-Za-zА-Яа-яЁё0-9]+(?:-[A-Za-zА-Яа-яЁё0-9]+)*$/u;
const DASHES_RE = /[‐‑‒–—―]/g;

function readJSON(key, fallback) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}
function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

async function jsonFetch(url, options = {}) {
  const r = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    ...options
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(data?.error || `HTTP ${r.status}`);
    err.status = r.status; err.payload = data; throw err;
  }
  return data;
}

export function getPlayer() {
  const p = readJSON(KEY_PLAYER, null);
  if (!p || !p.name || !p.group) return null;
  return { name: p.name, group: p.group, best: Number(p.best) || 0 };
}
export function canEnterName() { return !getPlayer(); }

function sanitizeClientName(name, maxLen = 40) {
  let s = String(name || '').trim().slice(0, maxLen);
  if (!s) return { ok: false, reason: 'EMPTY_NAME', value: '' };
  s = s.replace(/\s+/g, ' ').trim();
  if (!NAME_RE.test(s)) return { ok: false, reason: 'BAD_NAME', value: s };
  return { ok: true, value: s };
}
function sanitizeClientGroup(group, maxLen = 24) {
  let s = String(group || '').trim().slice(0, maxLen);
  if (!s) return { ok: false, reason: 'EMPTY_GROUP', value: '' };
  s = s.replace(DASHES_RE, '-').replace(/\s+/g, '').replace(/-+/g, '-').toLocaleUpperCase('ru');
  if (!GROUP_RE.test(s)) return { ok: false, reason: 'BAD_GROUP', value: s };
  return { ok: true, value: s };
}

// Регистрация профиля (имя + группа)
export async function registerProfile(name, group) {
  const n = sanitizeClientName(name);
  if (!n.ok) return { ok: false, reason: n.reason };
  const g = sanitizeClientGroup(group);
  if (!g.ok) return { ok: false, reason: g.reason };

  try {
    const res = await jsonFetch(`${API_BASE}/register`, {
      method: 'POST',
      body: JSON.stringify({ name: n.value, group: g.value })
    });
    const player = { name: n.value, group: g.value, best: Number(res?.player?.best) || 0 };
    writeJSON(KEY_PLAYER, player);
    localStorage.setItem(KEY_HI, String(player.best || 0));
    return { ok: true, player };
  } catch (e) {
    if (e.payload?.error === 'NAME_TAKEN' || e.status === 409) return { ok: false, reason: 'NAME_TAKEN' }; // уникальность только по имени
    if (e.payload?.error === 'BAD_NAME') return { ok: false, reason: 'BAD_NAME' };
    if (e.payload?.error === 'BAD_GROUP') return { ok: false, reason: 'BAD_GROUP' };
    return { ok: false, reason: 'NETWORK' };
  }
}

// Смена профиля (имя + группа)
export async function changeProfile(name, group) {
  const me = getPlayer();
  if (!me) return { ok: false, reason: 'NO_PLAYER' };

  const n = sanitizeClientName(name);
  if (!n.ok) return { ok: false, reason: n.reason };
  const g = sanitizeClientGroup(group);
  if (!g.ok) return { ok: false, reason: g.reason };

  try {
    await jsonFetch(`${API_BASE}/change-name`, {
      method: 'POST',
      body: JSON.stringify({ name: n.value, group: g.value })
    });
    const updated = { name: n.value, group: g.value, best: me.best };
    writeJSON(KEY_PLAYER, updated);
    return { ok: true, player: updated };
  } catch (e) {
    if (e.payload?.error === 'NAME_TAKEN' || e.status === 409) return { ok: false, reason: 'NAME_TAKEN' };
    if (e.payload?.error === 'BAD_NAME') return { ok: false, reason: 'BAD_NAME' };
    if (e.payload?.error === 'BAD_GROUP') return { ok: false, reason: 'BAD_GROUP' };
    if (e.payload?.error === 'NO_SESSION') return { ok: false, reason: 'NO_SESSION' };
    return { ok: false, reason: 'NETWORK' };
  }
}

export async function submitScore(scoreRaw) {
  const player = getPlayer();
  if (!player) throw new Error('NO_PLAYER');

  const score = Math.max(0, Math.floor(Number(scoreRaw) || 0));
  const res = await jsonFetch(`${API_BASE}/submit-score`, {
    method: 'POST',
    body: JSON.stringify({ score })
  });

  const best = Number(res?.best) || Math.max(player.best, score);
  const updated = { name: player.name, group: player.group, best };
  writeJSON(KEY_PLAYER, updated);
  localStorage.setItem(KEY_HI, String(updated.best || 0));

  return {
    best: updated.best,
    top10: res?.top10 || [],
    total: Number(res?.total) || 0
  };
}

export async function fetchLeaderboard(limit = 10) {
  const res = await jsonFetch(`${API_BASE}/leaderboard?limit=${encodeURIComponent(limit)}`);
  return { top10: res?.top10 || [], total: Number(res?.total) || 0 };
}