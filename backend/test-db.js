require('dotenv').config();
const dns = require('dns');
// Use Google Public DNS to resolve SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.warn('⚠️ Could not set custom DNS servers:', e.message);
}
const mongoose = require('mongoose');

async function testConnection() {
    console.log('Connecting to:', process.env.MONGODB_URI);
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ MongoDB connection successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
