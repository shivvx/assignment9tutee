const mongoose = require('mongoose');
let mongoServer;
// DB connect mechanism with memory fallback support
const connectDB = async () => {
  try {
    console.log('Database connecting...');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor-pass-db', {
      serverSelectionTimeoutMS: 2000 // 2 second me fail hua toh fallback activate krdo
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.log('Local MongoDB not running. Starting in-memory fallback server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-Memory server URI: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      process.env.MONGO_URI = mongoUri; // update state memory
    } catch (memError) {
      console.error(`Memory server starting failed: ${memError.message}`);
      process.exit(1);
    }
  }
};
module.exports = connectDB;
