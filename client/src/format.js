// Change the symbol here (or set VITE_CURRENCY in client/.env)
export const CURRENCY = import.meta.env.VITE_CURRENCY || 'Rs.';

const nf = new Intl.NumberFormat('en-IN');
export const money = (n) => `${CURRENCY} ${nf.format(Number(n) || 0)}`;

export const ALLOWANCES = [
  ['da', 'Dearness allowance (DA)'],
  ['hra', 'House rent allowance (HRA)'],
  ['wa', 'Washing allowance (WA)'],
];
export const DEDUCTIONS = [
  ['gpf', 'General provident fund (GPF)'],
  ['it', 'Income tax (IT)'],
  ['gis', 'Group insurance (GIS)'],
  ['pf', 'Provident fund (PF)'],
  ['lic', 'Life insurance (LIC)'],
];

// Mirrors server/src/utils/calc.js so the form can preview the result
const amountOf = (basic, c) => {
  const v = Number(c?.value) || 0;
  return c?.percent ? Math.floor((basic * v) / 100) : v;
};
export function preview(cat) {
  const basic = Number(cat.basicPay) || 0;
  const allow = ALLOWANCES.reduce((s, [k]) => s + amountOf(basic, cat[k]), 0);
  const dedu = DEDUCTIONS.reduce((s, [k]) => s + amountOf(basic, cat[k]), 0);
  return { allow, dedu, net: basic + allow - dedu };
}
