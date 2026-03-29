#!/usr/bin/env node
/**
 * Direct test of API endpoint
 * Mimics what the Express server would do
 */
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Commission = require('./src/models/Commission');
const adminService = require('./src/services/adminService');

(async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Simulate the exact flow the API would use
    console.log('🔄 Simulating API endpoint flow:');
    console.log('  1. Receiving query: { page: "1", limit: "10" }');
    
    const req = { 
      query: { page: '1', limit: '10' },
      user: { userId: 'test-admin', role: 'admin' }
    };

    console.log('  2. Calling adminService.getCommissions()...');
    const result = await adminService.getCommissions(req.query);
    
    console.log(`  3. Service returned: ${result.data.length} commissions, pagination: ${JSON.stringify(result.pagination)}`);
    
    console.log('\n  4. Building controller response...');
    const response = {
      success: true,
      message: 'Commission records retrieved successfully',
      data: {
        commissions: result.data,
        pagination: result.pagination
      }
    };

    console.log('\n  5. Final response that would be sent:');
    console.log(JSON.stringify(response, null, 2));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
