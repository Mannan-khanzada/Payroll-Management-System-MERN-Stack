import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username = '', password = '' } = req.body || {};
  const user = await User.findOne({ username: String(username).trim() });
  const ok = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!ok) return res.status(401).json({ message: 'Wrong username or password' });
  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });
  res.json({ token, username: user.username });
});

export default router;
