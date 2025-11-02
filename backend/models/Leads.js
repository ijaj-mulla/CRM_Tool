const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadId: { type: String, unique: true, index: true },
  name: { type: String, required: [true, 'Lead name is required'], trim: true },
  status: { type: String, enum: ['open', 'in process', 'qualified'], default: 'open' },
  contact: { type: String, trim: true },
  account: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  email: { type: String, trim: true },
  department: { type: String, trim: true },
  owner: { type: String, enum: ['user1', 'user2', 'user3'] },
  mobile: { type: String, trim: true },
  qualificationLevel: { type: String, enum: ['cold', 'warm', 'hot'], default: 'cold' },
  source: { type: String, enum: ['email', 'visit', 'direct'], default: 'email' },
  priority: { type: String, enum: ['immediate', 'low', 'normal', 'urgent'], default: 'normal' },
  startDate: { type: Date, default: () => new Date() },
  endDate: { type: Date },
  category: { type: String, default: 'demo category' },
  followUpActivity: { type: String, enum: ['visit', 'phone call', 'quotation', 'brochure request'] },
  linkedOpportunityId: { type: String, default: null },
  linkedQuoteId: { type: String, default: null },
  linkedOrderId: { type: String, default: null }
}, { timestamps: true });

// Pre-save hook: assign the lowest available ID (e.g., reuse L-01 if deleted)
leadSchema.pre('save', async function (next) {
  try {
    if (this.leadId) return next();
    const existing = await mongoose.model('Lead').find({}, { leadId: 1 }).lean();
    const used = new Set();
    for (const doc of existing) {
      const m = /^L-(\d+)$/.exec(doc.leadId || '');
      if (m) used.add(parseInt(m[1], 10));
    }
    let n = 1;
    while (used.has(n)) n++;
    const formatted = n < 10 ? `L-0${n}` : `L-${n}`;
    this.leadId = formatted;
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.models.Lead || mongoose.model('Lead', leadSchema);