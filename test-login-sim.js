const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const { comparePasswords } = require('./src/utils/passwordUtils');

(async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected\n');

    // Get the latest test user
    const email = 'affiliate-seed-1773767812297@test.com';
    console.log('🔍 Looking for user:', email);
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   isActive:', user.isActive);
    console.log('   affiliateStatus:', user.affiliateStatus);
    console.log('   Password field exists:', !!user.password);

    // Simulate login logic step by step
    console.log('\n📝 Simulating login steps...');

    // Step 1: Check if user exists
    console.log('  1. User exists:', !!user);
    
    // Step 2: Check if locked
    console.log('  2. isLocked():', user.isLocked ? user.isLocked() : 'Method not available');
    
    // Step 3: Check if active
    console.log('  3. isActive:', user.isActive);
    if (!user.isActive) {
      console.log('     ❌ Account deactivated!');
      process.exit(1);
    }
    
    // Step 4: Compare passwords
    const testPassword = 'TestPassword123!';
    console.log('  4. Comparing password...');
    console.log('     Plain password:', testPassword);
    console.log('     Hash (first 50):', user.password ? user.password.substring(0, 50) : 'NO HASH');
    
    const isMatch = await comparePasswords(testPassword, user.password);
    console.log('     Match result:', isMatch ? '✅ YES' : '❌ NO');

    if (!isMatch) {
      console.log('\n❌ LOGIN WOULD FAIL: Password does not match');
      process.exit(1);
    }

    console.log('\n✅ ALL LOGIN CHECKS PASSED');
    console.log('   The login should succeed with TestPassword123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();

setTimeout(() => {
  console.log('⏱️ Timeout');
  process.exit(1);
}, 8000);
