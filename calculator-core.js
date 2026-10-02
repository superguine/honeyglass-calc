/* Calculator logic with no DOM access, so it can run in the browser and in Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CalculatorCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const MAX_DIGITS = 15;

  const fmt = (n) => String(parseFloat(Number(n).toPrecision(12)));

  // Returns the result as a string, or null when it is not a finite number (e.g. divide by 0).
  function compute(a, b, op) {
    a = parseFloat(a);
    b = parseFloat(b);
    const r = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;
    return isFinite(r) ? fmt(r) : null;
  }

  function createCalculator() {
    let s;

    function reset() {
      s = { cur: '0', prev: null, op: null, fresh: false, awaiting: false, error: false, expr: '' };
    }

    function fail() {
      s.error = true;
      s.cur = "Can't divide by 0";
      s.prev = s.op = null;
      s.fresh = true;
      s.awaiting = false;
    }

    function digit(d) {
      if (s.error) reset();
      if (s.fresh) { s.cur = d; s.fresh = false; }
      else if (s.cur.replace(/[-.]/g, '').length < MAX_DIGITS) s.cur = s.cur === '0' ? d : s.cur + d;
      s.awaiting = false;
    }

    function dot() {
      if (s.error) reset();
      if (s.fresh) { s.cur = '0.'; s.fresh = false; s.awaiting = false; }
      else if (!s.cur.includes('.')) s.cur += '.';
    }

    function operator(o) {
      if (s.error) return;
      if (s.op && !s.awaiting) {
        const r = compute(s.prev, s.cur, s.op);
        if (r === null) return fail();
        s.prev = r; s.cur = r;
      } else if (!s.op) s.prev = s.cur;
      s.op = o; s.awaiting = true; s.fresh = true;
      s.expr = fmt(s.prev) + ' ' + SYM[o];
    }

    function equals() {
      if (s.error || !s.op) return;
      const r = compute(s.prev, s.cur, s.op);
      s.expr = fmt(s.prev) + ' ' + SYM[s.op] + ' ' + fmt(s.cur) + ' =';
      if (r === null) return fail();
      s.cur = r; s.prev = s.op = null; s.fresh = true; s.awaiting = false;
    }

    function percent() {
      if (s.error) return;
      s.cur = fmt(parseFloat(s.cur) / 100);
      s.fresh = true;
      s.awaiting = false;
    }

    function back() {
      if (s.error) return reset();
      if (s.fresh) return;
      s.cur = s.cur.slice(0, -1);
      if (s.cur === '' || s.cur === '-') s.cur = '0';
    }

    function getState() {
      return { display: s.cur, expr: s.expr, op: s.op, awaiting: s.awaiting, error: s.error };
    }

    function press(k) {
      if (/^\d$/.test(k)) digit(k);
      else if (k === '.') dot();
      else if (k in SYM) operator(k);
      else if (k === '=') equals();
      else if (k === '%') percent();
      else if (k === 'back') back();
      else if (k === 'AC') reset();
      return getState();
    }

    reset();
    return { press, getState };
  }

  return { createCalculator, compute, fmt, SYM };
});
