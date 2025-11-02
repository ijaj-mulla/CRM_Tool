const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  account: { type: String, trim: true },
  sales_organization: { type: String, trim: true },
  primary_contact: { type: String, trim: true },
  location: { type: String, trim: true },
  all_day: { type: Boolean, default: false },
  show_as: { type: String, enum: ['Free', 'Busy', 'Tentative', 'Out of Office'], default: 'Free' },
  start: { type: Date },
  end: { type: Date },
  category: { type: String, trim: true },
  priority: { type: String, enum: ['1 - High', '2 - Medium', '3 - Normal'], default: '3 - Normal' },
  status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
  campaign: { type: String, trim: true },
  owner: { type: String, trim: true },
  territory: { type: String, trim: true },
  notes: { type: String },
  attendees: { type: [attendeeSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);


