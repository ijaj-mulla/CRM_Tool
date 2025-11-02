const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  sourceCollection: { type: String, required: true },
  sourceId: { type: String, required: true },
  targetCollection: { type: String },
  targetId: { type: String },
  details: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('AutomationLog', automationLogSchema);
