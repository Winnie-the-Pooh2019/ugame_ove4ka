import { VW, VH, GROUND_OFFSET, PHYSICS, PROGRESSION, BG_TIMERS, DEBUG_DEFAULTS, PLAYER_BOX, HITBOX, STORAGE_KEY } from './config.js';

export function createState() {
  const groundY = VH - GROUND_OFFSET;
  return {
    // Метрики
    metrics: { VW, VH, groundY },

    // Состояние процесса
    started: false,
    running: false,
    gameOver: false,

    // Прогресс
    score: 0,
    hiScore: Number(localStorage.getItem(STORAGE_KEY) || 0),

    // Физика/скорость
    gravity: PHYSICS.gravity,
    jumpVel: PHYSICS.jumpVel,
    maxFall: PHYSICS.maxFall,
    speed: PROGRESSION.speedStart,
    maxSpeed: PROGRESSION.maxSpeed,
    accelPerSec: PROGRESSION.accelPerSec,

    // Игрок
    player: { x: 90, y: groundY - 50, w: 50, h: 50, vy: 0, onGround: true, duck: false },
    playerDuckHeight: PLAYER_BOX.duckHeight,

    // Коллекции
    obstacles: [],
    bgClouds: [],
    stars: [],

    // Таймеры
    obstTimer: 0,
    obstInterval: PROGRESSION.obstIntervalBase,
    bgCloudTimer: 0,
    bgCloudInterval: BG_TIMERS.cloudInterval,

    // Отладка/хитбоксы
    debug: { ...DEBUG_DEFAULTS },
    hitbox: HITBOX,
  };
}

export function resetGame(state) {
  const { groundY } = state.metrics;
  state.speed = PROGRESSION.speedStart;
  state.score = 0;
  state.obstacles.length = 0;
  state.bgClouds.length = 0;
  state.stars.length = 0;
  state.obstTimer = 0;
  state.bgCloudTimer = 0;
  state.player = { x: 90, y: groundY - 50, w: 50, h: 50, vy: 0, onGround: true, duck: false };
  state.gameOver = false;
}