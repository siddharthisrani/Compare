const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI not provided');
  await mongoose.connect(uri, {
    // options are default in mongoose v7+, but keep safe
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected');
}

module.exports = { connectDB };
