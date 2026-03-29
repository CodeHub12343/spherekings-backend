#!/usr/bin/env node
/**
 * Recovery Script: Restore missing affiliate User
 * Creates a User record for commissions that reference a deleted affiliate
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const missingAffiliateId = '69b98a00dd8ea58724e9a7f4';

    // Check if user exists
    const existing = await User.findById(missingAffiliateId);
    if (existing) {
      console.log('✅ User already exists:');
      console.log(`   Name: ${existing.name}`);
      console.log(`   Email: ${existing.email}`);
      process.exit(0);
    }

    console.log('🔧 Creating recovery User record...\n');

    // Create the missing user
    // Note: DO NOT hash password manually, let Mongoose middleware do it
    const recoveryUser = new User({
      _id: new mongoose.Types.ObjectId(missingAffiliateId),
      name: 'Recovered Affiliate',
      email: 'recovered-affiliate@example.com',
      password: 'TempPassword123!', // Will be hashed by Mongoose pre-save hook
      role: 'affiliate',
      isEmailVerified: true,
      affiliateStatus: 'inactive' // Mark as inactive since it was deleted
    });

    await recoveryUser.save();

    console.log('✅ Recovery User created successfully!');
    console.log(`   ID: ${recoveryUser._id}`);
    console.log(`   Name: ${recoveryUser.name}`);
    console.log(`   Email: ${recoveryUser.email}`);
    console.log(`   Role: ${recoveryUser.role}`);
    console.log(`   Status: ${recoveryUser.affiliateStatus}\n`);

    console.log('Now test the API again to see commissions populate correctly!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
