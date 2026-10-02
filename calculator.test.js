const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createCalculator, compute, fmt } = require('../calculator-core.js');

// Run a key sequence and return the final state.
// Each character is one key, except: "<" = backspace, "C" = AC.
function run(seq) {
  const calc = createCalculator();
  let state = calc.getState();
  for (const ch of seq) {
    state = calc.press(ch === '<' ? 'back' : ch === 'C' ? 'AC' : ch);
  }
  return state;
}

describe('compute()', () => {
  const cases = [
    ['1', '2', '+', '3'],
    ['9', '4', '-', '5'],
    ['6', '7', '*', '42'],
    ['8', '2', '/', '4'],
    ['0.1', '0.2', '+', '0.3'],
    ['3', '5', '-', '-2'],
    ['1', '3', '/', '0.333333333333'],
  ];
  for (const [a, b, op, expected] of cases) {
    test(`${a} ${op} ${b} = ${expected}`, () => assert.equal(compute(a, b, op), expected));
  }
  test('division by zero returns null', () => assert.equal(compute('5', '0', '/'), null));
  test('0 / 0 returns null', () => assert.equal(compute('0', '0', '/'), null));
});

describe('fmt()', () => {
  test('removes floating point noise', () => assert.equal(fmt(0.1 + 0.2), '0.3'));
  test('keeps whole numbers plain', () => assert.equal(fmt(42), '42'));
});

describe('entering numbers', () => {
  test('builds multi-digit numbers', () => assert.equal(run('123').display, '123'));
  test('replaces a leading zero', () => assert.equal(run('007').display, '7'));
  test('starts at 0', () => assert.equal(createCalculator().getState().display, '0'));
  test('decimal point after a digit', () => assert.equal(run('1.5').display, '1.5'));
  test('decimal point on its own gives 0.', () => assert.equal(run('.').display, '0.'));
  test('ignores a second decimal point', () => assert.equal(run('1.2.3').display, '1.23'));
  test('limits input to 15 digits', () => assert.equal(run('1234567890123456789').display, '123456789012345'));
});

describe('basic operations', () => {
  test('addition', () => assert.equal(run('2+3=').display, '5'));
  test('subtraction', () => assert.equal(run('9-4=').display, '5'));
  test('multiplication', () => assert.equal(run('6*7=').display, '42'));
  test('division', () => assert.equal(run('8/2=').display, '4'));
  test('negative result', () => assert.equal(run('3-5=').display, '-2'));
  test('decimal arithmetic', () => assert.equal(run('0.1+0.2=').display, '0.3'));
  test('multi-digit operands', () => assert.equal(run('120+80=').display, '200'));
  test('non-terminating division is rounded', () => assert.equal(run('1/3=').display, '0.333333333333'));
});

describe('chaining and operator handling', () => {
  test('evaluates left to right', () => assert.equal(run('5+3*2=').display, '16'));
  test('shows the running total when chaining', () => assert.equal(run('5+3*').display, '8'));
  test('pressing a second operator replaces the first', () => assert.equal(run('5+*3=').display, '15'));
  test('equals with no operator keeps the number', () => assert.equal(run('5=').display, '5'));
  test('equals right after an operator reuses the number', () => assert.equal(run('5+=').display, '10'));
  test('typing after equals starts a new calculation', () => assert.equal(run('2+3=4').display, '4'));
  test('operator after equals continues from the result', () => assert.equal(run('2+3=*4=').display, '20'));
});

describe('percent', () => {
  test('50% = 0.5', () => assert.equal(run('50%').display, '0.5'));
  test('5% = 0.05', () => assert.equal(run('5%').display, '0.05'));
  test('100% = 1', () => assert.equal(run('100%').display, '1'));
  test('percent as the second operand', () => assert.equal(run('200+10%=').display, '200.1'));
  test('typing after percent starts a new number', () => assert.equal(run('50%7').display, '7'));
});

describe('divide by zero', () => {
  test('shows an error message', () => {
    const s = run('5/0=');
    assert.equal(s.error, true);
    assert.equal(s.display, "Can't divide by 0");
  });
  test('error from a chained operator', () => assert.equal(run('5/0+').error, true));
  test('typing a digit clears the error', () => {
    const s = run('5/0=3');
    assert.equal(s.error, false);
    assert.equal(s.display, '3');
  });
  test('operators are ignored while in error', () => assert.equal(run('5/0=+').error, true));
});

describe('backspace and clear', () => {
  test('backspace removes the last digit', () => assert.equal(run('123<').display, '12'));
  test('backspace on a single digit gives 0', () => assert.equal(run('7<').display, '0'));
  test('backspace removes a trailing decimal point', () => assert.equal(run('1.<').display, '1'));
  test('backspace does not change a finished result', () => assert.equal(run('2+3=<').display, '5'));
  test('backspace after an error resets the calculator', () => assert.equal(run('5/0=<').display, '0'));
  test('AC resets everything', () => {
    const s = run('2+3C');
    assert.equal(s.display, '0');
    assert.equal(s.expr, '');
    assert.equal(s.op, null);
  });
});

describe('expression line and active operator', () => {
  test('shows the pending operation', () => assert.equal(run('5+').expr, '5 +'));
  test('uses display symbols for × and ÷', () => {
    assert.equal(run('6*').expr, '6 ×');
    assert.equal(run('6/').expr, '6 ÷');
  });
  test('shows the full expression after equals', () => assert.equal(run('5+3=').expr, '5 + 3 ='));
  test('marks the operator as active until a digit is typed', () => {
    const s = run('5+');
    assert.equal(s.awaiting, true);
    assert.equal(s.op, '+');
    assert.equal(run('5+3').awaiting, false);
  });
});

describe('input safety', () => {
  test('ignores unknown keys', () => assert.equal(run('5x').display, '5'));
  test('instances do not share state', () => {
    const a = createCalculator();
    const b = createCalculator();
    a.press('9');
    assert.equal(b.getState().display, '0');
  });
});
