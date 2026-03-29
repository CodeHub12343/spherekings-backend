const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');
const User = require('./src/models/User');

const createAdminUser = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('   Email: admin@example.com');
      console.log('   Password: AdminPass123!');
      await mongoose.disconnect();
      return;
    }

    // Create admin user - DON'T hash the password, let Mongoose middleware do it
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!', // Plain password - Mongoose will hash it
      role: 'admin',
      isEmailVerified: true,
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@example.com');
    console.log('   Password: AdminPass123!');
    console.log('\n📌 Use these credentials to login in Postman');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();
