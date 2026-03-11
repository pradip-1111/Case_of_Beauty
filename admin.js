document.addEventListener('DOMContentLoaded', () => {
    if (!SessionManager.isAdmin()) {
        alert('Access denied. Admin only.');
        location.href = 'admin-login.html';
        return;
    }

    // Initial content
    switchTab('dashboard');
    setupAdminModal();
    window.toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar-modern');
        sidebar.classList.toggle('active');
    };
});

const currentView = {
    tab: 'dashboard',
    type: 'PRODUCTS'
};

async function switchTab(tabId) {
    currentView.tab = tabId;

    // Update Sidebar UI
    document.querySelectorAll('.sidebar-modern li').forEach(li => li.classList.remove('active'));
    const navItem = document.getElementById(`nav-${tabId}`);
    if (navItem) navItem.classList.add('active');

    // Toggle Content Sections
    const dashboardSection = document.getElementById('dashboard-section');
    const crudSection = document.getElementById('crud-section');

    if (tabId === 'dashboard') {
        dashboardSection.classList.add('active');
        crudSection.classList.remove('active');
        await renderDashboard();
    } else {
        dashboardSection.classList.remove('active');
        crudSection.classList.add('active');
        currentView.type = tabId.toUpperCase();
        await renderCRUD(currentView.type);
    }
}

async function renderDashboard() {
    const products = await DataManager.getData(DB_KEYS.PRODUCTS);
    const orders = await DataManager.getData(DB_KEYS.ORDERS);
    const users = await DataManager.getData(DB_KEYS.USERS);

    // Update Stats
    document.getElementById('stat-products').innerText = products.length;
    document.getElementById('stat-orders').innerText = orders.length;
    document.getElementById('stat-users').innerText = users.length;

    const totalRevenue = orders
        .filter(o => ['Pending', 'Processing', 'Shipped', 'Delivered'].includes(o.status))
        .reduce((sum, o) => sum + parseFloat(o.price || 0), 0);

    document.getElementById('stat-revenue').innerText = `₹${totalRevenue.toLocaleString()}`;

    // Recent Activity
    const activityList = document.getElementById('recent-activity-list');
    const recentOrders = orders.slice(0, 5);

    if (recentOrders.length === 0) {
        activityList.innerHTML = '<p class="empty-state">No recent activity found.</p>';
    } else {
        activityList.innerHTML = recentOrders.map(o => `
            <div class="activity-item">
                <div class="activity-circle"></div>
                <div class="activity-content">
                    <strong>New Order: ${o.productName}</strong>
                    <span>Customer: ${o.customerEmail} • ₹${o.price}</span>
                </div>
                <div class="activity-time">${new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `).join('');
    }
}

