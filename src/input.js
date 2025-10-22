export function setupInput({ onToggleHitbox }, { jumpBtn, duckBtn }) {
  const keys = new Set();
  let touchJump = false;
  let touchDuck = false;

  function wantJump() { return keys.has('Space') || keys.has('ArrowUp') || touchJump; }
  function wantDuck() { return keys.has('ArrowDown') || touchDuck; }

  // Определяем, печатает ли сейчас пользователь в поле ввода
  const isTypingTarget = (target) => {
    if (!target) return false;
    // Любой input/textarea или contenteditable — считаем режимом ввода текста
    const el = target.closest ? target.closest('input, textarea, [contenteditable="true"]') : null;
    return !!el;
  };

  window.addEventListener('keydown', (e) => {
    const typing = isTypingTarget(e.target);

    // Эти клавиши мы блокируем только если пользователь НЕ печатает в поле ввода
    const controlKeys = ['Space','ArrowUp','ArrowDown','KeyH'];
    if (!typing && controlKeys.includes(e.code)) e.preventDefault();

    // Игровые хоткеи не должны срабатывать во время ввода текста
    if (typing) return;

    if (e.code === 'KeyH') onToggleHitbox?.();
    else keys.add(e.code);
  });

  window.addEventListener('keyup', (e) => {
    // Во время ввода текста не трогаем набор активных клавиш игры
    if (isTypingTarget(e.target)) return;
    keys.delete(e.code);
  });

  function bindTouch(btn, setter) {
    const onDown = (e) => { e.preventDefault(); setter(true); };
    const onUp = (e) => { e.preventDefault(); setter(false); };
    btn.addEventListener('touchstart', onDown, { passive: false });
    btn.addEventListener('touchend', onUp, { passive: false });
    btn.addEventListener('touchcancel', onUp, { passive: false });
    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('mouseup', onUp);
    btn.addEventListener('mouseleave', onUp);
  }
  if (jumpBtn) bindTouch(jumpBtn, (v)=>{ touchJump = v; });
  if (duckBtn) bindTouch(duckBtn, (v)=>{ touchDuck = v; });

  return { wantJump, wantDuck };
}