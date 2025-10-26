// Клавиатура + тач
export function setupInput({ jumpBtn, duckBtn }) {
  const keys = new Set();
  let touchJump = false;
  let touchDuck = false;

  function wantJump() { return keys.has('Space') || keys.has('ArrowUp') || touchJump; }
  function wantDuck() { return keys.has('ArrowDown') || touchDuck; }

  // Пользователь печатает в поле ввода?
  const isTypingTarget = (target) => {
    if (!target) return false;
    const el = target.closest ? target.closest('input, textarea, [contenteditable="true"]') : null;
    return !!el;
  };

  window.addEventListener('keydown', (e) => {
    const typing = isTypingTarget(e.target);

    // Блокируем прокрутку/скролл только когда не печатаем
    const controlKeys = ['Space','ArrowUp','ArrowDown'];
    if (!typing && controlKeys.includes(e.code)) e.preventDefault();

    if (typing) return;

    keys.add(e.code);
  });

  window.addEventListener('keyup', (e) => {
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