const mongoose = require('mongoose');
const PassSchema = new mongoose.Schema({
  passId: { type: String, required: true, unique: true }, // unique digital code e.g., VP-2026-1001
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }, // will be null in case of direct walkin passes
  visitorName: { type: String, required: true },
  visitorEmail: { type: String },
  visitorPhone: { type: String },
  visitorOrg: { type: String },
  visitorPhoto: { type: String }, // visitor camera capture or upload (encoded as base64 string)
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  qrCode: { type: String }, // base64 data URL for direct front-end display
  status: { type: String, enum: ['active', 'checked-in', 'checked-out', 'expired', 'cancelled'], default: 'active' },
  organization: { type: String, default: 'Default Org' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Pass', PassSchema);
