#!/usr/bin/env node
/**
 * Test script to verify getAffiliateSales returns correct earnings
 * This tests the fix to calculate commissions from Commission records instead of orders
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const affiliateService = require('./src/services/affiliateService');

async function testSalesEndpoint() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Find the test affiliate
    console.log('📊 Fetching sales for test affiliate...');
    const user = await User.findOne({ email: 'affiliate-seed-1773768573531@test.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`Found user: ${user.email}\n`);

    // Get sales using the service method we just fixed
    const sales = await affiliateService.getAffiliateSales(user._id, { page: 1, limit: 10 });

    console.log('💰 Sales Response:');
    console.log('=====================================');
    console.log(`Total Orders Found: ${sales.pagination.totalItems}`);
    console.log(`Current Page: ${sales.pagination.currentPage}`);
    console.log(`Page Items: ${sales.sales.length}`);
    
    console.log('\nStatistics:');
    console.log(`  Total Sales Amount: $${sales.statistics.totalSalesAmount.toFixed(2)}`);
    console.log(`  Total Commissions: $${sales.statistics.totalCommissions.toFixed(2)}`);
    console.log(`  Sales Count: ${sales.statistics.salesCount}`);
    console.log(`  Avg Order Value: $${sales.statistics.averageOrderValue.toFixed(2)}`);
    console.log(`  Avg Commission/Sale: $${sales.statistics.averageCommissionPerSale.toFixed(2)}`);

    console.log('\nOrders:');
    if (sales.sales.length > 0) {
      sales.sales.forEach((order, idx) => {
        console.log(`  ${idx + 1}. Order #${order.orderNumber} - $${order.total.toFixed(2)} (${order.paymentStatus})`);
      });
    } else {
      console.log('  No orders found');
    }

    console.log('\n✅ Sales endpoint test completed!');

    // Verify the data matches our expectations
    const expectedTotal = 346.67;
    const actualTotal = sales.statistics.totalCommissions;
    const difference = Math.abs(actualTotal - expectedTotal);

    if (difference < 0.01) {
      console.log(`\n✅ SUCCESS: Sales shows correct total commissions ($${actualTotal.toFixed(2)})`);
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
testSalesEndpoint();
