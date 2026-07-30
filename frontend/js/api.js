import { supabase, isSupabaseConfigured } from './supabase-client.js';
import { compressImageFile, sanitizeFileName } from './image-utils.js';

export { resolveImageUrl } from './image-utils.js';

// Helper to get current session user ID
const getUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id;
};

// Helper to convert a File/Blob to a Base64-encoded Data URL
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const MAX_BASE64_IMAGE_BYTES = 750_000;

function getUploadApiUrl() {
    const fromEnv = String(import.meta.env?.VITE_UPLOAD_API_URL ?? '').trim();
    if (fromEnv) return fromEnv;
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/api/upload-image`;
    }
    return '/api/upload-image';
}

async function uploadViaServerApi(file, accessToken, bucket) {
    try {
        const base64 = await fileToBase64(file);
        const res = await fetch(getUploadApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                base64,
                fileName: file.name,
                bucket,
                contentType: file.type || 'image/jpeg',
            }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) return data.url;
        console.warn('Vercel upload API error:', data.error || res.status);
        return null;
    } catch (err) {
        console.warn('Vercel upload API unreachable:', err);
        return null;
    }
}

/**
 * Upload listing or profile images — works on localhost and Vercel.
 * Tries Supabase client upload, then /api/upload-image on Vercel, then small base64 fallback.
 */
async function uploadImageFile(imageFile, userId, bucket = 'produce') {
    if (!isSupabaseConfigured) {
        throw new Error(
            'Image upload is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables, then redeploy.'
        );
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error('Your session expired. Please log out and sign in again, then retry the upload.');
    }

    const prepared = await compressImageFile(imageFile);
    const storagePath =
        bucket === 'avatars'
            ? `${userId}/profile-${Date.now()}.jpg`
            : `${userId}/${Date.now()}-${sanitizeFileName(prepared.name)}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, prepared, {
        upsert: true,
        contentType: prepared.type || 'image/jpeg',
        cacheControl: '3600',
    });

    if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
        return publicUrlData.publicUrl;
    }

    console.warn(`Direct ${bucket} upload failed, trying Vercel API:`, uploadError.message);

    const serverUrl = await uploadViaServerApi(prepared, session.access_token, bucket);
    if (serverUrl) return serverUrl;

    let fallbackFile = prepared;
    if (fallbackFile.size > MAX_BASE64_IMAGE_BYTES) {
        try {
            console.warn(`[FarmDirect] Image size (${fallbackFile.size} bytes) exceeds base64 limit. Compressing aggressively...`);
            // Attempt aggressive compression: max width 500px, quality 0.6
            const aggressivelyCompressed = await compressImageFile(imageFile, 500, 0.6);
            if (aggressivelyCompressed.size <= MAX_BASE64_IMAGE_BYTES || aggressivelyCompressed.size < fallbackFile.size) {
                fallbackFile = aggressivelyCompressed;
                console.log(`[FarmDirect] Aggressive compression succeeded: ${fallbackFile.size} bytes`);
            }
        } catch (compressErr) {
            console.warn('[FarmDirect] Aggressive compression failed:', compressErr);
        }
    }

    try {
        return await fileToBase64(fallbackFile);
    } catch (base64Err) {
        throw new Error(`Image encoding failed: ${base64Err.message}. Original upload error: ${uploadError.message}`);
    }
}

const LISTING_CATEGORIES = ['vegetables', 'fruits', 'grains', 'spices', 'pulses', 'other'];

async function getSessionUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

async function getCurrentProfile() {
    const userId = await getSessionUserId();
    if (!userId) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
}

async function assertAdmin() {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== 'admin') {
        throw new Error('Only administrators can perform this action.');
    }
    return profile;
}

