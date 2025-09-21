const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  title: {
    type: String,
    enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: String,
  mobile: String,
  account: String,
  department: String,
  technicalFunction: String,
  function: String,
  contactId: {
    type: String,
    required: true,
    unique: true
  },
  externalId: String,
  language: {
    type: String,
    enum: ['English', 'Spanish', 'French', 'German', 'Chinese'],
    default: 'English'
  },
  accountId: String,
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active'
  },
  jobTitle: String,
  state: String,
  country: String,
  createdBy: String
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);