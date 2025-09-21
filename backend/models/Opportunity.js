const mongoose = require('mongoose');
const { type } = require('os');

const opportunitySchema = new mongoose.Schema({
  name: 
  {
    type: String,
    required: [true, 'Opportunity name is required'],
    trim: true
  },
  account: 
  {
    type: String,
    ref: 'Account',
    required: true
  },
  opportunity_group:
  {
    type:String
  },
  opportuni_type:
  {
    type:String
  },
  industry:
  {
    type:String
  },
  sub_industry:
  {
    type:String
  },
  contact: {
    type: Number,
    ref: 'Contact',
    required: true
  },
  source:
  { 
    type: String
  },
  amount: 
  {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  start_date:
  {
    type:Date
  },
  close_date: 
  {
    type: Date,
  },
  phase: 
  {
    type: String,
  },
  
  probability: 
  {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  forecaset_category:
  {
    type:String
  },
  category:
  {
    type:String
  },
  owner: 
  {
    type: String,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  },
  status: 
  {
    type: String
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);