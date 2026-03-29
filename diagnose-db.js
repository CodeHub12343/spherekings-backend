/**
 * Database Diagnostic Script
 * Checks what's actually in the database and collections
 */

const mongoose = require('mongoose');
const config = require('./src/config/environment');

// Connect to MongoDB and run diagnostics
(async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    console.log(`📍 Database URI: ${config.MONGODB_URI}`);

    await diagnose();
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
})();

async function diagnose() {
  try {
    // Check 1: List all collections
    console.log('\n📦 Available collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach((col) => {
      console.log(`   - ${col.name}`);
    });

    // Check 2: Direct Mongoose query (strict: false)
    const schema1 = new mongoose.Schema({}, { strict: false });
    const Model1 = mongoose.model('Test1', schema1, 'influencerapplications');
    const count1 = await Model1.countDocuments();
    console.log(`\n📊 influencerapplications collection: ${count1} documents`);

    // Check 3: Try with actual model
    const InfluencerApplication = require('./src/models/InfluencerApplication');
    const count2 = await InfluencerApplication.countDocuments();
    console.log(`📊 Using actual model: ${count2} documents`);

    // Check 4: Count documents with userId: null
    const nullCount = await InfluencerApplication.countDocuments({ userId: null });
    console.log(`📊 Documents with userId: null: ${nullCount}`);

    // Check 5: Sample all documents
    console.log('\n📋 First 3 documents in InfluencerApplication:');
    const samples = await InfluencerApplication.find().limit(3).lean();
    samples.forEach((doc, idx) => {
      console.log(`\n   Document ${idx + 1}:`);
      console.log(`   - _id: ${doc._id}`);
      console.log(`   - email: ${doc.email}`);
      console.log(`   - userId: ${doc.userId}`);
      console.log(`   - status: ${doc.status}`);
    });

    // Check 6: Try raw MongoDB connection
    console.log('\n🔧 Raw MongoDB query:');
    const collection = mongoose.connection.collection('influencerapplications');
    const rawCount = await collection.countDocuments();
    console.log(`   Total documents: ${rawCount}`);

    const nullDocs = await collection
      .find({ userId: null })
      .limit(3)
      .toArray();
    console.log(`   Documents with userId: null: ${nullDocs.length}`);
    nullDocs.forEach((doc, idx) => {
      console.log(`     ${idx + 1}. ${doc.email} (userId: ${doc.userId})`);
    });

    // Check 7: Try with $exists and $eq
    console.log('\n🔍 Using $exists operator:');
    const existsCount = await InfluencerApplication.countDocuments({
      userId: { $exists: true, $eq: null },
    });
    console.log(`   Documents with userId field = null: ${existsCount}`);

    // Check 8: List all unique userId values (sample)
    const userIds = await InfluencerApplication.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    console.log(`\n📈 Top userId values (null and others):`);
    userIds.forEach((item) => {
      console.log(`   - ${item._id === null ? 'null' : item._id}: ${item.count} documents`);
    });

    console.log('\n✅ Diagnostic complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}