async function renderCRUD(type) {
    const title = document.getElementById('crud-title');
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    const addBtn = document.getElementById('add-btn');
    const loader = document.getElementById('loader');

    const normalizedType = type === 'BANNERS' ? 'Banner' : (type === 'SALES' ? 'Flash Sale' : type.charAt(0) + type.slice(1).toLowerCase());
    title.innerText = normalizedType + ' Management';
    tableBody.innerHTML = '';
    loader.style.display = 'flex';

    // Hide add button for read-only categories (orders, users)
    const readOnlyTabs = ['ORDERS', 'USERS'];
    addBtn.style.display = readOnlyTabs.includes(type) ? 'none' : 'block';

    const data = await DataManager.getData(DB_KEYS[type]);
    loader.style.display = 'none';

    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 4rem; color: #94a3b8;">No data available. If this is Settings, please run settings_setup.sql!</td></tr>';
        return;
    }

    if (type === 'PRODUCTS') {
        tableHead.innerHTML = `<tr><th>Product</th><th>Description</th><th>Price</th><th>Tag</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(p => `
            <tr>
                <td style="display:flex; align-items:center; gap:12px;">
                    <img src="${p.image}" class="table-img">
                    <strong>${p.name}</strong>
                </td>
                <td style="color:#64748b; font-size:0.8rem; max-width:200px;">${p.description}</td>
                <td>₹${p.price}</td>
                <td><span class="status-badge confirmed">${p.tag || 'NEW'}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="openModal('PRODUCTS', '${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteItem('PRODUCTS', '${p.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } else if (type === 'ORDERS') {
        tableHead.innerHTML = `<tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Address</th><th>Amount</th><th>Status</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(o => {
            const addr = [o.shipping_name, o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_pincode].filter(Boolean).join(', ');
            const phone = o.shipping_phone ? `<br><small style="color:#888;">${o.shipping_phone}</small>` : '';
            const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered'].map(s =>
                `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
            ).join('');
            return `
            <tr>
                <td style="font-family:monospace;color:#6366f1;">#${(o.id || '').slice(-6)}</td>
                <td>${o.customerEmail || o.user_id || 'N/A'}${phone}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        ${o.productImage ? `<img src="${o.productImage}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">` : '<div style="width:40px;height:40px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;"><i class="fas fa-box" style="color:#94a3b8;"></i></div>'}
                        <div>
                            <strong>${o.productName || 'N/A'}</strong>
                            ${o.quantity ? `<br><small style="color:#888;">Qty: ${o.quantity}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td style="font-size:0.8rem;color:#64748b;max-width:180px;">${addr || '<em style="color:#c0c0c0;">No address</em>'}</td>
                <td style="font-weight:600;">₹${parseFloat(o.price || 0).toFixed(2)}</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">${statusOptions}</select>
                </td>
                <td>
                    <button class="action-btn edit-btn" onclick="viewOrderDetails('${o.id}')" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteItem('ORDERS', '${o.id}')" title="Delete"><i class="fas fa-times"></i></button>
                </td>
            </tr>`;
        }).join('');
    } else if (type === 'USERS') {
        tableHead.innerHTML = `<tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(u => `
            <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="status-badge ${u.role === 'admin' ? 'confirmed' : 'pending'}">${u.role}</span></td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteItem('USERS', '${u.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } else if (type === 'REVIEWS') {
        tableHead.innerHTML = `<tr><th>Product</th><th>User</th><th>Rating</th><th>Review</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(r => `
            <tr>
                <td><strong>${r.product}</strong></td>
                <td>${r.userName}</td>
                <td>${'⭐'.repeat(r.stars)}</td>
                <td style="color:#64748b; font-size:0.85rem;">${r.text}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="openModal('REVIEWS', '${r.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteItem('REVIEWS', '${r.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } else if (type === 'CATEGORIES') {
        tableHead.innerHTML = `<tr><th>Category</th><th>Title</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(c => `
            <tr>
                <td><img src="${c.image}" class="table-img"></td>
                <td><strong>${c.title}</strong></td>
                <td>
                    <button class="action-btn edit-btn" onclick="openModal('CATEGORIES', '${c.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteItem('CATEGORIES', '${c.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } else if (type === 'BANNERS') {
        tableHead.innerHTML = `<tr><th>Banner</th><th>Title</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(b => `
            <tr>
                <td><img src="${b.image}" class="table-img-wide"></td>
                <td><strong>${b.title}</strong></td>
                <td>
                    <button class="action-btn edit-btn" onclick="openModal('BANNERS', '${b.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteItem('BANNERS', '${b.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } else if (type === 'SALES') {
        tableHead.innerHTML = `<tr><th>Sale Name</th><th>End Date</th><th>Discount</th><th>Status</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(s => {
            const dateStr = s.enddate || s.endDate;
            const isExpired = dateStr ? new Date(dateStr) < new Date() : true;
            return `
            <tr>
                <td><strong>${s.title}</strong></td>
                <td>${dateStr ? new Date(dateStr).toLocaleString() : 'No date'}</td>
                <td style="font-weight:600; color:#e11d48;">${s.discount}</td>
                <td><span class="status-badge ${isExpired ? 'pending' : 'confirmed'}">${isExpired ? 'EXPIRED' : 'ACTIVE'}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="openModal('SALES', '${s.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteItem('SALES', '${s.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `}).join('');
    } else if (type === 'VIDEOS') {
        tableHead.innerHTML = `<tr><th>Video Preview</th><th>Title</th><th>Price</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(v => `
            <tr>
                <td><video src="${v.videourl || v.video_url || v.videoUrl}" style="height:60px; border-radius:8px;"></video></td>
                <td>
                    <strong>${v.title}</strong><br>
                    <small style="color:#888;">${v.description || ''}</small>
                </td>
                <td>₹${v.price || 0}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="openModal('VIDEOS', '${v.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteItem('VIDEOS', '${v.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } else if (type === 'SETTINGS') {
        tableHead.innerHTML = `<tr><th>Setting Key</th><th>Value</th><th>Updated At</th><th>Actions</th></tr>`;
        tableBody.innerHTML = data.map(s => `
            <tr>
                <td><strong>${s.key}</strong></td>
                <td>${s.value}</td>
                <td style="font-size:0.8rem; color:#64748b;">${new Date(s.updated_at).toLocaleString()}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="openModal('SETTINGS', '${s.key}')"><i class="fas fa-edit"></i></button>
                    ${s.key !== 'top_bar_message' ? `<button class="action-btn delete-btn" onclick="deleteItem('SETTINGS', '${s.key}')"><i class="fas fa-trash"></i></button>` : ''}
                </td>
            </tr>
        `).join('');
    }
}

// ─────────────────────────────────────────────────────────
// FILE UPLOAD HELPER
// Uploads a file to the server → Supabase Storage → returns public URL
// ─────────────────────────────────────────────────────────
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'x-auth-token': SessionManager.getToken() },
        body: formData
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
    }

    const data = await res.json();
    return data.url;
}

