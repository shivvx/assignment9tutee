const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDatabase = require('./scripts/seed');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// backend api endpoints register logic
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/passes', require('./routes/passes'));
app.use('/api/checklogs', require('./routes/checklogs'));
app.use('/api/analytics', require('./routes/analytics'));
app.get('/', (req, res) => {
  res.json({ message: 'Gatekeeper MERN API Server is active...' });
});
const PORT = process.env.PORT || 5000;
// Connect DB hone ke baad listen start kro aur check kro empty to nahi
connectDB().then(async () => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty detect hua, auto seeding running...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Auto seed check during boot failed:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
});
