const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  country: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  mainContact: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
