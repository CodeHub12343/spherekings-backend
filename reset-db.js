const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');

const resetAdmin = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const result = await db.collection('users').deleteMany({});
    console.log(`✅ Deleted all ${result.deletedCount} users`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();
