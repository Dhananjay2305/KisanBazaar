import api, { showToast, formatCurrency, formatDate, resolveImageUrl } from './api.js';
import { bootstrapAdminUser } from './auth.js';

let charts = {};
let adminProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await bootstrapAdminUser();
        if (!user) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'admin-login.html';
            return;
        }

        const userInfoEl = document.getElementById('adminUserInfo');
        const avatarEl = document.getElementById('adminAvatar');
        if (userInfoEl && user.name) userInfoEl.textContent = user.name;
        if (avatarEl && user.name) avatarEl.textContent = user.name.charAt(0).toUpperCase();

        document.getElementById('adminProductImage')?.addEventListener('change', previewAdminProductImage);

        // Handle initial section from hash on reload
        const validViews = ['dashboard', 'orders', 'products', 'customers', 'payments', 'support', 'analytics'];
        const initialView = window.location.hash.replace('#', '');
        if (validViews.includes(initialView)) {
            switchView(initialView);
        } else {
            switchView('dashboard');
        }
    } catch (err) {
        console.error("Admin dashboard initialization failed:", err);
        showToast(err.message || 'Connection offline. Retrying in background...', 'error');
    }

    // Hashchange listener for back/forward navigation and reload persistence
    window.addEventListener('hashchange', () => {
        const view = window.location.hash.replace('#', '');
        if (validViews.includes(view)) {
            switchView(view);
        }
    });

    window.switchView = switchView;
    window.deleteProduct = deleteProduct;
    window.updateOrderStatus = updateOrderStatus;
    window.openAddProductModal = openAddProductModal;
    window.openEditProductModal = openEditProductModal;
    window.closeModal = closeModal;
    window.openAddFarmerModal = openAddFarmerModal;
    window.closeFarmerModal = closeFarmerModal;
});

function previewAdminProductImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('adminProductImagePreview');
    const nameEl = document.getElementById('adminProductImageName');
    if (!preview) return;

    if (!file) {
        preview.style.display = 'none';
        preview.removeAttribute('src');
        if (nameEl) nameEl.textContent = '';
        return;
    }

    if (!file.type.startsWith('image/')) {
        showToast('Please choose a JPEG, PNG, or WebP image.', 'error');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    if (nameEl) nameEl.textContent = file.name;
}

function resetAdminImagePreview(existingUrl = '') {
    const preview = document.getElementById('adminProductImagePreview');
    const input = document.getElementById('adminProductImage');
    const nameEl = document.getElementById('adminProductImageName');
    if (input) input.value = '';

    if (existingUrl) {
        preview.src = resolveImageUrl(existingUrl);
        preview.style.display = 'block';
        if (nameEl) nameEl.textContent = 'Current image (choose a file to replace)';
    } else {
        preview.style.display = 'none';
        preview.removeAttribute('src');
        if (nameEl) nameEl.textContent = '';
    }
}

function setSaveButtonLoading(isLoading, label = 'Save Product') {
    const btn = document.getElementById('saveProductBtn');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
        ? '<span class="loading-spinner"></span> Saving...'
        : label;
}

