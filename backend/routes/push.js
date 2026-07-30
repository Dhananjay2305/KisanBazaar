const express = require('express');
const webpush = require('web-push');
const supabase = require('../config/supabase');

const router = express.Router();

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BIh7OWGYwnTN9QvdFIMGrc2wEVXfhY0g6kka0EMyoNRJJntmvHrTKygt-F0bSdQWzPRfLAh7mGEJpX0tF8qjyUU';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'zT3EA9nTi1Ns1udcFvpldo3YedbLlR6Ey3MqPaFpbr8';

webpush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

// Subscribe route
router.post('/subscribe', async (req, res) => {
    try {
        const subscription = req.body;
        const endpoint = subscription.endpoint;
        
        let userId = null;
        if (req.headers.authorization) {
            // Can add token verification if needed, but for now just save the subscription
        }

        // Upsert into Supabase (requires push_subscriptions table)
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({ endpoint, subscription_json: subscription, user_id: userId }, { onConflict: 'endpoint' });

        if (error) {
            console.error('Supabase error saving subscription:', error);
            return res.status(500).json({ error: 'Failed to save subscription in Supabase.' });
        }

        res.status(201).json({ message: 'Subscription saved.' });
    } catch (err) {
        console.error('Error saving subscription:', err);
        res.status(500).json({ error: 'Server error saving subscription.' });
    }
});

// Test broadcast route
router.post('/send', async (req, res) => {
    try {
        const { title, body } = req.body;
        
        const payload = JSON.stringify({
            title: title || 'New Update from FarmDirect!',
            body: body || 'Check out the latest produce listed today.',
            icon: '/img/logo.jpg'
        });

        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (error) {
            console.error('Supabase fetch error:', error);
            return res.status(500).json({ error: 'Database fetch error' });
        }

        const sendPromises = (subscriptions || []).map(sub => {
            return webpush.sendNotification(sub.subscription_json, payload).catch(err => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    return supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                }
            });
        });

        await Promise.all(sendPromises);

        res.status(200).json({ message: 'Push notifications sent successfully.' });
    } catch (err) {
        console.error('Error sending push:', err);
        res.status(500).json({ error: 'Failed to send notifications.' });
    }
});

module.exports = router;
