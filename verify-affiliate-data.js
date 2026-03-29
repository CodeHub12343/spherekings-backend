const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const Commission = require('./src/models/Commission');
const Order = require('./src/models/Order');

(async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected\n');

    // Get the latest affiliate
    const latestAffiliate = await Affiliate.findOne().sort({ createdAt: -1 })
      .populate('userId', 'email name');
    
    if (!latestAffiliate) {
      console.log('❌ No affiliates found');
      process.exit(1);
    }

    console.log('📊 LATEST AFFILIATE:');
    console.log('  Code:', latestAffiliate.affiliateCode);
    console.log('  Email:', latestAffiliate.userId?.email);
    console.log('  Rate:', latestAffiliate.commissionRate * 100 + '%');
    console.log('  Status:', latestAffiliate.status);

    // Get all orders for this affiliate
    const orders = await Order.find({ 'affiliateDetails.affiliateId': latestAffiliate._id });
    console.log('\n📦 ORDERS:');
    console.log('  Count:', orders.length);
    orders.forEach((order, i) => {
      console.log(`  ${i + 1}. ${order.orderNumber} - $${order.total.toFixed(2)}`);
    });

    // Get all commissions for this affiliate
    const commissions = await Commission.find({ affiliateId: latestAffiliate._id });
    console.log('\n💰 COMMISSIONS:');
    console.log('  Count:', commissions.length);
    console.log('  Total Amount: $' + commissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0).toFixed(2));
    
    commissions.forEach((commission, i) => {
      console.log(`  ${i + 1}. ${commission.orderNumber} - $${(commission.calculation?.amount || 0).toFixed(2)} (${commission.status})`);
    });

    if (commissions.length === 0) {
      console.log('\n⚠️  NO COMMISSIONS FOUND!');
      console.log('  This could mean:');
      console.log('  1. Orders were created before commissions');
      console.log('  2. Commissions are being created but not showing');
      console.log('  3. Database query issue');
    }

    console.log('\n🔑 LOGIN WITH THIS:');
    console.log('  Email:', latestAffiliate.userId?.email);
    console.log('  Password: TestPassword123!');
    console.log('  Expected Earnings: $' + commissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0).toFixed(2));

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
