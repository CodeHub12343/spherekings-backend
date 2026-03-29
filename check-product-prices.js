/**
 * Check and fix product prices
 * Usage: node check-product-prices.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function checkPrices() {
  try {
    console.log('📦 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spherekings');
    console.log('✅ Connected to MongoDB\n');
    
    // Load models
    const User = require('./src/models/User');
    const Product = require('./src/models/Product');
    const Order = require('./src/models/Order');
    
    // Get the most recent order to see what products were ordered
    const recentOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .populate('items.productId');
    
    if (!recentOrder) {
      console.log('No orders found');
      await mongoose.disconnect();
      return;
    }
    
    console.log('📋 Recent Order Details:');
    console.log(`Order: ${recentOrder.orderNumber}`);
    console.log(`Total: $${recentOrder.total}`);
    console.log(`Subtotal: $${recentOrder.subtotal}\n`);
    
    console.log('Order Items from Database:');
    recentOrder.items.forEach((item, i) => {
      console.log(`${i+1}. ${item.productName}`);
      console.log(`   - Product ID: ${item.productId}`);
      console.log(`   - Stored Price: $${item.price}`);
      console.log(`   - Stored Subtotal: $${item.subtotal}`);
      console.log(`   - Quantity: ${item.quantity}\n`);
    });
    
    // Now fetch the actual products to see their current prices
    console.log('\n=== CHECKING PRODUCT DATABASE ===\n');
    
    const productIds = recentOrder.items.map(item => item.productId);
    
    for (const productId of productIds) {
      const product = await Product.findById(productId);
      if (product) {
        console.log(`Product: ${product.name}`);
        console.log(`  Current DB Price: $${product.price}`);
        console.log(`  Product ID: ${product._id}`);
        
        // Check if this matches what's in the order
        const orderItem = recentOrder.items.find(item => 
          item.productId._id?.toString() === product._id.toString() || 
          item.productId === productId
        );
        
        if (orderItem && orderItem.price !== product.price) {
          console.log(`  ⚠️  MISMATCH: Order has $${orderItem.price}, DB has $${product.price}`);
        } else if (orderItem) {
          console.log(`  ✅ Price matches order`);
        }
        console.log();
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPrices();
