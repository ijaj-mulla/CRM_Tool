const mongoose = require('mongoose');

const SupplierContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  state: { type: String },
  city: { type: String },
  country: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SupplierContact', SupplierContactSchema);
