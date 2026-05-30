import { supabase } from './supabase-client.js';

// Helper to get current session user ID
const getUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id;
};

const api = {
    // Standard request mapper
    async request(endpoint, options = {}) {
        // This is a legacy wrapper. New code should use the specific methods below.
        console.warn(`api.request('${endpoint}') called. Mapping to Supabase...`);
        
        // Simple mapping for common endpoints used with api.request
        if (endpoint.includes('/orders/') && endpoint.endsWith('/status')) {
            const orderId = endpoint.split('/')[2];
            const { status } = JSON.parse(options.body);
            return this.patch(`/orders/${orderId}`, { status });
        }
        
        throw new Error(`Endpoint ${endpoint} not fully mapped in Supabase migration yet.`);
    },

    async get(endpoint) {
        if (endpoint === '/stats/farmer') return this.getFarmerStats();
        if (endpoint === '/stats/buyer') return this.getBuyerStats();
        if (endpoint === '/notifications') return this.getNotifications();
        if (endpoint === '/listings/my/listings') return this.getMyListings();
        if (endpoint === '/offers/received') return this.getReceivedOffers();
        if (endpoint === '/offers/sent') return this.getSentOffers();
        if (endpoint === '/orders/farmer') return this.getFarmerOrders();
        if (endpoint === '/orders/buyer') return this.getBuyerOrders();
        if (endpoint === '/listings' || endpoint.startsWith('/listings?')) return this.getAllListings();
        if (endpoint === '/farmers/all') return this.getAllFarmers();
        if (endpoint === '/admin/stats') return this.getAdminDashboardStats();
        if (endpoint === '/admin/orders') return this.getAdminOrders();
        if (endpoint === '/admin/products') return this.getAdminProducts();
        if (endpoint === '/admin/customers') return this.getAdminCustomers();
        if (endpoint === '/admin/payments') return this.getAdminPayments();
        if (endpoint === '/admin/support') return this.getAdminSupportMessages();
        if (endpoint.startsWith('/listings/')) return this.getListingDetails(endpoint.split('/')[2]);
        
        throw new Error(`GET ${endpoint} not mapped.`);
    },

    async post(endpoint, data) {
        if (endpoint === '/orders') return this.createOrder(data);
        if (endpoint.startsWith('/orders/') && endpoint.endsWith('/pay')) return this.payOrder(endpoint.split('/')[2]);
        if (endpoint === '/offers') return this.createOffer(data);
        
        throw new Error(`POST ${endpoint} not mapped.`);
    },

    async put(endpoint, data) {
        if (endpoint.startsWith('/listings/')) {
            const id = endpoint.split('/')[2];
            return this.updateListing(id, data);
        }
        if (endpoint.startsWith('/notifications/') && endpoint.endsWith('/read')) {
            return this.markNotificationRead(endpoint.split('/')[2]);
        }
        if (endpoint === '/notifications/read-all') {
            return this.markAllNotificationsRead();
        }
        if (endpoint.startsWith('/offers/') && endpoint.endsWith('/accept')) {
            return this.updateOfferStatus(endpoint.split('/')[2], 'accepted');
        }
        if (endpoint.startsWith('/offers/') && endpoint.endsWith('/reject')) {
            return this.updateOfferStatus(endpoint.split('/')[2], 'rejected');
        }
        if (endpoint === '/auth/profile') {
            return this.updateProfile(data);
        }

        throw new Error(`PUT ${endpoint} not mapped.`);
    },

    async patch(endpoint, data) {
        if (endpoint.startsWith('/orders/')) {
            const id = endpoint.split('/')[2];
            return this.updateOrderStatus(id, data.status);
        }
        throw new Error(`PATCH ${endpoint} not mapped.`);
    },

    async delete(endpoint) {
        if (endpoint.startsWith('/listings/')) {
            const id = endpoint.split('/')[2];
            return this.deleteListing(id);
        }
        if (endpoint.startsWith('/admin/products/')) {
            const id = endpoint.split('/')[3];
            return this.deleteListing(id);
        }
        throw new Error(`DELETE ${endpoint} not mapped.`);
    },

    async postForm(endpoint, formData) {
        if (endpoint === '/listings') return this.createListingFromForm(formData);
        if (endpoint === '/admin/listings') return this.createListingAsAdmin(formData);
        throw new Error(`postForm ${endpoint} not mapped.`);
    },

    async putForm(endpoint, formData) {
        if (endpoint === '/auth/profile') return this.updateProfileFromForm(formData);
        throw new Error(`putForm ${endpoint} not mapped.`);
    },

    // --- Specific Supabase Implementations ---

    async getFarmerStats() {
        const userId = await getUserId();
        if (!userId) throw new Error('Not authenticated');

        const { data: listings } = await supabase.from('listings').select('status').eq('farmer_id', userId);
        const { data: receivedOffers } = await supabase.from('offers').select('id, listing:listings!inner(farmer_id)').eq('listing.farmer_id', userId);
        const { data: orders } = await supabase.from('orders').select('total_amount').filter('items', 'cs', `[{"farmer_id": "${userId}"}]`);

        return {
            total_listings: listings?.length || 0,
            active_listings: listings?.filter(l => l.status === 'available').length || 0,
            total_offers: receivedOffers?.length || 0,
            total_revenue: orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
        };
    },

    async getBuyerStats() {
        const userId = await getUserId();
        const { data: offers } = await supabase.from('offers').select('status').eq('buyer_id', userId);

        return {
            total_offers: offers?.length || 0,
            accepted_offers: offers?.filter(o => o.status === 'accepted').length || 0,
            pending_offers: offers?.filter(o => o.status === 'pending').length || 0,
            rejected_offers: offers?.filter(o => o.status === 'rejected').length || 0
        };
    },

    async getNotifications() {
        const userId = await getUserId();
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return {
            notifications: data,
            unread_count: data.filter(n => !n.is_read).length
        };
    },

    async markNotificationRead(id) {
        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    async markAllNotificationsRead() {
        const userId = await getUserId();
        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
        if (error) throw error;
        return { success: true };
    },

    async getMyListings() {
        const userId = await getUserId();
        const { data, error } = await supabase.from('listings').select('*').eq('farmer_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return { listings: data };
    },

    async getAllListings() {
        const { data, error } = await supabase.from('listings').select('*, farmer:profiles!listings_farmer_id_fkey(id, name, location, profile_image)').eq('status', 'available').order('created_at', { ascending: false });
        if (error) throw error;
        return { listings: data };
    },

    async getListingDetails(id) {
        const { data, error } = await supabase.from('listings').select('*, farmer:profiles!listings_farmer_id_fkey(*)').eq('id', id).single();
        if (error) throw error;
        return { listing: data };
    },

    async getAllFarmers() {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'farmer');
        if (error) throw error;
        return { farmers: data };
    },

    async createListingAsAdmin(formData) {
        const farmerId = formData.get('farmerId');
        if (!farmerId) throw new Error('Farmer ID is required');
        
        const imageData = formData.get('image');
        let imageUrl = null;

        if (imageData && imageData.size > 0) {
            const fileName = `${Date.now()}-${imageData.name}`;
            const { data, error } = await supabase.storage.from('produce').upload(fileName, imageData);
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage.from('produce').getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase.from('listings').insert({
            farmer_id: farmerId,
            crop_name: formData.get('cropName'),
            quantity: Number(formData.get('quantity')),
            unit: formData.get('unit'),
            price: Number(formData.get('price')),
            location: formData.get('location'),
            description: formData.get('description'),
            image: imageUrl,
            status: 'available'
        }).select().single();

        if (error) throw error;
        return data;
    },

    async createListingFromForm(formData) {
        const userId = await getUserId();
        const imageData = formData.get('image');
        let imageUrl = null;

        if (imageData && imageData.size > 0) {
            const fileName = `${Date.now()}-${imageData.name}`;
            const { data, error } = await supabase.storage.from('produce').upload(fileName, imageData);
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage.from('produce').getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase.from('listings').insert({
            farmer_id: userId,
            crop_name: formData.get('cropName'),
            quantity: Number(formData.get('quantity')),
            unit: formData.get('unit'),
            price: Number(formData.get('price')),
            location: formData.get('location'),
            description: formData.get('description'),
            image: imageUrl,
            status: 'available'
        }).select().single();

        if (error) throw error;
        return data;
    },

    async updateListing(id, updateData) {
        const { data, error } = await supabase.from('listings').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async deleteListing(id) {
        const { error } = await supabase.from('listings').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    async getReceivedOffers() {
        const userId = await getUserId();
        const { data, error } = await supabase.from('offers')
            .select('*, listing:listings!inner(*), buyer:profiles!offers_buyer_id_fkey(*)')
            .eq('listing.farmer_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { offers: data };
    },

    async getSentOffers() {
        const userId = await getUserId();
        const { data, error } = await supabase.from('offers')
            .select('*, listing:listings!inner(*, farmer:profiles!listings_farmer_id_fkey(*))')
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { offers: data };
    },

    async updateOfferStatus(id, status) {
        const { data, error } = await supabase.from('offers').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        if (status === 'accepted') {
            await supabase.from('listings').update({ status: 'sold' }).eq('id', data.listing_id);
        }
        return data;
    },

    async getFarmerOrders() {
        const userId = await getUserId();
        const { data, error } = await supabase.from('orders')
            .select('*, buyer:profiles!orders_buyer_id_fkey(*)')
            .filter('items', 'cs', `[{"farmer_id": "${userId}"}]`)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { orders: data };
    },

    async getBuyerOrders() {
        const userId = await getUserId();
        const { data, error } = await supabase.from('orders')
            .select('*')
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { orders: data };
    },

    async updateOrderStatus(id, status) {
        const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async updateProfileFromForm(formData) {
        const userId = await getUserId();
        const name = formData.get('name');
        const location = formData.get('location');
        const profileImage = formData.get('profileImage');
        let imageUrl = null;

        if (profileImage && profileImage.size > 0) {
            const fileName = `profile-${userId}-${Date.now()}`;
            const { data, error } = await supabase.storage.from('avatars').upload(fileName, profileImage, { upsert: true });
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        }

        const updates = { name, location };
        if (imageUrl) updates.profile_image = imageUrl;

        const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
        if (error) throw error;
        return { user: data };
    },

    async updateProfile(updates) {
        const userId = await getUserId();
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
        if (error) throw error;
        return { user: data };
    },

    async createOrder(orderData) {
        const userId = await getUserId();
        const { data, error } = await supabase.from('orders').insert({
            buyer_id: userId,
            items: orderData.items,
            shipping_address: orderData.shipping_address,
            total_amount: orderData.total_amount,
            status: 'pending',
            payment_status: orderData.payment_method === 'Cash on Delivery' ? 'pending' : 'pending' 
        }).select().single();

        if (error) throw error;
        
        const farmers = [...new Set(orderData.items.map(i => i.farmer_id))];
        for (const farmerId of farmers) {
            await supabase.from('notifications').insert({
                user_id: farmerId,
                type: 'order_received',
                message: `You have a new order!`,
                related_id: data.id,
                related_type: 'order'
            });
        }

        return { orderId: data.id };
    },

    async payOrder(orderId) {
        const { error } = await supabase.from('orders').update({ payment_status: 'completed' }).eq('id', orderId);
        if (error) throw error;
        return { success: true };
    },

    async createOffer(offerData) {
        const userId = await getUserId();
        const { data, error } = await supabase.from('offers').insert({
            listing_id: offerData.listingId,
            buyer_id: userId,
            offer_price: offerData.offerPrice,
            message: offerData.message,
            status: 'pending'
        }).select().single();

        if (error) throw error;

        const { data: listing } = await supabase.from('listings').select('farmer_id').eq('id', offerData.listingId).single();
        if (listing) {
            await supabase.from('notifications').insert({
                user_id: listing.farmer_id,
                type: 'offer_received',
                message: `New offer for your produce!`,
                related_id: data.id,
                related_type: 'offer'
            });
        }

        return data;
    },

    // --- Admin Panel Overhaul Methods ---
    async getAdminDashboardStats() {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: pendingOrdersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        
        const { data: orders } = await supabase.from('orders').select('total_amount').eq('payment_status', 'completed');
        const revenue = orders ? orders.reduce((sum, order) => sum + Number(order.total_amount), 0) : 0;
        
        // For charts
        const { data: recentOrders } = await supabase.from('orders').select('created_at, total_amount').order('created_at', { ascending: false }).limit(30);
        
        const { count: farmersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer');
        const { count: buyersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer');

        return {
            usersCount: usersCount || 0,
            ordersCount: ordersCount || 0,
            pendingOrdersCount: pendingOrdersCount || 0,
            revenue,
            recentOrders: recentOrders || [],
            roleStats: { farmer: farmersCount || 0, buyer: buyersCount || 0 }
        };
    },

    async getAdminOrders() {
        const { data, error } = await supabase.from('orders').select('*, buyer:profiles!orders_buyer_id_fkey(name)').order('created_at', { ascending: false });
        if (error) throw error;
        return { orders: data };
    },

    async getAdminProducts() {
        const { data, error } = await supabase.from('listings').select('*, farmer:profiles!listings_farmer_id_fkey(name)').order('created_at', { ascending: false });
        if (error) throw error;
        return { products: data };
    },

    async getAdminCustomers() {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return { customers: data };
    },

    async getAdminPayments() {
        const { data, error } = await supabase.from('orders').select('id, total_amount, created_at, payment_status, buyer:profiles!orders_buyer_id_fkey(name)').order('created_at', { ascending: false });
        if (error) throw error;
        return { payments: data };
    },

    async getAdminSupportMessages() {
        try {
            const { data, error } = await supabase.from('support_messages').select('*, user:profiles(name)').order('created_at', { ascending: false });
            if (error) return { messages: [] };
            return { messages: data };
        } catch (e) {
            return { messages: [] };
        }
    }
};

// Global helpers (mostly for compatibility)
window.api = api;
export default api;

// These functions were in the original api.js, keeping them for compatibility
export function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Time ago helper for notifications
export function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}
