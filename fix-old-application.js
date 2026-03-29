/**
 * Quick Fix Script
 * Updates old influencer applications to have the correct userId
 * 
 * Usage: node fix-old-application.js
 */

const mongoose = require('mongoose');
const config = require('./src/config/environment');

// Connect to MongoDB
mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });

// Define the schema inline since we just need to update
const influencerSchema = new mongoose.Schema({}, { strict: false });
const InfluencerApplication = mongoose.model(
  'InfluencerApplication',
  influencerSchema,
  'influencer_applications'  // Using the correct collection name with underscore
);

const User = mongoose.model(
  'User',
  new mongoose.Schema({}, { strict: false }),
  'users'
);

async function fixApplications() {
  try {
    // Find applications with null userId
    const applicationsWithNullUserId = await InfluencerApplication.find({
      userId: null,
    });

    console.log(`\n📋 Found ${applicationsWithNullUserId.length} applications with null userId\n`);

    if (applicationsWithNullUserId.length === 0) {
      console.log('✅ No applications to fix!');
      process.exit(0);
    }

    // For each application, find the matching user by email and update
    for (const app of applicationsWithNullUserId) {
      console.log(`\n🔍 Processing: ${app.email}`);

      // Find user by email
      const user = await User.findOne({ email: app.email });

      if (!user) {
        console.log(`   ⚠️  No user found with email: ${app.email}`);
        continue;
      }

      console.log(`   ✅ Found user: ${user._id}`);

      // Update application with userId
      await InfluencerApplication.updateOne(
        { _id: app._id },
        { $set: { userId: user._id } }
      );

      console.log(`   ✅ Updated application with userId: ${user._id}`);
    }

    console.log(`\n✅ All applications fixed!\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Run the fix
fixApplications();
