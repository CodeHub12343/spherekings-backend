/**
 * Drop affiliateCode index from User collection
 * Run this to fix the MongoDB duplicate key error
 * 
 * Usage: node drop-affiliate-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const dropAffiliateCodeIndex = async () => {
  try {
    console.log('🔍 Checking User collection indexes...');
    
    // Import User model
    const User = require('./src/models/User');
    const indexes = await User.collection.getIndexes();
    
    console.log('📋 Current indexes:', indexes);
    
    // Check if affiliateCode index exists
    if (indexes.affiliateCode_1 || indexes.affiliateCode) {
      console.log('🗑️ Dropping affiliateCode index...');
      await User.collection.dropIndex('affiliateCode_1');
      console.log('✅ affiliateCode index dropped successfully');
    } else {
      console.log('ℹ️ affiliateCode index not found (already removed)');
    }
    
    // Verify the index is gone
    const updatedIndexes = await User.collection.getIndexes();
    console.log('📋 Updated indexes:', updatedIndexes);
    
    console.log('\n✅ Cleanup complete! You can now:');
    console.log('1. npm run dev (to restart the server)');
    console.log('2. Try registering a new user again at /register');
    
  } catch (error) {
    console.error('❌ Error dropping index:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

const main = async () => {
  await connectDB();
  await dropAffiliateCodeIndex();
};

main();
