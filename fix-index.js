const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');

const fixAffiliateCodeIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the bad index
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    try {
      await collection.dropIndex('affiliateCode_1');
      console.log('✅ Dropped old affiliateCode index');
    } catch (e) {
      console.log('⚠️ No existing index to drop or index name different');
    }

    // Create the correct sparse unique index
    await collection.createIndex(
      { affiliateCode: 1 },
      { unique: true, sparse: true }
    );
    console.log('✅ Created new sparse unique index on affiliateCode');

    // Check indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('\n📋 Current indexes:');
    console.log(indexes.map(idx => idx.name));

    await mongoose.disconnect();
    console.log('\n✅ Fix complete! You can now register users.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixAffiliateCodeIndex();
