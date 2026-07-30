import { supabase, isSupabaseConfigured } from './supabase-client.js';
import { showToast } from './api.js';

// Get current user from localStorage (cached)
export function getUser() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined') return null;
        return JSON.parse(userStr);
    } catch (e) {
        console.error('Failed to parse cached user:', e);
        return null;
    }
}

// Get token
export function getToken() {
    return localStorage.getItem('token');
}

// Save user session
export function saveSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Clear session (logout)
export async function clearSession() {
    try {
        await supabase.auth.signOut();
    } catch (e) {
        console.error('Sign out error:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Logout function
export async function logout() {
    await clearSession();
    window.location.href = 'index.html';
}

// Check if user is authenticated
export function isAuthenticated() {
    return !!getToken();
}

// Redirect based on role
export function redirectToDashboard(user) {
    if (!user) return;
    if (user.role === 'farmer') {
        window.location.replace('farmer-dashboard.html');
    } else if (user.role === 'admin') {
        window.location.replace('admin.html');
    } else {
        window.location.replace('buyer-dashboard.html');
    }
}

function isAuthPage() {
    const path = window.location.pathname.replace(/\/$/, '');
    return path.endsWith('auth.html') || path.endsWith('/auth');
}

/**
 * Restore Supabase session into localStorage before dashboard auth checks.
 * Prevents a flash redirect to auth.html when the session cookie exists but cache is empty.
 */
export async function bootstrapDashboardUser(requiredRole) {
    const cached = getUser();
    if (cached?.role === requiredRole) return cached;

    if (!isSupabaseConfigured) return null;

    try {
        const { data: { session } } = await withTimeout(supabase.auth.getSession(), 6000);
        if (!session) return null;

        const { data: profile, error } = await withTimeout(supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single(), 6000);

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Profile row not found
            }
            throw error; // Connection timeout, DB offline, etc. Propagate it.
        }

        if (!profile || profile.role !== requiredRole) return null;

        // Inject contact email from auth metadata
        profile.email = session.user.user_metadata?.contact_email || '';

        saveSession(session.access_token, profile);
        return profile;
    } catch (err) {
        console.error('Session bootstrap:', err);
        throw err; // Rethrow to let caller catch network/offline states, preventing logs wipe & loop
    }
}

/** Restore admin session from Supabase before admin panel checks. */
export async function bootstrapAdminUser() {
    return bootstrapDashboardUser('admin');
}

// Tab switching for auth page
export function switchTab(tab) {
    const tabs = document.querySelectorAll('.auth-form__tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (!loginForm || !registerForm) return;

    const isRegister = tab === 'register';

    tabs.forEach((t) => {
        const active = t.dataset.tab === (isRegister ? 'register' : 'login');
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    loginForm.style.display = isRegister ? 'none' : 'block';
    registerForm.style.display = isRegister ? 'block' : 'none';

    if (isRegister) {
        if (window.location.hash !== '#register') {
            window.location.hash = '#register';
        }
    } else if (window.location.hash !== '#login' && window.location.hash !== '') {
        window.location.hash = '#login';
    }
}

function setLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    const btnText = btn.querySelector('.btn-text') || btn;
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btnText.innerHTML;
        btnText.innerHTML = '<span class="loading-spinner"></span> Processing...';
    } else {
        btn.disabled = false;
        btnText.innerHTML = btn.dataset.originalText || 'Submit';
    }
}

function parseAuthHash() {
    const raw = window.location.hash.replace(/^#/, '').trim().toLowerCase();
    return raw === 'register' ? 'register' : 'login';
}

function applyHashToUI() {
    switchTab(parseAuthHash());
}

// Utility helper to wrap promise operations in a safety timeout.
// Prevents infinite "buffering" / loading state in case of connection drop, adblocker block, or LockManager hangs.
export function withTimeout(promise, ms = 7000) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out. Please check your network or try refreshing.')), ms))
    ]);
}

