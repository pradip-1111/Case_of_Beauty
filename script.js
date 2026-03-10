document.addEventListener('DOMContentLoaded', () => {
    checkAuthUI();
    renderAll();
    CartManager.init();
});

async function renderAll() {
    await renderFlashSale();
    await loadTopBar();
    await renderBanners();
    await renderProducts();
    await renderCategories();
    await renderVideos();
    await renderReviews();
    setupNavigation();
}

function setupNavigation() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

const infoContent = {
    about: {
        title: "About Case of Beauty",
        body: "Effective, clean, and most importantly fuss-free, we've got a product for every mood your skin is in – expect potency, expect results, expect an expertly crafted solution! Our mission is to make high-quality skincare accessible and enjoyable for everyone."
    },
    press: {
        title: "Press & Media",
        body: "Coming Soon! We are currently working on our press kit and media resources. For urgent inquiries, please contact us at care@caseofbeauty.com."
    },
    blog: {
        title: "The Beauty Blog",
        body: "Stay tuned! Our beauty experts are crafting the best tips and tricks for your skincare routine. The Beauty Blog will be launching very soon."
    },
    returns: {
        title: "Returns & Refunds Policy",
        body: "We offer a 7-day return policy for unused and unopened products. If you're not satisfied with your purchase, please contact our support team within 7 days of delivery. Refunds are processed within 5-7 business days after the returned item is received and inspected."
    },
    terms: {
        title: "Terms & Conditions",
        body: "By using our website, you agree to comply with our terms of service. All content on this site is the property of Case of Beauty. Prices and availability are subject to change without notice."
    },
    privacy: {
        title: "Privacy Policy",
        body: "Your privacy is important to us. We only collect information necessary to process your orders and improve your shopping experience. We never share your data with third parties without your explicit consent."
    },
    work: {
        title: "Work with Us",
        body: "Join our vibrant team! We're always looking for passionate skin-care enthusiasts. Send your resume and portfolio to careers@caseofbeauty.com."
    }
};

window.showInfoModal = function (type) {
    const content = infoContent[type];
    if (!content) return;

    document.getElementById('info-title').innerText = content.title;
    document.getElementById('info-body').innerHTML = `<p>${content.body}</p>`;
    document.getElementById('info-modal').style.display = 'flex';
};

window.closeInfoModal = function () {
    document.getElementById('info-modal').style.display = 'none';
};

window.filterByCategory = async function (categoryTitle) {
    const products = await DataManager.getData(DB_KEYS.PRODUCTS);
    const grid = document.getElementById('product-grid');
    if (!grid || !products) return;

    // Scroll to shop section
    const shopSection = document.getElementById('shop');
    if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Filter products
    let filtered;
    if (categoryTitle === 'All Categories' || categoryTitle === 'All Ranges' || categoryTitle === 'Shop All') {
        filtered = products;
    } else {
        const query = categoryTitle.toLowerCase();
        filtered = products.filter(p =>
            (p.category && p.category.toLowerCase().includes(query)) ||
            (p.tag && p.tag.toLowerCase().includes(query)) ||
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }

    // Update section title if it's the main shop grid
    const sectionTitle = shopSection ? shopSection.querySelector('.section-title') : null;
    if (sectionTitle) {
        sectionTitle.innerText = categoryTitle === 'All Categories' || categoryTitle === 'Shop All' ? 'Bestsellers' : categoryTitle;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column:1/-1; padding: 4rem; color: #999;">No products found for "${categoryTitle}". Showing everything instead.</p>`;
        setTimeout(() => {
            grid.innerHTML = products.map(p => createProductCard(p)).join('');
            if (sectionTitle) sectionTitle.innerText = 'Bestsellers';
        }, 3000);
    } else {
        grid.innerHTML = filtered.map(p => createProductCard(p)).join('');
    }

    // Close mega menu if open
    const menu = document.getElementById('mega-menu');
    if (menu) menu.classList.remove('active');
};

async function loadTopBar() {
    try {
        const res = await fetch(`${API_URL}/settings/top_bar_message`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.value) {
                const topBar = document.querySelector('.top-bar');
                if (topBar) topBar.textContent = data.value;
            }
        }
    } catch (err) {
        console.error('Failed to load top bar:', err);
    }
}

