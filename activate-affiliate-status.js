#!/usr/bin/env node
/**
 * Activate Affiliate Status
 * 
 * Script to activate affiliateStatus on User documents
 * Finds all users with role='affiliate' and sets their affiliateStatus to 'active'
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function activateAffiliates() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with role='affiliate' that don't have affiliateStatus='active'
    const affiliatesToActivate = await User.find({
      role: 'affiliate',
      affiliateStatus: { $ne: 'active' }
    });

    console.log(`\n📋 Found ${affiliatesToActivate.length} affiliates to activate:`);
    affiliatesToActivate.forEach(user => {
      console.log(`   - ${user.email} (current status: ${user.affiliateStatus || 'undefined'})`);
    });

    if (affiliatesToActivate.length === 0) {
      console.log('✅ All affiliates already have active status!');
      await mongoose.connection.close();
      return;
    }

    // Update all to active
    const result = await User.updateMany(
      {
        role: 'affiliate',
        affiliateStatus: { $ne: 'active' }
      },
      {
        $set: { affiliateStatus: 'active' }
      }
    );

    console.log(`\n✅ Activated ${result.modifiedCount} affiliate(s)`);

    // Show updated users
    const updatedAffiliates = await User.find({
      role: 'affiliate',
      affiliateStatus: 'active'
    });

    console.log(`\n📊 Active affiliates now: ${updatedAffiliates.length}`);
    updatedAffiliates.slice(0, 5).forEach(user => {
      console.log(`   - ${user.email} ✅`);
    });

    if (updatedAffiliates.length > 5) {
      console.log(`   ... and ${updatedAffiliates.length - 5} more`);
    }

    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

activateAffiliates();
