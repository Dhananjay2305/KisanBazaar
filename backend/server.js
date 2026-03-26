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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Farmer Market API is running!' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const connectWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                family: 4, // Force IPv4 to avoid SRV lookup issues
                serverSelectionTimeoutMS: 10000,
            });
            console.log('✅ Connected to MongoDB');
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
            return;
        } catch (err) {
            console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);
            if (i < retries - 1) {
                console.log('⏳ Retrying in 3 seconds...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }
    console.error('❌ All MongoDB connection attempts failed. Please check your internet connection and MongoDB Atlas settings.');
};

connectWithRetry();
