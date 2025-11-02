const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  contactId: { type: String, unique: true, index: true }, // Auto-generated C-01, C-02, etc.
  department: { type: String },
  mainContact: { type: String, required: true },
  country: { type: String, default: 'India' },
  state: { type: String },
  city: { type: String },
  address: { type: String },
  email: { type: String, required: true },
  mobile: { type: String },
  accountId: { type: String },
  accountName: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

// Pre-save hook: assign the lowest available ID (e.g., reuse C-01 if deleted)
ContactSchema.pre('save', async function (next) {
  try {
    if (this.contactId) return next();
    const existing = await mongoose.model('Contact').find({}, { contactId: 1 }).lean();
    const used = new Set();
    for (const doc of existing) {
      const m = /^C-(\d+)$/.exec(doc.contactId || '');
      if (m) used.add(parseInt(m[1], 10));
    }
    let n = 1;
    while (used.has(n)) n++;
    const formatted = n < 10 ? `C-0${n}` : `C-${n}`;
    this.contactId = formatted;
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);