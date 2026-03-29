/**
 * Fix Product Status Script
 * Updates all products without a proper status to 'active'
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./src/models/Product');

async function fixProductStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update all products to ensure they have a valid status
    const result = await Product.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: '' },
        ],
      },
      { status: 'active' }
    );

    console.log(`✅ Updated ${result.modifiedCount} products with missing status`);

    // Also ensure all products have valid status values
    const invalidResult = await Product.updateMany(
      {
        status: {
          $nin: ['active', 'inactive', 'out_of_stock'],
        },
      },
      { status: 'active' }
    );

    console.log(`✅ Fixed ${invalidResult.modifiedCount} products with invalid status`);

    // Display all products
    const products = await Product.find();
    console.log('\n📦 All products:');
    products.forEach((p) => {
      console.log(`   - ${p.name} (ID: ${p._id}, Status: ${p.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProductStatus();
