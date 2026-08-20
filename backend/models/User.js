const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'security', 'host', 'visitor'], default: 'host' },
  phone: { type: String },
  department: { type: String },
  organization: { type: String, default: 'Default Org' }, // bonus challange: multi-organization support
  createdAt: { type: Date, default: Date.now }
});
// password hash karne ke liye pre-save middleware hook
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
// entered password validation method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', UserSchema);
