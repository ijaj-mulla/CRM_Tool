const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
  // Auto-generated ID-01, ID-02, ...
  orderId: { type: String, unique: true, index: true },

  document_type: { type: String }, // Standard Order, At Online Order

  primaryContact: { type: String, ref: 'Contact' },
  account: { type: String, ref: 'Account' },
  email: { type: String },
  mobile: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },

  // Creation date defaults to now
  creationDate: { type: Date, default: Date.now },

  // Total amount
  amount: { type: Number },

  // Delivery status and overall status
  deliveryStatus: {
    type: String,
    enum: ['In Process', 'Finished'],
    default: 'In Process'
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },

  // Legacy fields retained for backward compatibility (not used in new UI)
  ship_in: { type: String, ref: 'ship_in' },
  external_ref: { type: String },
  description: { type: String },
  pricing_date: { type: Date },
  requsted_date: { type: Date },
  owner: { type: String },
  sales_unit: { type: String },
  sales_organisation: { type: String },
  distribution_Channel: { type: String },
  terrritory: { type: String },
  // Linkage fields for traceability
  leadId: { type: String, index: true, default: null },
  opportunityId: { type: String, index: true, default: null },
  quoteId: { type: String, index: true, default: null }
}, { timestamps: true });

// Pre-save hook to assign the lowest available orderId (ID-01, ID-02, ...)
ordersSchema.pre('save', async function (next) {
  try {
    if (this.orderId) return next();
    const existing = await mongoose.model('Orders').find({}, { orderId: 1 }).lean();
    const used = new Set();
    for (const doc of existing) {
      const m = /^ID-(\d+)$/.exec(doc.orderId || '');
      if (m) used.add(parseInt(m[1], 10));
    }
    let n = 1;
    while (used.has(n)) n++;
    const formatted = n < 10 ? `ID-0${n}` : `ID-${n}`;
    this.orderId = formatted;
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model('Orders', ordersSchema);