import { Router } from 'express';
import Employee from '../models/Employee.js';
import Category from '../models/Category.js';
import { computeSalary } from '../utils/calc.js';

const router = Router();
const currentMonth = () => new Date().toISOString().slice(0, 7);

const slipFor = (emp, category, month) => ({
  month,
  generatedOn: new Date().toISOString(),
  employee: {
    code: emp.code,
    name: `${emp.firstName} ${emp.lastName}`.trim(),
    designation: emp.designation,
  },
  ...computeSalary(category),
});

// All employees for a month (payroll report)
router.get('/', async (req, res) => {
  const month = req.query.month || currentMonth();
  const [employees, categories] = await Promise.all([
    Employee.find().sort({ code: 1 }),
    Category.find(),
  ]);
  const byName = new Map(categories.map((c) => [c.name, c]));
  const rows = employees.map((emp) => {
    const cat = byName.get(emp.designation);
    return cat
      ? slipFor(emp, cat, month)
      : { month, employee: { code: emp.code, name: `${emp.firstName} ${emp.lastName}`.trim(), designation: emp.designation }, missingStructure: true };
  });
  res.json({ month, rows });
});

// One employee's payslip
router.get('/:code', async (req, res) => {
  const emp = await Employee.findOne({ code: req.params.code });
  if (!emp) return res.status(404).json({ message: 'Employee not found' });
  const cat = await Category.findOne({ name: emp.designation });
  if (!cat) {
    return res.status(422).json({ message: `No salary structure named "${emp.designation}". Add it under Salary structures.` });
  }
  res.json(slipFor(emp, cat, req.query.month || currentMonth()));
});

export default router;
