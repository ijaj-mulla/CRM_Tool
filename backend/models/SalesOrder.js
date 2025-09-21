const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
  document_type: {
    type: String,
  },
 
  account: {
    type: String,
    ref: 'Account',
  },
  ship_in: {
    type: String,
    ref: 'ship_in'
  },
  external_ref:
  {
    type: String
  },
  description:
  {
    type:String
  },
  pricing_date:
  {
    type:Date
  },
  requsted_date:
  {
    type:Date
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
  sales_organisation:
  {
    type:String
  },
  distribution_Channel:
  {
    type:String 
  },
  terrritory:
  {
    type:String
  },
  status:
  {
    type:String
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Orders', ordersSchema);