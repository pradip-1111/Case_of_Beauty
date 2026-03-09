/**
 * CartManager — Client-side cart stored in localStorage
 * Provides: add, remove, updateQty, getItems, getTotal, clear, renderSidebar
 */

const CartManager = (() => {
    const CART_KEY = 'cob_cart';

    function getItems() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch { return []; }
    }

    function save(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        updateBadge();
        renderSidebar();
    }

    function addItem(product) {
        const items = getItems();
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            items.push({ ...product, qty: 1 });
        }
        save(items);
        openSidebar();
    }

    function removeItem(id) {
        save(getItems().filter(i => i.id !== id));
    }

    function updateQty(id, qty) {
        if (qty < 1) { removeItem(id); return; }
        const items = getItems();
        const item = items.find(i => i.id === id);
        if (item) { item.qty = qty; save(items); }
    }

    function getTotal() {
        return getItems().reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
    }

    function getCount() {
        return getItems().reduce((sum, i) => sum + (i.qty || 1), 0);
    }

    function clear() {
        localStorage.removeItem(CART_KEY);
        updateBadge();
        renderSidebar();
    }

    function updateBadge() {
        const badge = document.getElementById('cart-badge');
        const count = getCount();
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    function openSidebar() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('open');
    }

    function closeSidebar() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }

    function renderSidebar() {
        const list = document.getElementById('cart-items-list');
        const totalEl = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('cart-checkout-btn');
        if (!list) return;

        const items = getItems();

        if (items.length === 0) {
            list.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag" style="font-size:3rem; color:#FFB7C5; margin-bottom:1rem;"></i>
                    <p>Your cart is empty</p>
                    <p style="font-size:0.85rem; color:#aaa;">Add products to get started!</p>
                </div>`;
            if (totalEl) totalEl.textContent = '₹0.00';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        list.innerHTML = items.map(item => `
            <div class="cart-item" id="cart-item-${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                    <div class="cart-qty-controls">
                        <button class="qty-btn" onclick="CartManager.updateQty('${item.id}', ${item.qty - 1})">−</button>
                        <span class="qty-val">${item.qty}</span>
                        <button class="qty-btn" onclick="CartManager.updateQty('${item.id}', ${item.qty + 1})">+</button>
                    </div>
                </div>
                <button class="cart-remove-btn" onclick="CartManager.removeItem('${item.id}')" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        if (totalEl) totalEl.textContent = `₹${getTotal().toFixed(2)}`;
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    function init() {
        updateBadge();
        renderSidebar();
    }

    return { addItem, removeItem, updateQty, getItems, getTotal, getCount, clear, openSidebar, closeSidebar, renderSidebar, updateBadge, init };
})();

// Global toggles (called from HTML)
function openCart() { CartManager.openSidebar(); }
function closeCart() { CartManager.closeSidebar(); }

function goToCheckout() {
    if (!SessionManager.isLoggedIn()) {
        CartManager.closeSidebar();
        toggleAuthModal();
        return;
    }
    if (CartManager.getCount() === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = 'checkout.html';
}
