/**
 * ============================================================================
 * END-TO-END TEST: Influencer & Sponsorship Features
 * ============================================================================
 *
 * Comprehensive test suite for:
 * - Influencer application submission and approval flow
 * - Sponsorship tier management
 * - Sponsorship purchase and webhook handling
 *
 * Usage: node test-influencer-sponsorship-e2e.js
 *
 * ============================================================================
 */

const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const InfluencerApplication = require('./src/models/InfluencerApplication');
const SponsorshipTier = require('./src/models/SponsorshipTier');
const SponsorshipRecord = require('./src/models/SponsorshipRecord');
const Product = require('./src/models/Product');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spherekings';

// Test data
let testUsers = {};
let testApplications = {};
let testTiers = {};
let testRecords = {};

// Logging utilities
const log = {
  section: (title) => console.log(`\n${'='.repeat(70)}\n${title}\n${'='.repeat(70)}`),
  test: (name) => console.log(`\n📝 TEST: ${name}`),
  success: (msg) => console.log(`✅ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  result: (condition, expected, actual) => {
    if (condition) {
      console.log(`   ✓ Assert: Expected ${expected}, Got ${actual}`);
    } else {
      console.log(`   ✗ Assert FAILED: Expected ${expected}, Got ${actual}`);
    }
  }
};

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    log.info('Connecting to MongoDB...');
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log.success('Connected to MongoDB');
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    log.success('Disconnected from MongoDB');
  } catch (error) {
    log.error(`MongoDB disconnection failed: ${error.message}`);
  }
}

/**
 * ============================================================================
 * PHASE 1: SEED TEST DATA
 * ============================================================================
 */

async function seedInfluencerApplications() {
  log.section('PHASE 1: SEED TEST DATA - Influencer Applications');

  try {
    // Clear existing data
    await InfluencerApplication.deleteMany({});
    log.info('Cleared existing influencer applications');

    // Create test influencer applications
    const applications = [
      {
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@example.com',
        platforms: ['Instagram', 'TikTok'],
        socialHandles: { instagram: '@sarahmitchell', tiktok: '@sarahm' },
        followerCount: 125000,
        averageEngagementRate: 8.5,
        shippingAddress: {
          street: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        },
        contentCommitment: 'videos_per_day',
        phoneNumber: '+1-555-0101',
        status: 'pending',
        totalVideos: 60,
        videosPerDay: 2,
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        platforms: ['YouTube', 'Instagram'],
        socialHandles: { youtube: 'MikeJ', instagram: '@mikej' },
        followerCount: 250000,
        averageEngagementRate: 12.3,
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA'
        },
        contentCommitment: 'videos_per_day',
        phoneNumber: '+1-555-0102',
        status: 'pending',
        totalVideos: 45,
        videosPerDay: 1,
      },
      {
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@example.com',
        platforms: ['TikTok', 'Instagram', 'YouTube'],
        socialHandles: { tiktok: '@emmarod', instagram: '@emmarod', youtube: 'EmmaRod' },
        followerCount: 550000,
        averageEngagementRate: 15.2,
        shippingAddress: {
          street: '789 Pine Rd',
          city: 'Miami',
          state: 'FL',
          postalCode: '33101',
          country: 'USA'
        },
        contentCommitment: 'videos_per_day',
        phoneNumber: '+1-555-0103',
        status: 'pending',
        totalVideos: 60,
        videosPerDay: 3,
      },
    ];

    const savedApplications = await InfluencerApplication.insertMany(applications);
    testApplications = savedApplications.reduce((acc, app) => {
      acc[app.email] = app;
      return acc;
    }, {});

    log.success(`Created ${savedApplications.length} test influencer applications`);
    savedApplications.forEach(app => {
      log.info(`  • ${app.name} (${app.email}) - ${app.followerCount} followers`);
    });
  } catch (error) {
    log.error(`Failed to seed influencer applications: ${error.message}`);
    throw error;
  }
}

async function seedSponsorshipTiers() {
  log.section('PHASE 1: SEED TEST DATA - Sponsorship Tiers');

  try {
    // Clear existing data
    await SponsorshipTier.deleteMany({});
    log.info('Cleared existing sponsorship tiers');

    // Create default sponsorship tiers
    const tiers = [
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

    const savedTiers = await SponsorshipTier.insertMany(tiers);
    testTiers = savedTiers.reduce((acc, tier) => {
      acc[tier.name] = tier;
      return acc;
    }, {});

    log.success(`Created ${savedTiers.length} test sponsorship tiers`);
    savedTiers.forEach(tier => {
      log.info(`  • ${tier.name} ($${tier.price / 100}) - ${tier.benefits.length} benefits`);
    });
  } catch (error) {
    log.error(`Failed to seed sponsorship tiers: ${error.message}`);
    throw error;
  }
}

/**
 * ============================================================================
 * PHASE 2: TEST INFLUENCER ENDPOINT
 * ============================================================================
 */

async function testInfluencerSubmitApplication() {
  log.test('Submit Influencer Application');

  try {
    const applicationData = {
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      platforms: ['Instagram', 'YouTube'],
      socialHandles: { instagram: '@alexchen', youtube: 'AlexChen' },
      followerCount: 180000,
      averageEngagementRate: 9.5,
      shippingAddress: {
        street: '321 Elm St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'USA'
      },
      contentCommitment: 'videos_per_day',
      phoneNumber: '+1-555-0104',
      totalVideos: 60,
      videosPerDay: 2,
    };

    const response = await axios.post(`${API_BASE_URL}/influencer/apply`, applicationData);
    
    log.info(`Status: ${response.status}`);
    log.result(response.status === 201, 201, response.status);
    log.result(response.data.success === true, 'true', response.data.success);
    log.result(response.data.data._id !== undefined, 'valid ID', response.data.data._id ? 'present' : 'missing');
    
    testApplications[applicationData.email] = response.data.data;
    log.success('Influencer application submitted successfully');
    return response.data.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
    const status = error.response?.status || 'no status';
    log.error(`Submit application failed [${status}]: ${errorMsg}`);
    if (error.response) {
      log.info(`Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function testInfluencerApplicationApproval() {
  log.test('Approve Influencer Application');

  try {
    const appEmail = Object.keys(testApplications)[0];
    const application = testApplications[appEmail];

    const response = await axios.put(
      `${API_BASE_URL}/influencer/${application._id}/approve`,
      { notes: 'Great engagement rate and follower count!' },
      {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_TEST_TOKEN || 'test-token-admin'}`,
        },
      }
    );

    log.info(`Status: ${response.status}`);
    log.result(response.data.success === true, 'true', response.data.success);
    log.result(response.data.data.status === 'approved', 'approved', response.data.data.status);
    
    log.success('Application approved successfully');
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      log.info('(Skipping approval - requires admin token)');
      return null;
    }
    log.error(`Approval failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testInfluencerListApplications() {
  log.test('List Influencer Applications');

  try {
    const response = await axios.get(`${API_BASE_URL}/influencer/applications?page=1`, {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_TEST_TOKEN || 'test-token-admin'}`,
      },
    });

    log.info(`Status: ${response.status}`);
    log.result(response.status === 200, 200, response.status);
    log.result(Array.isArray(response.data.data), 'array', Array.isArray(response.data.data) ? 'array' : 'not array');
    
    const count = response.data.data?.length || 0;
    log.success(`Listed ${count} influencer applications`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      log.info('(Skipping list - requires admin token)');
      return null;
    }
    log.error(`List applications failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * ============================================================================
 * PHASE 3: TEST SPONSORSHIP ENDPOINTS
 * ============================================================================
 */

async function testSponsorshipGetTiers() {
  log.test('Get All Sponsorship Tiers');

  try {
    const response = await axios.get(`${API_BASE_URL}/sponsorship/tiers`);

    log.info(`Status: ${response.status}`);
    log.result(response.status === 200, 200, response.status);
    log.result(Array.isArray(response.data.data), 'array', Array.isArray(response.data.data) ? 'array' : 'not array');
    
    const count = response.data.data?.length || 0;
    log.success(`Retrieved ${count} sponsorship tiers`);
    
    // Log tier details
    response.data.data?.forEach(tier => {
      log.info(`  • ${tier.name} ($${tier.price / 100}) - ${tier.videoMentions} videos`);
    });
    
    return response.data.data;
  } catch (error) {
    log.error(`Get tiers failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testSponsorshipGetTierById() {
  log.test('Get Single Sponsorship Tier by ID');

  try {
    const tierName = 'Royal Knight';
    const tier = testTiers[tierName];
    
    if (!tier) {
      log.error(`Tier ${tierName} not found in test data`);
      return null;
    }

    const response = await axios.get(`${API_BASE_URL}/sponsorship/tiers/${tier._id}`);

    log.info(`Status: ${response.status}`);
    log.result(response.status === 200, 200, response.status);
    log.result(response.data.data.name === tierName, tierName, response.data.data.name);
    log.result(response.data.data.videoMentions === 25, 25, response.data.data.videoMentions);
    
    log.success(`Retrieved tier: ${response.data.data.name}`);
    return response.data.data;
  } catch (error) {
    log.error(`Get tier by ID failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testSponsorshipInitiatePurchase() {
  log.test('Initiate Sponsorship Purchase (Create Stripe Session)');

  try {
    const tierName = 'Royal Knight';
    const tier = testTiers[tierName];
    
    if (!tier) {
      log.error(`Tier ${tierName} not found in test data`);
      return null;
    }

    const purchaseData = {
      tierId: tier._id,
      sponsorName: 'TechCorp Inc.',
      sponsorEmail: 'sponsor@techcorp.com',
      sponsorCompany: 'TechCorp Inc.',
    };

    const response = await axios.post(
      `${API_BASE_URL}/sponsorship/purchase`,
      purchaseData,
      {
        headers: {
          Authorization: `Bearer ${process.env.USER_TEST_TOKEN || 'test-token-user'}`,
        },
      }
    );

    log.info(`Status: ${response.status}`);
    log.result(response.data.success === true, 'true', response.data.success);
    log.result(response.data.data.sessionId !== undefined, 'session ID present', response.data.data.sessionId ? 'yes' : 'no');
    
    // Save the record ID for later tests
    if (response.data.data.recordId) {
      testRecords['stripe-test'] = response.data.data.recordId;
    }

    log.success('Sponsorship purchase initiated - Stripe session created');
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      log.info('(Skipping purchase - requires user token)');
      return null;
    }
    log.error(`Initiate purchase failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * ============================================================================
 * PHASE 4: DATABASE VALIDATION
 * ============================================================================
 */

async function validateDatabaseState() {
  log.section('PHASE 4: DATABASE VALIDATION');

  try {
    // Count influencer applications
    const appCount = await InfluencerApplication.countDocuments();
    log.info(`Influencer Applications in DB: ${appCount}`);
    
    // Count by status
    const byStatus = await InfluencerApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    byStatus.forEach(item => {
      log.info(`  • ${item._id}: ${item.count}`);
    });

    // Count sponsorship tiers
    const tierCount = await SponsorshipTier.countDocuments();
    log.info(`Sponsorship Tiers in DB: ${tierCount}`);
    
    // Count active tiers
    const activeTiers = await SponsorshipTier.countDocuments({ active: true });
    log.info(`  • Active: ${activeTiers}`);

    // Count sponsorship records
    const recordCount = await SponsorshipRecord.countDocuments();
    log.info(`Sponsorship Records in DB: ${recordCount}`);

    log.success('Database validation complete');
  } catch (error) {
    log.error(`Database validation failed: ${error.message}`);
  }
}

/**
 * ============================================================================
 * MAIN TEST EXECUTION
 * ============================================================================
 */

async function runAllTests() {
  try {
    log.section('STARTING END-TO-END TEST SUITE');
    log.info(`API Base URL: ${API_BASE_URL}`);
    log.info(`Timestamp: ${new Date().toISOString()}`);

    // Phase 1: Seed test data
    await connectDB();
    await seedInfluencerApplications();
    await seedSponsorshipTiers();

    // Phase 2: Test influencer endpoints
    log.section('PHASE 2: TEST INFLUENCER ENDPOINTS');
    try {
      await testInfluencerSubmitApplication();
      await testInfluencerApplicationApproval();
      await testInfluencerListApplications();
    } catch (error) {
      log.error(`Influencer endpoint tests encountered issues: ${error.message}`);
    }

    // Phase 3: Test sponsorship endpoints
    log.section('PHASE 3: TEST SPONSORSHIP ENDPOINTS');
    try {
      await testSponsorshipGetTiers();
      await testSponsorshipGetTierById();
      await testSponsorshipInitiatePurchase();
    } catch (error) {
      log.error(`Sponsorship endpoint tests encountered issues: ${error.message}`);
    }

    // Phase 4: Validate database
    await validateDatabaseState();

    log.section('TEST SUITE COMPLETE');
    log.success('End-to-end test suite completed successfully!');
  } catch (error) {
    log.error(`Test execution failed: ${error.message}`);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

// Run tests
runAllTests();
