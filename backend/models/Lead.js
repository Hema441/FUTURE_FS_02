const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  source: { type: String, enum: ['Website', 'Referral', 'Cold Call', 'Event', 'Other'], default: 'Website' },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'], default: 'New' },
  notes: { type: String },
  followUpDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
