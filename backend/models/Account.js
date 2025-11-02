const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  accountId: { type: String, unique: true, index: true }, // Auto-generated A-01, A-02, etc.
  name: { type: String, required: true }, // Account name (required)
  address: { type: String },
  city: { type: String },
  accountType: { 
    type: String, 
    enum: ['IE-Direct', 'IE-Indirect', 'IT-Direct', 'IT-Indirect', 'RI-Mixed']
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }, // Backend only
  mainContact: { type: String, required: true },
  country: { type: String, default: 'India' },
  state: { type: String },
  role: { type: String },
  mobile: { type: String }, // 10 digits validation in controller
  email: { type: String, required: true }, // Email validation in controller
  industryCode: { type: String },
  buAssignment: { 
    type: String,
    enum: ['Industry', 'Energy & Power', 'Cooling', 'Service', 'IT Direkt', 'IT Hyperscale']
  },
  horizontal: { 
    type: String,
    enum: [
      'End Customer / Operator',
      'System Integrator / EPC',
      'Machine Builder / OEM',
      'Panel Builder (Automation)',
      'Switchgear Manufacturer (Power)',
      'Component / Hardware Manufacturer',
      'Education (Universities)',
      'Planner / Specifier',
      'Distribution',
      'Global Key Account',
      'Others'
    ]
  },
  subVertical: { type: String }, // Demo field
  vertical: { type: String }, // Demo field
  valueAddedDepth: { type: String }
}, { timestamps: true });

// Pre-save hook: assign the lowest available ID (e.g., reuse A-01 if deleted)
AccountSchema.pre('save', async function (next) {
  try {
    if (this.accountId) return next();
    const existing = await mongoose.model('Account').find({}, { accountId: 1 }).lean();
    const used = new Set();
    for (const doc of existing) {
      const m = /^A-(\d+)$/.exec(doc.accountId || '');
      if (m) used.add(parseInt(m[1], 10));
    }
    let n = 1;
    while (used.has(n)) n++;
    const formatted = n < 10 ? `A-0${n}` : `A-${n}`;
    this.accountId = formatted;
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.models.Account || mongoose.model('Account', AccountSchema);