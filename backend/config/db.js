const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string') {
    throw new Error('Set MONGO_URI in backend/.env before starting the server.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}

module.exports = connectDB;
