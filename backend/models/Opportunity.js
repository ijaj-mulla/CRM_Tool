const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  opportunityId: { type: String, unique: true, index: true }, // e.g., o-01
  name: { type: String, required: [true, 'Opportunity name is required'], trim: true },
  account: { type: String, trim: true, required: true },
  contact: { type: String, trim: true, required: true },
  email: { type: String, trim: true },
  mobile: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  salesOrganization: { type: String, trim: true },
  owner: { type: String, enum: ['user1', 'user2', 'user3'], required: true },
  salesPhase: { type: String, enum: ['qualification','specification','quotation','negotiation','implementation'] },
  status: { type: String, enum: ['Open','Won','Closed Won','Lost'], default: 'Open' },
  startDate: { type: Date, default: () => new Date() },
  closeDate: { type: Date },
  followUpDate: { type: Date },
  category: { type: String, enum: ['Brochure request','Prospect for Consulting','Prospect for Product Sales','Prospect for Service','Prospect for Training','Value Chain'] },
  expectedValue: { type: Number, min: 0 },
  currency: { type: String, default: 'INR' },
  probability: { type: Number, min: 0, max: 100 },
  createdBy: { type: String, trim: true },
  salesUnit: { type: String, trim: true },
  salesOffice: { type: String, trim: true },
  industry: { type: String, trim: true },
  subIndustry: { type: String, trim: true },
  source: { type: String, trim: true },
  // Linkage fields for traceability
  leadId: { type: String, index: true },
  linkedQuoteId: { type: String, default: null },
  linkedOrderId: { type: String, default: null }
}, { timestamps: true });

// Assign the lowest available opportunityId like o-01, o-02 (reuse gaps)
opportunitySchema.pre('save', async function(next) {
  try {
    if (this.opportunityId) return next();
    const existing = await mongoose.model('Opportunity').find({}, { opportunityId: 1 }).lean();
    const used = new Set();
    for (const doc of existing) {
      const m = /^o-(\d+)$/.exec(doc.opportunityId || '');
      if (m) used.add(parseInt(m[1], 10));
    }
    let n = 1;
    while (used.has(n)) n++;
    const formatted = n < 10 ? `o-0${n}` : `o-${n}`;
    this.opportunityId = formatted;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Opportunity', opportunitySchema);