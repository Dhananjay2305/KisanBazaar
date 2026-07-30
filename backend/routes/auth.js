const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-profile-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Register new user (Legacy MongoDB - mostly unused since frontend uses Supabase)
router.post('/register', async (req, res) => {
    // ...
});

// Admin add farmer using Supabase
router.post('/admin-add-farmer', async (req, res) => {
    try {
        const supabase = require('../config/supabase');
        const { name, phone, location, password } = req.body;
        
        // Basic auth check for admin could go here if we pass a token

        const email = `${phone}@farmdirect.com`;
        
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { name, role: 'farmer', phone, location }
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        const userId = authData.user.id;
        
        // 2. Wait slightly for trigger, then insert profile manually if needed
        await new Promise(r => setTimeout(r, 1000));
        
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        
        if (!profile) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: userId,
                name: name,
                role: 'farmer',
                location: location,
                phone: phone
            });
            
            if (profileError) {
                console.error(`Error creating profile for ${name}:`, profileError.message);
            }
        }

        res.status(201).json({ message: 'Farmer added successfully', id: userId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
