const axios = require('axios');

async function testSalesDataStructure() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'affiliate-seed-1773768573531@test.com',
      password: 'TestPassword123!'
    });
    
    const token = loginRes.data.tokens.accessToken;
    const affiliateId = loginRes.data.data.user.affiliateId;
    
    console.log('Testing Sales API Response Structure\n');
    console.log('=====================================\n');
    
    // Call the sales endpoint
    const salesRes = await axios.get(
      `http://localhost:5000/api/v1/tracking/sales/${affiliateId}?page=1&limit=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Sales API Response Structure:');
    console.log('Key path: response.data\n');
    console.log(JSON.stringify(salesRes.data, null, 2));
    
    console.log('\n\nData extraction for frontend:\n');
    console.log('1. React Query receives response.data as "data"');
    console.log('2. To get sales array: data.data.sales');
    console.log(`3. Number of sales: ${salesRes.data?.data?.sales?.length || 0}`);
    console.log(`4. First sale: ${salesRes.data?.data?.sales?.[0]?._id || 'undefined'}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSalesDataStructure();
