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

const DEFAULT_FALLBACK_IMG = 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=800&auto=format&fit=crop&q=80';

const FALLBACK_CATEGORIES = [
    { id: 'cat-1', title: 'Skincare', image: 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=800&auto=format&fit=crop&q=80' },
    { id: 'cat-2', title: 'Haircare', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&auto=format&fit=crop&q=80' },
    { id: 'cat-3', title: 'Body Care', image: 'https://images.unsplash.com/photo-1556228722-d1191e3266ec?w=800&auto=format&fit=crop&q=80' },
    { id: 'cat-4', title: 'Lip & Eye Care', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80' }
];

const FALLBACK_PRODUCTS = [
    {
        id: 'p-1',
        name: 'Golden Botanical Elixir Face Oil',
        description: 'Pure cold-pressed botanical oils infused with 24K gold flakes for intense nourishment and youthful glow.',
        price: 1499,
        discount_price: 1299,
        tag: 'BESTSELLER',
        is_new_launch: false,
        stock: 45,
        is_featured: true,
        rating: 4.9,
        reviews_count: 124,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-2',
        name: 'Organic Neem & Tea Tree Cleansing Gel',
        description: 'Gentle clarifying facial cleanser infused with fresh neem extract and tea tree oil to purify pores.',
        price: 699,
        discount_price: 599,
        tag: 'ORGANIC',
        is_new_launch: false,
        stock: 60,
        is_featured: true,
        rating: 4.8,
        reviews_count: 88,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-3',
        name: 'Rose & Aloe Revitalizing Face Mist',
        description: 'Pure Steam-distilled Kannauj Rose water enriched with organic aloe vera for instant hydration.',
        price: 799,
        discount_price: 649,
        tag: 'HYDRATING',
        is_new_launch: true,
        stock: 80,
        is_featured: true,
        rating: 4.9,
        reviews_count: 210,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-4',
        name: 'Kumkumadi Radiant Glow Night Serum',
        description: 'Ancient Ayurvedic formula with Kashmiri Saffron and 16 precious herbs for overnight skin brightness.',
        price: 2199,
        discount_price: 1899,
        tag: 'LUXURY',
        is_new_launch: false,
        stock: 30,
        is_featured: true,
        rating: 5.0,
        reviews_count: 340,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-5',
        name: 'Saffron & Sandalwood Youth Repair Cream',
        description: 'Deeply moisturizing night repair cream that firms skin texture and minimizes fine lines.',
        price: 1899,
        discount_price: 1599,
        tag: 'ANTI-AGING',
        is_new_launch: false,
        stock: 50,
        is_featured: false,
        rating: 4.9,
        reviews_count: 175,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-6',
        name: 'Green Tea & Hyaluronic Clarifying Serum',
        description: 'Lightweight oil-free hydrating serum that balances sebum production and restores moisture.',
        price: 1299,
        discount_price: 1099,
        tag: 'NEW',
        is_new_launch: true,
        stock: 40,
        is_featured: false,
        rating: 4.7,
        reviews_count: 95,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-7',
        name: 'Radiant Botanical Sunscreen Gel SPF 50',
        description: 'Non-greasy broad spectrum sun defense enriched with Centella and Green Tea extracts.',
        price: 999,
        discount_price: 849,
        tag: 'SUN DEFENSE',
        is_new_launch: true,
        stock: 80,
        is_featured: true,
        rating: 4.9,
        reviews_count: 270,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1567928257065-c14669877d84?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-8',
        name: 'Botanical Detox Clarifying Clay Mask',
        description: 'French Green Clay and Activated Charcoal mask that draws out toxins and refines pores.',
        price: 1149,
        discount_price: 949,
        tag: 'PURIFYING',
        is_new_launch: false,
        stock: 45,
        is_featured: false,
        rating: 4.8,
        reviews_count: 145,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80'
    },

    {
        id: 'p-9',
        name: 'Brahmi & Bhringraj Nourishing Hair Oil',
        description: 'Traditional slow-cooked herbal hair elixir that stimulates scalp circulation and stops hair fall.',
        price: 899,
        discount_price: 749,
        tag: 'HERBAL',
        is_new_launch: false,
        stock: 70,
        is_featured: true,
        rating: 4.9,
        reviews_count: 280,
        category: 'Haircare',
        image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-10',
        name: 'Hibiscus & Coconut Intense Shampoo',
        description: 'Sulfate-free creamy botanical cleanser that restores silkiness and bounce to dry damaged hair.',
        price: 799,
        discount_price: 699,
        tag: 'SULFATE-FREE',
        is_new_launch: false,
        stock: 65,
        is_featured: true,
        rating: 4.8,
        reviews_count: 190,
        category: 'Haircare',
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-11',
        name: 'Argan & Onion Scalp Revitalizing Mask',
        description: 'Deep conditioning spa mask enriched with Moroccan Argan oil and Red Onion extract.',
        price: 1099,
        discount_price: 899,
        tag: 'REPAIR',
        is_new_launch: true,
        stock: 35,
        is_featured: false,
        rating: 4.8,
        reviews_count: 115,
        category: 'Haircare',
        image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-12',
        name: 'Amla & Vitamin E Shine Hair Serum',
        description: 'Lightweight anti-frizz serum that seals split ends and gives hair luminous high-gloss shine.',
        price: 649,
        discount_price: 549,
        tag: 'SMOOTHING',
        is_new_launch: false,
        stock: 55,
        is_featured: false,
        rating: 4.7,
        reviews_count: 82,
        category: 'Haircare',
        image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&auto=format&fit=crop&q=80'
    },

    {
        id: 'p-13',
        name: 'Velvet Jasmine & Shea Body Butter',
        description: 'Rich whip of raw Shea Butter and Night-Blooming Jasmine oil for 48-hour velvety soft hydration.',
        price: 1199,
        discount_price: 999,
        tag: 'RICH MOISTURE',
        is_new_launch: false,
        stock: 45,
        is_featured: true,
        rating: 4.9,
        reviews_count: 230,
        category: 'Body Care',
        image: 'https://images.unsplash.com/photo-1556228722-d1191e3266ec?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-14',
        name: 'Coffee Bean & Cocoa Body Scrub',
        description: 'Freshly ground Arabica coffee and natural sugar crystals scrub to polish skin and target cellulite.',
        price: 849,
        discount_price: 699,
        tag: 'DETOX',
        is_new_launch: false,
        stock: 50,
        is_featured: true,
        rating: 4.9,
        reviews_count: 160,
        category: 'Body Care',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-15',
        name: 'Wild Rose & Almond Body Lotion',
        description: 'Silky quick-absorbing body lotion infused with cold-pressed almond oil and wild rose essence.',
        price: 749,
        discount_price: 629,
        tag: 'DAILY CARE',
        is_new_launch: false,
        stock: 75,
        is_featured: false,
        rating: 4.8,
        reviews_count: 140,
        category: 'Body Care',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-16',
        name: 'Eucalyptus & Lemongrass Body Wash',
        description: 'Energizing aromatherapeutic body wash that revives senses and leaves skin fresh and supple.',
        price: 599,
        discount_price: 499,
        tag: 'SPA FRESH',
        is_new_launch: false,
        stock: 85,
        is_featured: false,
        rating: 4.7,
        reviews_count: 90,
        category: 'Body Care',
        image: 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=800&auto=format&fit=crop&q=80'
    },

    {
        id: 'p-17',
        name: 'Organic Honey & Vanilla Lip Butter',
        description: 'Ultra-soothing treatment balm crafted with raw honey, beeswax, and pure vanilla pod extract.',
        price: 399,
        discount_price: 349,
        tag: 'NOURISHING',
        is_new_launch: false,
        stock: 100,
        is_featured: true,
        rating: 4.9,
        reviews_count: 310,
        category: 'Lip & Eye Care',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-18',
        name: 'Rosehip & Peptide Overnight Eye Cream',
        description: 'Advanced eye treatment that visibly reduces dark circles, puffiness, and crow’s feet overnight.',
        price: 1399,
        discount_price: 1199,
        tag: 'ANTI-DARK CIRCLE',
        is_new_launch: true,
        stock: 40,
        is_featured: true,
        rating: 4.8,
        reviews_count: 120,
        category: 'Lip & Eye Care',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-19',
        name: 'Tinted Beetroot & Cocoa Lip Balm',
        description: 'Natural rosy pink tint infused with beetroot extract and ultra-moisturizing cocoa butter.',
        price: 449,
        discount_price: 379,
        tag: 'NATURAL TINT',
        is_new_launch: false,
        stock: 90,
        is_featured: false,
        rating: 4.8,
        reviews_count: 185,
        category: 'Lip & Eye Care',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80'
    },
    {
        id: 'p-20',
        name: 'Cucumber & Matcha Cooling Eye Gel',
        description: 'Refreshing eye contour gel with cucumber extract and Japanese matcha to de-puff tired eyes.',
        price: 999,
        discount_price: 849,
        tag: 'SOOTHING',
        is_new_launch: true,
        stock: 50,
        is_featured: false,
        rating: 4.9,
        reviews_count: 105,
        category: 'Lip & Eye Care',
        image: 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=800&auto=format&fit=crop&q=80'
    }
];

const DataManager = {
    async getData(type) {
        const endpoint = type.toLowerCase();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const res = await fetch(`${API_URL}/${endpoint}`, {
                headers: { 'x-auth-token': SessionManager.getToken() },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) return data;
            }
        } catch (err) {
            console.warn(`Fetch ${type} API note: using instant data cache.`);
        }

        if (type === 'PRODUCTS') return FALLBACK_PRODUCTS;
        if (type === 'CATEGORIES') return FALLBACK_CATEGORIES;
        if (type === 'SALES') return [{
            title: 'Case of Beauty Botanical Sale',
            discount: 'FLAT 35% OFF',
            endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
            image: 'assets/hero_waterfall.jpg'
        }];
        if (type === 'BANNERS') return [{
            title: 'Case of Beauty Botanical Rituals',
            subtitle: 'Pure Nature, Uncompromised Elegance',
            image: 'assets/hero_waterfall.jpg',
            link: '#shop'
        }];
        return [];
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
