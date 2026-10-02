import { Router } from 'express';
import Employee from '../models/Employee.js';
import Category from '../models/Category.js';

const router = Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const filter = q
    ? {
        $or: ['code', 'firstName', 'lastName', 'designation'].map((f) => ({
          [f]: new RegExp(escapeRegex(q), 'i'),
        })),
      }
    : {};
  res.json(await Employee.find(filter).sort({ code: 1 }));
});

router.get('/:code', async (req, res) => {
  const emp = await Employee.findOne({ code: req.params.code });
  if (!emp) return res.status(404).json({ message: 'Employee not found' });
  res.json(emp);
});

async function checkDesignation(designation) {
  return Boolean(await Category.exists({ name: designation }));
}

router.post('/', async (req, res) => {
  const { code, firstName, lastName, address, phone, designation } = req.body || {};
  if (!code?.trim() || !firstName?.trim() || !designation?.trim()) {
    return res.status(400).json({ message: 'Code, first name and designation are required' });
  }
  if (!(await checkDesignation(designation))) {
    return res.status(400).json({ message: 'Choose a designation that has a salary structure' });
  }
  if (await Employee.exists({ code: code.trim() })) {
    return res.status(409).json({ message: `Employee code ${code.trim()} is already in use` });
  }
  const emp = await Employee.create({ code, firstName, lastName, address, phone, designation });
  res.status(201).json(emp);
});

router.put('/:code', async (req, res) => {
  const { firstName, lastName, address, phone, designation } = req.body || {};
  if (!firstName?.trim() || !designation?.trim()) {
    return res.status(400).json({ message: 'First name and designation are required' });
  }
  if (!(await checkDesignation(designation))) {
    return res.status(400).json({ message: 'Choose a designation that has a salary structure' });
  }
  const emp = await Employee.findOneAndUpdate(
    { code: req.params.code },
    { firstName, lastName, address, phone, designation },
    { new: true, runValidators: true }
  );
  if (!emp) return res.status(404).json({ message: 'Employee not found' });
  res.json(emp);
});

router.delete('/:code', async (req, res) => {
  const emp = await Employee.findOneAndDelete({ code: req.params.code });
  if (!emp) return res.status(404).json({ message: 'Employee not found' });
  res.json({ message: 'Employee deleted' });
});

export default router;
