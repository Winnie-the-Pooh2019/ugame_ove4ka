import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Корень проекта (на уровень выше server/)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, 'data');
const FILE = path.join(DATA_DIR, 'participants.json');
const COOKIE_NAME = 'pid';
const PORT = process.env.PORT || 8787;

// Подготовка хранилища
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]', 'utf8');

function loadAll() {
    try { const j = JSON.parse(fs.readFileSync(FILE, 'utf8')); return Array.isArray(j) ? j : []; }
    catch { return []; }
}
function saveAll(arr) { fs.writeFileSync(FILE, JSON.stringify(arr, null, 2), 'utf8'); }
function ensureArray(x) { return Array.isArray(x) ? x : []; }
function getPid(req) {
    const pid = req.cookies?.[COOKIE_NAME];
    return (typeof pid === 'string' && pid.length > 0) ? pid : null;
}

// Валидация/нормализация
const DASHES_RE = /[‐‑‒–—―]/g; // все виды тире → "-"
const NAME_RE  = /^[A-Za-zА-Яа-яЁё]+(?: [A-Za-zА-Яа-яЁё]+)*$/u;                  // буквы и пробелы
const GROUP_RE = /^[A-Za-zА-Яа-яЁё0-9]+(?:-[A-Za-zА-Яа-яЁё0-9]+)*$/u;            // буквы/цифры и дефис

function sanitizeName(raw, maxLen = 40) {
    let s = String(raw ?? '').trim().slice(0, maxLen);
    if (!s) return { ok: false, reason: 'EMPTY_NAME', value: '' };
    s = s.replace(/\s+/g, ' ').trim(); // схлопываем пробелы
    if (!NAME_RE.test(s)) return { ok: false, reason: 'BAD_NAME', value: s };
    return { ok: true, value: s };
}
function sanitizeGroup(raw, maxLen = 24) {
    let s = String(raw ?? '').trim().slice(0, maxLen);
    if (!s) return { ok: false, reason: 'EMPTY_GROUP', value: '' };
    s = s.replace(DASHES_RE, '-');     // все тире → "-"
    s = s.replace(/\s+/g, '');         // убираем пробелы
    s = s.replace(/-+/g, '-');         // схлопываем повторные дефисы
    s = s.toLocaleUpperCase('ru');     // UPPER
    if (!GROUP_RE.test(s)) return { ok: false, reason: 'BAD_GROUP', value: s };
    return { ok: true, value: s };
}

// Уникальность ТОЛЬКО по имени
function normalizeNameKey(name) {
    return sanitizeName(name).value.toLocaleLowerCase('ru');
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Диагностика
app.get('/api/me', (req, res) => {
    const pid = getPid(req);
    const all = ensureArray(loadAll());
    const me = pid ? all.find(x => x.pid === pid) : null;
    res.json({
        pid: pid || null,
        player: me ? { name: me.name, group: me.group, best: me.best, createdAt: me.createdAt } : null
    });
});

// Регистрация профиля (уникальность по имени)
app.post('/api/register', (req, res) => {
    const { name, group } = req.body || {};
    const n = sanitizeName(name);
    const g = sanitizeGroup(group);
    if (!n.ok) return res.status(400).json({ error: 'BAD_NAME', reason: n.reason });
    if (!g.ok) return res.status(400).json({ error: 'BAD_GROUP', reason: g.reason });

    const existingPid = getPid(req);
    if (existingPid) return res.status(400).json({ error: 'ALREADY_REGISTERED' });

    const all = ensureArray(loadAll());
    const normalizedName = normalizeNameKey(n.value);

    const taken = all.some(rec => {
        const recNorm = rec.normalizedName || normalizeNameKey(rec.name);
        return recNorm === normalizedName;
    });
    if (taken) return res.status(409).json({ error: 'NAME_TAKEN' });

    const newPid = crypto.randomUUID();
    const rec = {
        pid: newPid,
        name: n.value,
        group: g.value,
        normalizedName,
        best: 0,
        createdAt: Date.now()
    };
    all.push(rec);
    saveAll(all);

    res.cookie(COOKIE_NAME, newPid, { httpOnly: true, sameSite: 'lax', maxAge: 365*24*3600*1000 });
    res.json({ ok: true, player: { name: rec.name, group: rec.group, best: rec.best } });
});

// Смена имени/группы (уникальность по имени)
app.post('/api/change-name', (req, res) => {
    const pid = getPid(req);
    if (!pid) return res.status(401).json({ error: 'NO_SESSION' });

    const { name, group } = req.body || {};
    const n = sanitizeName(name);
    const g = sanitizeGroup(group);
    if (!n.ok) return res.status(400).json({ error: 'BAD_NAME', reason: n.reason });
    if (!g.ok) return res.status(400).json({ error: 'BAD_GROUP', reason: g.reason });

    const all = ensureArray(loadAll());
    const idx = all.findIndex(x => x.pid === pid);
    if (idx === -1) return res.status(401).json({ error: 'UNKNOWN_PLAYER' });

    const normalizedName = normalizeNameKey(n.value);

    const taken = all.some(rec => {
        if (rec.pid === pid) return false;
        const recNorm = rec.normalizedName || normalizeNameKey(rec.name);
        return recNorm === normalizedName;
    });
    if (taken) return res.status(409).json({ error: 'NAME_TAKEN' });

    all[idx].name = n.value;
    all[idx].group = g.value;
    all[idx].normalizedName = normalizedName;
    saveAll(all);

    res.json({ ok: true, player: { name: all[idx].name, group: all[idx].group, best: all[idx].best } });
});

// Сохранение результата
app.post('/api/submit-score', (req, res) => {
    const pid = getPid(req);
    if (!pid) return res.status(401).json({ error: 'NO_SESSION' });

    const score = Math.max(0, Math.floor(Number(req.body?.score || 0)));
    const all = ensureArray(loadAll());
    const idx = all.findIndex(x => x.pid === pid);
    if (idx === -1) return res.status(401).json({ error: 'UNKNOWN_PLAYER' });

    if (!Number.isFinite(all[idx].best) || score > all[idx].best) {
        all[idx].best = score;
        saveAll(all);
    }

    const sorted = [...all].sort((a,b) => (b.best - a.best) || (a.createdAt - b.createdAt));
    const top10 = sorted.slice(0, 10).map(({ name, group, best }, i) => ({ rank: i+1, name, group, score: best }));
    res.json({ ok: true, best: all[idx].best, top10, total: sorted.length });
});

// Публичный лидерборд
app.get('/api/leaderboard', (req, res) => {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const all = ensureArray(loadAll());
    const sorted = [...all].sort((a,b) => (b.best - a.best) || (a.createdAt - b.createdAt));
    const top = sorted.slice(0, limit).map(({ name, group, best }, i) => ({ rank: i+1, name, group, score: best }));
    res.json({ top10: top, total: sorted.length });
});

// Статика
app.use(express.static(PROJECT_ROOT, {
    extensions: ['html'],
    setHeaders(res, filePath) {
        if (/\.(svg|png|jpg|css|js)$/.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
    }
}));

app.get('*', (_req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Serving static from: ${PROJECT_ROOT}`);
    console.log(`Data file: ${FILE}`);
});