async function renderFlashSale() {
    console.log("--- Starting Flash Sale Render ---");
    try {
        const sales = await DataManager.getData(DB_KEYS.SALES);
        console.log("Fetched sales from API:", sales);

        if (!Array.isArray(sales)) {
            console.error("Sales data is not valid or empty:", sales);
            return;
        }

        const activeSale = sales.find(s => {
            const dateStr = s.endDate || s.enddate;
            if (!dateStr) return false;
            const saleEnd = new Date(dateStr);
            console.log(`Checking sale: ${s.title}, End Date: ${saleEnd}, Current Time: ${new Date()}`);
            return saleEnd > new Date();
        });

        const banner = document.getElementById('flash-sale-banner');
        if (!banner) {
            console.error("Critical: 'flash-sale-banner' element not found in HTML!");
            return;
        }

        if (activeSale) {
            console.log("Active sale found! Displaying banner:", activeSale);
            document.getElementById('sale-title').innerText = activeSale.title;
            document.getElementById('sale-discount').innerText = activeSale.discount;

            // Apply background image if provided
            if (activeSale.image) {
                banner.style.backgroundImage = `url('${activeSale.image}')`;
                banner.style.backgroundSize = 'cover';
                banner.style.backgroundPosition = 'center';
            } else {
                banner.style.backgroundImage = 'linear-gradient(135deg, #e11d48, #be123c)';
            }

            banner.style.display = 'block';
            startCountdown(activeSale.endDate || activeSale.enddate);
        } else {
            console.log("No active sale found for current time.");
            banner.style.display = 'none';
        }
    } catch (err) {
        console.error("Flash Sale render error:", err);
    }
}

function startCountdown(endDate) {
    const end = new Date(endDate).getTime();

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) {
            clearInterval(timer);
            document.getElementById('flash-sale-banner').style.display = 'none';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }, 1000);
}

async function renderBanners() {
    const banners = await DataManager.getData(DB_KEYS.BANNERS);
    const container = document.getElementById('banner-container');
    if (!container || !banners || banners.length === 0) return;

    container.innerHTML = banners.map((banner, index) => `
        <div class="banner-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${banner.image}')">
            <div class="banner-content">
                <h2 class="banner-title">${banner.title}</h2>
                <a href="${banner.link}" class="cta-btn">SHOP NOW</a>
            </div>
        </div>
    `).join('');

    if (banners.length > 1) {
        startBannerCarousel();
    }
}

let currentSlide = 0;
function startBannerCarousel() {
    setInterval(() => {
        const slides = document.querySelectorAll('.banner-slide');
        if (slides.length === 0) return;

        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000); // 5 seconds interval
}

async function renderCategories() {
    const container = document.getElementById('category-container');
    if (!container) return;
    const categories = await DataManager.getData(DB_KEYS.CATEGORIES);
    if (!categories || categories.length === 0) return;

    container.innerHTML = categories.map(c => `
        <div class="category-item" onclick="filterByCategory('${c.title}')" style="cursor:pointer;">
            <div class="category-img"><img src="${c.image}" alt="${c.title}"></div>
            <span>${c.title}</span>
        </div>
    `).join('');
}

async function renderProducts() {
    const products = await DataManager.getData(DB_KEYS.PRODUCTS);
    const mainGrid = document.getElementById('product-grid');
    const newGrid = document.getElementById('new-launches-grid');

    if (!products) return;

    if (mainGrid) {
        mainGrid.innerHTML = products.map(p => createProductCard(p)).join('');
    }

    if (newGrid) {
        const newLaunches = products.filter(p => p.is_new_launch || p.tag === 'NEW');
        newGrid.innerHTML = newLaunches.map(p => createProductCard(p)).join('');
    }
}

function createProductCard(product) {
    const id = product._id || product.id;
    return `
        <div class="product-card">
            <div class="product-image-container">
                <span class="tag ${product.tag ? product.tag.toLowerCase().replace(' ', '') : 'new'}">${product.tag || 'NEW'}</span>
                <span class="discount-badge">BUY 3 @ 999</span>
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="rating">
                    ${getStars(product.rating || 5)} 
                    <span style="color: #999; font-size: 0.8rem;">(${product.reviews || 0} Reviews)</span>
                </div>
                <div class="product-price" style="margin-top: 10px;">Rs. ${product.price.toFixed(2)}</div>
                <button class="cta-btn" onclick="addToCartFlow(${JSON.stringify({ id: id, name: product.name, price: product.price, image: product.image }).replace(/"/g, '&quot;')})" style="margin-top: 15px; width: 100%; padding: 8px;">ADD TO CART</button>
            </div>
        </div>
    `;
}

// Auth UI Logic
let isLoginMode = true;

function toggleAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function toggleProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        renderProfileInfo();
        modal.style.display = 'flex';
    }
}

function renderProfileInfo() {
    const userRole = SessionManager.getRole();
    const email = localStorage.getItem('cob_user_email') || 'User';
    document.getElementById('profile-name').innerText = email.split('@')[0];
    document.getElementById('profile-email').innerText = email;
    document.getElementById('profile-role-badge').innerText = userRole.toUpperCase();
    document.getElementById('profile-avatar').src = `https://ui-avatars.com/api/?name=${email}&background=FFB7C5&color=fff`;
}

function toggleAuthType() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Create Account';
    document.getElementById('name-group').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('auth-switch-text').innerText = isLoginMode ? 'New here?' : 'Already have an account?';
    document.getElementById('auth-switch-link').innerText = isLoginMode ? 'Create account' : 'Login';
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;

    let success = false;
    if (isLoginMode) {
        success = await DataManager.login(email, pass);
    } else {
        const name = document.getElementById('auth-name').value;
        success = await DataManager.register(name, email, pass);
        if (success) {
            alert('Registration successful! Please login.');
            toggleAuthType();
            return;
        }
    }

    if (success) {
        // Store email for profile display
        localStorage.setItem('cob_user_email', email);
        location.reload();
    } else {
        alert('Authentication failed. Check your credentials.');
    }
}

