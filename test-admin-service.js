#!/usr/bin/env node
/**
 * Test admin service getCommissions directly
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Commission = require('./src/models/Commission');
const adminService = require('./src/services/adminService');

(async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Test 1: Direct query
    console.log('📊 TEST 1: Direct Commission.find() query');
    const count = await Commission.countDocuments({});
    console.log(`   Commission documents: ${count}\n`);

    const directResult = await Commission.find({}).limit(3).lean();
    console.log(`   Direct query retrieved: ${directResult.length} documents`);
    if (directResult.length > 0) {
      console.log(`   Sample _id: ${directResult[0]._id}`);
    }
    console.log();

    // Test 2: AdminService getCommissions  
    console.log('📋 TEST 2: adminService.getCommissions()');
    const adminService = require('./src/services/adminService');
    const result = await adminService.getCommissions({ page: 1, limit: 10 });
    console.log(`   Result:`, JSON.stringify(result, null, 2));
    console.log();

    // Test 3: Check pagination response format
    console.log('📦 TEST 3: Check API response format');
    console.log('   Current response pagination fields:', Object.keys(result.pagination));
    console.log('   Expected fields: currentPage, itemsPerPage, totalItems, totalPages');
    console.log();

    await mongoose.connection.close();
    console.log('✅ Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
