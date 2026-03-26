const express = require('express');
const Listing = require('../models/Listing');
const Offer = require('../models/Offer');
const { auth, isFarmer, isBuyer } = require('../middleware/auth');

const router = express.Router();

// Get farmer stats
router.get('/farmer', auth, isFarmer, async (req, res) => {
    try {
        const listings = await Listing.find({ farmerId: req.userId });
        const listingIds = listings.map(l => l._id);

        const totalListings = listings.length;
        const activeListings = listings.filter(l => l.status === 'available').length;
        const soldListings = listings.filter(l => l.status === 'sold').length;

        const offers = await Offer.find({ listingId: { $in: listingIds } });
        const totalOffers = offers.length;
        const acceptedOffers = offers.filter(o => o.status === 'accepted');
        const pendingOffers = offers.filter(o => o.status === 'pending').length;

        // Total revenue from accepted offers
        const totalRevenue = acceptedOffers.reduce((sum, o) => sum + o.offerPrice, 0);

        res.json({
            totalListings,
            activeListings,
            soldListings,
            totalOffers,
            pendingOffers,
            acceptedOffers: acceptedOffers.length,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get buyer stats
router.get('/buyer', auth, isBuyer, async (req, res) => {
    try {
        const offers = await Offer.find({ buyerId: req.userId });

        const totalOffers = offers.length;
        const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
        const pendingOffers = offers.filter(o => o.status === 'pending').length;
        const rejectedOffers = offers.filter(o => o.status === 'rejected').length;

        // Total amount of accepted offers
        const totalSpent = offers
            .filter(o => o.status === 'accepted')
            .reduce((sum, o) => sum + o.offerPrice, 0);

        res.json({
            totalOffers,
            acceptedOffers,
            pendingOffers,
            rejectedOffers,
            totalSpent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
