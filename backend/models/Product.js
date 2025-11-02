const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  unitOfMeasure: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