function checkAuthUI() {
    const adminLink = document.getElementById('admin-link');
    const authBtn = document.getElementById('auth-btn');
    const profileBtn = document.getElementById('profile-btn');
    const addHeroBtn = document.getElementById('add-herb-btn'); // Note: 'add-herb-btn' in HTML

    if (SessionManager.isLoggedIn()) {
        authBtn.style.display = 'none';
        profileBtn.style.display = 'block';

        if (SessionManager.isAdmin()) {
            adminLink.style.display = 'block';
            if (addHeroBtn) addHeroBtn.style.display = 'block';
        }
    } else {
        authBtn.style.display = 'block';
        profileBtn.style.display = 'none';
        adminLink.style.display = 'none';
        if (addHeroBtn) addHeroBtn.style.display = 'none';
    }
}
async function addToCartFlow(product) {
    if (!SessionManager.isLoggedIn()) {
        alert('Please login to add items to cart.');
        toggleAuthModal();
        return;
    }
    // If product passed as string (from attribute), look it up
    if (typeof product === 'string') {
        const products = await DataManager.getData(DB_KEYS.PRODUCTS);
        const p = products.find(pr => (pr._id || pr.id) == product);
        if (!p) { alert('Product not found.'); return; }
        product = { id: p._id || p.id, name: p.name, price: p.price, image: p.image };
    }
    CartManager.addItem(product);
}

// Keep for backwards compat from video BUY NOW buttons
async function placeOrderFlow(productId) {
    await addToCartFlow(productId);
}

function getStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
    if (hasHalf) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    return starsHtml;
}

async function renderVideos() {
    const container = document.getElementById('video-container');
    if (!container) return;
    const videos = await DataManager.getData(DB_KEYS.VIDEOS);
    if (!videos || videos.length === 0) return;

    window.allVideos = videos; // Store for easy access

    container.innerHTML = videos.map((video, index) => `
        <div class="reel-card">
            <div class="reel-video-wrapper" onclick="openVideoPlayer(${index})">
                <video src="${video.videourl || video.video_url || video.videoUrl}" class="reel-video-preview" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>
                <div class="video-play-btn"><i class="fas fa-play"></i></div>
                ${video.product_image ? `<img src="${video.product_image}" class="reel-product-overlay" alt="product">` : ''}
            </div>
            <div class="reel-info">
                <h4 class="reel-title">${video.title}</h4>
                <p class="reel-desc">${video.description || ''}</p>
                <div class="reel-footer">
                    <span class="reel-price">Rs. ${video.price}</span>
                    <button class="reel-buy-btn" onclick="placeOrderFlow('${video.id}')">BUY NOW</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openVideoPlayer(index) {
    const video = window.allVideos[index];
    if (!video) return;

    const modal = document.getElementById('video-modal');
    const player = document.getElementById('main-video-player');

    // Set Video
    player.src = video.videourl || video.video_url || video.videoUrl;

    // Set Product Info
    document.getElementById('modal-product-img').src = video.product_image || '';
    document.getElementById('modal-product-title').innerText = video.title;
    document.getElementById('modal-product-desc').innerText = video.description || '';
    document.getElementById('modal-product-price').innerText = `Rs. ${video.price}`;

    const buyBtn = document.getElementById('modal-buy-btn');
    buyBtn.onclick = () => placeOrderFlow(video.id);

    modal.style.display = 'flex';
}

function closeVideoPlayer() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('main-video-player');
    player.pause();
    player.src = "";
    modal.style.display = 'none';
}

// Hero Upload Logic
function triggerHeroUpload() {
    document.getElementById('hero-upload-input').click();
}

async function handleHeroUpload(input) {
    const file = input.files[0];
    if (!file) return;

    try {
        const btn = document.getElementById('add-herb-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

        const imageUrl = await uploadFile(file);

        const newBanner = {
            title: "New Featured Look",
            image: imageUrl,
            link: "#shop"
        };

        await DataManager.addItem(DB_KEYS.BANNERS, newBanner);
        btn.innerHTML = originalText;
        await renderAll();
        alert('New hero slide added!');
    } catch (err) {
        alert('Failed to upload hero image: ' + err.message);
        console.error(err);
    }
}

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

async function renderReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    const reviews = await DataManager.getData(DB_KEYS.REVIEWS);
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 2rem; color: #999;">No reviews yet. Be the first!</p>';
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-stars">${'<i class="fas fa-star"></i>'.repeat(review.stars)}</div>
            <p class="review-content">"${review.text}"</p>
            <span class="review-user">${review.userName}</span>
            <span class="review-product">on ${review.product}</span>
        </div>
    `).join('');
}
