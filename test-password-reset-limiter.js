/**
 * Test Password Reset Rate Limiter
 * Verifies that password reset endpoints are rate limited to 3 attempts per hour
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test email
const testEmail = 'rate-limit-test@test.com';

async function testPasswordResetLimiter() {
  console.log('\n=== PASSWORD RESET RATE LIMITER TEST ===\n');
  
  console.log('This test verifies that:');
  console.log('1. First 3 password reset attempts succeed');
  console.log('2. 4th attempt (within 1 hour) is blocked with 429');
  console.log('3. Error message is clear\n');
  
  console.log(`Testing with email: ${testEmail}\n`);
  
  let successCount = 0;
  let blockedCount = 0;
  
  try {
    // Attempt 1: Should succeed
    console.log('Attempt 1...');
    const response1 = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testEmail
    });
    console.log(`✅ Status: ${response1.status}`);
    console.log(`   Message: ${response1.data?.message || 'Password reset email sent'}\n`);
    successCount++;
    
    // Brief delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Attempt 2: Should succeed
    console.log('Attempt 2...');
    const response2 = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testEmail
    });
    console.log(`✅ Status: ${response2.status}`);
    console.log(`   Message: ${response2.data?.message || 'Password reset email sent'}\n`);
    successCount++;
    
    // Brief delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Attempt 3: Should succeed
    console.log('Attempt 3...');
    const response3 = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testEmail
    });
    console.log(`✅ Status: ${response3.status}`);
    console.log(`   Message: ${response3.data?.message || 'Password reset email sent'}\n`);
    successCount++;
    
    // Brief delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Attempt 4: Should be blocked (429)
    console.log('Attempt 4 (should be blocked)...');
    try {
      const response4 = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: testEmail
      });
      console.log(`❌ ERROR: Should have been blocked but got: ${response4.status}\n`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`✅ Status: ${error.response.status} (Too Many Requests)`);
        console.log(`   Message: ${error.response?.data?.message || 'Too many password reset attempts'}\n`);
        blockedCount++;
      } else {
        console.log(`❌ Unexpected status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
  
  // Print summary
  console.log('=== SUMMARY ===');
  console.log(`✅ Successful requests: ${successCount}/3`);
  console.log(`✅ Rate limited (429) responses: ${blockedCount}/1`);
  
  if (successCount === 3 && blockedCount === 1) {
    console.log('\n✅ PASSWORD RESET RATE LIMITER WORKING CORRECTLY\n');
    process.exit(0);
  } else {
    console.log('\n❌ TEST FAILED\n');
    process.exit(1);
  }
}

// Run test
testPasswordResetLimiter().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});
