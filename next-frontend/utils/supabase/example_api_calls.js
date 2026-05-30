import { supabase } from './client';

/**
 * Example Supabase API Calls showing basic CRUD, Auth, Real-time, and Storage.
 * Using async/await structure.
 */

// ======================= AUTH (Users) =======================

export async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) console.error('SignUp Error:', error.message);
  return data;
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) console.error('Login Error:', error.message);
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout Error:', error.message);
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) console.error('Session Error:', error.message);
  return session;
}


// ======================= PRODUCTS (CRUD) =======================

// Create (Insert)
export async function addProduct(name, description, price, imageUrl) {
  const { data, error } = await supabase
    .from('products')
    .insert([
      { name, description, price, image_url: imageUrl },
    ])
    .select(); // Returns the inserted row
  if (error) console.error('Insert Error:', error.message);
  return data;
}

// Read (Select All)
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  if (error) console.error('Select Error:', error.message);
  return data; // Array of items
}

// Update
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id) // match the specific ID
    .select();
  if (error) console.error('Update Error:', error.message);
  return data;
}

// Delete
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) console.error('Delete Error:', error.message);
}


// ======================= REAL-TIME EXAMPLES =======================

// Subscribe to new rows in 'orders' table
export function subscribeToOrders(callback) {
  const ordersSubscription = supabase
    .channel('custom-insert-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('New Order change received!', payload);
        callback(payload.new);
      }
    )
    .subscribe();

  return ordersSubscription;
}


// ======================= STORAGE EXAMPLES =======================

export async function uploadImage(file) {
  const { data, error } = await supabase.storage
    .from('product-images') // your bucket name
    .upload(`public/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) console.error('Upload Error:', error.message);
  return data;
}

export function getPublicImageUrl(filePath) {
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}
