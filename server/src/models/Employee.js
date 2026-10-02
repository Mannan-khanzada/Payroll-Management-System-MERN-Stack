import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    // Matches a salary structure (Category) name
    designation: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

employeeSchema.index({ firstName: 'text', lastName: 'text', code: 'text' });

export default mongoose.model('Employee', employeeSchema);
