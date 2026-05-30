require('dotenv').config();
const dns = require('dns');
// Use Google Public DNS to resolve SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.warn('⚠️ Could not set custom DNS servers:', e.message);
}
const mongoose = require('mongoose');

async function checkCollections() {
    let uri = process.env.MONGODB_URI;
    console.log('📡 Attempting to connect to Atlas:', uri.split('@')[1] || uri);

    try {
        await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to Atlas MongoDB');
    } catch (error) {
        console.error('❌ Atlas connection failed:', error.message);
        uri = process.env.MONGODB_LOCAL || 'mongodb://127.0.0.1:27017/farmer-market';
        console.log('🔄 Falling back to Local:', uri);
        try {
            await mongoose.connect(uri, { family: 4 });
            console.log('✅ Connected to Local MongoDB');
        } catch (localError) {
            console.error('❌ Local connection failed:', localError.message);
            process.exit(1);
        }
    }

    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(c => console.log(` - ${c.name}`));
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to list collections:', err.message);
        process.exit(1);
    }
}

checkCollections();
