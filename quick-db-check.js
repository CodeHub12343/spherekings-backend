#!/usr/bin/env node
/**
 * Quick database check script
 */
const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections (${collections.length}):`);
    collections.forEach(c => console.log(`  - ${c.name}`));

    // Check commissions specifically
    if (collections.find(c => c.name === 'commissions')) {
      const count = await mongoose.connection.db.collection('commissions').countDocuments();
      console.log(`\nCommissions collection: ${count} documents`);
      
      if (count > 0) {
        const sample = await mongoose.connection.db.collection('commissions').findOne();
        console.log('Sample:', JSON.stringify(sample, null, 2).slice(0, 500));
      }
    } else {
      console.log('\n⚠️  No commissions collection found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
