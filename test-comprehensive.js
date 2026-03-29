#!/usr/bin/env node
/**
 * COMPREHENSIVE TEST SUITE - Affiliate System Earnings Display Fix
 * Tests all endpoints to verify correct data is being displayed across the affiliate dashboard
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const Commission = require('./src/models/Commission');
const Order = require('./src/models/Order');
const affiliateService = require('./src/services/affiliateService');
const commissionService = require('./src/services/commissionService');

async function runComprehensiveTest() {
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

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   AFFILIATE SYSTEM COMPREHENSIVE TEST - EARNINGS DISPLAY FIX');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\nTest User: ${user.email}`);
    console.log(`Affiliate Code: ${affiliate.affiliateCode}\n`);

    // =======================
    // 1. DATABASE VERIFICATION
    // =======================
    console.log('📊 DATABASE VERIFICATION');
    console.log('───────────────────────────────────────────────────────────────');
    
    const dbCommissions = await Commission.find({ affiliateId: affiliate._id });
    const dbOrders = await Order.find({ 'affiliateDetails.affiliateId': affiliate._id });
    
    const dbTotalEarnings = dbCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const dbPendingEarnings = dbCommissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const dbApprovedEarnings = dbCommissions
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const dbPaidEarnings = dbCommissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);

    console.log(`✅ Commissions in DB: ${dbCommissions.length}`);
    console.log(`   • Pending: ${dbCommissions.filter(c => c.status === 'pending').length} | $${dbPendingEarnings.toFixed(2)}`);
    console.log(`   • Approved: ${dbCommissions.filter(c => c.status === 'approved').length} | $${dbApprovedEarnings.toFixed(2)}`);
    console.log(`   • Paid: ${dbCommissions.filter(c => c.status === 'paid').length} | $${dbPaidEarnings.toFixed(2)}`);
    console.log(`   • Total: $${dbTotalEarnings.toFixed(2)}`);
    
    console.log(`\n✅ Orders in DB: ${dbOrders.length}`);
    const dbOrderTotal = dbOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    console.log(`   • Total Sales: $${dbOrderTotal.toFixed(2)}`);

    // =======================
    // 2. DASHBOARD ENDPOINT
    // =======================
    console.log('\n📈 DASHBOARD ENDPOINT (getAffiliateProfile)');
    console.log('───────────────────────────────────────────────────────────────');
    
    const profile = await affiliateService.getAffiliateProfile(user._id);
    
    console.log(`✅ Total Earnings: $${profile.earnings.totalEarnings.toFixed(2)}`);
    console.log(`   • Pending: $${profile.earnings.pendingEarnings.toFixed(2)}`);
    console.log(`   • Approved: $${profile.earnings.approvedEarnings.toFixed(2)}`);
    console.log(`   • Paid: $${profile.earnings.paidEarnings.toFixed(2)}`);
    
    console.log(`\n✅ Payout Threshold:`);
    console.log(`   • Minimum: $${profile.earnings.minimumPayoutThreshold.toFixed(2)}`);
    console.log(`   • Percentage: ${profile.earnings.thresholdPercentage}% (capped at 100%)`);
    console.log(`   • Amount Needed: $${profile.earnings.amountNeeded.toFixed(2)}`);
    console.log(`   • Meets Threshold: ${profile.earnings.meetsThreshold ? '✅ YES' : '❌ NO'}`);

    // =======================
    // 3. ANALYTICS ENDPOINT
    // =======================
    console.log('\n📊 ANALYTICS ENDPOINT (getAffiliateAnalytics)');
    console.log('───────────────────────────────────────────────────────────────');
    
    const analytics = await affiliateService.getAffiliateAnalytics(user._id);
    
    console.log(`✅ Earnings Summary:`);
    console.log(`   • Total: $${analytics.earnings.totalEarnings.toFixed(2)}`);
    console.log(`   • Pending: $${analytics.earnings.pendingEarnings.toFixed(2)}`);
    console.log(`   • Approved: $${analytics.earnings.approvedEarnings.toFixed(2)}`);
    console.log(`   • Paid: $${analytics.earnings.paidEarnings.toFixed(2)}`);
    
    console.log(`\n✅ Referral Stats:`);
    console.log(`   • Total Clicks: ${analytics.overview.totalClicks}`);
    console.log(`   • Total Conversions: ${analytics.overview.totalConversions}`);
    console.log(`   • Unique Visitors: ${analytics.overview.uniqueVisitors}`);

    // =======================
    // 4. SALES/COMMISSIONS ENDPOINT
    // =======================
    console.log('\n💼 SALES ENDPOINT (getAffiliateSales)');
    console.log('───────────────────────────────────────────────────────────────');
    
    const sales = await affiliateService.getAffiliateSales(user._id);
    
    console.log(`✅ Sales Statistics:`);
    console.log(`   • Total Orders: ${sales.pagination.totalItems}`);
    console.log(`   • Total Sales: $${sales.statistics.totalSalesAmount.toFixed(2)}`);
    console.log(`   • Total Commissions: $${sales.statistics.totalCommissions.toFixed(2)}`);
    console.log(`   • Avg Order Value: $${sales.statistics.averageOrderValue.toFixed(2)}`);
    console.log(`   • Avg Commission/Sale: $${sales.statistics.averageCommissionPerSale.toFixed(2)}`);

    // =======================
    // 4b. REFERRAL TRACKING SALES ENDPOINT
    // =======================
    console.log('\n🔗 REFERRAL TRACKING SALES ENDPOINT (getAffiliateSales)');
    console.log('───────────────────────────────────────────────────────────────');
    
    const referralTrackingService = require('./src/services/referralTrackingService');
    const referralSales = await referralTrackingService.getAffiliateSales(affiliate._id, {
      page: 1,
      limit: 20,
      dateFrom: '2026-02-28',
      dateTo: '2026-03-30',
    });
    
    console.log(`✅ Referral Sales Retrieved: ${referralSales.sales.length}`);
    console.log(`   • Total in System: ${referralSales.pagination.totalItems}`);
    
    const referralTotalCommissions = referralSales.sales.reduce((sum, s) => sum + (s.commissionAmount || 0), 0);
    console.log(`   • Total Commissions: $${referralTotalCommissions.toFixed(2)}`);
    console.log(`   • Total Sales: $${referralSales.sales.reduce((sum, s) => sum + (s.total || 0), 0).toFixed(2)}`);

    // =======================
    // 5. COMMISSION LIST ENDPOINT
    // =======================
    console.log('\n📋 COMMISSION LIST ENDPOINT (getAffiliateCommissions)');
    console.log('───────────────────────────────────────────────────────────────');
    
    const commissions = await commissionService.getAffiliateCommissions(affiliate._id, { page: 1, limit: 10 });
    
    console.log(`✅ Commissions Retrieved: ${commissions.commissions.length}`);
    console.log(`   • Total in System: ${commissions.pagination.totalItems}`);
    console.log(`   • Pagination: Page ${commissions.pagination.currentPage}/${commissions.pagination.totalPages}`);
    
    if (commissions.commissions.length > 0) {
      console.log(`\n   Breakdown by Status:`);
      const pending = commissions.commissions.filter(c => c.status === 'pending');
      const approved = commissions.commissions.filter(c => c.status === 'approved');
      const paid = commissions.commissions.filter(c => c.status === 'paid');
      
      console.log(`   • Pending: ${pending.length} | $${pending.reduce((s, c) => s + (c.calculation?.amount || 0), 0).toFixed(2)}`);
      console.log(`   • Approved: ${approved.length} | $${approved.reduce((s, c) => s + (c.calculation?.amount || 0), 0).toFixed(2)}`);
      console.log(`   • Paid: ${paid.length} | $${paid.reduce((s, c) => s + (c.calculation?.amount || 0), 0).toFixed(2)}`);
    }

    // =======================
    // 6. COMMISSION STATS ENDPOINT
    // =======================
    console.log('\n📊 COMMISSION STATS ENDPOINT (getAffiliateCommissionStats)');
    console.log('───────────────────────────────────────────────────────────────');
    
    const stats = await commissionService.getAffiliateCommissionStats(affiliate._id);
    
    console.log(`✅ Commission Statistics:`);
    console.log(`   • Total Commissions: ${stats.totalCommissions}`);
    console.log(`   • Total Earned (Paid): $${stats.totalEarned.toFixed(2)}`);
    console.log(`   • Total Pending: $${stats.totalPending.toFixed(2)}`);
    console.log(`   • Total Approved: $${stats.totalApproved.toFixed(2)}`);
    console.log(`   • Average: $${stats.averageCommission.toFixed(2)} | Max: $${stats.maxCommission.toFixed(2)}`);

    // =======================
    // 7. CROSS-ENDPOINT VALIDATION
    // =======================
    console.log('\n✅ CROSS-ENDPOINT VALIDATION');
    console.log('───────────────────────────────────────────────────────────────');
    
    const expectedTotal = 346.67;
    const tolerance = 0.01;
    
    const tests = [
      { name: 'Dashboard Total', value: profile.earnings.totalEarnings },
      { name: 'Analytics Total', value: analytics.earnings.totalEarnings },
      { name: 'Sales Commission Total', value: sales.statistics.totalCommissions },
      { name: 'Referral Sales Commission Total', value: referralSales.sales.reduce((sum, s) => sum + (s.commissionAmount || 0), 0) },
      { name: 'Stats Total', value: stats.totalEarned + stats.totalPending + stats.totalApproved },
    ];
    
    let allPassed = true;
    tests.forEach(test => {
      const diff = Math.abs(test.value - expectedTotal);
      const passed = diff < tolerance;
      allPassed = allPassed && passed;
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${test.name}: $${test.value.toFixed(2)}`);
    });

    // =======================
    // FINAL RESULT
    // =======================
    console.log('\n═══════════════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('   ✅ ALL TESTS PASSED - AFFILIATE SYSTEM WORKING CORRECTLY');
    } else {
      console.log('   ❌ SOME TESTS FAILED - PLEASE REVIEW');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the comprehensive test
runComprehensiveTest();
