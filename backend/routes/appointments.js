const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
// Create pre-registration appointment (OTP generated)
router.post('/create', async (req, res) => {
  try {
    const { visitorName, visitorEmail, visitorPhone, visitorOrg, hostId, date, time, purpose, organization } = req.body;
    const hostUser = await User.findById(hostId);
    if (!hostUser || hostUser.role !== 'host') {
      return res.status(404).json({ success: false, message: 'Host user not found' });
    }
    // 6-digit OTP code creation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const appointment = await Appointment.create({
      visitorName,
      visitorEmail,
      visitorPhone,
      visitorOrg,
      host: hostId,
      date,
      time,
      purpose,
      otp,
      organization: organization || hostUser.organization
    });
    // mock notification logs
    console.log(`\n========================================`);
    console.log(`[SMS MOCK] Sent to ${visitorPhone}: "Your Visitor Pass OTP is ${otp}. Please verify it."`);
    console.log(`========================================\n`);
    res.status(201).json({
      success: true,
      message: 'Pre-registration created successfully. OTP generated.',
      appointmentId: appointment._id,
      otp // testing ke liye response me return kar dia
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Verify pre-registration OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (appointment.otp !== otp) {
      return res.status(400).json({ success: false, message: 'OTP did not match' });
    }
    appointment.otpVerified = true;
    await appointment.save();
    res.json({ success: true, message: 'OTP verified. Now waiting for host approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get appointments list (filtered by role and organization)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'host') {
      filter.host = req.user.id;
    } else if (req.user.role === 'admin' || req.user.role === 'security') {
      filter.organization = req.user.organization;
    } else {
      // For visitor, query their email or phone
      filter.$or = [{ visitorEmail: req.user.email }, { visitorPhone: req.user.phone }];
    }
    const appointments = await Appointment.find(filter).populate('host', 'name department email phone').sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Host approves/rejects visitor request
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const appointment = await Appointment.findById(req.params.id).populate('host');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    // Check permission: only host of this appointment or admin can change status
    if (req.user.role !== 'admin' && req.user.id !== appointment.host._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }
    appointment.status = status;
    await appointment.save();
    // Notification mock logger
    console.log(`\n========================================`);
    console.log(`[EMAIL MOCK] Sent to ${appointment.visitorEmail}: "Your visitor pass application is ${status} by host ${appointment.host.name}."`);
    console.log(`========================================\n`);
    res.json({ success: true, message: `Appointment status updated to ${status}`, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
