const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Payout = require('./src/models/Payout');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get latest affiliate user
    const user = await User.findOne({ email: /affiliate-seed/ }).sort({ createdAt: -1 });
    
    if (!user) {
      console.log('No affiliate user found');
      process.exit(0);
    }

    console.log('\n=== USER INFO ===');
    console.log('User ID:', user._id);
    console.log('Email:', user.email);
    console.log('affiliateStatus:', user.affiliateStatus);
    console.log('Full affiliateStatus value:', JSON.stringify(user.affiliateStatus));

    // Try to create a test payout
    console.log('\n=== ATTEMPTING PAYOUT CREATION ===');
    try {
      const payout = await Payout.create({
        affiliateId: user._id,
        amount: 50,
        method: 'bank_transfer',
        status: 'pending',
        beneficiaryDetails: {
          name: user.name,
          accountNumber: '1234567890'
        }
      });
      console.log('✅ Payout created successfully:', payout._id);
    } catch (err) {
      console.log('❌ Payout creation failed:');
      console.log(err.message);
      if (err.errors && err.errors.affiliateId) {
        console.log('affiliateId error:', err.errors.affiliateId.message);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
