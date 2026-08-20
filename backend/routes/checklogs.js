const express = require('express');
const router = express.Router();
const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');
const { protect, authorize } = require('../middleware/auth');
// Scan pass QR or manual ID entry check-in/check-out
router.post('/scan', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const { passId, remarks } = req.body;
    const pass = await Pass.findOne({ passId }).populate('host');
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }
    // Org mismatch check
    if (pass.organization !== req.user.organization) {
      return res.status(403).json({ success: false, message: 'Pass belongs to another organization' });
    }
    const now = new Date();
    if (now > pass.validTo) {
      pass.status = 'expired';
      await pass.save();
      return res.status(400).json({ success: false, message: 'This pass has expired' });
    }
    let actionTaken = '';
    if (pass.status === 'active') {
      pass.status = 'checked-in';
      actionTaken = 'check-in';
    } else if (pass.status === 'checked-in') {
      pass.status = 'checked-out';
      actionTaken = 'check-out';
    } else if (pass.status === 'checked-out') {
      return res.status(400).json({ success: false, message: 'Visitor is already checked-out' });
    } else {
      return res.status(400).json({ success: false, message: `Pass is currently ${pass.status}` });
    }
    await pass.save();
    // logging log entry
    const log = await CheckLog.create({
      pass: pass._id,
      passId: pass.passId,
      action: actionTaken,
      timestamp: now,
      performedBy: req.user.id,
      remarks: remarks || ''
    });
    console.log(`\n========================================`);
    console.log(`[GATEKEEPER SCAN] Pass ${passId} -> ${actionTaken.toUpperCase()}`);
    console.log(`========================================\n`);
    res.json({
      success: true,
      message: `${actionTaken} success!`,
      action: actionTaken,
      pass,
      log
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get all checklogs (filtered by security/admin org)
router.get('/', protect, async (req, res) => {
  try {
    const logs = await CheckLog.find({})
      .populate({
        path: 'pass',
        match: { organization: req.user.organization },
        populate: { path: 'host', select: 'name department' }
      })
      .populate('performedBy', 'name')
      .sort({ timestamp: -1 });
    const filteredLogs = logs.filter(log => log.pass !== null);
    res.json({ success: true, logs: filteredLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
