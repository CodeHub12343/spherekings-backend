const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./src/config/environment');
const User = require('./src/models/User');

const fixAdminRole = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update admin user to have admin role
    const result = await User.updateOne(
      { email: 'admin@example.com' },
      { $set: { role: 'admin' } }
    );

    if (result.modifiedCount === 0) {
      console.log('❌ Admin user not found or already has admin role');
    } else {
      console.log('✅ Admin user role updated to "admin"');
      console.log('   Email: admin@example.com');
      console.log('\n✨ You can now access the admin dashboard!');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixAdminRole();
