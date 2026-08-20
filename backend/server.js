const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDatabase = require('./scripts/seed');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Database connection state memory
let isDbConnected = false;
const ensureDbConnection = async () => {
  if (isDbConnected) return;
  await connectDB();
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Serverless trigger: Database empty detect hua, auto seeding running...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Auto seed check error:', err.message);
  }
  isDbConnected = true;
};
// database connect checker middleware on every serverless api hit
app.use(async (req, res, next) => {
  await ensureDbConnection();
  next();
});
// backend api endpoints register logic
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/passes', require('./routes/passes'));
app.use('/api/checklogs', require('./routes/checklogs'));
app.use('/api/analytics', require('./routes/analytics'));
app.get('/', (req, res) => {
  res.json({ message: 'Gatekeeper MERN API Server is active...' });
});
// vercel serverless environment checks for port listener
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
}
module.exports = app;
