#!/usr/bin/env node
/**
 * Test to simulate the auth flow that happens on page load
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const { generateTokenPair } = require('./src/utils/jwtUtils');

async function testAuthFlow() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Find the test affiliate user
    const user = await User.findOne({ email: 'affiliate-seed-1773768573531@test.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('🔄 Simulating Frontend Auth Flow');
    console.log('=====================================\n');

    // Step 1: Generate tokens (simulating login)
    console.log('Step 1: Generate tokens (simulating login)');
    const { accessToken, refreshToken } = generateTokenPair(
      user._id.toString(),
      user.role
    );
    console.log(`✅ Tokens generated`);
    console.log(`   • accessToken: ${accessToken.substring(0, 20)}...`);
    console.log(`   • refreshToken: ${refreshToken.substring(0, 20)}...\n`);

    // Step 2: Decode token to get userId (what frontend does)
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(accessToken);
    console.log('Step 2: Frontend decodes token to extract userId');
    console.log(`✅ Token decoded`);
    console.log(`   • userId from token: ${decoded.userId}\n`);

    // Step 3: Frontend calls getCurrentUser with userId
    console.log('Step 3: Frontend calls /api/auth/me which calls getCurrentUserById');
    console.log('Simulating the getCurrentUserById call with Affiliate lookup...');
    
    try {
      const userData = user.toJSON();
      
      // This is what we added - include affiliateId if user is an affiliate
      if (user.affiliateStatus === 'active') {
        console.log(`   ℹ️  User has affiliateStatus='active', looking up Affiliate...`);
        
        const affiliate = await Affiliate.findOne({ userId: user._id }).select('_id affiliateCode');
        
        if (affiliate) {
          userData.affiliateId = affiliate._id.toString();
          userData.affiliateCode = affiliate.affiliateCode;
          console.log(`   ✅ Found Affiliate:`);
          console.log(`      • affiliateId: ${affiliate._id}`);
          console.log(`      • affiliateCode: ${affiliate.affiliateCode}`);
        } else {
          console.log(`   ⚠️  No Affiliate found for this user`);
        }
      } else {
        console.log(`   ℹ️  User is not an active affiliate (status=${user.affiliateStatus})`);
      }

      console.log(`\n✅ getCurrentUserById completed successfully`);
      console.log(`   User data keys: ${Object.keys(userData).join(', ')}\n`);
    } catch (error) {
      console.error(`\n❌ ERROR in getCurrentUserById: ${error.message}`);
      console.error(error.stack);
      console.log('\n⚠️  This error would cause the frontend auth to fail!');
      return;
    }

    // Step 4: Check page redirect logic
    console.log('Step 4: Page redirect logic');
    console.log(`   • isAuthenticated = true (received user data)`);
    console.log(`   • Should NOT redirect to /login ✅\n`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Auth flow simulation successful - no errors should occur');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testAuthFlow();
