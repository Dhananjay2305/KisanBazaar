require('dotenv').config();
const dns = require('dns');
// Use Google Public DNS to resolve SRV records (fixes ECONNREFUSED on some networks)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const offerRoutes = require('./routes/offers');
const statsRoutes = require('./routes/stats');
const notificationRoutes = require('./routes/notifications');
const orderRoutes = require('./routes/orders');
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Farmer Market API is running!' });
});

// Connect to MongoDB (with retry logic in background)
const PORT = process.env.PORT || 5001;

const connectWithRetry = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        const uri = i >= 3 ? (process.env.MONGODB_LOCAL || 'mongodb://127.0.0.1:27017/farmer-market') : process.env.MONGODB_URI;
        const isLocal = i >= 3;
        
        try {
            if (isLocal) console.log('🔄 Attempting fallback to local MongoDB...');
            
            await mongoose.connect(uri, {
                family: 4, // Force IPv4 to avoid SRV lookup issues
                serverSelectionTimeoutMS: 5000,
            });
            console.log(`✅ Connected to ${isLocal ? 'Local' : 'Atlas'} MongoDB`);
            if (supabase) {
                console.log('✅ Supabase Client Initialized');
            }
            return;
        } catch (err) {
            console.error(`❌ ${isLocal ? 'Local' : 'Atlas'} MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);
            if (i < retries - 1) {
                console.log('⏳ Retrying in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    console.error('❌ All MongoDB connection attempts (including local fallback) failed. Please check if your local MongoDB service is running.');
};

// Start the server immediately
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    
    // Start background DB connection
    connectWithRetry();
});
