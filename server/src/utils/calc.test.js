import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSalary } from './calc.js';

const pct = (value) => ({ value, percent: true });
const fixed = (value) => ({ value, percent: false });
const zero = fixed(0);

test('Programmer from the original database', () => {
  const r = computeSalary({
    basicPay: 20000,
    da: pct(10), hra: pct(2), wa: pct(2),
    gpf: pct(2), it: pct(2), gis: pct(2), pf: pct(2), lic: fixed(0),
  });
  assert.equal(r.totalAllowance, 2800);
  assert.equal(r.totalDeduction, 1600);
  assert.equal(r.netSalary, 21200);
});

test('Team Leader uses fixed allowances and percent deductions', () => {
  const r = computeSalary({
    basicPay: 30000,
    da: fixed(2000), hra: fixed(500), wa: fixed(500),
    gpf: pct(2), it: pct(2), gis: pct(2), pf: pct(2), lic: fixed(0),
  });
  assert.equal(r.totalAllowance, 3000);
  assert.equal(r.totalDeduction, 2400);
  assert.equal(r.netSalary, 30600);
});

test('percentages round down like Java integer division', () => {
  const r = computeSalary({ basicPay: 999, da: pct(1), hra: zero, wa: zero, gpf: zero, it: zero, gis: zero, pf: zero, lic: zero });
  assert.equal(r.allowances.da, 9);
});
