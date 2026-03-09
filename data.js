const API_URL = '/api';

const SessionManager = {
    setToken: (token, role, email) => {
        localStorage.setItem('cob_token', token);
        localStorage.setItem('cob_role', role);
        if (email) localStorage.setItem('cob_user_email', email);
    },
    getToken: () => localStorage.getItem('cob_token'),
    getRole: () => localStorage.getItem('cob_role'),
    getEmail: () => localStorage.getItem('cob_user_email'),
    logout: () => {
        localStorage.removeItem('cob_token');
        localStorage.removeItem('cob_role');
        localStorage.removeItem('cob_user_email');
        location.reload();
    },
    isLoggedIn: () => !!localStorage.getItem('cob_token'),
    isAdmin: () => localStorage.getItem('cob_role') === 'admin'
};

const DataManager = {
    async getData(type) {
        const endpoint = type.toLowerCase();
        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                headers: {
                    'x-auth-token': SessionManager.getToken()
                }
            });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.error('Fetch error:', err);
            return [];
        }
    },

    async addItem(type, item) {
        const endpoint = type.toLowerCase();
        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': SessionManager.getToken()
                },
                body: JSON.stringify(item)
            });
            return await res.json();
        } catch (err) {
            console.error('Add item error:', err);
        }
    },

    async updateItem(type, item) {
        const endpoint = type.toLowerCase();
        try {
            const res = await fetch(`${API_URL}/${endpoint}/${item.id || item._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': SessionManager.getToken()
                },
                body: JSON.stringify(item)
            });
            return await res.json();
        } catch (err) {
            console.error('Update item error:', err);
        }
    },

    async deleteItem(type, id) {
        const endpoint = type.toLowerCase();
        try {
            await fetch(`${API_URL}/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': SessionManager.getToken()
                }
            });
        } catch (err) {
            console.error('Delete item error:', err);
        }
    },

    async login(email, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.token) {
            SessionManager.setToken(data.token, data.role, data.email);
            return true;
        }
        return false;
    },

    async register(name, email, password, role = 'user') {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (data.token) {
            SessionManager.setToken(data.token, data.role || role, data.email || email);
            return true;
        }
        return false;
    },

    devLogin() {
        console.warn("Dev mode enabled. Refreshing...");
        SessionManager.setToken('dev-token', 'admin');
        location.reload();
    },

    async placeOrder(orderData) {
        return this.addItem('ORDERS', orderData);
    }
};

const DB_KEYS = {
    PRODUCTS: 'PRODUCTS',
    VIDEOS: 'VIDEOS',
    REVIEWS: 'REVIEWS',
    BANNERS: 'BANNERS',
    ORDERS: 'ORDERS',
    USERS: 'USERS',
    SALES: 'SALES',
    CATEGORIES: 'CATEGORIES',
    SETTINGS: 'SETTINGS'
};
