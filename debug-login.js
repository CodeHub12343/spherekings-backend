const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

(async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB\n');

    // Get the latest affiliate seed user - explicitly select password
    const user = await User.findOne({ email: /affiliate-seed/ })
      .sort({ createdAt: -1 })
      .select('+password'); // Explicitly select password field

    if (!user) {
      console.log('❌ No affiliate seed user found');
      process.exit(1);
    }

    console.log('✅ Found user:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Affiliate Status:', user.affiliateStatus);
    console.log('  Created At:', user.createdAt);

    // Try password comparison
    const testPassword = 'TestPassword123!';
    console.log('\n🔐 Testing password:');
    console.log('  Password to test:', testPassword);
    console.log('  Password hash stored (first 50 chars):', user.password ? user.password.substring(0, 50) : 'NO PASSWORD');

    if (!user.password) {
      console.log('❌ User has no password hash!');
      process.exit(1);
    }

    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('  Password match result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');

    if (!isMatch) {
      console.log('\n⚠️  Password does not match!');
      console.log('The seed script may have used a different password.');
      console.log('\n💡 Solution: Hash the correct password and update user:');
      
      // Generate correct hash
      const hash = await bcrypt.hash(testPassword, 10);
      console.log(`
Use this command to update the user:
db.users.updateOne(
  { _id: ObjectId("${user._id}") },
  { $set: { password: "${hash}" } }
)
`);
    } else {
      console.log('\n✅ Password is correct!');
      console.log('The login should work. Check the backend authentication middleware.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

// Safety timeout
setTimeout(() => {
  console.log('⏱️ Timeout - closing script');
  process.exit(1);
}, 8000);
