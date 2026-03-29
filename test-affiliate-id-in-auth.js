#!/usr/bin/env node
/**
 * Test script to verify affiliateId is now included in user object from auth service
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const authService = require('./src/services/authService');

async function testAffiliateIdInAuth() {
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

    console.log('🔐 Testing Authentication Service');
    console.log('=====================================\n');
    console.log(`User Email: ${user.email}`);
    console.log(`User ID: ${user._id}`);
    console.log(`Affiliate Status: ${user.affiliateStatus}\n`);

    // Test 1: getCurrentUserById
    console.log('📋 Test 1: getCurrentUserById()');
    console.log('-----------------------------------');
    const userFromGetCurrent = await authService.getCurrentUserById(user._id.toString());
    
    console.log(`✅ User retrieved: ${userFromGetCurrent.email}`);
    console.log(`   • name: ${userFromGetCurrent.name}`);
    console.log(`   • role: ${userFromGetCurrent.role}`);
    console.log(`   • affiliateStatus: ${userFromGetCurrent.affiliateStatus}`);
    console.log(`   • affiliateId: ${userFromGetCurrent.affiliateId || 'NOT SET ❌'}`);
    console.log(`   • affiliateCode: ${userFromGetCurrent.affiliateCode || 'NOT SET'}\n`);

    // Test 2: Check if affiliate ID matches actual affiliate
    if (userFromGetCurrent.affiliateId) {
      const affiliate = await Affiliate.findById(userFromGetCurrent.affiliateId);
      if (affiliate) {
        console.log('✅ Affiliate ID is valid:');
        console.log(`   • Affiliate Code: ${affiliate.affiliateCode}`);
        console.log(`   • Status: ${affiliate.status}\n`);
      } else {
        console.log('❌ Affiliate ID does not match any affiliate\n');
      }
    }

    // Test 3: refreshAccessToken
    console.log('📋 Test 2: refreshAccessToken()');
    console.log('-----------------------------------');
    const refreshResult = await authService.refreshAccessToken(user._id.toString());
    
    console.log(`✅ Token refreshed`);
    console.log(`   • Has accessToken: ${!!refreshResult.accessToken}`);
    console.log(`   • User affiliateId: ${refreshResult.user.affiliateId || 'NOT SET ❌'}`);
    console.log(`   • User affiliateCode: ${refreshResult.user.affiliateCode || 'NOT SET'}\n`);

    // Test 4: loginUser
    console.log('📋 Test 3: loginUser()');
    console.log('-----------------------------------');
    const loginResult = await authService.loginUser(user.email, 'TestPassword123!');
    
    console.log(`✅ User logged in`);
    console.log(`   • Email: ${loginResult.user.email}`);
    console.log(`   • Has accessToken: ${!!loginResult.accessToken}`);
    console.log(`   • Has refreshToken: ${!!loginResult.refreshToken}`);
    console.log(`   • User affiliateId: ${loginResult.user.affiliateId || 'NOT SET ❌'}`);
    console.log(`   • User affiliateCode: ${loginResult.user.affiliateCode || 'NOT SET'}\n`);

    // Summary
    console.log('✅ SUMMARY');
    console.log('=====================================');
    if (userFromGetCurrent.affiliateId && loginResult.user.affiliateId && refreshResult.user.affiliateId) {
      console.log('✅ All auth methods now include affiliateId!');
      console.log(`   Frontend can now access user.affiliateId = "${userFromGetCurrent.affiliateId}"`);
      console.log('\n🎉 Fix is working correctly!');
    } else {
      console.log('❌ Some auth methods are still missing affiliateId');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testAffiliateIdInAuth();
