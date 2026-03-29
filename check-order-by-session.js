/**
 * Check if order exists by Stripe session ID
 * Usage: node check-order-by-session.js <sessionId>
 */

require('dotenv').config();
const mongoose = require('mongoose');

const sessionId = process.argv[2];

if (!sessionId) {
  console.error('❌ No session ID provided');
  console.log('Usage: node check-order-by-session.js cs_test_...');
  process.exit(1);
}

async function checkOrder() {
  try {
    console.log('📦 Connecting to database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spherekings');
    console.log('✅ Connected to MongoDB');
    
    // Get models (ensure all dependencies are loaded)
    const User = require('./src/models/User');
    const Order = require('./src/models/Order');
    
    console.log(`\n🔍 Searching for order with session ID: ${sessionId}`);
    
    // Query by stripeSessionId
    const order = await Order.findOne({
      'paymentDetails.stripeSessionId': sessionId,
    }).populate('userId', 'name email');
    
    if (!order) {
      console.log('❌ No order found for this session ID');
      
      // Try to see all recent orders
      console.log('\n📋 Recent orders in database:');
      const recentOrders = await Order.find()
        .select('_id orderNumber paymentDetails.stripeSessionId total paymentStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(10);
      
      if (recentOrders.length > 0) {
        console.log('Found', recentOrders.length, 'orders:');
        recentOrders.forEach((o, i) => {
          console.log(`${i+1}. Order: ${o.orderNumber}`);
          console.log(`   Total: $${o.total}`);
          console.log(`   Status: ${o.paymentStatus}`);
          console.log(`   Session ID: ${o.paymentDetails?.stripeSessionId}`);
          console.log(`   Created: ${o.createdAt}`);
        });
      } else {
        console.log('No orders found in database');
      }
    } else {
      console.log('✅ Order found!\n');
      console.log('Order Details:');
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  Order ID: ${order._id}`);
      console.log(`  Total: $${order.total}`);
      console.log(`  Subtotal: $${order.subtotal}`);
      console.log(`  Tax: $${order.tax}`);
      console.log(`  Payment Status: ${order.paymentStatus}`);
      console.log(`  Order Status: ${order.orderStatus}`);
      console.log(`  Items: ${order.items.length}`);
      console.log(`  Created: ${order.createdAt}`);
      console.log(`\nPayment Details:`);
      console.log(`  Stripe Session ID: ${order.paymentDetails?.stripeSessionId}`);
      console.log(`  Payment Intent ID: ${order.paymentDetails?.paymentIntentId}`);
      console.log(`  Charge ID: ${order.paymentDetails?.chargeId}`);
      console.log(`  Paid At: ${order.paymentDetails?.paidAt}`);
      
      if (order.userId) {
        console.log(`\nCustomer:`);
        console.log(`  Name: ${order.userId.name}`);
        console.log(`  Email: ${order.userId.email}`);
      }
      
      console.log(`\nItems:`);
      order.items.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.productName || item.productId}`);
        console.log(`     Quantity: ${item.quantity}`);
        console.log(`     Price: $${item.price}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkOrder();