function initAuthPage() {
    const tabs = document.querySelectorAll('.auth-form__tab');
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    document.getElementById('toRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('register');
    });

    document.getElementById('toLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('login');
    });

    window.addEventListener('hashchange', applyHashToUI);
    applyHashToUI();

    const roleButtons = document.querySelectorAll('.role-toggle__btn');
    roleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            roleButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const roleInput = document.getElementById('registerRole');
            if (roleInput) roleInput.value = btn.dataset.role;
        });
    });

    const initSession = async () => {
        if (!isSupabaseConfigured) return;
        try {
            const { data: { session } } = await withTimeout(supabase.auth.getSession(), 6000);
            if (!session) return;

            const { data: profile, error: pErr } = await withTimeout(supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single(), 6000);

            if (pErr) {
                console.error('Profile load:', pErr);
                return;
            }
            if (profile) {
                if (profile.role === 'admin') {
                    await clearSession();
                    showToast('Access denied. Admins must log in through the admin panel.', 'error');
                    return;
                }
                
                // Inject contact email from auth metadata
                profile.email = session.user.user_metadata?.contact_email || '';
                
                saveSession(session.access_token, profile);
                if (isAuthPage()) {
                    redirectToDashboard(profile);
                }
            }
        } catch (err) {
            console.error('Session init:', err);
        }
    };
    initSession();

    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isSupabaseConfigured) {
            showToast('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env', 'error');
            return;
        }

        const phone = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!phone || !password) {
            showToast('Please fill all fields', 'error');
            return;
        }

        const email = `${phone}@farmdirect.com`;

        try {
            setLoading('loginFormSubmit', true);
            const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }), 8000);
            if (error) throw error;

            const { data: profile, error: pError } = await withTimeout(supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single(), 8000);

            if (pError) throw pError;

            if (profile.role === 'admin') {
                await clearSession();
                showToast('Access denied. Admins must log in through the admin panel.', 'error');
                return;
            }

            saveSession(data.session.access_token, profile);
            showToast('Welcome back!', 'success');
            setTimeout(() => redirectToDashboard(profile), 500);
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
        } finally {
            setLoading('loginFormSubmit', false);
        }
    });

    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isSupabaseConfigured) {
            showToast('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env', 'error');
            return;
        }

        const name = document.getElementById('registerName').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const role = document.getElementById('registerRole').value;
        const location = document.getElementById('registerLocation').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (!name) {
            showToast('Please enter your name', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (phone.length < 10) {
            showToast('Enter a valid 10-digit phone number', 'error');
            return;
        }

        const email = `${phone}@farmdirect.com`;

        try {
            setLoading('registerSubmit', true);
            const { data, error } = await withTimeout(supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name, role, phone, location }
                }
            }), 8000);

            if (error) throw error;
            if (!data.user) throw new Error('Registration failed');

            let profile = null;
            for (let i = 0; i < 15; i++) {
                const { data: p } = await withTimeout(supabase.from('profiles').select('*').eq('id', data.user.id).single(), 6000).catch(() => ({ data: null }));
                if (p) {
                    profile = p;
                    break;
                }
                await new Promise((r) => setTimeout(r, 600));
            }

            if (data.session && profile) {
                if (profile.role === 'admin') {
                    await clearSession();
                    showToast('Access denied. Admins must log in through the admin panel.', 'error');
                    return;
                }
                saveSession(data.session.access_token, profile);
                showToast('Account created successfully!', 'success');
                setTimeout(() => redirectToDashboard(profile), 1000);
            } else {
                showToast('Registration successful! Please log in.', 'success');
                switchTab('login');
            }
        } catch (error) {
            showToast(error.message || 'Registration failed', 'error');
        } finally {
            setLoading('registerSubmit', false);
        }
    });
}

// Only run auth-page UI setup on auth.html (avoids hash listeners / duplicate work on dashboards)
if (isAuthPage()) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthPage);
    } else {
        initAuthPage();
    }
}

window.logout = logout;
window.getUser = getUser;
window.switchTab = switchTab;
window.saveSession = saveSession;
window.getToken = getToken;
