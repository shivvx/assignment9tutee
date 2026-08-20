const mongoose = require('mongoose');
const AppointmentSchema = new mongoose.Schema({
  visitorName: { type: String, required: true },
  visitorEmail: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  visitorOrg: { type: String },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  purpose: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'visited'], default: 'pending' },
  otp: { type: String }, // visitor registration verification key
  otpVerified: { type: Boolean, default: false },
  organization: { type: String, default: 'Default Org' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Appointment', AppointmentSchema);
