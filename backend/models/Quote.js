const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  // Auto-generated Q-01, Q-02, ...
  quoteId: { type: String, unique: true, index: true },

  document_type: { type: String },

  // Store display names for simplicity (consistent with other pages)
  account: { type: String, ref: 'Account' },
  contact: { type: String, ref: 'Contact' },
  email: { type: String },
  mobile: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  product: { type: String, ref: 'Product' },

  external_ref: { type: String },
  description: { type: String },

  // Created date defaults to today
  date: { type: Date, default: Date.now },

  // Validity at top-level; keep financials.validTo optional for backward compatibility
  validTo: { type: Date },

  financials: {
    payment_terms: String,
    incoterms: String,
    chance_of_success: { type: Number, min: 0, max: 100, default: 50 },
    validTo: { type: Date }
  },

  owner: { type: String },
  sales_unit: { type: String },
  territory: { type: String },

  // Total amount
  amount: { type: Number },

  status: {
    type: String,
    enum: ['Open', 'Below Minimum Amount', 'In Process', 'Order', 'No Order'],
    default: 'Open'
  },

  uploaded_pdf: { type: String, default: null },
  // Linkage fields for traceability
  leadId: { type: String, index: true, default: null },
  opportunityId: { type: String, index: true, default: null },
  linkedOrderId: { type: String, default: null }
}, { timestamps: true });

// Pre-save hook to assign the lowest available quoteId (Q-01, Q-02, ...)
quoteSchema.pre('save', async function (next) {
  try {
    if (this.quoteId) return next();
    const existing = await mongoose.model('Quote').find({}, { quoteId: 1 }).lean();
    const used = new Set();
    for (const doc of existing) {
      const m = /^Q-(\d+)$/.exec(doc.quoteId || '');
      if (m) used.add(parseInt(m[1], 10));
    }
    let n = 1;
    while (used.has(n)) n++;
    const formatted = n < 10 ? `Q-0${n}` : `Q-${n}`;
    this.quoteId = formatted;
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model('Quote', quoteSchema);