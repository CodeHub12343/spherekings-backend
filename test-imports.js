#!/usr/bin/env node
/**
 * Test to check if there are circular dependency issues
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function testImports() {
  try {
    console.log('🧪 Testing Imports and Circular Dependencies\n');

    console.log('1. Importing User model...');
    const User = require('./src/models/User');
    console.log('   ✅ User model loaded\n');

    console.log('2. Importing Affiliate model...');
    const Affiliate = require('./src/models/Affiliate');
    console.log('   ✅ Affiliate model loaded\n');

    console.log('3. Importing authService...');
    const authService = require('./src/services/authService');
    console.log('   ✅ authService loaded\n');

    console.log('4. Checking authService exports...');
    const exports = Object.keys(authService);
    console.log(`   • Exports: ${exports.join(', ')}\n`);

    if (!exports.includes('getCurrentUserById')) {
      console.error('   ❌ getCurrentUserById not exported!');
      return;
    }

    console.log('5. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ MongoDB connected\n');

    console.log('6. Testing getCurrentUserById with Affiliate model require...');
    const user = await User.findOne({ email: 'affiliate-seed-1773768573531@test.com' });
    
    if (user) {
      const result = await authService.getCurrentUserById(user._id.toString());
      console.log('   ✅ getCurrentUserById executed successfully');
      console.log(`   • Has affiliateId: ${!!result.affiliateId}`);
      console.log(`   • affiliateId value: ${result.affiliateId}\n`);
    }

    console.log('✅ All imports and tests successful - no circular dependency issues');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    console.log('\n⚠️  This error indicates there IS a problem with imports or circular dependencies!');
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testImports();
