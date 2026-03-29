#!/usr/bin/env node
/**
 * Test the /api/auth/me endpoint with a proper auth token
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const User = require('./src/models/User');
const { generateAccessToken } = require('./src/utils/jwtUtils');

async function testMeEndpoint() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Find test user
    const user = await User.findOne({ email: 'affiliate-seed-1773768573531@test.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('🧪 Testing /api/auth/me Endpoint');
    console.log('=====================================\n');

    // Generate a test JWT token (like what the frontend would have)
    const token = generateAccessToken(user._id.toString(), user.role);
    console.log(`Generated token: ${token.substring(0, 50)}...\n`);

    // Make HTTP request to /me endpoint with token
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    console.log(`Making request to ${apiUrl}/api/auth/me\n`);

    try {
      const response = await axios.get(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: () => true // Don't throw on any status code
      });

      console.log(`📊 Response Status: ${response.status}`);
      console.log(`Headers returned:`, response.headers['content-type']);

      if (response.status === 200 && response.data?.success) {
        console.log(`\n✅ /me endpoint working correctly!`);
        
        const userData = response.data.data?.user;
        console.log(`\nUser data returned:`);
        console.log(`  • email: ${userData.email}`);
        console.log(`  • role: ${userData.role}`);
        console.log(`  • affiliateStatus: ${userData.affiliateStatus}`);
        console.log(`  • affiliateId: ${userData.affiliateId || 'NOT SET ❌'}`);
        console.log(`  • affiliateCode: ${userData.affiliateCode || 'NOT SET'}`);

        if (!userData.affiliateId) {
          console.log('\n⚠️  WARNING: affiliateId not in response!');
          console.log('This would cause frontend auth to fail.');
        }
      } else {
        console.log(`\n❌ /me endpoint returned error!`);
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.error(`\n❌ Request failed: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.error('   Backend server is not running. Start it with: npm run dev');
      } else {
        console.error(error);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testMeEndpoint();
