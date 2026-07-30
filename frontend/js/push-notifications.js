const publicVapidKey = 'BIh7OWGYwnTN9QvdFIMGrc2wEVXfhY0g6kka0EMyoNRJJntmvHrTKygt-F0bSdQWzPRfLAh7mGEJpX0tF8qjyUU';
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5001' 
    : 'https://farm-market-api.vercel.app'; // Modify if the backend URL is different

// Check for service worker
if ('serviceWorker' in navigator) {
    send().catch(err => console.error('Push notification registration failed:', err));
}

// Register SW, Register Push, Send Push
async function send() {
    console.log('Registering service worker...');
    
    // Register Service Worker
    const register = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
    });
    console.log('Service Worker Registered...');

    // Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.log('Notification permission denied.');
        return;
    }

    console.log('Registering Push...');
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    console.log('Push Registered...');

    console.log('Sending Push Subscription to Backend...');
    
    // Attempt to get Supabase session if using Supabase auth
    let token = null;
    const sessionStr = localStorage.getItem('sb-addnaontkrvwgcotzjyy-auth-token');
    if (sessionStr) {
        try { token = JSON.parse(sessionStr).access_token; } catch (e) {}
    }
    
    const API_URL = window.location.hostname.includes('localhost') 
        ? 'http://localhost:5001/api/push/subscribe' 
        : '/_/backend/api/push/subscribe';
        
    await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'content-type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    });
    console.log('Push Subscription Sent.');
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
