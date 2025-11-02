const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  account: { type: String, trim: true },
  primary_contact: { type: String, trim: true },
  processor: { type: String, trim: true },
  completion: { type: Number, min: 0, max: 100, default: 0 },
  start: { type: Date },
  due: { type: Date },
  category: { type: String, trim: true },
  priority: { type: String, enum: ['High', 'Normal', 'Low'], default: 'Normal' },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed', 'Cancelled'], default: 'Open' },
  owner: { type: String, trim: true },
  campaign: { type: String, trim: true },
  territory: { type: String, trim: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);


