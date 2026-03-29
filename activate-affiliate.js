/**
 * Activate Affiliate Account
 * Manually activates an affiliate account for testing/development
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const config = require('./src/config/environment');

async function activateAffiliate(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📡 Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email}`);

    // Find affiliate account
    const affiliate = await Affiliate.findOne({ userId: user._id });

    if (!affiliate) {
      console.error(`❌ Affiliate account not found for user: ${email}`);
      process.exit(1);
    }

    console.log(`📋 Current status: ${affiliate.status}`);
    console.log(`📧 Email verified: ${affiliate.emailVerified}`);

    // Update affiliate to active
    affiliate.status = 'active';
    affiliate.emailVerified = true;
    affiliate.emailVerificationToken = null;
    affiliate.emailVerificationTokenExpires = null;

    await affiliate.save();

    console.log(`\n✅ Affiliate account activated!`);
    console.log(`📌 Affiliate Code: ${affiliate.affiliateCode}`);
    console.log(`🔗 Status: ${affiliate.status}`);
    console.log(`📧 Email Verified: ${affiliate.emailVerified}`);

    // Also update user affiliateDetails if it exists
    if (user.affiliateDetails) {
      user.affiliateDetails.status = 'active';
      user.affiliateDetails.emailVerified = true;
      await user.save();
      console.log(`✅ Updated user.affiliateDetails`);
    }

    console.log(`\n✨ Ready to request payouts!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: node activate-affiliate.js <email>');
  console.error('Example: node activate-affiliate.js user@example.com');
  process.exit(1);
}

activateAffiliate(email);
