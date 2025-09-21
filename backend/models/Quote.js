const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  document_type: {
    type: String,
  },
 
  account: {
    type: String,
    ref: 'Account',
  },
  contact: {
    type: Number,
    ref: 'Contact'
  },
  external_ref:
  {
    type: String
  },
  description:
  {
    type:String
  },
  date:
  {
    type:Date
  },
  financials:
  {
    payment_terms: String,
    incoterms:String,
    chance_of_success: {type: Number, min: 0, max: 100, default: 50},
    validTo: {
    type: Date,
    required: [true, 'Valid to date is required']
  }
  },
  
  owner:
  {
    type:String
  },
  sales_unit:
  {
    type:String
  }
  ,
  terrritory:
  {
    type:String
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Quote', quoteSchema);