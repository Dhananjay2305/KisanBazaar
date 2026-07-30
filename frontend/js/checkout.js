import api, { resolveImageUrl } from './api.js';
import { getUser } from './auth.js';

let shippingLocation = null;
let deliveryDistance = 0;
let deliveryFee = 0;
let map = null;
let marker = null;

function getAvatarUrl(image_path, name = 'Farmer') {
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff`;
    return resolveImageUrl(image_path, fallback);
}

document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!getUser() || getUser().role !== 'buyer') {
        window.location.href = 'auth.html';
        return;
    }

    // Load cart
    loadCheckoutSummary();
    
    // Set default address if available
    const user = getUser();
    if (user.location) {
        document.getElementById('shippingAddress').value = user.location;
    }
});

function loadCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const container = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('finalTotal');

    if (cart.length === 0) {
        window.location.href = 'buyer-dashboard.html#cart';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <div style="display: flex; gap: 0.75rem; flex: 1;">
                    <img src="${getAvatarUrl(item.farmer_image, item.farmer_name)}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-top: 0.25rem;">
                    <div style="flex: 1;">
                        <span style="font-weight: 600;">${item.crop_name}</span>
                        <br>
                        <small style="color: var(--gray-500);">${item.quantity} ${item.unit} x ₹${item.price}</small>
                        <br>
                        <small style="color: var(--primary-600); font-size: 0.75rem;">Farmer: ${item.farmer_name}</small>
                    </div>
                </div>
                <span style="font-weight: 600;">₹${itemTotal}</span>
            </div>
        `;
    }).join('');

    subtotalEl.textContent = `₹${total}`;
    updateFinalTotal(total);
}

function updateFinalTotal(subtotal) {
    const finalTotalEl = document.getElementById('finalTotal');
    const total = subtotal + deliveryFee;
    finalTotalEl.textContent = `₹${total}`;
}

async function detectLocation() {
    const status = document.getElementById('locationStatus');
    const mapDiv = document.getElementById('map');
    
    status.style.display = 'block';
    status.textContent = '⌛ Detecting location...';
    
    if (!navigator.geolocation) {
        status.textContent = '❌ Geolocation is not supported by your browser';
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        shippingLocation = { lat: latitude, lng: longitude };
        
        status.textContent = `✅ Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        mapDiv.style.display = 'block';
        
        initMap(latitude, longitude);
        await calculateDeliveryStats(latitude, longitude);
    }, (error) => {
        status.textContent = `❌ Error: ${error.message}`;
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}

function initMap(lat, lng) {
    if (map) {
        map.setView([lat, lng], 13);
        marker.setLatLng([lat, lng]);
        return;
    }

    map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    
    marker.on('dragend', async function(event) {
        const position = marker.getLatLng();
        shippingLocation = { lat: position.lat, lng: position.lng };
        document.getElementById('locationStatus').textContent = `✅ Location updated: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
        await calculateDeliveryStats(position.lat, position.lng);
    });
}

async function calculateDeliveryStats(lat, lng) {
    // Mock farmer locations for distance calculation
    // In a real app, you would fetch the actual farmer locations from the cart items
    const farmerLat = lat + (Math.random() - 0.5) * 0.1; // Simulated nearby farmer
    const farmerLng = lng + (Math.random() - 0.5) * 0.1;
    
    const distance = getHaversineDistance(lat, lng, farmerLat, farmerLng);
    deliveryDistance = Math.round(distance * 10) / 10;
    
    // ₹10 base + ₹5 per km
    deliveryFee = Math.round(10 + (deliveryDistance * 5));
    
    document.getElementById('deliveryDistance').textContent = `${deliveryDistance} km`;
    document.getElementById('deliveryFee').textContent = `₹${deliveryFee}`;
    
    const subtotal = parseInt(document.getElementById('subtotal').textContent.replace('₹', ''));
    updateFinalTotal(subtotal);
}

function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function togglePaymentFields(type) {
    // Hide all
    document.getElementById('upiFields').style.display = 'none';
    document.getElementById('cardFields').style.display = 'none';
    document.getElementById('netbankingFields').style.display = 'none';
    document.getElementById('codFields').style.display = 'none';

    // Show selected
    document.getElementById(`${type}Fields`).style.display = 'block';
    
    // Update button text
    const payBtn = document.getElementById('payBtn');
    if (type === 'cod') {
        payBtn.textContent = '📦 Confirm Order';
    } else {
        payBtn.textContent = '🔒 Secure Pay';
    }

    // Highlight selected card
    document.querySelectorAll('.payment-methods label').forEach(l => {
        l.style.borderColor = 'var(--gray-200)';
    });
    const radio = document.querySelector(`input[value="${type === 'upi' ? 'UPI' : type === 'card' ? 'Card' : type === 'netbanking' ? 'Net Banking' : 'Cash on Delivery'}"]`);
    if (radio) {
        radio.closest('label').style.borderColor = 'var(--primary-500)';
    }
}

async function handlePayment() {
    const payBtn = document.getElementById('payBtn');
    const originalText = payBtn.textContent;
    const shippingAddress = document.getElementById('shippingAddress').value.trim();

    if (!shippingAddress) {
        showToast('Please enter a shipping address', 'error');
        return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Validation
    if (paymentMethod === 'UPI' && !document.getElementById('upiId').value) {
        showToast('Please enter your UPI ID', 'error');
        return;
    }
    if (paymentMethod === 'Card' && (!document.getElementById('cardNumber').value || !document.getElementById('cardCvv').value)) {
        showToast('Please enter your card details', 'error');
        return;
    }
    if (paymentMethod === 'Net Banking' && !document.getElementById('bankName').value) {
        showToast('Please select a bank', 'error');
        return;
    }

    try {
        payBtn.disabled = true;
        payBtn.textContent = '🔒 Please wait...';

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + deliveryFee;

        // 1. Create Order
        const orderResp = await api.post('/orders', {
            items: cart,
            total_amount: total,
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            shipping_location: shippingLocation,
            delivery_distance: deliveryDistance,
            delivery_fee: deliveryFee
        });

        const orderId = orderResp.orderId;

        if (paymentMethod !== 'Cash on Delivery') {
            // 2. Process Payment (Mock)
            await api.post(`/orders/${orderId}/pay`);
        } else {
            // COD - just a slight delay for realism
            await new Promise(r => setTimeout(r, 1000));
        }

        // 3. Success
        showToast('Order placed successfully!', 'success');
        localStorage.removeItem('cart');
        
        setTimeout(() => {
            window.location.href = 'buyer-dashboard.html#offers';
        }, 1500);

    } catch (error) {
        showToast(error.message, 'error');
        payBtn.disabled = false;
        payBtn.textContent = originalText;
    }
}

// Expose functions to window
window.togglePaymentFields = togglePaymentFields;
window.detectLocation = detectLocation;
window.handlePayment = handlePayment;
