#!/usr/bin/env node
/**
 * Mimics exactly what the running server does
 */
require('dotenv').config();

// Import exactly as the server does
const express = require('express');
const mongoose = require('mongoose');
const config = require('./src/config/environment');
const Commission = require('./src/models/Commission');
const adminService = require('./src/services/adminService');

console.log('🔍 Testing server-like environment\n');
console.log('Environment configured:');
console.log('  MONGODB_URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
console.log('  NODE_ENV:', config.NODE_ENV);
console.log('  API_PREFIX:', config.API_PREFIX);

// Simulate what happens when the server starts
(async () => {
  try {
    // Connect as server does
    console.log('\nConnecting to MongoDB (server-style)...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');
    console.log('  Database:', mongoose.connection.db.databaseName);
    
    // Try direct Commission query
    console.log('\n📍 Direct Commission.countDocuments()...');
    const directCount = await Commission.countDocuments({});
    console.log(`   Result: ${directCount} commissions`);
    
    // Try through adminService
    console.log('\n📍 Via adminService.getCommissions({})...');
    const serviceResult = await adminService.getCommissions({ page: 1, limit: 10 });
    console.log(`   Success: ${serviceResult.success}`);
    console.log(`   Data count: ${serviceResult.data.length}`);
    console.log(`   Total items in db: ${serviceResult.pagination.totalItems}`);
    
    if (serviceResult.data.length === 0 && directCount > 0) {
      console.log('\n⚠️  MISMATCH DETECTED:');
      console.log(`   Direct query found: ${directCount}`);
      console.log(`   Service returned: ${serviceResult.data.length}`);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