// Builds an upload field with a file picker + URL input + preview
function buildUploadField(labelText, fieldName, currentUrl = '', accept = 'image/*') {
    const uniqueId = `upload_${fieldName}_${Date.now()}`;
    return `
        <div class="form-group full upload-field-group">
            <label>${labelText}</label>
            <div class="upload-row">
                <label class="upload-btn" for="${uniqueId}">
                    <i class="fas fa-cloud-upload-alt"></i> Choose File
                    <input type="file" id="${uniqueId}" accept="${accept}" style="display:none;"
                        onchange="handleFileUpload(this, '${fieldName}')">
                </label>
                <input type="url" name="${fieldName}" id="url_${fieldName}" 
                    value="${currentUrl}" placeholder="Paste URL or upload a file above" class="url-fallback-input">
            </div>
            <div class="upload-status" id="status_${fieldName}"></div>
            ${currentUrl ? `<img src="${currentUrl}" class="upload-preview" id="preview_${fieldName}" onerror="this.style.display='none'">` : `<img class="upload-preview" id="preview_${fieldName}" style="display:none;">`}
        </div>
    `;
}

// Handles the file input change: uploads and fills the URL field
window.handleFileUpload = async function (input, fieldName) {
    const file = input.files[0];
    if (!file) return;

    const statusEl = document.getElementById(`status_${fieldName}`);
    const previewEl = document.getElementById(`preview_${fieldName}`);
    const urlInput = document.getElementById(`url_${fieldName}`);

    statusEl.innerHTML = '<span class="upload-uploading"><i class="fas fa-spinner fa-spin"></i> Uploading...</span>';

    try {
        const url = await uploadFile(file);
        urlInput.value = url;
        statusEl.innerHTML = '<span class="upload-success"><i class="fas fa-check-circle"></i> Uploaded successfully!</span>';
        previewEl.src = url;
        previewEl.style.display = 'block';
    } catch (err) {
        statusEl.innerHTML = `<span class="upload-error"><i class="fas fa-times-circle"></i> Upload failed: ${err.message}</span>`;
        console.error('Upload failed:', err);
    }
};

