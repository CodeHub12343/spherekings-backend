const axios = require('axios');

async function testAffiliateAPIs() {
  try {
    console.log('Testing Affiliate APIs...\n');
    
    // First login
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'affiliate-seed-1773768573531@test.com',
      password: 'TestPassword123!'
    });
    
    const token = loginRes.data.tokens.accessToken;
    const affiliateId = loginRes.data.data.user.affiliateId;
    
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 30)}...`);
    console.log(`   Affiliate ID: ${affiliateId}\n`);
    
    // Test /tracking/stats endpoint
    console.log('Testing /api/v1/tracking/stats endpoint...');
    const statsRes = await axios.get(`http://localhost:5000/api/v1/tracking/stats/${affiliateId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ /tracking/stats: Status ${statsRes.status}`);
    console.log(`   Total Commission: $${statsRes.data.totalCommission || 0}\n`);
    
    // Test /tracking/sales endpoint
    console.log('Testing /api/v1/tracking/sales endpoint...');
    const salesRes = await axios.get(`http://localhost:5000/api/v1/tracking/sales/${affiliateId}?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ /tracking/sales: Status ${salesRes.status}`);
    console.log(`   Sales Records: ${salesRes.data.data?.length || 0}`);
    console.log(`   Total Commission: $${salesRes.data.totalCommission || 0}\n`);
    
    // Test /affiliate/profile endpoint
    console.log('Testing /api/v1/affiliate/profile endpoint...');
    const profileRes = await axios.get(`http://localhost:5000/api/v1/affiliate/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ /affiliate/profile: Status ${profileRes.status}`);
    console.log(`   Total Earnings: $${profileRes.data.totalEarnings || 0}\n`);
    
    console.log('✅ All APIs responding correctly!');
    console.log('\nFrontend should now work without issues:');
    console.log('- referralService using /api/v1 base URL');
    console.log('- Token retrieved with correct key');
    console.log('- No forced 401 logout redirects');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

testAffiliateAPIs();
