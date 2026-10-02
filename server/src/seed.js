import dns from 'node:dns';

// Some ISP/router DNS servers refuse the SRV lookup needed by mongodb+srv:// URIs
dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Category from './models/Category.js';

const data = JSON.parse(fs.readFileSync(new URL('./seed-data.json', import.meta.url)));
const { ADMIN_USER = 'admin', ADMIN_PASS = 'admin123' } = process.env;

await mongoose.connect(process.env.MONGO_URI);

if (!(await User.exists({ username: ADMIN_USER }))) {
  await User.create({ username: ADMIN_USER, passwordHash: await bcrypt.hash(ADMIN_PASS, 10) });
  console.log(`Created login "${ADMIN_USER}"`);
}
if ((await Category.countDocuments()) === 0) {
  await Category.insertMany(data.categories);
  console.log(`Imported ${data.categories.length} salary structures from the old database`);
}
if ((await Employee.countDocuments()) === 0) {
  await Employee.insertMany(data.employees);
  console.log(`Imported ${data.employees.length} employees from the old database`);
}

await mongoose.disconnect();
console.log('Seed done');
