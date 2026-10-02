import mongoose from 'mongoose';

// value is either a fixed amount or, when percent is true, a % of basic pay
const component = new mongoose.Schema(
  {
    value: { type: Number, default: 0, min: 0 },
    percent: { type: Boolean, default: false },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    basicPay: { type: Number, required: true, min: 0 },
    da: { type: component, default: () => ({}) },
    hra: { type: component, default: () => ({}) },
    wa: { type: component, default: () => ({}) },
    gpf: { type: component, default: () => ({}) },
    it: { type: component, default: () => ({}) },
    gis: { type: component, default: () => ({}) },
    pf: { type: component, default: () => ({}) },
    lic: { type: component, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
