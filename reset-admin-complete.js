const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');
const User = require('./src/models/User');

const resetAdminUser = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete existing admin if any
    const deleteResult = await User.deleteOne({ email: 'admin@example.com' });
    if (deleteResult.deletedCount > 0) {
      console.log('🗑️  Deleted existing admin@example.com');
    }

    // Create fresh admin user with correct role
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!', // Will be hashed by mongoose middleware
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    await admin.save();
    console.log('✅ Fresh admin user created with role: "admin"');
    console.log('\n👤 Admin Credentials:');
    console.log('   📧 Email: admin@example.com');
    console.log('   🔐 Password: AdminPass123!');
    console.log('   👑 Role: admin');
    console.log('   🆔 ID:', admin._id);
    
    // Verify it was saved correctly
    const verify = await User.findOne({ email: 'admin@example.com' });
    console.log('\n✅ Verification - Admin role in DB:', verify.role);

    console.log('\n📌 NEXT STEPS:');
    console.log('   1. Go to http://localhost:3000/login');
    console.log('   2. Clear browser localStorage (DevTools > Application > Local Storage > Clear All)');
    console.log('   3. Log out if logged in');
    console.log('   4. Log back in with admin@example.com / AdminPass123!');
    console.log('   5. Visit http://localhost:3000/admin/dashboard');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminUser();
