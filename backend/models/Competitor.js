const mongoose = require('mongoose');

const CompetitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  postalCode: { type: String },
  city: { type: String },
  country: { type: String},
  website: { type: String},
  createdBy: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Competitor', CompetitorSchema);
