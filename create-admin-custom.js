const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');
const User = require('./src/models/User');

const createAdminUser = async (email, password) => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists with this email
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`✅ User already exists with email: ${email}`);
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email,
      password, // Plain password - Mongoose will hash it
      role: 'admin',
      isEmailVerified: true,
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n📌 Use these credentials to login');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Usage: node create-admin-custom.js <email> <password>');
  console.error('   Example: node create-admin-custom.js admin2@example.com MyPassword123!');
  process.exit(1);
}

createAdminUser(email, password);
