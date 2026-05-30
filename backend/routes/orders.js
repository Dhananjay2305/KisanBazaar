const express = require('express');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { auth, isBuyer, isFarmer } = require('../middleware/auth');

const router = express.Router();

// Create new order (initiates checkout)
router.post('/', auth, isBuyer, async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod, shippingAddress, shippingLocation, deliveryDistance, deliveryFee } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        const order = new Order({
            buyerId: req.userId,
            items,
            totalAmount,
            paymentMethod,
            shippingAddress,
            shippingLocation,
            deliveryDistance,
            deliveryFee,
            paymentStatus: paymentMethod === 'Cash on Delivery' ? 'pending' : 'pending'
        });

        await order.save();

        // Notify each farmer in the order
        const farmerIds = [...new Set(items.map(item => item.farmerId))];
        for (const farmerId of farmerIds) {
            await Notification.create({
                userId: farmerId,
                type: 'order_received',
                message: `You have received a new order for ${items.find(i => i.farmerId === farmerId).cropName}!`,
                relatedId: order._id
            });
        }

        res.status(201).json({
            message: 'Order created successfully. Farmers have been notified.',
            orderId: order._id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Process Payment (Mock)
router.post('/:id/pay', auth, isBuyer, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.buyerId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Simulating payment processing delay
        // In a real integration, this is where you'd verify Stripe/Razorpay signature

        order.paymentStatus = 'completed';
        await order.save();

        // Update listing status and notify farmers
        for (const item of order.items) {
            await Listing.findByIdAndUpdate(item.listingId, { status: 'sold' });

            // Notify farmer
            await Notification.create({
                userId: item.farmerId,
                type: 'offer_accepted', // Repurposing notification type for simplicity
                message: `New paid order for your ${item.cropName}! Total: ₹${item.price * item.quantity}`,
                relatedId: order._id
            });
        }

        res.json({
            message: 'Payment successful! Your order is being processed.',
            order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get buyer order history
router.get('/buyer', auth, isBuyer, async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.userId })
            .sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get orders received by farmer
router.get('/farmer', auth, isFarmer, async (req, res) => {
    try {
        const orders = await Order.find({ 'items.farmerId': req.userId })
            .populate('buyerId', 'name phone location')
            .sort({ createdAt: -1 });
        
        // Filter items to only show those belonging to this farmer
        const filteredOrders = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.items = orderObj.items.filter(item => item.farmerId.toString() === req.userId);
            return orderObj;
        });

        res.json({ orders: filteredOrders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders for admin (with location data)
router.get('/admin/all', auth, async (req, res) => {
    try {
        // Simple admin check - in a real app, use a proper middleware
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const orders = await Order.find()
            .populate('buyerId', 'name phone')
            .sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status (Farmer action)
router.patch('/:id/status', auth, isFarmer, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['accepted', 'rejected', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status update' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Verify if this farmer is part of the order
        const isFarmerInOrder = order.items.some(item => item.farmerId.toString() === req.userId);
        if (!isFarmerInOrder) {
            return res.status(403).json({ error: 'Not authorized to update this order' });
        }

        order.status = status;
        await order.save();

        // Notify buyer
        await Notification.create({
            userId: order.buyerId,
            type: 'order_updated',
            message: `Your order #${order._id.toString().substring(order._id.toString().length - 8)} has been ${status} by the farmer.`,
            relatedId: order._id
        });

        res.json({
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
