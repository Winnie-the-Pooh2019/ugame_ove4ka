// Центральная конфигурация игры

export const VW = 1000;
export const VH = 400;
export const GROUND_OFFSET = 48; // от нижней границы экрана
export const STORAGE_KEY = 'sleepSheep.hi';

export const CLOUD_SIZE = {
    bg:  { scale: 1.5, hMin: 16, hMax: 26, wMin: 50,  wMax: 120 }, // фоновые облака
    low: { scale: 6,   hMin: 10, hMax: 13, clearance: 1 }          // низкие облака-препятствия
};

// На сколько пикселей ниже рисовать ИКОНКУ низкого облака (хитбокс без изменений)
export const LOW_CLOUD_DRAW_OFFSET = 4;

// Базовый размер овцы и масштаб
export const PLAYER_BASE_SIZE = 50;
export const SHEEP_SCALE = 2; // текущий размер овцы = 100 px

// Хитбокс игрока (прямоугольный, с отступами)
export const PLAYER_BOX = {
    left: 0.12,
    right: 0.28,
    top: 0.37,
    bottom: 0.10,
    duckHeight: 0.6
};

// Хитбоксы препятствий (прямоугольные, с независимыми отступами)
export const HITBOX = {
    lowcloud: { left: 0.18, right: 0.14, top: 0.32, bottom: 0.26 },
    fence:    { left: 0.15, right: 0.15, top: 0.15, bottom: 0.02 },
};

// Размер забора (относительно овцы)
export const FENCE_SIZE = {
    hMinFactor: 0.45,
    hMaxFactor: 0.65,
    // При желании можно задать абсолютные пиксели — тогда факторы игнорируются:
    // minPx: 24,
    // maxPx: 36,
};

// Дистанции/разрывы
export const SPACING = {
    // Раздельные «времена реакции» (сек): это СТАРТОВЫЕ значения (при speed = speedStart)
    reactTimeSecFence: 0.7,
    reactTimeSecCloud: 0.4,

    // Во сколько раз ослабить "время реакции" к максимальной скорости (1.0 = без изменений)
    // Пример: 0.8 → к maxSpeed рост дистанции будет на 20% мягче.
    speedGapFactorTo: 1.7,

    // Дополнительный запас в ширинах овцы (постоянная прибавка)
    extraSheepWidths: 0.4,

    // Базовый промежуток внутри двойного забора (в ширинах овцы)
    doubleFenceGapW: { min: 1.6, max: 2.1 },

    // Рост промежутка с увеличением скорости:
    // множители для min/max выше. 1.0 = без изменений, 1.5 = +50% к диапазону на максимальной скорости.
    doubleFenceGapScaleFrom: 1.0,
    doubleFenceGapScaleTo:   1.5,

    // Шанс на двойной забор
    doubleFenceChance: 0.4
};

// Физика и прогресс
export const PHYSICS = {
    gravity: 2000,
    jumpVel: -650,
    maxFall: 1200,
};

export const PROGRESSION = {
    speedStart: 260,
    maxSpeed: 950,
    accelPerSec: 0.15,
    obstIntervalBase: 0.9,
    // Меньше — чаще спавним (нижний предел)
    minObstInterval: 0.4
};

// Тайминги бэкраунда
export const BG_TIMERS = {
    cloudInterval: 0.8,
};

// Анимация овечки (бег/прыжок/пригиб)
export const SHEEP_ANIM = {
    runBaseFps: 9,
    speedFpsGain: 3,
    runFrameKeys: ['sheepRun1', 'sheepRun2', 'sheepRun3', 'sheepRun4'],
    offsets: [
        { x: 0,   y: 0 },
        { x: 0.5, y: 0 },
        { x: 0,   y: 0.5 },
        { x: 0.5, y: 0 }
    ],
    jumpOffset: { x: 0, y: 0 },
    layOffset:  { x: 0, y: 0 },
    pixelSnap: true,
};

// Пути к ассетам
export const ASSET_PATHS = {
    sheep: 'svg/sheep.svg',
    sheepRun1: 'svg/sheep1.svg',
    sheepRun2: 'svg/sheep2.svg',
    sheepRun3: 'svg/sheep3.svg',
    sheepRun4: 'svg/sheep4.svg',
    sheepJump: 'svg/sheep_jump.svg',
    sheepLay:  'svg/sheep_lay.svg',
    cloud: 'svg/cloud.svg',
    fence: 'svg/fence.svg',
};

// Отладка
export const DEBUG_DEFAULTS = {
    showBoxes: false,
};