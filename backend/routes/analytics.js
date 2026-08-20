const express = require('express');
const router = express.Router();
const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');
// Get analytics stats cards data
router.get('/stats', protect, async (req, res) => {
  try {
    const org = req.user.organization;
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);
    const totalTodayPasses = await Pass.countDocuments({
      organization: org,
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const currentlyInside = await Pass.countDocuments({
      organization: org,
      status: 'checked-in'
    });
    const pendingAppointments = await Appointment.countDocuments({
      organization: org,
      status: 'pending'
    });
    const approvedToday = await Appointment.countDocuments({
      organization: org,
      status: 'approved',
      date: { $gte: startOfToday, $lte: endOfToday }
    });
    res.json({
      success: true,
      stats: { totalTodayPasses, currentlyInside, pendingAppointments, approvedToday }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get weekly trends & purposes chart data
router.get('/charts', protect, async (req, res) => {
  try {
    const org = req.user.organization;
    const passes = await Pass.find({ organization: org });
    // purpose filter counting
    const purposeCounts = {};
    passes.forEach(p => {
      const purpose = p.purpose || 'General Meeting';
      purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
    });
    // weekly chart data grouping
    const weeklyVisits = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weeklyVisits[dateStr] = 0;
    }
    passes.forEach(p => {
      const dateStr = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (weeklyVisits[dateStr] !== undefined) {
        weeklyVisits[dateStr] += 1;
      }
    });
    res.json({
      success: true,
      charts: {
        purpose: Object.entries(purposeCounts).map(([name, value]) => ({ name, value })),
        weekly: Object.entries(weeklyVisits).map(([name, value]) => ({ name, value }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