async function switchView(viewId) {
    document.getElementById('adminSidebar')?.classList.remove('open');
    document.getElementById('sidebar')?.classList.remove('open');
    const validViews = ['dashboard', 'orders', 'products', 'customers', 'payments', 'support', 'analytics'];
    if (!validViews.includes(viewId)) return;

    document.querySelectorAll('.admin-nav__item').forEach((item) => {
        item.classList.remove('active');
        if (item.getAttribute('onclick')?.includes(viewId)) item.classList.add('active');
    });

    const pageTitles = {
        dashboard: 'Dashboard Overview',
        orders: 'Orders Management',
        products: 'Product Catalog',
        customers: 'Customer Management',
        payments: 'Payment Tracking',
        support: 'Customer Support',
        analytics: 'Detailed Analytics',
    };
    document.getElementById('pageTitle').innerText = pageTitles[viewId] || 'Admin Panel';

    document.querySelectorAll('.view-section').forEach((section) => section.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');

    switch (viewId) {
        case 'dashboard':
            await initDashboard();
            break;
        case 'orders':
            await initOrders();
            break;
        case 'products':
            await initProducts();
            break;
        case 'customers':
            await initCustomers();
            break;
        case 'payments':
            await initPayments();
            break;
        case 'support':
            await initSupport();
            break;
        case 'analytics':
            await initAnalytics();
            break;
    }

    if (window.location.hash !== `#${viewId}`) {
        window.location.hash = viewId;
    }
}

async function initDashboard() {
    try {
        const stats = await api.get('/admin/stats');
        const statsContainer = document.getElementById('dashboardStats');

        statsContainer.innerHTML = `
            <div class="stat-card admin-stat">
                <div class="stat-card__icon stat-card__icon--blue"><i class="fa-solid fa-users"></i></div>
                <div class="stat-card__info">
                    <h4>Total Users</h4>
                    <p>${stats.usersCount}</p>
                </div>
            </div>
            <div class="stat-card admin-stat">
                <div class="stat-card__icon stat-card__icon--green"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                <div class="stat-card__info">
                    <h4>Revenue</h4>
                    <p>${formatCurrency(stats.revenue)}</p>
                </div>
            </div>
            <div class="stat-card admin-stat">
                <div class="stat-card__icon stat-card__icon--orange"><i class="fa-solid fa-cart-shopping"></i></div>
                <div class="stat-card__info">
                    <h4>Total Orders</h4>
                    <p>${stats.ordersCount}</p>
                </div>
            </div>
            <div class="stat-card admin-stat">
                <div class="stat-card__icon stat-card__icon--purple"><i class="fa-solid fa-clock"></i></div>
                <div class="stat-card__info">
                    <h4>Pending Orders</h4>
                    <p>${stats.pendingOrdersCount}</p>
                </div>
            </div>
        `;

        renderDashboardCharts(stats);
    } catch (error) {
        showToast('Error loading dashboard: ' + error.message, 'error');
    }
}

function renderDashboardCharts(stats) {
    const ordersCtx = document.getElementById('dashboardOrdersChart').getContext('2d');
    const revenueCtx = document.getElementById('dashboardRevenueChart').getContext('2d');

    if (charts.dashOrders) charts.dashOrders.destroy();
    if (charts.dashRevenue) charts.dashRevenue.destroy();

    const recentDays = stats.recentOrders.slice(0, 7).reverse();

    charts.dashOrders = new Chart(ordersCtx, {
        type: 'line',
        data: {
            labels: recentDays.map((o) => new Date(o.created_at).toLocaleDateString()),
            datasets: [{
                label: 'Order Value',
                data: recentDays.map((o) => o.total_amount),
                borderColor: '#22c55e',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
            }],
        },
        options: { responsive: true, plugins: { legend: { display: false } } },
    });

    charts.dashRevenue = new Chart(revenueCtx, {
        type: 'doughnut',
        data: {
            labels: ['Farmers', 'Buyers'],
            datasets: [{
                data: [stats.roleStats.farmer, stats.roleStats.buyer],
                backgroundColor: ['#22c55e', '#3b82f6'],
            }],
        },
        options: { responsive: true },
    });
}

async function initOrders() {
    try {
        const { orders } = await api.get('/admin/orders');
        const tbody = document.getElementById('ordersTableBody');

        tbody.innerHTML = orders
            .map(
                (order) => `
            <tr>
                <td>#${order.id.slice(-6)}</td>
                <td>${order.buyer?.name || 'Guest'}</td>
                <td>${formatDate(order.created_at)}</td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td><span class="status-badge ${order.status}">${order.status.toUpperCase()}</span></td>
                <td>
                    <select onchange="updateOrderStatus('${order.id}', this.value)" class="form-select" style="padding: 0.25rem; font-size: 0.8rem; width: auto;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `
            )
            .join('');
    } catch (error) {
        showToast('Error loading orders: ' + error.message, 'error');
    }
}

async function initProducts() {
    try {
        const { products } = await api.get('/admin/products');
        adminProducts = products || [];
        const tbody = document.getElementById('productsTableBody');

        if (!adminProducts.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#6b7280;">No products yet. Click "Add Product" to create one.</td></tr>`;
            return;
        }

        tbody.innerHTML = adminProducts
            .map(
                (p) => `
            <tr>
                <td><img src="${resolveImageUrl(p.image)}" alt="${p.crop_name}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover;"></td>
                <td><strong>${p.crop_name}</strong><br><small style="color:#6b7280;">${p.category || '—'}</small></td>
                <td>${p.farmer?.name || 'Unknown'}</td>
                <td>${formatCurrency(p.price)}/${p.unit}</td>
                <td>${p.quantity} ${p.unit}</td>
                <td><span class="status-badge ${p.status === 'available' ? 'completed' : 'cancelled'}">${p.status}</span></td>
                <td>
                    <button type="button" class="action-btn" title="Edit" onclick="openEditProductModal('${p.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button type="button" class="action-btn delete" title="Delete" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `
            )
            .join('');
    } catch (error) {
        showToast('Error loading products: ' + error.message, 'error');
    }
}

async function initCustomers() {
    try {
        const { customers } = await api.get('/admin/customers');
        const tbody = document.getElementById('customersTableBody');
        tbody.innerHTML = customers
            .map(
                (c) => `
            <tr>
                <td><strong>${c.name || 'No Name'}</strong><br><small>${c.phone || ''}</small></td>
                <td><span class="status-badge ${c.role === 'farmer' ? 'shipped' : 'completed'}">${c.role.toUpperCase()}</span></td>
                <td>${c.location || 'N/A'}</td>
                <td>${formatDate(c.created_at)}</td>
            </tr>
        `
            )
            .join('');
    } catch (error) {
        showToast('Error loading customers: ' + error.message, 'error');
    }
}

async function initPayments() {
    try {
        const { payments } = await api.get('/admin/payments');
        const tbody = document.getElementById('paymentsTableBody');
        tbody.innerHTML = payments
            .map(
                (p) => `
            <tr>
                <td>TRX-${p.id.slice(-8).toUpperCase()}</td>
                <td>#${p.id.slice(-6)}</td>
                <td>${formatCurrency(p.total_amount)}</td>
                <td>${formatDate(p.created_at)}</td>
                <td><span class="status-badge ${p.payment_status === 'completed' ? 'completed' : 'pending'}">${p.payment_status.toUpperCase()}</span></td>
            </tr>
        `
            )
            .join('');
    } catch (error) {
        showToast('Error loading payments: ' + error.message, 'error');
    }
}

async function initSupport() {
    const tbody = document.getElementById('supportTableBody');
    try {
        const { messages } = await api.get('/admin/support');
        if (!messages || messages.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:3rem;color:#6b7280;">
                <i class="fa-solid fa-headset" style="font-size:2rem;display:block;margin-bottom:0.75rem;color:#d1d5db;"></i>
                No support messages yet
            </td></tr>`;
            return;
        }
        tbody.innerHTML = messages
            .map(
                (m) => `
            <tr>
                <td>${m.user?.name || 'Guest'}</td>
                <td>${m.subject || 'N/A'}</td>
                <td>${(m.message || '').slice(0, 50)}${(m.message || '').length > 50 ? '...' : ''}</td>
                <td>${formatDate(m.created_at)}</td>
                <td><span class="status-badge pending">NEW</span></td>
            </tr>
        `
            )
            .join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#dc2626;">
            Support messages table not found. Run supabase_setup.sql to enable this feature.
        </td></tr>`;
    }
}

async function initAnalytics() {
    try {
        const stats = await api.get('/admin/stats');

        const growthCtx = document.getElementById('salesGrowthChart').getContext('2d');
        if (charts.growth) charts.growth.destroy();

        const ordersForChart = [...(stats.recentOrders || [])].reverse().slice(-10);

        charts.growth = new Chart(growthCtx, {
            type: 'bar',
            data: {
                labels: ordersForChart.map((o) =>
                    new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                ),
                datasets: [{
                    label: 'Revenue (₹)',
                    data: ordersForChart.map((o) => o.total_amount),
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#16a34a',
                    borderWidth: 1,
                    borderRadius: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
            },
        });

        const rolesCtx = document.getElementById('userRolesChart').getContext('2d');
        if (charts.roles) charts.roles.destroy();
        charts.roles = new Chart(rolesCtx, {
            type: 'pie',
            data: {
                labels: ['Farmers', 'Buyers'],
                datasets: [{
                    data: [stats.roleStats.farmer, stats.roleStats.buyer],
                    backgroundColor: ['#16a34a', '#2563eb'],
                    borderWidth: 0,
                }],
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
        });

        const completionCtx = document.getElementById('orderCompletionChart')?.getContext('2d');
        if (completionCtx) {
            if (charts.completion) charts.completion.destroy();
            const pending = stats.pendingOrdersCount;
            const completed = stats.ordersCount - pending;
            charts.completion = new Chart(completionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Pending'],
                    datasets: [{
                        data: [completed, pending],
                        backgroundColor: ['#10b981', '#f59e0b'],
                        borderWidth: 0,
                    }],
                },
                options: { responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '65%' },
            });
        }
    } catch (error) {
        showToast('Error loading analytics: ' + error.message, 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await api.delete(`/admin/products/${id}`);
        showToast('Product deleted', 'success');
        initProducts();
    } catch (error) {
        showToast('Delete failed: ' + error.message, 'error');
    }
}

async function updateOrderStatus(id, status) {
    try {
        await api.patch(`/orders/${id}`, { status });
        showToast('Order status updated', 'success');
        initOrders();
    } catch (error) {
        showToast('Update failed: ' + error.message, 'error');
    }
}

function openAddProductModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
    document.getElementById('productModal').style.display = 'block';
    document.getElementById('productModalTitle').innerText = 'Add New Product';
    document.getElementById('productId').value = '';
    document.getElementById('adminProductForm').reset();
    document.getElementById('adminProductImage').required = true;
    resetAdminImagePreview();
    loadFarmersList();
}

function openEditProductModal(id) {
    const product = adminProducts.find((p) => p.id === id);
    if (!product) {
        showToast('Product not found. Refresh the page.', 'error');
        return;
    }

    document.getElementById('modalOverlay').style.display = 'flex';
    document.getElementById('productModal').style.display = 'block';
    document.getElementById('productModalTitle').innerText = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('adminProductImage').required = false;

    loadFarmersList().then(() => {
        document.getElementById('farmerId').value = product.farmer_id;
    });

    document.getElementById('cropName').value = product.crop_name || '';
    document.getElementById('quantity').value = product.quantity ?? '';
    document.getElementById('unit').value = product.unit || 'kg';
    document.getElementById('price').value = product.price ?? '';
    document.getElementById('description').value = product.description || '';
    document.getElementById('location').value = product.location || '';
    document.getElementById('category').value = product.category || 'vegetables';

    resetAdminImagePreview(product.image);
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('productModal').style.display = 'none';
}

async function loadFarmersList() {
    const select = document.getElementById('farmerId');
    try {
        const { farmers } = await api.get('/farmers/all');
        select.innerHTML = farmers
            .map((f) => `<option value="${f.id}">${f.name} (${f.location || 'No location'})</option>`)
            .join('');
    } catch (error) {
        select.innerHTML = '<option value="">Error loading farmers</option>';
    }
}

document.getElementById('adminProductForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('productId').value;
    const isEdit = Boolean(productId);
    setSaveButtonLoading(true);

    try {
        const formData = new FormData(e.target);
        if (isEdit) {
            await api.putForm(`/admin/listings/${productId}`, formData);
            showToast('Product updated successfully', 'success');
        } else {
            await api.postForm('/admin/listings', formData);
            showToast('Product added successfully', 'success');
        }
        closeModal();
        initProducts();
    } catch (error) {
        showToast(error.message || 'Save failed', 'error');
    } finally {
        setSaveButtonLoading(false, isEdit ? 'Update Product' : 'Save Product');
    }
});

function openAddFarmerModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
    document.getElementById('addFarmerModal').style.display = 'block';
    document.getElementById('adminFarmerForm').reset();
}

function closeFarmerModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('addFarmerModal').style.display = 'none';
}

document.getElementById('adminFarmerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveFarmerBtn');
    const originalText = btn.innerHTML;
    
    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Creating...';
        
        const data = Object.fromEntries(new FormData(e.target).entries());
        await api.createFarmerAsAdmin(data);
        showToast('Farmer added successfully!', 'success');
        closeFarmerModal();
        initCustomers(); // Refresh the customers list
    } catch (error) {
        showToast(error.message || 'Failed to add farmer', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});
