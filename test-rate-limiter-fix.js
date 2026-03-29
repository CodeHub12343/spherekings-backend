const axios = require('axios');

async function testAuth() {
  try {
    console.log('Starting auth test...');
    
    // First login
    console.log('Attempting login...');
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'affiliate-seed-1773768573531@test.com',
      password: 'TestPassword123!'
    }, {
      validateStatus: () => true
    });
    
    console.log('Login response status:', loginRes.status);
    
    if (loginRes.status !== 200) {
      console.log('❌ Login failed:', loginRes.status, JSON.stringify(loginRes.data));
      return;
    }
    
    const token = loginRes.data.accessToken;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Now test /me endpoint multiple times
    console.log('\nTesting /me endpoint...');
    for (let i = 0; i < 5; i++) {
      const meRes = await axios.get('http://localhost:5000/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true
      });
      
      if (meRes.status === 200) {
        console.log(`✅ Request ${i+1}: SUCCESS - Status ${meRes.status}`);
        if (i === 0) {
          console.log('   User:', meRes.data.user.email);
          console.log('   Affiliate ID:', meRes.data.user.affiliateId);
          console.log('   Affiliate Code:', meRes.data.user.affiliateCode);
          console.log('   Affiliate Status:', meRes.data.user.affiliateStatus);
        }
      } else {
        console.log(`❌ Request ${i+1}: FAILED - Status ${meRes.status}`);
        if (meRes.data) console.log('   Response:', JSON.stringify(meRes.data).substring(0, 100));
      }
    }
  } catch (error) {
    console.error('Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAuth().catch(console.error);
