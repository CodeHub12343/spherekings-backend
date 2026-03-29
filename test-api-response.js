const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const Commission = require('./src/models/Commission');
const ReferralTracking = require('./src/models/ReferralTracking');

(async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected\n');

    // Get latest affiliate to simulate what the API would do
    const affiliateUser = await User.findOne({ email: /affiliate-seed/ }).sort({ createdAt: -1 });
    console.log('📋 SIMULATING AFFILIATE DASHBOARD API CALL');
    console.log('  User:', affiliateUser.email);
    console.log('  UserID:', affiliateUser._id);

    // Get affiliate record
    const affiliate = await Affiliate.findOne({ userId: affiliateUser._id });
    console.log('\n  Affiliate Code:', affiliate?.affiliateCode);
    console.log('  Affiliate ID:', affiliate?._id);

    if (!affiliate) {
      console.log('\n❌ No affiliate found for this user!');
      process.exit(1);
    }

    // Simulate dashboard data fetching (what the API should return)
    
    // 1. Get referral stats
    const referrals = await ReferralTracking.find({ affiliateId: affiliate._id });
    const conversions = referrals.filter(r => r.converted).length;
    
    console.log('\n📊 REFERRAL STATS:');
    console.log('  Total Clicks:', referrals.length);
    console.log('  Conversions:', conversions);
    console.log('  Conversion Rate:', conversions > 0 ? ((conversions / referrals.length) * 100).toFixed(1) + '%' : '0%');

    // 2. Get commission stats
    const commissions = await Commission.find({ affiliateId: affiliate._id });
    const pendingCommissions = commissions.filter(c => c.status === 'pending');
    const approvedCommissions = commissions.filter(c => c.status === 'approved');
    const paidCommissions = commissions.filter(c => c.status === 'paid');

    const totalAmount = commissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const pendingAmount = pendingCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const approvedAmount = approvedCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const paidAmount = paidCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);

    console.log('\n💰 COMMISSION STATS:');
    console.log('  Total Commissions:', commissions.length);
    console.log('  - Pending:', pendingCommissions.length, '($' + pendingAmount.toFixed(2) + ')');
    console.log('  - Approved:', approvedCommissions.length, '($' + approvedAmount.toFixed(2) + ')');
    console.log('  - Paid:', paidCommissions.length, '($' + paidAmount.toFixed(2) + ')');
    console.log('  Total Amount: $' + totalAmount.toFixed(2));

    console.log('\n❌ FRONTEND SHOULD DISPLAY:');
    console.log('  Total Earnings: $' + (approvedAmount + paidAmount).toFixed(2));
    console.log('  Pending Earnings: $' + pendingAmount.toFixed(2));
    console.log('  Paid Out: $' + paidAmount.toFixed(2));

    console.log('\n🔍 CHECKING API ENDPOINTS:');
    console.log('  GET /api/v1/affiliate/dashboard <- Should return commission stats');
    console.log('  GET /api/v1/affiliate/commissions/stats <- Should return breakdown');
    console.log('  GET /api/v1/affiliate/commissions <- Should return list');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

setTimeout(() => {
  console.log('⏱️ Timeout');
  process.exit(1);
}, 8000);
