// Локальный лидерборд на localStorage
// Структура:
// - KEY_PLAYER: { name: string, best: number, createdAt: number }
// - KEY_BOARD:  [{ name: string, score: number, createdAt?: number }]
//
// Имя меняется только один раз: если уже есть игрок в KEY_PLAYER — регистрировать заново нельзя.

const KEY_PLAYER = 'sleepSheep.player';
const KEY_BOARD  = 'sleepSheep.board';
const KEY_HI     = 'sleepSheep.hi'; // совместимость со старым "HI"

function readJSON(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    if (!s) return fallback;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// Публичные API

// Возвращает { name, best } или null, если игрок ещё не регистрировался
export function getPlayer() {
  const p = readJSON(KEY_PLAYER, null);
  if (!p || typeof p.name !== 'string') return null;
  return { name: p.name, best: Number(p.best) || 0 };
}

// Регистрация имени один раз. Если игрок уже есть — вернёт существующего и ok:false
export function registerNameOnce(name) {
  const existing = readJSON(KEY_PLAYER, null);
  if (existing && existing.name) {
    return { ok: false, player: { name: existing.name, best: Number(existing.best) || 0 } };
  }
  const player = { name: String(name).slice(0, 40), best: 0, createdAt: Date.now() };
  writeJSON(KEY_PLAYER, player);

  // Обеспечим запись на доске, если такого имени не было
  const board = readJSON(KEY_BOARD, []);
  const idx = board.findIndex(e => e && e.name === player.name);
  if (idx === -1) {
    board.push({ name: player.name, score: 0, createdAt: Date.now() });
    writeJSON(KEY_BOARD, board);
  }

  // Дублируем best в старый HI ключ (совместимость)
  localStorage.setItem(KEY_HI, String(player.best || 0));
  return { ok: true, player: { name: player.name, best: 0 } };
}

// Записать результат забега. Обновляет best у игрока и на доске.
// Возвращает { best, top10, total }
export function recordScore(scoreRaw) {
  const score = Math.max(0, Math.floor(Number(scoreRaw) || 0));
  const player = readJSON(KEY_PLAYER, null);
  if (!player || !player.name) {
    // Нет зарегистрированного игрока — ничего не делаем
    return getLeaderboard();
  }

  // Обновляем best игрока
  if (!Number.isFinite(player.best) || score > player.best) {
    player.best = score;
    writeJSON(KEY_PLAYER, player);
    localStorage.setItem(KEY_HI, String(player.best || 0)); // совместимость
  }

  // Апсертом обновляем запись на доске
  const board = readJSON(KEY_BOARD, []);
  const i = board.findIndex(e => e && e.name === player.name);
  if (i === -1) {
    board.push({ name: player.name, score: score, createdAt: Date.now() });
  } else {
    board[i].score = Math.max(Number(board[i].score) || 0, score);
  }
  writeJSON(KEY_BOARD, board);

  return getLeaderboard();
}

// Получить топ и общее число участников
export function getLeaderboard(limit = 10) {
  const board = readJSON(KEY_BOARD, []);
  // Сортировка: по score убыв., при равенстве — по времени создания (более ранний выше)
  board.sort((a, b) => {
    const ds = (Number(b.score)||0) - (Number(a.score)||0);
    if (ds !== 0) return ds;
    return (Number(a.createdAt)||0) - (Number(b.createdAt)||0);
  });
  const top10 = board.slice(0, limit).map((e, i) => ({
    rank: i + 1,
    name: e.name,
    score: Number(e.score) || 0
  }));
  return { top10, total: board.length };
}

// Утилита для UI: можно ли вводить имя (ещё не зарегистрирован)
export function canEnterName() {
  const p = readJSON(KEY_PLAYER, null);
  return !(p && p.name);
}