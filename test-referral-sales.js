#!/usr/bin/env node
/**
 * Test script to verify referral tracking sales endpoint returns correct data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const referralTrackingService = require('./src/services/referralTrackingService');

async function testReferralSalesEndpoint() {
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

    console.log('📊 Testing Referral Tracking Sales Endpoint');
    console.log('=====================================');
    console.log(`Affiliate: ${affiliate.affiliateCode}`);
    console.log(`Email: ${user.email}\n`);

    // Test with date range matching the frontend request
    const dateFrom = '2026-02-28';
    const dateTo = '2026-03-30';

    console.log(`📅 Date Range: ${dateFrom} to ${dateTo}\n`);

    const result = await referralTrackingService.getAffiliateSales(affiliate._id, {
      page: 1,
      limit: 20,
      dateFrom: dateFrom,
      dateTo: dateTo,
    });

    console.log('💼 Sales Retrieved:');
    console.log(`  Total Items: ${result.pagination.totalItems}`);
    console.log(`  Current Page: ${result.pagination.currentPage}/${result.pagination.totalPages}`);
    console.log(`  Items Per Page: ${result.pagination.itemsPerPage}\n`);

    if (result.sales.length > 0) {
      console.log('📋 Sales List:');
      result.sales.forEach((sale, idx) => {
        console.log(`\n  ${idx + 1}. Order #${sale.orderNumber}`);
        console.log(`     Total: $${(sale.total || 0).toFixed(2)}`);
        console.log(`     Commission: $${(sale.commissionAmount || 0).toFixed(2)}`);
        console.log(`     Status: ${sale.commissionStatus}`);
        console.log(`     Date: ${new Date(sale.createdAt).toLocaleDateString()}`);
      });

      // Calculate totals
      const totalSales = result.sales.reduce((sum, s) => sum + (s.total || 0), 0);
      const totalCommissions = result.sales.reduce((sum, s) => sum + (s.commissionAmount || 0), 0);

      console.log('\n💰 Summary:');
      console.log(`  Total Sales: $${totalSales.toFixed(2)}`);
      console.log(`  Total Commissions: $${totalCommissions.toFixed(2)}`);
      console.log(`  Avg Order Value: $${(totalSales / result.sales.length).toFixed(2)}`);

      // Verify data matches expected values
      const expectedTotal = 346.67;
      const difference = Math.abs(totalCommissions - expectedTotal);

      if (difference < 0.01) {
        console.log(`\n✅ SUCCESS: Commissions match expected value ($${totalCommissions.toFixed(2)})`);
      } else {
        console.log(`\n⚠️  WARNING: Expected $${expectedTotal}, got $${totalCommissions.toFixed(2)}`);
      }
    } else {
      console.log('❌ No sales found (should have 5 orders)');
    }

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testReferralSalesEndpoint();
