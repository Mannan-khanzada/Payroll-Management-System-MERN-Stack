import { Router } from 'express';
import Category from '../models/Category.js';
import Employee from '../models/Employee.js';

const router = Router();
const FIELDS = ['name', 'basicPay', 'da', 'hra', 'wa', 'gpf', 'it', 'gis', 'pf', 'lic'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

router.get('/', async (_req, res) => {
  res.json(await Category.find().sort({ createdAt: 1 }));
});

router.post('/', async (req, res) => {
  const data = pick(req.body || {});
  if (!data.name?.trim()) return res.status(400).json({ message: 'Name is required' });
  if (!(Number(data.basicPay) >= 0)) return res.status(400).json({ message: 'Basic pay must be a number' });
  if (await Category.exists({ name: data.name.trim() })) {
    return res.status(409).json({ message: `"${data.name.trim()}" already exists` });
  }
  res.status(201).json(await Category.create(data));
});

router.put('/:id', async (req, res) => {
  const data = pick(req.body || {});
  const existing = await Category.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Salary structure not found' });

  const newName = data.name?.trim();
  if (newName && newName !== existing.name) {
    if (await Category.exists({ name: newName })) {
      return res.status(409).json({ message: `"${newName}" already exists` });
    }
    // keep employees attached to the renamed structure
    await Employee.updateMany({ designation: existing.name }, { designation: newName });
  }
  existing.set(data);
  await existing.save();
  res.json(existing);
});

router.delete('/:id', async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Salary structure not found' });
  const inUse = await Employee.countDocuments({ designation: cat.name });
  if (inUse > 0) {
    return res.status(409).json({
      message: `${inUse} employee(s) use "${cat.name}". Move them to another designation first.`,
    });
  }
  await cat.deleteOne();
  res.json({ message: 'Salary structure deleted' });
});

export default router;
