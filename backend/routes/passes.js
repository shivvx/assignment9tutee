const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
// Issue new pass (either from approved appointment or direct walkin)
router.post('/issue', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const { appointmentId, visitorName, visitorEmail, visitorPhone, visitorOrg, visitorPhoto, hostId, validFrom, validTo, organization } = req.body;
    let hostUser;
    let appointment;
    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      if (appointment.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Appointment is not approved yet' });
      }
      hostUser = await User.findById(appointment.host);
    } else {
      hostUser = await User.findById(hostId);
      if (!hostUser || hostUser.role !== 'host') {
        return res.status(404).json({ success: false, message: 'Selected host not found or invalid role' });
      }
    }
    // generating unique pass id VP-2026-XXXXXX
    const passId = `VP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrData = JSON.stringify({ passId, visitorName: visitorName || (appointment && appointment.visitorName) });
    const qrCodeBase64 = await QRCode.toDataURL(qrData); // base64 representation of QR
    const pass = await Pass.create({
      passId,
      appointment: appointmentId || null,
      visitorName: visitorName || appointment.visitorName,
      visitorEmail: visitorEmail || appointment.visitorEmail,
      visitorPhone: visitorPhone || appointment.visitorPhone,
      visitorOrg: visitorOrg || appointment.visitorOrg,
      visitorPhoto: visitorPhoto || '', // photo base64
      host: hostUser._id,
      validFrom: validFrom || new Date(),
      validTo: validTo || new Date(Date.now() + 8 * 60 * 60 * 1000), // default 8 hours validity
      qrCode: qrCodeBase64,
      status: 'active',
      organization: organization || req.user.organization
    });
    if (appointment) {
      appointment.status = 'visited';
      await appointment.save();
    }
    // notification mock log
    console.log(`\n========================================`);
    console.log(`[EMAIL MOCK] Pass PDF mailed to ${pass.visitorEmail}`);
    console.log(`========================================\n`);
    res.status(201).json({ success: true, pass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get all passes list (based on role)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'host') {
      filter.host = req.user.id;
    } else if (req.user.role === 'admin' || req.user.role === 'security') {
      filter.organization = req.user.organization;
    }
    const passes = await Pass.find(filter).populate('host', 'name department email phone').sort({ createdAt: -1 });
    res.json({ success: true, passes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get currently checked-in visitors (active in building)
router.get('/active', protect, async (req, res) => {
  try {
    let filter = { status: 'checked-in' };
    if (req.user.role === 'host') {
      filter.host = req.user.id;
    } else if (req.user.role === 'admin' || req.user.role === 'security') {
      filter.organization = req.user.organization;
    }
    const passes = await Pass.find(filter).populate('host', 'name department email phone').sort({ createdAt: -1 });
    res.json({ success: true, passes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get individual pass
router.get('/:id', protect, async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id).populate('host', 'name department email phone');
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }
    res.json({ success: true, pass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Generate & Stream PDF badge for printer
router.get('/:id/pdf', async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id).populate('host');
    if (!pass) {
      return res.status(404).send('Pass not found');
    }
    const doc = new PDFDocument({ size: 'A6', margin: 15 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=VisitorPass-${pass.passId}.pdf`);
    doc.pipe(res);
    // drawing visual layout frame
    doc.rect(5, 5, doc.page.width - 10, doc.page.height - 10).lineWidth(2).strokeColor('#4f46e5').stroke();
    doc.fillColor('#4f46e5').fontSize(14).font('Helvetica-Bold').text(pass.organization || 'VISITOR PASS', { align: 'center' }).moveDown(0.2);
    doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text('SCAN QR CODE AT SECURITY GATE', { align: 'center' }).moveDown(0.3);
    // line separator
    doc.moveTo(10, 45).lineTo(doc.page.width - 10, 45).lineWidth(1).strokeColor('#e5e7eb').stroke();
    // draw qr image buffer
    if (pass.qrCode) {
      const qrBuffer = Buffer.from(pass.qrCode.replace(/^data:image\/png;base64,/, ''), 'base64');
      doc.image(qrBuffer, (doc.page.width - 100) / 2, 55, { width: 100 });
    }
    // Details
    doc.moveDown(5.8);
    doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text(`Visitor: ${pass.visitorName}`, { indent: 10 }).moveDown(0.2);
    doc.fillColor('#374151').fontSize(8).font('Helvetica')
       .text(`Pass ID: ${pass.passId}`, { indent: 10 })
       .text(`From Org: ${pass.visitorOrg || 'Personal'}`, { indent: 10 })
       .text(`Host: ${pass.host.name} (${pass.host.department})`, { indent: 10 })
       .text(`Valid Till: ${new Date(pass.validTo).toLocaleString()}`, { indent: 10 });
    // footer note
    doc.moveDown(0.5);
    doc.fillColor('#9ca3af').fontSize(6).text('Powered by Gatekeeper OS - Secure System', { align: 'center' });
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error.message);
    res.status(500).send('Error generating PDF');
  }
});
module.exports = router;
