#!/usr/bin/env node
/**
 * Debug script to test Commission database access
 * Verifies collection exists and contains documents
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Load ALL models to register them in Mongoose
const Commission = require('./src/models/Commission');
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const Affiliate = require('./src/models/Affiliate');

(async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Count all commissions
    console.log('📊 TEST 1: Count all commissions');
    const totalCount = await Commission.countDocuments({});
    console.log(`   Result: ${totalCount} total commissions\n`);

    // Test 2: Find all commissions
    console.log('📋 TEST 2: Find all commissions (limit 5)');
    const allDocs = await Commission.find({}).limit(5).lean();
    console.log(`   Found: ${allDocs.length} documents`);
    if (allDocs.length > 0) {
      console.log('   Sample:');
      allDocs.forEach((doc, i) => {
        console.log(`     [${i+1}] _id=${doc._id}, status=${doc.status}, amount=${doc.calculation?.amount}`);
      });
    }
    console.log();

    // Test 3: Count by status
    console.log('📌 TEST 3: Count by status');
    const pending = await Commission.countDocuments({ status: 'pending' });
    const approved = await Commission.countDocuments({ status: 'approved' });
    const paid = await Commission.countDocuments({ status: 'paid' });
    const reversed = await Commission.countDocuments({ status: 'reversed' });
    console.log(`   pending: ${pending}`);
    console.log(`   approved: ${approved}`);
    console.log(`   paid: ${paid}`);
    console.log(`   reversed: ${reversed}\n`);

    // Test 4: Check if collection exists
    console.log('🔍 TEST 4: Collection metadata');
    const collection = mongoose.connection.collection('commissions');
    const stats = await collection.stats();
    console.log(`   Collection name: ${stats.ns}`);
    console.log(`   Document count: ${stats.count}`);
    console.log(`   Indexes: ${stats.nindexes}\n`);

    // Test 5: Test MongoService aggregation
    console.log('🧮 TEST 5: Aggregation pipeline (same as admin service)');
    const stats_by_status = await Commission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$calculation.amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]).project({ _id: 1, count: 1, total: 1 });
    
    console.log('   Results:');
    stats_by_status.forEach(stat => {
      console.log(`     ${stat._id}: count=${stat.count}, total=$${stat.total?.toFixed(2) || '0.00'}`);
    });
    console.log();

    // Test 6: Simulate exact admin query
    console.log('🎯 TEST 6: Simulating actual admin getCommissions query');
    const filter = {};
    const page = 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const total = await Commission.countDocuments(filter);
    const commissions = await Commission.find(filter)
      .populate('affiliateId', 'name email')
      .populate('orderId', '_id totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(`   Total count: ${total}`);
    console.log(`   Retrieved: ${commissions.length} documents`);
    if (commissions.length > 0) {
      console.log('   Sample:');
      commissions.slice(0, 2).forEach((c, i) => {
        console.log(`     [${i+1}] _id=${c._id}`);
        console.log(`          status=${c.status}, amount=$${c.calculation?.amount}`);
        console.log(`          affiliate=${c.affiliateId?.name || 'N/A'}, order=${c.orderId?._id}`);
      });
    }
    console.log();

    console.log('✅ All tests completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
