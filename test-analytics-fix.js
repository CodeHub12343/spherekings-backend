#!/usr/bin/env node
/**
 * Test script to verify getAffiliateAnalytics returns correct earnings
 * This tests the fix we just applied to use dynamic Commission querying
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const Commission = require('./src/models/Commission');
const affiliateService = require('./src/services/affiliateService');

async function testAnalyticsEndpoint() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Find the test affiliate
    console.log('📊 Fetching analytics for test affiliate...');
    const user = await User.findOne({ email: 'affiliate-seed-1773768573531@test.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`Found user: ${user.email}\n`);

    // Get analytics using the service method we just fixed
    const analytics = await affiliateService.getAffiliateAnalytics(user._id);

    console.log('📈 Analytics Response:');
    console.log('=====================================');
    console.log(`Period: ${analytics.period.startDate} to ${analytics.period.endDate}`);
    console.log('\nOverview:');
    console.log(`  Total Clicks: ${analytics.overview.totalClicks}`);
    console.log(`  Total Conversions: ${analytics.overview.totalConversions}`);
    console.log(`  Conversion Rate: ${analytics.overview.conversionRate}%`);
    console.log(`  Total Commissions: ${analytics.overview.totalCommissions}`);
    console.log(`  Unique Visitors: ${analytics.overview.uniqueVisitors}`);
    
    console.log('\nEarnings:');
    console.log(`  Total Earnings: $${analytics.earnings.totalEarnings.toFixed(2)}`);
    console.log(`  Pending Earnings: $${analytics.earnings.pendingEarnings.toFixed(2)}`);
    console.log(`  Approved Earnings: $${analytics.earnings.approvedEarnings.toFixed(2)}`);
    console.log(`  Paid Earnings: $${analytics.earnings.paidEarnings.toFixed(2)}`);

    console.log('\n✅ Analytics endpoint test completed!');

    // Verify the data matches our expectations
    const expectedTotal = 346.67;
    const actualTotal = analytics.earnings.totalEarnings;
    const difference = Math.abs(actualTotal - expectedTotal);

    if (difference < 0.01) {
      console.log(`\n✅ SUCCESS: Analytics shows correct total earnings ($${actualTotal.toFixed(2)})`);
    } else {
      console.log(`\n⚠️  WARNING: Expected $${expectedTotal}, got $${actualTotal.toFixed(2)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testAnalyticsEndpoint();
