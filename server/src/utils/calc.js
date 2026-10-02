// Same rules as the original Java app (Emprptwindow.java):
//  - a component is either a percentage of basic pay or a fixed amount
//  - percentages use integer division, so the result is rounded down
//  - net = basic + allowances - deductions
export const ALLOWANCES = ['da', 'hra', 'wa'];
export const DEDUCTIONS = ['gpf', 'it', 'gis', 'pf', 'lic'];

const amountOf = (basic, c) => {
  const value = Number(c?.value) || 0;
  return c?.percent ? Math.floor((basic * value) / 100) : value;
};

export function computeSalary(category) {
  const basicPay = Number(category.basicPay) || 0;
  const allowances = {};
  const deductions = {};
  ALLOWANCES.forEach((k) => (allowances[k] = amountOf(basicPay, category[k])));
  DEDUCTIONS.forEach((k) => (deductions[k] = amountOf(basicPay, category[k])));
  const totalAllowance = Object.values(allowances).reduce((a, b) => a + b, 0);
  const totalDeduction = Object.values(deductions).reduce((a, b) => a + b, 0);
  return {
    basicPay,
    allowances,
    deductions,
    totalAllowance,
    totalDeduction,
    netSalary: basicPay + totalAllowance - totalDeduction,
  };
}
