const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');

const cleanUsers = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Delete all users with null affiliateCode (customers without affiliate code)
    const result = await collection.deleteMany({ affiliateCode: null });
    console.log(`✅ Deleted ${result.deletedCount} users with null affiliateCode`);

    // Delete all documents to start fresh (optional - uncomment if needed)
    // const allResult = await collection.deleteMany({});
    // console.log(`✅ Deleted all ${allResult.deletedCount} users (full reset)`);

    await mongoose.disconnect();
    console.log('\n✅ Database cleaned! Start the server and register a new user.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanUsers();
