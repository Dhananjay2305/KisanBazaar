const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }

        req.user = user;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Middleware to check if user is a farmer
const isFarmer = (req, res, next) => {
    if (req.user.role !== 'farmer') {
        return res.status(403).json({ error: 'Access denied. Farmers only.' });
    }
    next();
};

// Middleware to check if user is a buyer
const isBuyer = (req, res, next) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).json({ error: 'Access denied. Buyers only.' });
    }
    next();
};

module.exports = { auth, isFarmer, isBuyer };
