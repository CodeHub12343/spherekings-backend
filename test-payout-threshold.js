#!/usr/bin/env node
/**
 * Test script to verify payout threshold calculations
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const affiliateService = require('./src/services/affiliateService');

async function testPayoutThreshold() {
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
    console.log('🎯 Affiliate Details:');
    console.log('=====================================');
    console.log(`Affiliate: ${affiliate.affiliateCode}`);
    console.log(`Email: ${user.email}`);
    console.log(`Minimum Payout Threshold: $${affiliate.minimumPayoutThreshold.toFixed(2)}`);
    console.log(`Payout Method: ${affiliate.payoutMethod}`);
    console.log(`Status: ${affiliate.status}`);

    // Get dashboard profile
    const profile = await affiliateService.getAffiliateProfile(user._id);

    console.log('\n💰 Earnings Summary:');
    console.log('=====================================');
    console.log(`Total Earnings: $${profile.earnings.totalEarnings.toFixed(2)}`);
    console.log(`Pending Earnings: $${profile.earnings.pendingEarnings.toFixed(2)}`);
    console.log(`Approved Earnings: $${profile.earnings.approvedEarnings.toFixed(2)}`);
    console.log(`Paid Earnings: $${profile.earnings.paidEarnings.toFixed(2)}`);
    
    console.log('\n🏆 Payout Threshold:');
    console.log('=====================================');
    console.log(`Minimum Threshold: $${profile.earnings.minimumPayoutThreshold.toFixed(2)}`);
    console.log(`Current Earnings: $${profile.earnings.totalEarnings.toFixed(2)}`);
    console.log(`Percentage of Threshold: ${profile.earnings.thresholdPercentage}%`);
    console.log(`Amount Needed: $${profile.earnings.amountNeeded.toFixed(2)}`);
    console.log(`Meets Threshold: ${profile.earnings.meetsThreshold ? '✅ YES' : '❌ NO'}`);
    console.log(`Payout Configured: ${profile.earnings.hasPayoutConfigured ? '✅ YES' : '❌ NO'}`);

    // Calculate what it should be
    const expectedPercentage = Math.min(100, Math.round((profile.earnings.totalEarnings / profile.earnings.minimumPayoutThreshold) * 100));
    const expectedAmountNeeded = Math.max(0, profile.earnings.minimumPayoutThreshold - profile.earnings.totalEarnings);

    console.log('\n✅ Validation:');
    console.log('=====================================');
    console.log(`Expected Percentage: ${expectedPercentage}%`);
    console.log(`Actual Percentage: ${profile.earnings.thresholdPercentage}%`);
    console.log(`Match: ${expectedPercentage === profile.earnings.thresholdPercentage ? '✅' : '❌'}`);
    
    console.log(`\nExpected Amount Needed: $${expectedAmountNeeded.toFixed(2)}`);
    console.log(`Actual Amount Needed: $${profile.earnings.amountNeeded.toFixed(2)}`);
    console.log(`Match: ${Math.abs(expectedAmountNeeded - profile.earnings.amountNeeded) < 0.01 ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testPayoutThreshold();
