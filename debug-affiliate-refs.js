#!/usr/bin/env node
/**
 * Debug script to find which affiliate references are broken
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Commission = require('./src/models/Commission');
const User = require('./src/models/User');
const Order = require('./src/models/Order');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all commissions with their affiliateId
    console.log('🔍 Finding commissions and their affiliate references...\n');
    
    const commissions = await Commission.find({})
      .select('_id affiliateId orderId status')
      .limit(5)
      .lean();

    console.log(`Found ${commissions.length} sample commissions:\n`);

    for (const commission of commissions) {
      const affiliate = await User.findById(commission.affiliateId).select('_id name email role');
      const order = await Order.findById(commission.orderId).select('_id totalAmount');
      
      console.log(`Commission ${commission._id}`);
      console.log(`  Status: ${commission.status}`);
      console.log(`  AffiliateId: ${commission.affiliateId}`);
      console.log(`  ✓ User exists? ${affiliate ? 'YES' : 'NO'}`);
      if (affiliate) {
        console.log(`    Name: ${affiliate.name}`);
        console.log(`    Email: ${affiliate.email}`);
        console.log(`    Role: ${affiliate.role}`);
      }
      console.log(`  OrderId: ${commission.orderId}`);
      console.log(`  ✓ Order exists? ${order ? 'YES' : 'NO'}`);
      if (order) {
        console.log(`    Amount: $${order.totalAmount}`);
      }
      console.log();
    }

    // Count broken references
    console.log('📊 Checking all 44 commissions for broken references...\n');
    
    const allCommissions = await Commission.find({})
      .select('affiliateId orderId')
      .lean();

    let missingAffiliates = 0;
    let missingOrders = 0;

    for (const comm of allCommissions) {
      const affiliateExists = await User.findById(comm.affiliateId).select('_id');
      const orderExists = await Order.findById(comm.orderId).select('_id');

      if (!affiliateExists) missingAffiliates++;
      if (!orderExists) missingOrders++;
    }

    console.log(`Results:`);
    console.log(`  Total commissions: ${allCommissions.length}`);
    console.log(`  Missing affiliates: ${missingAffiliates} ❌`);
    console.log(`  Missing orders: ${missingOrders} ❌`);
    console.log(`  Valid commissions: ${allCommissions.length - Math.max(missingAffiliates, missingOrders)} ✓`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
