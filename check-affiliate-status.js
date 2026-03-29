/**
 * Check Affiliate Status Script
 * Displays affiliate account status and activates if needed
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Affiliate = require('./src/models/Affiliate');

async function checkAffiliateStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the affiliate by code
    const affiliate = await Affiliate.findOne({ affiliateCode: 'AFFP038HUSQ75C' });
    
    if (!affiliate) {
      console.log('❌ Affiliate code AFFP038HUSQ75C not found');
      process.exit(1);
    }

    console.log('\n📋 Affiliate Status:');
    console.log(`   Code: ${affiliate.affiliateCode}`);
    console.log(`   Status: ${affiliate.status}`);
    console.log(`   Email Verified: ${affiliate.emailVerified}`);
    console.log(`   User ID: ${affiliate.userId}`);

    // Check if status is not "active"
    if (affiliate.status !== 'active') {
      console.log(`\n⚠️  Status is "${affiliate.status}", updating to "active"...`);
      affiliate.status = 'active';
      affiliate.emailVerified = true;
      await affiliate.save();
      console.log('✅ Affiliate activated successfully');
    } else {
      console.log('\n✅ Affiliate is already active');
    }

    console.log('\n📋 Updated Affiliate Status:');
    console.log(`   Code: ${affiliate.affiliateCode}`);
    console.log(`   Status: ${affiliate.status}`);
    console.log(`   Email Verified: ${affiliate.emailVerified}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAffiliateStatus();
