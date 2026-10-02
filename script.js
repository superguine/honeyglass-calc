/* Browser wiring only: the calculator logic lives in calculator-core.js */
const calc = CalculatorCore.createCalculator();
const valueEl = document.getElementById('value');
const exprEl = document.getElementById('expr');

function render(state) {
  const text = state.display;
  valueEl.textContent = text;
  exprEl.textContent = state.expr;
  valueEl.style.fontSize = text.length > 14 ? '1.5rem' : text.length > 10 ? '1.9rem' : text.length > 8 ? '2.2rem' : '2.6rem';
  document.querySelectorAll('.op').forEach((b) =>
    b.classList.toggle('active', state.awaiting && b.dataset.k === state.op));
}

document.getElementById('keys').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) render(calc.press(b.dataset.k));
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (/^\d$/.test(k) || '.+-*/%'.includes(k)) render(calc.press(k));
  else if (k === 'Enter' || k === '=') { e.preventDefault(); render(calc.press('=')); }
  else if (k === 'Backspace') render(calc.press('back'));
  else if (k === 'Escape' || k === 'Delete') render(calc.press('AC'));
});

render(calc.getState());
