const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: 
  {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true
  },
  companyName: 
  {
    type: String,
    trim: true
  },
  contactName: 
  {
    type: String,
    trim: true
  },
  status: 
  {
    type: String,
    enum: ['In process', 'Qualified', 'Converted', 'Lost'],
    default: 'In process'
  },
  qualificationLevel: 
  {
    type: String,
    enum: ['Hot', 'Warm', 'Cold'],
    default: 'Cold'
  },
  source: 
  {
    type: String,
    enum: ['Website', 'Referral', 'Trade Show', 'Cold Call', 'Social Media', 'Other'],
    default: 'Website'
  },
  category: 
  {
    type: String,
    enum: ['Retail', 'Wholesale', 'Enterprise', 'SMB'],
    default: 'Retail'
  },
  priority: 
  {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  campaign: 
  {
    type: String,
    trim: true
  },
  owner: 
  {
    type: String,
    ref: 'User',
    required: true
  },
  follow_up_activity: 
  {
    type: String
  },
  accountInfo: 
  {
    city: String,
    state: String,
    country: String,
    postalCode: String,
    language: String
  },
  contactInfo: 
  {
    phone: String,
    mobile: String,
    email: String
  },
  notes:
  {
    type: String
  },
  
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);