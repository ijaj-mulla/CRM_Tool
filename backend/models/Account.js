const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  accountId: { type: String, required: true, unique: true },
  accountType: { type: String, enum: ['Customer', 'Prospect', 'Partner'], required: true },
  accountName: { type: String, required: true },
  prospectRole: { type: String, enum: ['Decision Maker', 'Influencer', 'User'] },
  website: { type: String },
  status: { type: String, enum: ['Active', 'Prospect', 'Inactive'], default: 'Active' },
  salesOrganization: { type: String },
  buAssignment: { type: String },
  industryHorizontal: { type: String },
  vertical: { type: String },
  subVertical: { type: String },
  country: { type: String },
  postalCode: { type: String },
  city: { type: String },
  state: { type: String },
  district: { type: String },
  street: { type: String },
  territory: { type: String },
  owner: { type: String },
  taxCountry: { type: String },
  taxNumberType: { type: String, enum: ['EIN', 'VAT', 'GSTIN'] },
  taxNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);