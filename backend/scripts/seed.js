const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');
// Seeding logic exportable function
const seedDatabase = async () => {
  try {
    await User.deleteMany();
    await Appointment.deleteMany();
    await Pass.deleteMany();
    await CheckLog.deleteMany();
    console.log('Clear data finished. Seeding fresh logs...');
    const admin = await User.create({
      name: 'Rohan Sharma',
      email: 'admin@gatekeeper.com',
      password: 'password123',
      role: 'admin',
      phone: '9876543210',
      organization: 'Acme Corp'
    });
    const host1 = await User.create({
      name: 'Amit Patel',
      email: 'amit@gatekeeper.com',
      password: 'password123',
      role: 'host',
      phone: '9812345678',
      department: 'Engineering',
      organization: 'Acme Corp'
    });
    const host2 = await User.create({
      name: 'Priyanka Sen',
      email: 'priyanka@gatekeeper.com',
      password: 'password123',
      role: 'host',
      phone: '9812345679',
      department: 'Human Resources',
      organization: 'Acme Corp'
    });
    const security = await User.create({
      name: 'Suresh Kumar',
      email: 'security@gatekeeper.com',
      password: 'password123',
      role: 'security',
      phone: '9988776655',
      organization: 'Acme Corp'
    });
    const visitor = await User.create({
      name: 'Karan Malhotra',
      email: 'karan@visitor.com',
      password: 'password123',
      role: 'visitor',
      phone: '9876123456',
      organization: 'Acme Corp'
    });
    const app1 = await Appointment.create({
      visitorName: 'Rajesh Gupta',
      visitorEmail: 'rajesh@gmail.com',
      visitorPhone: '9555123456',
      visitorOrg: 'Gupta Tech',
      host: host1._id,
      date: new Date(),
      time: '11:00 AM',
      purpose: 'Technical Interview',
      status: 'pending',
      otp: '123456',
      otpVerified: true,
      organization: 'Acme Corp'
    });
    const app2 = await Appointment.create({
      visitorName: 'Sneha Rao',
      visitorEmail: 'sneha@yahoo.com',
      visitorPhone: '9555654321',
      visitorOrg: 'HR Solutions',
      host: host2._id,
      date: new Date(),
      time: '02:30 PM',
      purpose: 'HR Consulting',
      status: 'approved',
      otp: '654321',
      otpVerified: true,
      organization: 'Acme Corp'
    });
    const app3 = await Appointment.create({
      visitorName: 'Vikram Singh',
      visitorEmail: 'vikram@outlook.com',
      visitorPhone: '9666789012',
      visitorOrg: 'Dell Logistics',
      host: host1._id,
      date: new Date(),
      time: '04:00 PM',
      purpose: 'Equipment Delivery',
      status: 'visited',
      otp: '789123',
      otpVerified: true,
      organization: 'Acme Corp'
    });
    const pass1 = await Pass.create({
      passId: 'VP-2026-987123',
      appointment: app3._id,
      visitorName: 'Vikram Singh',
      visitorEmail: 'vikram@outlook.com',
      visitorPhone: '9666789012',
      visitorOrg: 'Dell Logistics',
      visitorPhoto: '',
      host: host1._id,
      validFrom: new Date(Date.now() - 4 * 60 * 60 * 1000),
      validTo: new Date(Date.now() + 4 * 60 * 60 * 1000),
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      status: 'checked-out',
      organization: 'Acme Corp'
    });
    const pass2 = await Pass.create({
      passId: 'VP-2026-554433',
      appointment: app2._id,
      visitorName: 'Sneha Rao',
      visitorEmail: 'sneha@yahoo.com',
      visitorPhone: '9555654321',
      visitorOrg: 'HR Solutions',
      visitorPhoto: '',
      host: host2._id,
      validFrom: new Date(Date.now() - 1 * 60 * 60 * 1000),
      validTo: new Date(Date.now() + 7 * 60 * 60 * 1000),
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      status: 'checked-in',
      organization: 'Acme Corp'
    });
    await CheckLog.create({
      pass: pass1._id,
      passId: pass1.passId,
      action: 'check-in',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      performedBy: security._id,
      remarks: 'Physical verification success'
    });
    await CheckLog.create({
      pass: pass1._id,
      passId: pass1.passId,
      action: 'check-out',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      performedBy: security._id,
      remarks: 'Exit standard log success'
    });
    await CheckLog.create({
      pass: pass2._id,
      passId: pass2.passId,
      action: 'check-in',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      performedBy: security._id,
      remarks: 'Pre-registered checkout checkin log'
    });
    console.log('Seeding: Completed seeding database with demo data.');
  } catch (error) {
    console.error('Seeding process failed:', error.message);
    throw error;
  }
};
module.exports = seedDatabase;
// script direct run kiya toh direct connection handle kro
if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config();
  const runDirectly = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor-pass-db');
      await seedDatabase();
      mongoose.connection.close();
    } catch (error) {
      console.error('Direct run seeding error:', error.message);
      process.exit(1);
    }
  };
  runDirectly();
}
