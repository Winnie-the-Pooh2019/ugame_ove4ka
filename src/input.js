export function setupInput({ onPause, onRestart, onToggleHitbox }, { jumpBtn, duckBtn }) {
  const keys = new Set();
  let touchJump = false;
  let touchDuck = false;

  function wantJump() { return keys.has('Space') || keys.has('ArrowUp') || touchJump; }
  function wantDuck() { return keys.has('ArrowDown') || touchDuck; }

  window.addEventListener('keydown', (e) => {
    if (['Space','ArrowUp','ArrowDown','KeyP','KeyR','KeyH'].includes(e.code)) e.preventDefault();
    if (e.code === 'KeyP') onPause?.();
    else if (e.code === 'KeyR') onRestart?.();
    else if (e.code === 'KeyH') onToggleHitbox?.();
    else keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => { keys.delete(e.code); });

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