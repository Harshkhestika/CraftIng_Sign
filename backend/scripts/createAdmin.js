import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.error('\n📝 Please create a .env file in the backend/ directory with:');
      console.error('   MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin');
      console.error('\n💡 For DigitalOcean Managed Database:');
      console.error('   1. Go to your DigitalOcean dashboard');
      console.error('   2. Navigate to your MongoDB database');
      console.error('   3. Copy the connection string');
      console.error('   4. Add it to your .env file as MONGODB_URI');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to MongoDB...');
    // Hide password in logs for security
    const safeUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`   URI: ${safeUri}`);
    
    // Connect with authentication options
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const adminEmail = 'admin@craftingsign.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (adminExists) {
      // Delete and recreate to ensure password is properly hashed
      await User.deleteOne({ email: adminEmail });
      console.log('ℹ️  Existing admin user removed');
    }
    
    // Create admin user (password will be hashed by pre-save hook)
    const adminUser = await User.create({
      email: adminEmail,
      password: 'admin123',
      name: 'Admin User',
      isAdmin: true,
      active: true
    });
    console.log('✅ Admin user created/updated');
    console.log(`   Email: ${adminEmail}`);
    console.log('   Password: admin123');
    
    // Verify password works
    const passwordTest = await adminUser.comparePassword('admin123');
    console.log(`   Password verification: ${passwordTest ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!passwordTest) {
      console.error('❌ Password verification failed!');
      process.exit(1);
    }

    console.log('✅ Admin user ready');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 13 || error.codeName === 'Unauthorized') {
      console.error('\n🔐 Authentication Error:');
      console.error('   Your MongoDB connection string needs authentication credentials.');
      console.error('\n📝 Check your MONGODB_URI in .env file:');
      console.error('   Format: mongodb://username:password@host:port/database?authSource=admin');
      console.error('\n💡 Common issues:');
      console.error('   - Missing username or password in connection string');
      console.error('   - Incorrect authSource (should be "admin" for managed databases)');
      console.error('   - Database user doesn\'t have required permissions');
      console.error('\n📖 See MONGODB_SETUP.md for detailed instructions');
    } else if (error.name === 'MongoNetworkError' || error.message.includes('ECONNREFUSED')) {
      console.error('\n🌐 Connection Error:');
      console.error('   Cannot connect to MongoDB server.');
      console.error('   Check if:');
      console.error('   - MongoDB server is running');
      console.error('   - Host and port are correct');
      console.error('   - Firewall allows connection');
      console.error('   - IP is whitelisted in DigitalOcean database settings');
    }
    
    process.exit(1);
  }
};

createAdmin();

