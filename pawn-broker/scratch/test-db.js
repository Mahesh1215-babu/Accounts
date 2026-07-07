const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Simple parser for .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const lines = envFile.split('\n');
let MONGODB_URI = '';
for (const line of lines) {
  if (line.startsWith('MONGODB_URI=')) {
    MONGODB_URI = line.split('MONGODB_URI=')[1].trim();
  }
}

console.log('Using MONGODB_URI:', MONGODB_URI);

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected!');

    // Let's print existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    console.log(collections.map(c => c.name));

    // Define schema and test query
    const CustomerSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
      },
      { collection: 'customers' }
    );

    // Register model or use existing
    const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

    console.log('Fetching customers...');
    const result = await Customer.find({});
    console.log('Query result count:', result.length);
    console.log('Query results:', result);

  } catch (err) {
    console.error('Error during db test:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