// ─────────────────────────────────────────────────────────
// OPEN MODAL
// ─────────────────────────────────────────────────────────
async function openModal(type, id = null) {
    if (!type) type = currentView.type;

    const fieldsContainer = document.getElementById('form-fields');
    const label = type === 'BANNERS' ? 'Banner' : (type === 'SALES' ? 'Flash Sale' : type.charAt(0) + type.slice(1).toLowerCase().slice(0, -1));
    document.getElementById('modal-title').innerText = (id ? 'Edit ' : 'New ') + label;
    document.getElementById('item-id').value = id || '';
    document.getElementById('item-type').value = type;

    let item = null;
    if (id) {
        const data = await DataManager.getData(DB_KEYS[type]);
        item = data.find(i => (i.id == id || i.key == id));
        // Normalize enddate for datetime-local input
        if (item && (item.enddate || item.endDate)) {
            const rawDate = item.enddate || item.endDate;
            item.enddate = rawDate.slice(0, 16);
        }
    }

    let fieldsHtml = '';
    if (type === 'PRODUCTS') {
        fieldsHtml = `
            <div class="form-group full"><label>Product Name</label><input type="text" name="name" value="${item ? item.name : ''}" required></div>
            <div class="form-group full"><label>Description</label><input type="text" name="description" value="${item ? item.description : ''}" required></div>
            <div class="form-group"><label>Price (₹)</label><input type="number" name="price" value="${item ? item.price : ''}" required></div>
            <div class="form-group"><label>Tag (e.g. BESTSELLER)</label><input type="text" name="tag" value="${item ? item.tag : ''}"></div>
            <div class="form-group full" style="flex-direction: row; align-items: center; gap: 10px;">
                <input type="checkbox" name="is_new_launch" ${item && item.is_new_launch ? 'checked' : ''} style="width: auto;">
                <label style="margin-bottom: 0;">Mark as New Launch</label>
            </div>
            ${buildUploadField('Product Image', 'image', item ? item.image : '')}
        `;
    } else if (type === 'BANNERS') {
        fieldsHtml = `
            <div class="form-group full"><label>Banner Title</label><input type="text" name="title" value="${item ? item.title : ''}" required></div>
            ${buildUploadField('Banner Image', 'image', item ? item.image : '')}
        `;
    } else if (type === 'CATEGORIES') {
        fieldsHtml = `
            <div class="form-group full"><label>Category Title</label><input type="text" name="title" value="${item ? item.title : ''}" required></div>
            ${buildUploadField('Category Image', 'image', item ? item.image : '')}
        `;
    } else if (type === 'REVIEWS') {
        fieldsHtml = `
            <div class="form-group full"><label>Username</label><input type="text" name="userName" value="${item ? item.userName : ''}" required></div>
            <div class="form-group"><label>Product Name</label><input type="text" name="product" value="${item ? item.product : ''}" required></div>
            <div class="form-group"><label>Stars (1-5)</label><input type="number" name="stars" min="1" max="5" value="${item ? item.stars : 5}" required></div>
            <div class="form-group full"><label>Review Text</label><input type="text" name="text" value="${item ? item.text : ''}" required></div>
        `;
    } else if (type === 'SALES') {
        fieldsHtml = `
            <div class="form-group full"><label>Sale Title (e.g. FLASH SALE)</label><input type="text" name="title" value="${item ? item.title : ''}" required></div>
            <div class="form-group full"><label>Discount Text (e.g. 50% OFF)</label><input type="text" name="discount" value="${item ? item.discount : ''}" required></div>
            <div class="form-group full"><label>End Date &amp; Time</label><input type="datetime-local" name="enddate" value="${item ? item.enddate : ''}" required></div>
            ${buildUploadField('Banner Image (Optional)', 'image', item ? item.image : '')}
        `;
    } else if (type === 'VIDEOS') {
        fieldsHtml = `
            <div class="form-group full"><label>Video Title</label><input type="text" name="title" value="${item ? item.title : ''}" required></div>
            <div class="form-group full"><label>Product Description (Below Video)</label><input type="text" name="description" value="${item ? item.description : ''}" required></div>
            <div class="form-group"><label>Price (₹)</label><input type="number" name="price" value="${item ? item.price : ''}" required></div>
            ${buildUploadField('Product Image (Overlay)', 'product_image', item ? item.product_image : '', 'image/*')}
            ${buildUploadField('Video File', 'videourl', item ? (item.videourl || item.video_url || item.videoUrl) : '', 'video/*')}
        `;
    } else if (type === 'SETTINGS') {
        fieldsHtml = `
            <div class="form-group full"><label>Setting Key</label><input type="text" name="key" value="${item ? item.key : ''}" ${item ? 'readonly' : ''} required></div>
            <div class="form-group full"><label>Value</label><input type="text" name="value" value="${item ? item.value : ''}" required></div>
        `;
    }

    fieldsContainer.innerHTML = fieldsHtml;
    document.getElementById('admin-modal').style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('admin-modal');
    modal.style.display = 'none';
    // Restore the Save Changes button that may have been hidden during order detail view
    const saveBtn = modal.querySelector('button[type="submit"]');
    if (saveBtn) saveBtn.style.display = '';
}

function setupAdminModal() {
    const form = document.getElementById('admin-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const type = document.getElementById('item-type').value;
        const id = document.getElementById('item-id').value;
        const formData = new FormData(form);
        const item = Object.fromEntries(formData.entries());

        // Handle checkboxes (New Launch)
        if (form.elements['is_new_launch']) {
            item.is_new_launch = form.elements['is_new_launch'].checked;
        }

        if (item.price) item.price = parseFloat(item.price);

        try {
            if (id) {
                item.id = id;
                await DataManager.updateItem(DB_KEYS[type], item);
            } else {
                const result = await DataManager.addItem(DB_KEYS[type], item);
                if (result && !result.id && !result._id && result.msg !== 'success') {
                    alert('Error: ' + (result.msg || 'Failed to save.'));
                    return;
                }
            }
            closeModal();
            await renderCRUD(type);
            alert('Saved successfully!');
        } catch (err) {
            alert('Operation failed. Check console.');
            console.error(err);
        }
    };
}

