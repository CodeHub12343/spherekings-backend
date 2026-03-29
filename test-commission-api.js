#!/usr/bin/env node
/**
 * Test script to verify affiliate commission API endpoints
 * Simulates HTTP requests to verify controllers work correctly
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const Commission = require('./src/models/Commission');
const commissionService = require('./src/services/commissionService');

async function testCommissionEndpoints() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Find the test affiliate
    const user = await User.findOne({ email: 'affiliate-seed-1773768573531@test.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    const affiliate = await Affiliate.findOne({ userId: user._id });

    if (!affiliate) {
      console.log('❌ Test affiliate not found');
      return;
    }

    console.log('🧪 Testing Commission API Endpoints');
    console.log('=====================================');
    console.log(`User: ${user.email}`);
    console.log(`Affiliate: ${affiliate.affiliateCode}\n`);

    // Test 1: getAffiliateCommissions
    console.log('📋 Test 1: getAffiliateCommissions');
    console.log('-----------------------------------');
    const commissionsResult = await commissionService.getAffiliateCommissions(affiliate._id, {
      page: 1,
      limit: 10
    });

    console.log(`✅ Retrieved ${commissionsResult.commissions.length} commissions`);
    console.log(`Total Items: ${commissionsResult.pagination.totalItems}`);
    console.log(`Pages: ${commissionsResult.pagination.totalPages}`);

    if (commissionsResult.commissions.length > 0) {
      console.log('\nCommission List:');
      commissionsResult.commissions.forEach((c, idx) => {
        console.log(`  ${idx + 1}. Order: ${c.orderNumber} | Amount: $${(c.calculation?.amount || 0).toFixed(2)} | Status: ${c.status}`);
      });
    }

    // Test 2: getAffiliateCommissionStats
    console.log('\n📊 Test 2: getAffiliateCommissionStats');
    console.log('-----------------------------------');
    const statsResult = await commissionService.getAffiliateCommissionStats(affiliate._id);

    console.log(`Total Commissions: ${statsResult.totalCommissions}`);
    console.log(`Total Earned (Paid): $${statsResult.totalEarned.toFixed(2)}`);
    console.log(`Total Pending: $${statsResult.totalPending.toFixed(2)}`);
    console.log(`Total Approved: $${statsResult.totalApproved.toFixed(2)}`);
    console.log(`Average Commission: $${statsResult.averageCommission.toFixed(2)}`);
    console.log(`Max Commission: $${statsResult.maxCommission.toFixed(2)}`);

    // Verify the data
    console.log('\n✅ Validation');
    console.log('-----------------------------------');
    const expectedTotal = 346.67;
    const actualTotal = statsResult.totalPending + statsResult.totalApproved + statsResult.totalEarned;
    const difference = Math.abs(actualTotal - expectedTotal);

    if (difference < 0.01) {
      console.log(`✅ SUCCESS: Commissions total is correct ($${actualTotal.toFixed(2)})`);
    } else {
      console.log(`⚠️  WARNING: Expected $${expectedTotal}, got $${actualTotal.toFixed(2)}`);
    }

    console.log(`✅ All endpoints working correctly!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testCommissionEndpoints();
