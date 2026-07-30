require('dotenv').config();
const dns = require('dns');
// Use Google Public DNS to resolve SRV records (fixes ECONNREFUSED on some networks)
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.warn('⚠️ Could not set custom DNS servers:', e.message);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Import routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const offerRoutes = require('./routes/offers');
const statsRoutes = require('./routes/stats');
const notificationRoutes = require('./routes/notifications');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');
const supabase = require('./config/supabase');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/push', require('./routes/push'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Farmer Market API is running!' });
});

// Connect to MongoDB (with retry logic in background)
const PORT = process.env.PORT || 5001;

const connectWithRetry = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        // First 2 attempts: try Atlas. Subsequent attempts: try Local if Atlas fails.
        const useLocal = i >= 2;
        const uri = useLocal ? (process.env.MONGODB_LOCAL || 'mongodb://127.0.0.1:27017/farmer-market') : process.env.MONGODB_URI;
        const dbName = uri.includes('mongodb+srv') ? 'Atlas' : 'Local';
        
        try {
            const maskedUri = uri.replace(/\/\/.*:.*@/, '//****:****@');
            console.log(`📡 Attempting to connect to ${dbName} MongoDB... (Attempt ${i + 1}/${retries})`);
            if (dbName === 'Atlas') {
                console.log(`🔗 Target: ${maskedUri}`);
            }
            
            const options = {
                serverSelectionTimeoutMS: 8000,
                family: 4, // Force IPv4 to resolve SRV record issues on some networks
            };
            
            await mongoose.connect(uri, options);
            
            console.log(`✅ Successfully connected to ${dbName} MongoDB`);
            if (supabase) {
                console.log('✅ Supabase Client Initialized');
            }
            return;
        } catch (err) {
            console.error(`❌ ${dbName} MongoDB connection failed:`, err.message);
            
            if (dbName === 'Atlas') {
                console.log('💡 TIP: This is often caused by an IP Whitelist error in MongoDB Atlas.');
                console.log('💡 TIP: Please ensure your current IP is whitelisted in your Atlas Dashboard.');
            }
            
            const waitTime = 5000; 
            
            if (i < retries - 1) {
                console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    console.error('❌ All MongoDB connection attempts failed.');
    console.log('💡 Make sure either MongoDB Atlas is accessible or a local MongoDB service is running on 127.0.0.1:27017');
};

// Start the server immediately
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    
    // Start background DB connection
    connectWithRetry();
});
