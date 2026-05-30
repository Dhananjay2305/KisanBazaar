const express = require('express');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all messages for the current user
router.get('/', auth, async (req, res) => {
    try {
        const adminFlag = req.user.role === 'admin';
        let query = {};
        
        if (!adminFlag) {
            query.userId = req.userId;
        }

        const messages = await Message.find(query)
            .populate('userId', 'name phone email')
            .sort({ createdAt: -1 });
            
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new support message
router.post('/', auth, async (req, res) => {
    try {
        const { subject, body } = req.body;
        
        if (!subject || !body) {
            return res.status(400).json({ error: 'Subject and body are required' });
        }

        const message = new Message({
            userId: req.userId,
            subject,
            body,
            status: 'pending'
        });

        await message.save();
        res.status(201).json({ message: 'Ticket submitted successfully', ticket: message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin reply to a message
router.patch('/:id/reply', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { adminReply } = req.body;
        if (!adminReply) {
            return res.status(400).json({ error: 'Reply content is required' });
        }

        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        message.adminReply = adminReply;
        message.status = 'resolved';
        await message.save();

        res.json({ message: 'Reply sent successfully', ticket: message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
