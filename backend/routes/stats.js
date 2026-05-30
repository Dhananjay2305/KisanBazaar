const express = require('express');
const Listing = require('../models/Listing');
const Offer = require('../models/Offer');
const Order = require('../models/Order');
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

        // Total revenue from both accepted offers and completed orders
        const orders = await Order.find({ 'items.listingId': { $in: listingIds }, paymentStatus: 'completed' });
        
        const offerRevenue = acceptedOffers.reduce((sum, o) => sum + o.offerPrice, 0);
        const orderRevenue = orders.reduce((sum, o) => {
            // Only count items belonging to this farmer
            const farmerItems = o.items.filter(item => listingIds.some(id => id.toString() === item.listingId.toString()));
            return sum + farmerItems.reduce((s, item) => s + (item.price * item.quantity), 0);
        }, 0);

        const totalRevenue = offerRevenue + orderRevenue;

        res.json({
            totalListings,
            activeListings,
            soldListings,
            totalOffers,
            pendingOffers,
            acceptedOffers: acceptedOffers.length,
            totalOrders: orders.length,
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

        const orders = await Order.find({ buyerId: req.userId });

        const totalOffers = offers.length;
        const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
        const pendingOffers = offers.filter(o => o.status === 'pending').length;
        const rejectedOffers = offers.filter(o => o.status === 'rejected').length;

        const totalOrders = orders.length;
        const paidOrders = orders.filter(o => o.paymentStatus === 'completed').length;

        // Total amount spent (accepted offers + completed orders)
        const offerSpent = offers
            .filter(o => o.status === 'accepted')
            .reduce((sum, o) => sum + o.offerPrice, 0);
            
        const orderSpent = orders
            .filter(o => o.paymentStatus === 'completed')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        res.json({
            totalOffers,
            acceptedOffers,
            pendingOffers,
            rejectedOffers,
            totalOrders,
            paidOrders,
            totalSpent: offerSpent + orderSpent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
