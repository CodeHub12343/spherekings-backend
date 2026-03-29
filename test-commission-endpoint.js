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

    // Get latest affiliate to simulate API call
    const affiliateUser = await User.findOne({ email: /affiliate-seed/ }).sort({ createdAt: -1 });
    const affiliate = await Affiliate.findOne({ userId: affiliateUser._id });

    console.log('📋 TESTING COMMISSIONS ENDPOINT');
    console.log('  Affiliate:', affiliate.affiliateCode);
    console.log('  Affiliate ID:', affiliate._id);

    // Test the getAffiliateCommissions query
    console.log('\n🔍 TESTING Commission.getAffiliateCommissions()...');
    const result = await Commission.getAffiliateCommissions(affiliate._id, { page: 1, limit: 20 });
    
    console.log('  Commissions returned:', result.commissions.length);
    console.log('  Total in DB:', result.pagination.totalItems);
    
    if (result.commissions.length === 0) {
      console.log('\n❌ NO COMMISSIONS RETURNED!');
      console.log('  But we know there are 5 commissions in DB');
      
      // Try direct query to debug
      console.log('\n🔧 Trying direct Commission.find()...');
      const allCommissions = await Commission.find({ affiliateId: affiliate._id });
      console.log('  Direct find() returns:', allCommissions.length);
      
      if (allCommissions.length > 0) {
        console.log('\n  First commission:');
        console.log('    ID:', allCommissions[0]._id);
        console.log('    affiliateId:', allCommissions[0].affiliateId);
        console.log('    Affiliate ID we queried:', affiliate._id);
        console.log('    Match:', allCommissions[0].affiliateId.toString() === affiliate._id.toString());
      }
    } else {
      console.log('\n✅ COMMISSIONS FOUND:');
      result.commissions.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.orderNumber} - $${(c.calculation?.amount || 0).toFixed(2)} (${c.status})`);
      });
    }

    // Test stats
    console.log('\n🔍 TESTING Commission.getAffiliateStats()...');
    const stats = await Commission.getAffiliateStats(affiliate._id);
    console.log('  Stats:', stats);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

setTimeout(() => {
  console.log('⏱️ Timeout');
  process.exit(1);
}, 8000);
