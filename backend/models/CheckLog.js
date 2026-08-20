const mongoose = require('mongoose');
const CheckLogSchema = new mongoose.Schema({
  pass: { type: mongoose.Schema.Types.ObjectId, ref: 'Pass', required: true },
  passId: { type: String, required: true },
  action: { type: String, enum: ['check-in', 'check-out'], required: true },
  timestamp: { type: Date, default: Date.now },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // refers to frontdesk/security staff
  remarks: { type: String }
});
module.exports = mongoose.model('CheckLog', CheckLogSchema);