window.deleteItem = async function (type, id) {
    if (confirm('Permanently delete this item?')) {
        await DataManager.deleteItem(DB_KEYS[type], id);
        await renderCRUD(type);
    }
};

window.updateOrderStatus = async function (id, status) {
    await DataManager.updateItem(DB_KEYS.ORDERS, { id, status });
    await renderCRUD('ORDERS');
};

// View full order detail in a modal popup
window.viewOrderDetails = async function (orderId) {
    const data = await DataManager.getData(DB_KEYS.ORDERS);
    const o = data.find(order => order.id === orderId);
    if (!o) return;

    const addr = [o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_pincode].filter(Boolean).join(', ');
    const dateStr = o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : 'N/A';
    const statusColors = { Pending: '#f59e0b', Processing: '#3b82f6', Shipped: '#f97316', Delivered: '#22c55e' };
    const color = statusColors[o.status] || '#94a3b8';

    const modal = document.getElementById('admin-modal');
    document.getElementById('modal-title').innerText = `Order Details`;
    document.getElementById('item-id').value = '';
    document.getElementById('item-type').value = '';

    document.getElementById('form-fields').innerHTML = `
        <div style="grid-column:1/-1; display:flex; flex-direction:column; gap:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:#f8fafc; border-radius:12px;">
                <div>
                    <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em;">Order ID</div>
                    <div style="font-family:monospace; color:#6366f1; font-size:1.1rem; font-weight:700;">#${(o.id || '').slice(-8).toUpperCase()}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">${dateStr}</div>
                </div>
                <span style="background:${color}20; color:${color}; border:1px solid ${color}40; padding:6px 16px; border-radius:20px; font-weight:700; font-size:0.85rem;">${o.status}</span>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <!-- Product Info -->
                <div style="padding:16px; background:#f8fafc; border-radius:12px;">
                    <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; margin-bottom:10px;">Product</div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        ${o.productImage ? `<img src="${o.productImage}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;">` : ''}
                        <div>
                            <div style="font-weight:700; font-size:0.95rem;">${o.productName || 'N/A'}</div>
                            <div style="color:#64748b; font-size:0.85rem; margin-top:2px;">Qty: ${o.quantity || 1}</div>
                            <div style="font-weight:700; color:#6366f1; margin-top:4px;">₹${parseFloat(o.price || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <!-- Customer Info -->
                <div style="padding:16px; background:#f8fafc; border-radius:12px;">
                    <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; margin-bottom:10px;">Customer</div>
                    <div style="font-weight:600;">${o.shipping_name || 'N/A'}</div>
                    <div style="color:#64748b; font-size:0.85rem; margin-top:4px;">${o.customerEmail || ''}</div>
                    ${o.shipping_phone ? `<div style="color:#64748b; font-size:0.85rem; margin-top:4px;"><i class="fas fa-phone"></i> ${o.shipping_phone}</div>` : ''}
                </div>
            </div>

            <!-- Shipping Address -->
            ${addr ? `
            <div style="padding:16px; background:#f0fdf4; border-radius:12px; border-left:4px solid #22c55e;">
                <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;"><i class="fas fa-map-marker-alt" style="color:#22c55e;"></i> Shipping Address</div>
                <div style="color:#374151;">${addr}</div>
            </div>` : ''}

            <!-- Update Status -->
            <div style="padding:16px; background:#f8fafc; border-radius:12px;">
                <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; margin-bottom:10px;">Update Order Status</div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    ${['Pending', 'Processing', 'Shipped', 'Delivered'].map(s => `
                        <button onclick="updateOrderStatus('${o.id}','${s}'); closeModal();" 
                            style="padding:8px 16px; border-radius:8px; border:2px solid ${s === o.status ? color : '#e2e8f0'}; background:${s === o.status ? color + '20' : 'white'}; color:${s === o.status ? color : '#64748b'}; font-weight:600; cursor:pointer; font-family:inherit;">
                            ${s}
                        </button>`).join('')}
                </div>
            </div>
        </div>
    `;

    // Hide Save Changes button for detail view
    const saveBtn = modal.querySelector('button[type="submit"]');
    if (saveBtn) saveBtn.style.display = 'none';
    modal.style.display = 'flex';
};

window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleSidebar = window.toggleSidebar || (() => {
    const sidebar = document.querySelector('.sidebar-modern');
    if (sidebar) sidebar.classList.toggle('active');
});

