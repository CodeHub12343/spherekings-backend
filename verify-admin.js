const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');
const User = require('./src/models/User');

const verifyAdmin = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch admin user
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      await mongoose.disconnect();
      return;
    }

    console.log('👤 Admin User Details:');
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.isActive);
    console.log('   Email Verified:', admin.isEmailVerified);
    console.log('   ID:', admin._id);
    
    if (admin.role === 'admin') {
      console.log('\n✅ Admin role is correctly set to "admin"');
    } else {
      console.log('\n❌ Admin role is "' + admin.role + '" - should be "admin"');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyAdmin();
