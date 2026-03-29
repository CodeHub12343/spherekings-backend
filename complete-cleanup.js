const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');

const completeCleanup = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Step 1: Drop all indexes except _id
    try {
      const indexes = await collection.listIndexes().toArray();
      console.log('\n📋 Current indexes:');
      indexes.forEach(idx => console.log(`  - ${idx.name}`));

      for (const index of indexes) {
        if (index.name !== '_id_') {
          try {
            await collection.dropIndex(index.name);
            console.log(`  ✅ Dropped index: ${index.name}`);
          } catch (e) {
            console.log(`  ⚠️ Could not drop ${index.name}`);
          }
        }
      }
    } catch (e) {
      console.log('⚠️ Could not list indexes');
    }

    // Step 2: Delete ALL users to start completely fresh
    const allResult = await collection.deleteMany({});
    console.log(`\n✅ Deleted all ${allResult.deletedCount} users (complete reset)`);

    // Step 3: Create ONLY the essential indexes with sparse on affiliateCode
    console.log('\n📌 Creating new sparse indexes...');
    
    await collection.createIndex({ email: 1 }, { unique: true });
    console.log('  ✅ Created unique index on email');
    
    await collection.createIndex({ createdAt: 1 });
    console.log('  ✅ Created index on createdAt');
    
    await collection.createIndex(
      { affiliateCode: 1 },
      { unique: true, sparse: true }
    );
    console.log('  ✅ Created sparse unique index on affiliateCode');

    // Step 4: Verify indexes
    const finalIndexes = await collection.listIndexes().toArray();
    console.log('\n📋 Final indexes:');
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name} ${idx.unique ? '(unique)' : ''} ${idx.sparse ? '(sparse)' : ''}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Complete cleanup finished! Database is clean and ready.');
    console.log('✅ Now you can register new users without errors.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

completeCleanup();
