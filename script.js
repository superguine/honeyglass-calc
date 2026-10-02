const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const valueEl = document.getElementById('value');
const exprEl = document.getElementById('expr');
let cur = '0', prev = null, op = null, fresh = false, awaiting = false, error = false;

const fmt = n => String(parseFloat(Number(n).toPrecision(12)));
const compute = (a, b, o) => {
  a = parseFloat(a); b = parseFloat(b);
  const r = o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : a / b;
  return isFinite(r) ? fmt(r) : null;
};
function fail() { error = true; cur = "Can't divide by 0"; prev = op = null; fresh = true; awaiting = false; }
function reset() { cur = '0'; prev = op = null; fresh = awaiting = error = false; exprEl.textContent = ''; }

function digit(d) {
  if (error) reset();
  if (fresh) { cur = d; fresh = false; }
  else if (cur.replace(/[-.]/g, '').length < 15) cur = cur === '0' ? d : cur + d;
  awaiting = false;
}
function dot() {
  if (error) reset();
  if (fresh) { cur = '0.'; fresh = false; awaiting = false; }
  else if (!cur.includes('.')) cur += '.';
}
function operator(o) {
  if (error) return;
  if (op && !awaiting) {
    const r = compute(prev, cur, op);
    if (r === null) return fail();
    prev = r; cur = r;
  } else if (!op) prev = cur;
  op = o; awaiting = true; fresh = true;
  exprEl.textContent = fmt(prev) + ' ' + SYM[o];
}
function equals() {
  if (error || !op) return;
  const r = compute(prev, cur, op);
  exprEl.textContent = fmt(prev) + ' ' + SYM[op] + ' ' + fmt(cur) + ' =';
  if (r === null) return fail();
  cur = r; prev = op = null; fresh = true; awaiting = false;
}
function percent() {
  if (error) return;
  cur = fmt(parseFloat(cur) / 100); fresh = true; awaiting = false;
}
function back() {
  if (error) return reset();
  if (fresh) return;
  cur = cur.slice(0, -1);
  if (cur === '' || cur === '-') cur = '0';
}

function render() {
  valueEl.textContent = cur;
  valueEl.style.fontSize = cur.length > 14 ? '1.5rem' : cur.length > 10 ? '1.9rem' : cur.length > 8 ? '2.2rem' : '2.6rem';
  document.querySelectorAll('.op').forEach(b => b.classList.toggle('active', awaiting && b.dataset.k === op));
}
function press(k) {
  if (/^\d$/.test(k)) digit(k);
  else if (k === '.') dot();
  else if (k in SYM) operator(k);
  else if (k === '=') equals();
  else if (k === '%') percent();
  else if (k === 'back') back();
  else if (k === 'AC') reset();
  render();
}
document.getElementById('keys').addEventListener('click', e => {
  const b = e.target.closest('button'); if (b) press(b.dataset.k);
});
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (/^\d$/.test(k) || k === '.' || k in SYM || k === '%') press(k);
  else if (k === 'Enter' || k === '=') { e.preventDefault(); press('='); }
  else if (k === 'Backspace') press('back');
  else if (k === 'Escape' || k === 'Delete') press('AC');
});
render();
