/**
 * Script to Recreate Sponsorship Tiers
 * Run: node recreate-sponsorship-tiers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SponsorshipTier = require('./src/models/SponsorshipTier');

const TIERS = [
  {
    name: "King's Pawn",
    slug: 'kings-pawn',
    price: 100000, // $1,000 in cents
    videoMentions: 10,
    benefitsSummary: 'Entry-level sponsorship with basic mentions',
    benefits: [
      '10 guaranteed video mentions',
      '30-day campaign window',
      'Brand mention in captions',
      'Basic reporting dashboard'
    ],
    description: 'Perfect for new brands or limited budgets.',
    campaignCycle: 'kickstarter_2026_q2',
    defaultDeliveryDays: 45,
    featured: false,
    displayOrder: 1,
    active: true,
  },
  {
    name: 'Royal Knight',
    slug: 'royal-knight',
    price: 250000, // $2,500 in cents
    videoMentions: 25,
    benefitsSummary: 'Premium sponsorship with expanded reach',
    benefits: [
      '25 guaranteed video mentions',
      '30-day campaign window',
      'Product showcase videos',
      'Detailed reporting & analytics'
    ],
    description: 'Best value for established brands.',
    campaignCycle: 'kickstarter_2026_q2',
    defaultDeliveryDays: 45,
    featured: true,
    displayOrder: 2,
    active: true,
  },
  {
    name: 'Crown Prince',
    slug: 'crown-prince',
    price: 500000, // $5,000 in cents
    videoMentions: 50,
    benefitsSummary: 'Premium sponsorship with dedicated support',
    benefits: [
      '50 guaranteed video mentions',
      '60-day campaign window',
      'Dedicated content creator',
      'Premium custom reporting'
    ],
    description: 'For maximum brand impact and reach.',
    campaignCycle: 'kickstarter_2026_q2',
    defaultDeliveryDays: 75,
    featured: false,
    displayOrder: 3,
    active: true,
  },
];

async function recreateTiers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if tiers already exist
    const existingCount = await SponsorshipTier.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} tiers already exist.`);
      const answer = await new Promise((resolve) => {
        process.stdout.write('Delete existing tiers and recreate? (yes/no): ');
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (answer === 'yes') {
        await SponsorshipTier.deleteMany({});
        console.log('🗑️  Deleted existing tiers');
      } else {
        console.log('❌ Cancelled. Existing tiers preserved.');
        process.exit(0);
      }
    }

    // Create new tiers
    const created = await SponsorshipTier.insertMany(TIERS);
    console.log(`\n✅ Successfully recreated ${created.length} sponsorship tiers:\n`);

    created.forEach((tier) => {
      console.log(`  📌 ${tier.name}`);
      console.log(`     • Price: $${(tier.price / 100).toFixed(2)}`);
      console.log(`     • Videos: ${tier.videoMentions}`);
      console.log(`     • Featured: ${tier.featured ? 'Yes' : 'No'}`);
      console.log(`     • Status: ${tier.active ? 'Active' : 'Inactive'}\n`);
    });

    console.log('🎉 Sponsorship tiers restored successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Start
recreateTiers();