function parseListingFormData(formData, { requireImage = false } = {}) {
    const cropName = String(formData.get('cropName') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const unit = String(formData.get('unit') ?? 'kg').trim() || 'kg';
    const category = String(formData.get('category') ?? 'vegetables').trim().toLowerCase();
    const quantity = Number(formData.get('quantity'));
    const price = Number(formData.get('price'));
    const imageFile = formData.get('image');

    const errors = [];
    if (!cropName) errors.push('Product name is required.');
    if (!location) errors.push('Location is required.');
    if (!Number.isFinite(quantity) || quantity <= 0) errors.push('Stock quantity must be greater than 0.');
    if (!Number.isFinite(price) || price <= 0) errors.push('Price must be greater than 0.');
    if (!LISTING_CATEGORIES.includes(category)) errors.push('Please select a valid category.');
    if (requireImage && (!imageFile || !imageFile.size)) {
        errors.push('Product image is required.');
    }

    if (errors.length) {
        const err = new Error(errors.join(' '));
        err.validationErrors = errors;
        throw err;
    }

    return {
        cropName,
        description,
        location,
        unit,
        category,
        quantity,
        price,
        imageFile: imageFile && imageFile.size > 0 ? imageFile : null,
    };
}

function listingRowFromParsed(parsed, farmerId, imageUrl) {
    return {
        farmer_id: farmerId,
        crop_name: parsed.cropName,
        quantity: parsed.quantity,
        unit: parsed.unit,
        price: parsed.price,
        location: parsed.location,
        description: parsed.description || null,
        category: parsed.category,
        image: imageUrl || null,
        status: 'available',
    };
}


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
        if (endpoint === '/listings' || endpoint.startsWith('/listings?')) {
            const query = endpoint.includes('?') ? endpoint.slice(endpoint.indexOf('?')) : '';
            return this.getAllListings(query);
        }
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
        if (endpoint.startsWith('/admin/listings/')) {
            const id = endpoint.split('/')[3];
            return this.updateListingAsAdmin(id, formData);
        }
        if (endpoint.startsWith('/listings/')) {
            const id = endpoint.split('/')[2];
            return this.updateListingFromForm(id, formData);
        }
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

    async getAllListings(queryString = '') {
        const params = new URLSearchParams(
            queryString.startsWith('?') ? queryString.slice(1) : queryString
        );
        const status = params.get('status') || 'available';
        const crop = params.get('crop')?.trim();
        const location = params.get('location')?.trim();

        let query = supabase
            .from('listings')
            .select('*, farmer:profiles!listings_farmer_id_fkey(id, name, location, profile_image)')
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (crop) {
            if (LISTING_CATEGORIES.includes(crop.toLowerCase())) {
                query = query.eq('category', crop.toLowerCase());
            } else {
                query = query.ilike('crop_name', `%${crop}%`);
            }
        }
        if (location) {
            query = query.ilike('location', `%${location}%`);
        }

        const { data, error } = await query;
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
        await assertAdmin();

        const farmerId = String(formData.get('farmerId') ?? '').trim();
        if (!farmerId) throw new Error('Please select a farmer for this product.');

        const parsed = parseListingFormData(formData, { requireImage: false });
        let imageUrl = null;
        if (parsed.imageFile) {
            imageUrl = await uploadImageFile(parsed.imageFile, farmerId, 'produce');
        }

        const { data, error } = await supabase
            .from('listings')
            .insert(listingRowFromParsed(parsed, farmerId, imageUrl))
            .select()
            .single();

        if (error) throw error;
        return { message: 'Product created successfully', listing: data };
    },

    async createListingFromForm(formData) {
        const userId = await getUserId();
        if (!userId) throw new Error('Not authenticated. Please sign in again.');

        const profile = await getCurrentProfile();
        if (!profile || profile.role !== 'farmer') {
            throw new Error('Only farmers can add product listings.');
        }

        const parsed = parseListingFormData(formData, { requireImage: false });
        let imageUrl = null;
        if (parsed.imageFile) {
            imageUrl = await uploadImageFile(parsed.imageFile, userId, 'produce');
        }

        const { data, error } = await supabase
            .from('listings')
            .insert(listingRowFromParsed(parsed, userId, imageUrl))
            .select()
            .single();

        if (error) throw error;
        return { message: 'Listing created successfully', listing: data };
    },

    async updateListingFromForm(id, formData) {
        const userId = await getUserId();
        if (!userId) throw new Error('Not authenticated');

        const { data: existing, error: fetchError } = await supabase
            .from('listings')
            .select('farmer_id, image')
            .eq('id', id)
            .single();
        if (fetchError || !existing) throw new Error('Listing not found');
        if (existing.farmer_id !== userId) {
            throw new Error('You can only update your own listings.');
        }

        const parsed = parseListingFormData(formData, { requireImage: false });
        let imageUrl = existing.image;
        if (parsed.imageFile) {
            imageUrl = await uploadImageFile(parsed.imageFile, userId, 'produce');
        }

        const { data, error } = await supabase
            .from('listings')
            .update({
                crop_name: parsed.cropName,
                quantity: parsed.quantity,
                unit: parsed.unit,
                price: parsed.price,
                location: parsed.location,
                description: parsed.description || null,
                category: parsed.category,
                image: imageUrl,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { message: 'Listing updated successfully', listing: data };
    },

    // --- Admin Endpoints ---

    async createFarmerAsAdmin(data) {
        await assertAdmin();
        const apiUrl = window.location.hostname.includes('localhost')
            ? 'http://localhost:5001/api/auth/admin-add-farmer'
            : '/_/backend/api/auth/admin-add-farmer';
            
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create farmer');
        }
        
        return await response.json();
    },

    async updateListingAsAdmin(id, formData) {
        await assertAdmin();

        const farmerId = String(formData.get('farmerId') ?? '').trim();
        if (!farmerId) throw new Error('Please select a farmer for this product.');

        const { data: existing, error: fetchError } = await supabase
            .from('listings')
            .select('image')
            .eq('id', id)
            .single();
        if (fetchError || !existing) throw new Error('Product not found');

        const parsed = parseListingFormData(formData, { requireImage: false });
        let imageUrl = existing.image;
        if (parsed.imageFile) {
            imageUrl = await uploadImageFile(parsed.imageFile, farmerId, 'produce');
        }

        const { data, error } = await supabase
            .from('listings')
            .update({
                farmer_id: farmerId,
                crop_name: parsed.cropName,
                quantity: parsed.quantity,
                unit: parsed.unit,
                price: parsed.price,
                location: parsed.location,
                description: parsed.description || null,
                category: parsed.category,
                image: imageUrl,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { message: 'Product updated successfully', listing: data };
    },

    async updateListing(id, updateData) {
        const userId = await getUserId();
        if (!userId) throw new Error('Not authenticated');

        const profile = await getCurrentProfile();
        if (profile?.role !== 'admin') {
            const { data: existing } = await supabase
                .from('listings')
                .select('farmer_id')
                .eq('id', id)
                .single();
            if (!existing || existing.farmer_id !== userId) {
                throw new Error('You can only update your own listings.');
            }
        }

        const { data, error } = await supabase.from('listings').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async deleteListing(id) {
        const profile = await getCurrentProfile();
        if (profile?.role !== 'admin') {
            const userId = await getUserId();
            const { data: existing } = await supabase
                .from('listings')
                .select('farmer_id')
                .eq('id', id)
                .single();
            if (!existing || existing.farmer_id !== userId) {
                throw new Error('You can only delete your own listings.');
            }
        }

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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error('Session missing. Please log in again.');

        const userId = session.user.id;
        const name = formData.get('name');
        const location = formData.get('location');
        const phone = formData.get('phone');
        const email = formData.get('email');
        const profileImage = formData.get('profileImage');
        let imageUrl = null;

        if (profileImage && profileImage.size > 0) {
            imageUrl = await uploadImageFile(profileImage, userId, 'avatars');
        }

        const updates = { name, location };
        if (phone) updates.phone = phone;
        if (imageUrl) updates.profile_image = imageUrl;

        // 1. Update public profile
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
        if (error) throw error;

        // 2. Update auth user metadata for email, and update primary email if phone changed
        const authUpdates = { data: { contact_email: email, phone } };
        
        // If phone changed, we must update their login email so they can still log in
        if (phone && phone !== session.user.user_metadata?.phone && phone !== session.user.phone) {
            authUpdates.email = `${phone}@farmdirect.com`;
        }

        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) console.warn('Could not update auth user metadata:', authError);

        // 3. Merge contact_email into the returned profile so the UI can display it
        const finalProfile = { ...data, email: email || session.user.user_metadata?.contact_email || '' };
        return { user: finalProfile };
    },

    async updateProfile(updates) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error('Session missing. Please log in again.');

        const userId = session.user.id;
        const profileUpdates = { ...updates };
        
        // Extract email to store in user_metadata
        let contactEmail = profileUpdates.email;
        delete profileUpdates.email; // Do not send email to profiles table since column doesn't exist

        const { data, error } = await supabase.from('profiles').update(profileUpdates).eq('id', userId).select().single();
        if (error) throw error;

        // Update auth user metadata
        const authUpdates = { data: {} };
        if (contactEmail !== undefined) authUpdates.data.contact_email = contactEmail;
        if (profileUpdates.phone) authUpdates.data.phone = profileUpdates.phone;

        if (profileUpdates.phone && profileUpdates.phone !== session.user.user_metadata?.phone && profileUpdates.phone !== session.user.phone) {
            authUpdates.email = `${profileUpdates.phone}@farmdirect.com`;
        }

        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) console.warn('Could not update auth user metadata:', authError);

        const finalProfile = { ...data, email: contactEmail !== undefined ? contactEmail : session.user.user_metadata?.contact_email || '' };
        return { user: finalProfile };
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
