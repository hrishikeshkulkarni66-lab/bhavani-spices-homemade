/* ==========================================================================
   MASALA CRAFT - APPLICATION LOGIC
   ========================================================================== */

// 1. Spice Products Catalog
let PRODUCTS = [
    {
        id: "garam-masala",
        name: "Heritage Garam Masala",
        category: "blends",
        price: 350.00,
        rating: 4.9,
        reviewsCount: 142,
        badge: "Best Seller",
        image: "assets/garam_masala.jpg",
        description: "A warm, intensely aromatic blend of 12 roasted spices including cardamom, cinnamon, and mace. Ground in small batches."
    },
    {
        id: "turmeric-powder",
        name: "Organic Turmeric Powder",
        category: "single",
        price: 250.00,
        rating: 4.8,
        reviewsCount: 98,
        badge: "Pure Origin",
        image: "assets/turmeric_powder.jpg",
        description: "High-curcumin turmeric harvested from the hills of Alleppey. Sun-dried and ground to retain its vibrant gold shade."
    },
    {
        id: "kashmiri-chili",
        name: "Kashmiri Red Chili",
        category: "single",
        price: 290.00,
        rating: 4.9,
        reviewsCount: 215,
        badge: "Aromatic",
        image: "assets/kashmiri_chili.jpg",
        description: "Deep, brilliant crimson red powder that delivers a rich color and a gentle, sweet warmth instead of stinging heat."
    },
    {
        id: "green-cardamom",
        name: "Imperial Green Cardamom",
        category: "single",
        price: 490.00,
        rating: 5.0,
        reviewsCount: 76,
        badge: "Premium",
        image: "assets/green_cardamom.jpg",
        description: "Bold, hand-picked green cardamom pods from the Western Ghats. Packed with sweet, eucalyptus-like fragrance."
    }
];

// 2. State Management
let state = {
    cart: [],
    currentCategory: 'all',
    searchQuery: '',
    isLoginSignUpMode: false
};

// Helper: Get user-specific cart storage key
function getCartKey() {
    const email = localStorage.getItem('bhavani_user_email');
    if (email) return 'bhavani_cart_' + email;
    const loginState = localStorage.getItem('bhavani_user_logged_in');
    if (loginState === 'guest') return 'bhavani_cart_guest';
    return 'bhavani_cart_anonymous';
}

// Load the correct user's cart from server API
async function loadUserCart() {
    try {
        state.cart = await db.getCart() || [];
    } catch (err) {
        state.cart = JSON.parse(localStorage.getItem(getCartKey()) || '[]');
    }
    updateCartUI();
}

// 3. DOM Elements
const dom = {
    header: document.querySelector('.main-header'),
    productGrid: document.getElementById('product-grid'),
    searchInput: document.getElementById('search-input'),
    filterTabs: document.getElementById('filter-tabs'),
    
    // Cart elements
    cartTrigger: document.getElementById('cart-trigger'),
    cartClose: document.getElementById('cart-close'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartItemsContainer: document.getElementById('cart-items'),
    cartBadgeCount: document.getElementById('cart-badge-count'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartTotal: document.getElementById('cart-total'),
    cartFooter: document.getElementById('cart-footer'),
    cartContinueShopping: document.getElementById('cart-continue-shopping'),
    
    // Checkout elements
    checkoutTrigger: document.getElementById('checkout-trigger'),
    checkoutModal: document.getElementById('checkout-modal'),
    modalClose: document.getElementById('modal-close'),
    checkoutForm: document.getElementById('shipping-form'),
    checkoutAmount: document.getElementById('checkout-amount'),
    checkoutSubtotal: document.getElementById('checkout-subtotal'),
    checkoutTotalAmount: document.getElementById('checkout-total-amount'),
    checkoutSummaryList: document.getElementById('checkout-summary-list'),
    checkoutStepForm: document.getElementById('checkout-step-form'),
    checkoutStepSuccess: document.getElementById('checkout-step-success'),
    checkoutLoader: document.getElementById('checkout-loader'),
    successOrderId: document.getElementById('success-order-id'),
    successDeliveryDate: document.getElementById('success-delivery-date'),
    successDoneBtn: document.getElementById('success-done-btn'),
    
    // Newsletter & Toasts
    newsletterForm: document.getElementById('newsletter-form'),
    toastContainer: document.getElementById('toast-container'),

    // Login elements
    loginGateway: document.getElementById('login-gateway'),
    storefrontApp: document.getElementById('storefront-app'),
    loginForm: document.getElementById('login-form'),
    exploreGuestBtn: document.getElementById('explore-guest-btn'),
    passwordToggle: document.getElementById('password-toggle'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    navSignoutBtn: document.getElementById('nav-signout-btn'),
    loginCardTitle: document.getElementById('login-card-title'),
    signupNameGroup: document.getElementById('signup-name-group'),
    signupConfirmGroup: document.getElementById('signup-confirm-group'),
    loginOptionsRow: document.getElementById('login-options-row'),
    loginToggleLink: document.getElementById('toggle-login-mode-link'),
    loginToggleMsg: document.getElementById('login-toggle-msg'),
    loginName: document.getElementById('login-name'),
    loginConfirmPassword: document.getElementById('login-confirm-password'),

    // Sidebar Settings Menu elements
    sidebarTrigger: document.getElementById('sidebar-trigger'),
    sidebarOverlay: document.getElementById('sidebar-menu-overlay'),
    sidebarDrawer: document.getElementById('sidebar-menu-drawer'),
    sidebarClose: document.getElementById('sidebar-menu-close'),
    sidebarSignOutBtn: document.getElementById('sidebar-signout-btn'),
    themeToggleCheckbox: document.getElementById('theme-toggle-checkbox'),

    // Testimonials elements
    testimonialCarousel: document.getElementById('testimonial-carousel'),
    carouselDragOverlay: document.getElementById('carousel-drag-overlay'),
    testimonialCardsWrapper: document.getElementById('testimonial-cards-wrapper'),
    carouselIndicators: document.getElementById('carousel-indicators'),

    // Order Tracker elements
    orderTrackerTrigger: document.getElementById('sidebar-link-orders'),
    orderTrackerDrawer: document.getElementById('order-tracker-drawer'),
    orderTrackerOverlay: document.getElementById('order-tracker-overlay'),
    orderTrackerClose: document.getElementById('order-tracker-close'),
    orderTrackerContainer: document.getElementById('order-tracker-container'),
    orderTrackerShopBtn: document.getElementById('order-tracker-shop-btn'),

    // Chatbot elements
    chatTrigger: document.getElementById('help-desk-trigger'),
    chatWindow: document.getElementById('chat-window'),
    chatClose: document.getElementById('chat-window-close'),
    chatMessages: document.getElementById('chat-messages'),
    chatInputForm: document.getElementById('chat-input-form'),
    chatUserInput: document.getElementById('chat-user-input'),
    chatQuickReplies: document.getElementById('chat-quick-replies'),

    // Admin Dashboard elements
    adminLink: document.getElementById('sidebar-link-admin'),
    adminDrawer: document.getElementById('admin-dashboard-drawer'),
    adminOverlay: document.getElementById('admin-dashboard-overlay'),
    adminClose: document.getElementById('admin-dashboard-close'),
    adminContainer: document.getElementById('admin-dashboard-container'),

    // Customer Profile elements
    profileLink: document.getElementById('sidebar-link-profile'),
    profileDrawer: document.getElementById('profile-drawer'),
    profileOverlay: document.getElementById('profile-overlay'),
    profileClose: document.getElementById('profile-close'),
    profileContainer: document.getElementById('profile-container')
};

/* ==========================================================================
   INITIALIZATION & NAVIGATION EFFECTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    await applyCustomPrices();
    
    // Check if already logged in
    initLoginGateway();

    // Load the correct user's cart on startup
    loadUserCart();

    // Initialize Theme preference
    initThemePreference();

    // Render initial catalog
    renderProducts();
    
    // Sync cart badge and container
    updateCartUI();

    // Initialize Testimonials Stacked Carousel
    initTestimonialCarousel();
    
    // Header scroll background toggle
    window.addEventListener('scroll', () => {
        // Toggle header scroll background only if storefront is visible
        if (window.scrollY > 50 && !dom.storefrontApp.classList.contains('hidden')) {
            dom.header.classList.add('scrolled');
        } else {
            dom.header.classList.remove('scrolled');
        }
    });

    setupEventListeners();
});

/* ==========================================================================
   EVENT LISTENERS Setup
   ========================================================================== */

function setupEventListeners() {
    // Search filtering
    dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderProducts();
    });

    // Category tab filtering
    dom.filterTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;

        // Toggle active class
        dom.filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        state.currentCategory = tab.dataset.category;
        renderProducts();
    });

    // Cart Drawer Toggle
    dom.cartTrigger.addEventListener('click', openCartDrawer);
    dom.cartClose.addEventListener('click', closeCartDrawer);
    dom.cartOverlay.addEventListener('click', closeCartDrawer);
    if(dom.cartContinueShopping) {
        dom.cartContinueShopping.addEventListener('click', (e) => {
            e.preventDefault();
            closeCartDrawer();
        });
    }

    // Checkout Modal Toggle
    dom.checkoutTrigger.addEventListener('click', openCheckoutModal);
    dom.modalClose.addEventListener('click', closeCheckoutModal);
    
    // Prevent closing when clicking outside the checkout modal content (optional, standard overlay click closes it)
    dom.checkoutModal.addEventListener('click', (e) => {
        if (e.target === dom.checkoutModal) {
            closeCheckoutModal();
        }
    });

    // Place Order Form Submission
    dom.checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Success Screen Done Button
    dom.successDoneBtn.addEventListener('click', () => {
        closeCheckoutModal();
        // Clear success screen state back to form
        dom.checkoutStepSuccess.classList.add('hidden');
        dom.checkoutStepForm.classList.remove('hidden');
    });

    // Newsletter Form Submission
    dom.newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = dom.newsletterForm.querySelector('input').value;
        dom.newsletterForm.reset();
        showToast(`Welcome to the Spice Club! We've sent a 15% discount code to ${email}`, 'success');
    });

    // Login Event Listeners
    dom.loginForm.addEventListener('submit', handleLoginSubmit);
    dom.exploreGuestBtn.addEventListener('click', handleGuestLogin);
    dom.passwordToggle.addEventListener('click', togglePasswordVisibility);
    dom.navSignoutBtn.addEventListener('click', handleSignOut);

    // Sidebar Settings Menu Event Listeners
    dom.sidebarTrigger.addEventListener('click', openSidebarMenu);
    dom.sidebarClose.addEventListener('click', closeSidebarMenu);
    dom.sidebarOverlay.addEventListener('click', closeSidebarMenu);
    dom.sidebarSignOutBtn.addEventListener('click', (e) => {
        closeSidebarMenu();
        handleSignOut(e);
    });

    // Sidebar Navigation smooth scroll intercepts
    document.getElementById('sidebar-link-home').addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeSidebarMenu();
    });
    
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        if (link.id !== 'sidebar-link-home') {
            link.addEventListener('click', () => {
                closeSidebarMenu();
            });
        }
    });

    // Theme Switcher Toggle
    dom.themeToggleCheckbox.addEventListener('change', handleThemeToggle);

    // Testimonials Carousel Drag Event Listeners
    if (dom.carouselDragOverlay) {
        dom.carouselDragOverlay.addEventListener('mousedown', handleCarouselDragStart);
        dom.carouselDragOverlay.addEventListener('mousemove', handleCarouselDragMove);
        window.addEventListener('mouseup', handleCarouselDragEnd);

        dom.carouselDragOverlay.addEventListener('touchstart', handleCarouselDragStart, { passive: true });
        dom.carouselDragOverlay.addEventListener('touchmove', handleCarouselDragMove, { passive: true });
        window.addEventListener('touchend', handleCarouselDragEnd);
    }

    // Login / Sign Up Toggle Mode Click Listener
    if (dom.loginToggleLink) {
        dom.loginToggleLink.addEventListener('click', handleLoginModeToggle);
    }

    // Order Tracker Event Listeners
    if (dom.orderTrackerTrigger) {
        dom.orderTrackerTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebarMenu();
            openOrderTrackerDrawer();
        });
        dom.orderTrackerClose.addEventListener('click', closeOrderTrackerDrawer);
        dom.orderTrackerOverlay.addEventListener('click', closeOrderTrackerDrawer);
        if (dom.orderTrackerShopBtn) {
            dom.orderTrackerShopBtn.addEventListener('click', () => {
                closeOrderTrackerDrawer();
            });
        }
    }

    // Enquiry Chatbot Event Listeners
    if (dom.chatTrigger) {
        dom.chatTrigger.addEventListener('click', toggleChatWindow);
        dom.chatClose.addEventListener('click', closeChatWindow);
        dom.chatInputForm.addEventListener('submit', handleChatSubmit);
        
        // Quick reply buttons delegation
        dom.chatQuickReplies.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply-btn')) {
                const query = e.target.dataset.query;
                const text = e.target.innerText;
                triggerChatQuickReply(query, text);
            }
        });
    }

    // Admin Dashboard Event Listeners
    if (dom.adminLink) {
        dom.adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebarMenu();
            openAdminDashboardDrawer();
        });
        dom.adminClose.addEventListener('click', closeAdminDashboardDrawer);
        dom.adminOverlay.addEventListener('click', closeAdminDashboardDrawer);
    }

    // Customer Profile Event Listeners
    if (dom.profileLink) {
        dom.profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebarMenu();
            openProfileDrawer();
        });
        dom.profileClose.addEventListener('click', closeProfileDrawer);
        dom.profileOverlay.addEventListener('click', closeProfileDrawer);
    }

    // Admin Add Product Form Event Listeners
    const addToggleBtn = document.getElementById('admin-add-toggle-btn');
    const addForm = document.getElementById('admin-add-product-form');
    const toggleIcon = document.getElementById('admin-add-toggle-icon');
    const fileInput = document.getElementById('add-prod-file');
    const urlInput = document.getElementById('add-prod-img-url');
    const imgPreview = document.getElementById('add-prod-img-preview');

    if (addToggleBtn && addForm) {
        addToggleBtn.addEventListener('click', () => {
            const isHidden = addForm.classList.contains('hidden');
            addForm.classList.toggle('hidden');
            if (toggleIcon) toggleIcon.textContent = isHidden ? '➖' : '➕';
        });
    }

    if (fileInput && imgPreview) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    imgPreview.innerHTML = `<img src="${evt.target.result}" alt="Preview">`;
                    imgPreview.classList.remove('hidden');
                    imgPreview.dataset.base64 = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (urlInput && imgPreview) {
        urlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) {
                imgPreview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.style.display='none'">`;
                imgPreview.classList.remove('hidden');
                delete imgPreview.dataset.base64;
            } else if (!fileInput || !fileInput.files.length) {
                imgPreview.classList.add('hidden');
            }
        });
    }

    if (addForm) {
        addForm.addEventListener('submit', handleAddProductSubmit);
    }
}

/* ==========================================================================
   PRODUCT CATALOG RENDERING
   ========================================================================== */

function renderProducts() {
    // Filter products list
    const filtered = PRODUCTS.filter(prod => {
        const matchesCategory = state.currentCategory === 'all' || prod.category === state.currentCategory;
        const matchesSearch = prod.name.toLowerCase().includes(state.searchQuery) || 
                              prod.description.toLowerCase().includes(state.searchQuery);
        return matchesCategory && matchesSearch;
    });

    // Reset grid
    dom.productGrid.innerHTML = '';

    if (filtered.length === 0) {
        dom.productGrid.innerHTML = `
            <div class="no-results text-center" style="grid-column: 1 / -1; padding: 40px 0;">
                <p style="color: var(--color-text-muted); font-size: 1.1rem; margin-bottom: 16px;">
                    No spices found matching your search.
                </p>
                <button class="btn btn-secondary btn-sm" onclick="resetFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }

    // Build product elements
    filtered.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const isOutOfStock = prod.stock_status === 'out-of-stock';
        const isLowStock = prod.stock_status === 'low-stock';

        if (isOutOfStock) {
            card.classList.add('out-of-stock-card');
        }
        
        // Stars generation
        let starsHTML = '';
        const fullStars = Math.floor(prod.rating);
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHTML += `<svg class="star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            } else {
                starsHTML += `<svg class="star-icon" style="opacity: 0.2" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            }
        }

        const shareText = encodeURIComponent(`Check out ${prod.name} on Bhavani Homemade Products! Freshly ground, organic, and only ₹${prod.price.toFixed(2)}. Buy it here: ${window.location.origin}/#shop`);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

        let badgeHTML = '';
        if (isOutOfStock) {
            badgeHTML = `<span class="product-badge out-of-stock-badge">OUT OF STOCK</span>`;
        } else if (isLowStock) {
            badgeHTML = `<span class="product-badge low-stock-badge">LOW STOCK</span>`;
        } else if (prod.badge) {
            badgeHTML = `<span class="product-badge">${prod.badge}</span>`;
        }

        let cartActionHTML = '';
        if (isOutOfStock) {
            cartActionHTML = `
                <button class="add-to-cart-btn disabled-btn" disabled title="Item is currently out of stock">
                    Out of Stock
                </button>
            `;
        } else {
            cartActionHTML = `
                <button class="add-to-cart-btn" aria-label="Add ${prod.name} to cart" onclick="addToCart('${prod.id}')">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            `;
        }

        card.innerHTML = `
            <div class="product-img-container">
                ${badgeHTML}
                <img src="${prod.image}" alt="${prod.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <span class="product-category">${prod.category === 'blends' ? 'Signature Blend' : 'Single Origin'}</span>
                    <div class="product-rating">
                        ${starsHTML}
                        <span>(${prod.reviewsCount})</span>
                    </div>
                </div>
                <h3 class="product-name">${prod.name}</h3>
                <p class="product-desc">${prod.description}</p>
                <div class="product-footer">
                    <span class="product-price">₹${prod.price.toFixed(2)}</span>
                    <div class="product-actions">
                        <a href="${whatsappUrl}" target="_blank" class="share-whatsapp-btn" aria-label="Share ${prod.name} on WhatsApp">
                            <svg class="btn-icon" viewBox="0 0 448 512" fill="currentColor">
                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.3 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                            </svg>
                        </a>
                        ${cartActionHTML}
                    </div>
                </div>
            </div>
        `;
        dom.productGrid.appendChild(card);
    });
}

window.resetFilters = () => {
    dom.searchInput.value = '';
    state.searchQuery = '';
    state.currentCategory = 'all';
    
    dom.filterTabs.querySelectorAll('.filter-tab').forEach(t => {
        if(t.dataset.category === 'all') t.classList.add('active');
        else t.classList.remove('active');
    });
    
    renderProducts();
};

/* ==========================================================================
   CART SYSTEM FUNCTIONS
   ========================================================================== */

window.addToCart = (productId) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (product.stock_status === 'out-of-stock') {
        showToast(`Sorry, ${product.name} is currently out of stock!`, "warning");
        return;
    }

    const existing = state.cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${product.name} to your spice basket!`, 'success');
};

function updateCartUI() {
    const totalItemsCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    dom.cartBadgeCount.textContent = totalItemsCount;

    // Build cart items layout
    if (state.cart.length === 0) {
        dom.cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-cart-icon">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Your spice basket is empty.</p>
                <button class="btn btn-secondary btn-sm" onclick="closeCartDrawer()">Browse Collection</button>
            </div>
        `;
        dom.cartFooter.style.display = 'none';
    } else {
        dom.cartItemsContainer.innerHTML = '';
        dom.cartFooter.style.display = 'block';

        let subtotal = 0;

        state.cart.forEach(item => {
            const itemPriceTotal = item.price * item.quantity;
            subtotal += itemPriceTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-img-wrapper">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)" aria-label="Decrease quantity">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            <span class="qty-num">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateItemQty('${item.id}', 1)" aria-label="Increase quantity">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                        <button class="item-remove-btn" onclick="removeCartItem('${item.id}')">Remove</button>
                    </div>
                </div>
            `;
            dom.cartItemsContainer.appendChild(cartItem);
        });

        // Update totals
        dom.cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
        dom.cartTotal.textContent = `₹${subtotal.toFixed(2)}`;
    }
}

window.updateItemQty = (productId, change) => {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        state.cart = state.cart.filter(i => i.id !== productId);
    }

    saveCart();
    updateCartUI();
};

window.removeCartItem = (productId) => {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showToast("Item removed from basket.", "info");
};

async function saveCart() {
    localStorage.setItem(getCartKey(), JSON.stringify(state.cart));
    try {
        await db.saveCart(state.cart);
    } catch (err) {
        console.warn('Server cart sync note:', err);
    }
}

function closeAllDrawers() {
    if (dom.adminDrawer) dom.adminDrawer.classList.remove('active');
    if (dom.adminOverlay) dom.adminOverlay.classList.remove('active');
    if (dom.profileDrawer) dom.profileDrawer.classList.remove('active');
    if (dom.profileOverlay) dom.profileOverlay.classList.remove('active');
    if (dom.orderTrackerDrawer) dom.orderTrackerDrawer.classList.remove('active');
    if (dom.orderTrackerOverlay) dom.orderTrackerOverlay.classList.remove('active');
    if (dom.cartDrawer) dom.cartDrawer.classList.remove('active');
    if (dom.cartOverlay) dom.cartOverlay.classList.remove('active');
    if (dom.sidebarDrawer) dom.sidebarDrawer.classList.remove('active');
    if (dom.sidebarOverlay) dom.sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openCartDrawer() {
    closeAllDrawers();
    dom.cartDrawer.classList.add('active');
    dom.cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeCartDrawer = () => {
    dom.cartDrawer.classList.remove('active');
    dom.cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
};

/* ==========================================================================
   CHECKOUT PROCESS FUNCTIONS
   ========================================================================== */

function openCheckoutModal() {
    // Check if user is logged in as guest
    const userSession = localStorage.getItem('bhavani_user_logged_in');
    if (userSession === 'guest') {
        localStorage.setItem('bhavani_checkout_redirect', 'true');
        showToast("Please sign in or create an account to place your order.", "warning");
        closeCartDrawer();
        
        // Return to login screen
        dom.storefrontApp.classList.remove('visible');
        dom.storefrontApp.classList.add('hidden');
        dom.loginGateway.style.display = 'flex';
        dom.loginGateway.classList.remove('fade-out');
        return;
    }

    if (state.cart.length === 0) {
        showToast("Please add items to your basket before checking out.", "info");
        return;
    }
    
    // Close cart drawer first
    closeCartDrawer();

    // Fill modal details
    let subtotal = state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const amountStr = `₹${subtotal.toFixed(2)}`;

    dom.checkoutAmount.textContent = amountStr;
    dom.checkoutSubtotal.textContent = amountStr;
    dom.checkoutTotalAmount.textContent = amountStr;

    // Render summary list inside modal
    dom.checkoutSummaryList.innerHTML = '';
    state.cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'checkout-summary-item';
        itemRow.innerHTML = `
            <span>${item.name} <strong>x${item.quantity}</strong></span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        `;
        dom.checkoutSummaryList.appendChild(itemRow);
    });

    // Pre-fill full name, email, address, and payment from server profile
    const userEmail = localStorage.getItem('bhavani_user_email');
    if (userEmail) {
        let savedName = '';
        let savedAddress = {};
        let savedPayment = {};

        try {
            const serverProf = await db.getUserProfile();
            if (serverProf) {
                savedName = serverProf.name || '';
                savedAddress = serverProf.address || {};
                savedPayment = serverProf.payment || {};
            }
        } catch (err) {
            console.warn(err);
        }

        let nameToFill = savedName || (userEmail === ADMIN_EMAIL ? "Bhavani Admin" : userEmail.split('@')[0]);
        
        const fullNameInput = document.getElementById('full-name');
        const emailInput = document.getElementById('email-address');
        const addressInput = document.getElementById('shipping-address');
        const cityInput = document.getElementById('city');
        const postalInput = document.getElementById('postal-code');
        const payMethodSelect = document.getElementById('payment-method');

        if (fullNameInput) fullNameInput.value = nameToFill;
        if (emailInput) emailInput.value = userEmail;
        if (addressInput && savedAddress.street) addressInput.value = savedAddress.street;
        if (cityInput && savedAddress.city) cityInput.value = savedAddress.city;
        if (postalInput && savedAddress.postal) postalInput.value = savedAddress.postal;
        if (payMethodSelect && savedPayment.method) payMethodSelect.value = savedPayment.method.toUpperCase();
    }

    // Make modal active
    dom.checkoutModal.classList.add('active');
}

function closeCheckoutModal() {
    dom.checkoutModal.classList.remove('active');
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();

    // Verify none of the cart items are out of stock
    const outOfStockItems = state.cart.filter(item => {
        const prod = PRODUCTS.find(p => p.id === item.id);
        return prod && prod.stock_status === 'out-of-stock';
    });

    if (outOfStockItems.length > 0) {
        showToast(`Cannot place order: ${outOfStockItems.map(i => i.name).join(', ')} is currently out of stock!`, "warning");
        return;
    }

    // Form inputs verification
    if (!dom.checkoutForm.checkValidity()) return;

    // Show loading spinner
    dom.checkoutLoader.classList.remove('hidden');

    // Simulate Payment Gateway call (2.2 seconds delay)
    setTimeout(async () => {
        // Hide loader
        dom.checkoutLoader.classList.add('hidden');

        // Generate dynamic success states
        const randomOrderId = `#BHP-${Math.floor(100000 + Math.random() * 900000)}`;
        const date = new Date();
        date.setDate(date.getDate() + 4);
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const deliveryStr = date.toLocaleDateString('en-US', options);

        dom.successOrderId.textContent = randomOrderId;
        dom.successDeliveryDate.textContent = deliveryStr;

        // Switch panel visibility inside modal
        dom.checkoutStepForm.classList.add('hidden');
        dom.checkoutStepSuccess.classList.remove('hidden');

        // Save order details to backend API & history
        const orderItems = state.cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));
        
        const payMethod = document.getElementById('payment-method') ? document.getElementById('payment-method').value : 'UPI';
        
        const newOrderPayload = {
            user: localStorage.getItem('bhavani_user_email') || 'customer',
            customerName: document.getElementById('full-name').value,
            customerEmail: document.getElementById('email-address').value,
            customerAddress: document.getElementById('shipping-address').value,
            customerCity: document.getElementById('city').value,
            customerPostal: document.getElementById('postal-code').value,
            paymentMethod: payMethod,
            items: orderItems
        };

        let serverOrderId = randomOrderId;

        try {
            const result = await db.placeOrder(newOrderPayload);
            if (result && result.length > 0 && result[0].id) {
                serverOrderId = result[0].id;
                dom.successOrderId.textContent = serverOrderId;
            }
        } catch (err) {
            console.error('Order save error:', err);
        }

        // Reset cart state
        state.cart = [];
        saveCart();
        updateCartUI();
        dom.checkoutForm.reset();
        showToast("Payment processed successfully!", "success");
    }, 2200);
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
    
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close-btn" aria-label="Close Notification">&times;</button>
    `;

    // Add to container
    dom.toastContainer.appendChild(toast);

    // Event listener for manual close
    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.2s forwards';
        setTimeout(() => toast.remove(), 200);
    });

    // Auto removal after 3.5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.2s forwards';
            setTimeout(() => toast.remove(), 200);
        }
    }, 3500);
}

// Add CSS keyframe for sliding out
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes slideOut {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(20px) scale(0.9); }
}
`;
document.head.appendChild(styleSheet);

/* ==========================================================================
   GATEWAY LOGIN FUNCTIONALITY
   ========================================================================== */

function initLoginGateway() {
    const isLoggedIn = localStorage.getItem('bhavani_user_logged_in');
    
    // Toggle Admin Dashboard Link in settings sidebar
    syncAdminLinkVisibility();

    if (isLoggedIn === 'true' || isLoggedIn === 'guest') {
        dom.loginGateway.classList.add('fade-out');
        dom.storefrontApp.classList.remove('hidden');
        setTimeout(() => {
            dom.loginGateway.style.display = 'none';
            dom.storefrontApp.classList.add('visible');
        }, 500);
    } else {
        dom.loginGateway.style.display = 'flex';
        dom.loginGateway.classList.remove('fade-out');
        dom.storefrontApp.classList.add('hidden');
        dom.storefrontApp.classList.remove('visible');
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    if (state.isLoginSignUpMode) {
        // Sign Up Flow
        const name = dom.loginName.value.trim();
        const email = dom.loginEmail.value.trim().toLowerCase();
        const password = dom.loginPassword.value;
        const confirmPassword = dom.loginConfirmPassword.value;
        
        if (!name || !email || !password || !confirmPassword) {
            showValidationError("All fields are required.");
            return;
        }
        
        const validateEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };
        if (!validateEmail(email)) {
            showValidationError("Please enter a valid email address.");
            return;
        }
        
        if (password.length < 6) {
            showValidationError("Password must be at least 6 characters long.");
            return;
        }
        
        if (password !== confirmPassword) {
            showValidationError("Passwords do not match.");
            return;
        }
        
        // Store user in Supabase cloud database
        try {
            await db.signUp(name, email, password);
        } catch (err) {
            showValidationError(err.message);
            return;
        }
        
        showToast("Account created successfully! Please sign in.", "success");
        
        // Auto toggle back to Sign In
        handleLoginModeToggle(e); // will toggle state back to false
        dom.loginEmail.value = email; // pre-fill registered email
        dom.loginPassword.value = '';
        dom.loginName.value = '';
        dom.loginConfirmPassword.value = '';
    } else {
        // Sign In Flow
        const email = dom.loginEmail.value.trim().toLowerCase();
        const password = dom.loginPassword.value;
        
        // Verify credentials against Supabase database
        let isValidUser = false;
        try {
            const user = await db.signIn(email, password);
            isValidUser = !!user;
        } catch (err) {
            console.error('Sign in error:', err);
        }
            
        if (isValidUser) {
            const submitBtn = dom.loginForm.querySelector('.login-submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Show spinner inside button
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>`;
            
            // Simulate login validation delay (1.2 seconds)
            setTimeout(async () => {
                closeAllDrawers();
                localStorage.setItem('bhavani_user_logged_in', 'true');
                localStorage.setItem('bhavani_user_email', email);
                
                // Clear old profile container HTML to avoid showing previous user profile
                if (dom.profileContainer) dom.profileContainer.innerHTML = '';

                // Pre-fetch user name from Supabase to sync profile cache
                try {
                    const users = await db.getAllUsers();
                    const matched = users.find(u => (u.email || '').trim().toLowerCase() === email);
                    if (matched && matched.name) {
                        localStorage.setItem('bhavani_user_name_' + email, matched.name);
                    }
                } catch (err) {
                    console.warn(err);
                }

                showToast("Signed in successfully! Welcome to Bhavani Homemade Products.", "success");
                
                // Load this user's cart
                loadUserCart();
                
                // Sync admin link visibility
                syncAdminLinkVisibility();
                
                // Transition animations
                dom.loginGateway.classList.add('fade-out');
                dom.storefrontApp.classList.remove('hidden');
                                setTimeout(() => {
                    dom.loginGateway.style.display = 'none';
                    dom.storefrontApp.classList.add('visible');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    dom.loginForm.reset();

                    // Check for redirect flag to directly access checkout payment modal
                    if (localStorage.getItem('bhavani_checkout_redirect') === 'true') {
                        localStorage.removeItem('bhavani_checkout_redirect');
                        openCheckoutModal();
                    }
                }, 500);
            }, 1200);
        } else {
            showValidationError("Invalid email or password.");
        }
    }
}

function showValidationError(message) {
    const card = document.querySelector('.login-card');
    card.classList.add('wiggle-error');
    showToast(message, "error");
    
    setTimeout(() => {
        card.classList.remove('wiggle-error');
    }, 400);
}

function handleGuestLogin() {
    closeAllDrawers();
    localStorage.setItem('bhavani_user_logged_in', 'guest');
    localStorage.removeItem('bhavani_user_email');
    syncAdminLinkVisibility();
    if (dom.profileContainer) dom.profileContainer.innerHTML = '';
    showToast("Welcome! Exploring catalog as Guest. Sign in required to place orders.", "success");
    
    // Load guest-specific cart
    loadUserCart();
    
    dom.loginGateway.classList.add('fade-out');
    dom.storefrontApp.classList.remove('hidden');
    
    setTimeout(() => {
        dom.loginGateway.style.display = 'none';
        dom.storefrontApp.classList.add('visible');
    }, 500);
}

function togglePasswordVisibility() {
    const isPassword = dom.loginPassword.type === 'password';
    dom.loginPassword.type = isPassword ? 'text' : 'password';
    
    // Toggle eye icon styling if wanted, or just swap state
    const eyeSvg = dom.passwordToggle.querySelector('.eye-icon');
    if (isPassword) {
        eyeSvg.style.color = 'var(--color-primary)';
    } else {
        eyeSvg.style.color = 'var(--color-text-muted)';
    }
}

function handleSignOut(e) {
    if (e) e.preventDefault();
    
    // Close all open drawers and sidebars immediately
    closeAllDrawers();

    // Clear in-memory cart and profile HTML
    state.cart = [];
    updateCartUI();
    if (dom.profileContainer) dom.profileContainer.innerHTML = '';
    if (dom.adminContainer) dom.adminContainer.innerHTML = '';
    
    localStorage.removeItem('bhavani_user_logged_in');
    localStorage.removeItem('bhavani_user_email');
    syncAdminLinkVisibility();
    showToast("You have been signed out.", "info");
    
    // Transition back to login page
    dom.storefrontApp.classList.remove('visible');
    dom.loginGateway.style.display = 'flex';
    
    setTimeout(() => {
        dom.loginGateway.classList.remove('fade-out');
        dom.storefrontApp.classList.add('hidden');
    }, 100);
}

/* ==========================================================================
   SIDEBAR SETTINGS MENU & THEME TOGGLE FUNCTIONALITY
   ========================================================================== */

function openSidebarMenu() {
    syncAdminLinkVisibility();
    dom.sidebarDrawer.classList.add('active');
    dom.sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scrolling
}

function closeSidebarMenu() {
    dom.sidebarDrawer.classList.remove('active');
    dom.sidebarOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable body scrolling
}

function initThemePreference() {
    const savedTheme = localStorage.getItem('bhavani_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (dom.themeToggleCheckbox) {
            dom.themeToggleCheckbox.checked = true;
        }
    } else {
        document.body.classList.remove('light-theme');
        if (dom.themeToggleCheckbox) {
            dom.themeToggleCheckbox.checked = false;
        }
    }
}

function handleThemeToggle(e) {
    const isLight = e.target.checked;
    if (isLight) {
        document.body.classList.add('light-theme');
        localStorage.setItem('bhavani_theme', 'light');
        showToast("Light sand theme activated.", "success");
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('bhavani_theme', 'dark');
        showToast("Dark saffron theme activated.", "success");
    }
}

/* ==========================================================================
   TESTIMONIALS STACKED CAROUSEL FUNCTIONS
   ========================================================================== */

const TESTIMONIALS = [
    {
        badge: "Heritage",
        quote: "Grandma's recipe lives on! Bhavani's Garam Masala smells exactly like the hand-ground spices from Kerala.",
        name: "Devi Prasad",
        role: "Home Cook, Chennai",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
        bg: "assets/garam_masala.jpg"
    },
    {
        badge: "Master Chef",
        quote: "Unmatched essential oil concentration. The Kashmiri Chili gives a vibrant crimson hue without synthetic colorings.",
        name: "Chef Sanjay",
        role: "Executive Chef, Taj",
        avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&h=150&q=80",
        bg: "assets/kashmiri_chili.jpg"
    },
    {
        badge: "100% Purity",
        quote: "Authentic & Clean. Being organically sourced, I don't have to worry about chemical pesticide contamination.",
        name: "Aarav Mehta",
        role: "Wellness Coach, Mumbai",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
        bg: "assets/turmeric_powder.jpg"
    },
    {
        badge: "Rich Aroma",
        quote: "A pod of Bhavani's Green Cardamom completely elevates my morning chai. Sweeter and stronger than store brands.",
        name: "Priya Sharma",
        role: "Food Blogger, Delhi",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        bg: "assets/green_cardamom.jpg"
    },
    {
        badge: "Quality Fresh",
        quote: "Freshly milled spices make a massive difference. The turmeric powder has this distinct warm earthiness that shines.",
        name: "Meera Nair",
        role: "Home Baker, Kochi",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
        bg: "assets/hero_spices.jpg"
    }
];

let carouselProgress = 0;
let isDraggingCarousel = false;
let startDragX = 0;
let startProgressVal = 0;

function getCarouselConfig(width) {
    if (width < 640) {
        return {
            xMultiplier: 90,
            yMultiplier: 20,
            rotationMultiplier: 8,
            scaleReduction: 0.06,
            sensitivity: 180,
            distanceDivisor: 120,
            velocityDivisor: 500
        };
    }
    return {
        xMultiplier: 170,
        yMultiplier: 40,
        rotationMultiplier: 12,
        scaleReduction: 0.12,
        sensitivity: 250,
        distanceDivisor: 200,
        velocityDivisor: 800
    };
}

function initTestimonialCarousel() {
    renderTestimonialCards();
    updateTestimonialPositions();
    
    // Resize listener to re-render positions on size change
    window.addEventListener('resize', () => {
        updateTestimonialPositions();
    });
}

function renderTestimonialCards() {
    if (!dom.testimonialCardsWrapper) return;
    
    dom.testimonialCardsWrapper.innerHTML = '';
    dom.carouselIndicators.innerHTML = '';
    
    TESTIMONIALS.forEach((t, i) => {
        // Create card element
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.dataset.index = i;
        
        card.innerHTML = `
            <img src="${t.bg}" alt="${t.name}" class="testimonial-bg-img">
            <span class="testimonial-badge">${t.badge}</span>
            <p class="testimonial-quote">${t.quote}</p>
            <div class="testimonial-author">
                <img src="${t.avatar}" alt="${t.name}" class="testimonial-author-avatar">
                <div class="testimonial-author-info">
                    <span class="testimonial-author-name">${t.name}</span>
                    <span class="testimonial-author-role">${t.role}</span>
                </div>
            </div>
        `;
        
        dom.testimonialCardsWrapper.appendChild(card);
        
        // Create indicator dot
        const dot = document.createElement('div');
        dot.className = `indicator-dot ${i === 0 ? 'active' : ''}`;
        dot.dataset.index = i;
        dot.addEventListener('click', () => {
            animateCarouselProgressTo(i);
        });
        dom.carouselIndicators.appendChild(dot);
    });
}

function updateTestimonialPositions() {
    if (!dom.testimonialCardsWrapper) return;
    
    const cards = dom.testimonialCardsWrapper.querySelectorAll('.testimonial-card');
    const total = TESTIMONIALS.length;
    const config = getCarouselConfig(window.innerWidth);
    
    cards.forEach((card, i) => {
        let diff = (i - carouselProgress) % total;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        
        const x = diff * config.xMultiplier;
        const rotate = diff * config.rotationMultiplier;
        const y = Math.abs(diff) * config.yMultiplier;
        const scale = 1 - Math.abs(diff) * config.scaleReduction;
        
        // Opacity mapping
        let opacity = 0;
        if (Math.abs(diff) < 2) {
            opacity = 1 - Math.abs(diff) * 0.45;
        } else if (Math.abs(diff) < 2.5) {
            opacity = (2.5 - Math.abs(diff)) * 2; // smooth fade to 0
        }
        
        const zIndex = Math.round(100 - Math.abs(diff) * 10);
        
        card.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`;
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;
        
        // Toggle visibility to prevent invisible cards blocking clicks or hover events
        if (opacity < 0.05) {
            card.style.visibility = 'hidden';
        } else {
            card.style.visibility = 'visible';
        }
    });
    
    // Update indicator dots active state
    const dots = dom.carouselIndicators.querySelectorAll('.indicator-dot');
    const activeIndex = Math.round(((carouselProgress % total) + total) % total);
    dots.forEach((dot, i) => {
        if (i === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Drag Handlers
let dragStartTime = 0;

function handleCarouselDragStart(e) {
    isDraggingCarousel = true;
    dragStartTime = Date.now();
    startDragX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startProgressVal = carouselProgress;
}

function handleCarouselDragMove(e) {
    if (!isDraggingCarousel) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const dragDistance = clientX - startDragX;
    const config = getCarouselConfig(window.innerWidth);
    
    const delta = -dragDistance / config.sensitivity;
    carouselProgress = startProgressVal + delta;
    updateTestimonialPositions();
}

function handleCarouselDragEnd(e) {
    if (!isDraggingCarousel) return;
    
    isDraggingCarousel = false;
    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
    const dragDistance = clientX - startDragX;
    
    const duration = Date.now() - dragStartTime;
    const velocity = duration > 0 ? (dragDistance / duration) * 1000 : 0; // px/sec
    
    const config = getCarouselConfig(window.innerWidth);
    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;
    
    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-3, Math.min(3, totalShift));
    
    const target = Math.round(startProgressVal) + totalShift;
    animateCarouselProgressTo(target);
}

function animateCarouselProgressTo(target) {
    const start = carouselProgress;
    const change = target - start;
    const duration = 400; // ms
    let startTime = null;
    
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - t, 3);
        carouselProgress = start + change * ease;
        updateTestimonialPositions();
        
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            carouselProgress = target;
            wrapCarouselProgress();
            updateTestimonialPositions();
        }
    }
    requestAnimationFrame(step);
}

function wrapCarouselProgress() {
    const total = TESTIMONIALS.length;
    carouselProgress = ((carouselProgress % total) + total) % total;
}

function handleLoginModeToggle(e) {
    if (e) e.preventDefault();
    state.isLoginSignUpMode = !state.isLoginSignUpMode;
    
    if (state.isLoginSignUpMode) {
        // Switch to Sign Up Mode
        dom.loginCardTitle.innerText = "Create Account";
        dom.loginForm.querySelector('.login-submit-btn span').innerText = "Create Account";
        
        dom.signupNameGroup.classList.remove('hidden');
        dom.signupConfirmGroup.classList.remove('hidden');
        dom.loginOptionsRow.classList.add('hidden');
        
        dom.loginToggleMsg.innerText = "Already have an account? ";
        dom.loginToggleLink.innerText = "Sign in here";
        
        // Mark fields required
        dom.loginName.required = true;
        dom.loginConfirmPassword.required = true;
    } else {
        // Switch to Sign In Mode
        dom.loginCardTitle.innerText = "Sign In";
        dom.loginForm.querySelector('.login-submit-btn span').innerText = "Sign In";
        
        dom.signupNameGroup.classList.add('hidden');
        dom.signupConfirmGroup.classList.add('hidden');
        dom.loginOptionsRow.classList.remove('hidden');
        
        dom.loginToggleMsg.innerText = "Don't have an account? ";
        dom.loginToggleLink.innerText = "Sign up, it's free!";
        
        // Unmark required
        dom.loginName.required = false;
        dom.loginConfirmPassword.required = false;
    }
}

/* ==========================================================================
   ORDER HISTORY & DYNAMIC TRACKER FUNCTIONS
   ========================================================================== */

function openOrderTrackerDrawer() {
    closeAllDrawers();
    dom.orderTrackerDrawer.classList.add('active');
    dom.orderTrackerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderOrdersHistory();
}

function closeOrderTrackerDrawer() {
    dom.orderTrackerDrawer.classList.remove('active');
    dom.orderTrackerOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

async function renderOrdersHistory() {
    if (!dom.orderTrackerContainer) return;

    const currentUser = localStorage.getItem('bhavani_user_email') || 'admin';
    const userOrders = await db.getUserOrders(currentUser);

    if (userOrders.length === 0) {
        dom.orderTrackerContainer.innerHTML = `
            <div class="empty-cart-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-cart-icon" style="color: var(--color-primary);">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
                <p>No orders placed yet. Start cooking with Bhavani Spices today!</p>
                <a href="#shop" class="btn btn-secondary btn-sm" onclick="closeOrderTrackerDrawer()">Browse Spices</a>
            </div>
        `;
        return;
    }

    // Summary stats at top
    const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
    let html = `
        <div class="admin-section-stats" style="margin-bottom: 16px;">
            <div class="admin-stat-card">
                <span class="admin-stat-num">${userOrders.length}</span>
                <span class="admin-stat-label">Total Orders</span>
            </div>
            <div class="admin-stat-card">
                <span class="admin-stat-num">₹${totalSpent.toFixed(0)}</span>
                <span class="admin-stat-label">Total Spent</span>
            </div>
        </div>
    `;

    dom.orderTrackerContainer.innerHTML = html;

    userOrders.forEach(order => {
        // Use the actual status from Supabase (set by admin), NOT time-based
        const status = order.status || 'processing';
        
        let step = 1;
        let statusStr = "⏳ Order Placed & Processing";
        let statusColor = "#f59e0b";
        if (status === 'delivered') {
            step = 4;
            statusStr = "✅ Spices Delivered Safely!";
            statusColor = "#22c55e";
        } else if (status === 'shipped') {
            step = 3;
            statusStr = "🚚 Shipped via SpiceExpress";
            statusColor = "#3b82f6";
        } else if (status === 'milling') {
            step = 2;
            statusStr = "🔄 Milling Spices in Stone Mills";
            statusColor = "#f97316";
        }

        // Detailed items list
        const itemsHTML = order.items.map(it => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.78rem; color: rgba(255,255,255,0.7);">
                <span>${it.name} × ${it.quantity}</span>
                <span>₹${(it.price * it.quantity).toFixed(0)}</span>
            </div>
        `).join('');

        const card = document.createElement('div');
        card.className = 'tracker-order-card';
        card.innerHTML = `
            <div class="tracker-card-header">
                <span class="tracker-order-id">${order.id}</span>
                <span class="tracker-order-date">${order.date}</span>
            </div>
            
            <div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                ${itemsHTML}
            </div>
            
            <div class="tracker-card-items" style="margin-top: 8px;">
                <div class="tracker-card-total">Total: ₹${order.total.toFixed(2)}</div>
            </div>
            
            <div style="font-size: 0.82rem; font-weight: 700; color: ${statusColor}; margin-top: 8px; padding: 6px 10px; background: rgba(255,255,255,0.04); border-radius: 8px;">
                ${statusStr}
            </div>

            <!-- Tracker steps visualization -->
            <div class="tracker-progress-steps">
                <div class="tracker-step-dot ${step >= 1 ? 'active' : ''}">
                    <span class="tracker-step-label">Placed</span>
                </div>
                <div class="tracker-step-dot ${step >= 2 ? 'active' : ''}">
                    <span class="tracker-step-label">Milling</span>
                </div>
                <div class="tracker-step-dot ${step >= 3 ? 'active' : ''}">
                    <span class="tracker-step-label">Shipped</span>
                </div>
                <div class="tracker-step-dot ${step >= 4 ? 'active' : ''}">
                    <span class="tracker-step-label">Delivered</span>
                </div>
            </div>
            
            <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 10px; font-size: 0.75rem;" onclick="reorderItems('${encodeURIComponent(JSON.stringify(order.items))}')">
                🔄 Reorder These Items
            </button>
        `;
        dom.orderTrackerContainer.appendChild(card);
    });
}

// Reorder: Add all items from a previous order back to cart
window.reorderItems = (encodedItems) => {
    try {
        const items = JSON.parse(decodeURIComponent(encodedItems));
        let addedCount = 0;
        let outOfStockCount = 0;

        items.forEach(item => {
            const product = PRODUCTS.find(p => p.name === item.name);
            if (product) {
                if (product.stock_status === 'out-of-stock') {
                    outOfStockCount++;
                } else {
                    for (let i = 0; i < item.quantity; i++) {
                        addToCart(product.id);
                    }
                    addedCount++;
                }
            }
        });

        closeOrderTrackerDrawer();
        openCartDrawer();
        if (outOfStockCount > 0) {
            showToast(`${addedCount} item(s) added to cart. (${outOfStockCount} out-of-stock item skipped)`, "info");
        } else {
            showToast("Previous order items added to your cart! 🛒", "success");
        }
    } catch (err) {
        console.error('Reorder error:', err);
        showToast("Failed to reorder. Please try again.", "error");
    }
};

/* ==========================================================================
   HELP DESK CHATBOT FUNCTIONALITY
   ========================================================================== */

const BOT_REPLIES = {
    'spices-mill': "🌿 Our spices are 100% organic and sustainable! We mill them in low-temperature stone mills — traditional grinding that prevents heat buildup, preserving flavor-essential oils and vibrant colors. Each batch is tested for purity before packaging!",
    'shipping': "📍 We ship pan-India with FREE standard delivery! Your order reaches you in 2-4 business days. Currently we serve 500+ pin codes. Track your package anytime via the sidebar 'Track Orders' section!",
    'refund': "🛡️ We stand behind our quality! While fresh spice products can't be returned, we offer a <strong>100% money-back guarantee</strong> or free replacement if you're not satisfied. Simply reach out within 7 days of delivery.",
    'default': "🌸 Namaste! I'm Bhavani Bot — your spice concierge! 🧡\n\nI can help you with:\n• 🌿 Milling & quality info\n• 📍 Shipping & delivery\n• 🛡️ Refunds & returns\n• 📦 Track your order\n• 💬 Any other questions!\n\nJust type below or tap a quick reply!"
};

function toggleChatWindow() {
    dom.chatWindow.classList.toggle('active');
    
    // Hide notification badge when opened
    const badge = dom.chatTrigger.querySelector('.chat-badge-pulse');
    if (badge) badge.style.display = 'none';
}

function closeChatWindow() {
    dom.chatWindow.classList.remove('active');
}

function triggerChatQuickReply(query, userText) {
    appendChatMessage(userText, 'user');
    showBotTypingIndicator(async () => {
        let reply = BOT_REPLIES[query] || BOT_REPLIES['default'];
        
        // Handle dynamic tracking inside chatbot query
        if (query === 'track-order') {
            reply = await fetchBotTrackingResponse();
        }
        
        appendChatMessage(reply, 'bot');
    });
}

function handleChatSubmit(e) {
    e.preventDefault();
    const userInputText = dom.chatUserInput.value.trim();
    if (!userInputText) return;
    
    appendChatMessage(userInputText, 'user');
    dom.chatUserInput.value = '';
    
    showBotTypingIndicator(async () => {
        const botReply = await getChatbotResponse(userInputText);
        appendChatMessage(botReply, 'bot');
    });
}

function appendChatMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = `<p>${text}</p>`;
    dom.chatMessages.appendChild(msg);
    
    // Smooth scroll message container
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

function showBotTypingIndicator(callback) {
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg bot typing-msg';
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    dom.chatMessages.appendChild(indicator);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    
    setTimeout(() => {
        indicator.remove();
        callback();
    }, 900);
}

async function fetchBotTrackingResponse() {
    const currentUser = localStorage.getItem('bhavani_user_email') || 'admin';
    const userOrders = await db.getUserOrders(currentUser);
    
    if (userOrders.length > 0) {
        userOrders.sort((a, b) => b.timestamp - a.timestamp);
        const latest = userOrders[0];
        const status = latest.status || 'processing';
        
        let statusStr = "⏳ Order Placed & Processing";
        if (status === 'delivered') statusStr = "✅ Spices Delivered Safely!";
        else if (status === 'shipped') statusStr = "🚚 Shipped via SpiceExpress";
        else if (status === 'milling') statusStr = "🔄 Milling Spices in Stone Mills";
        
        return `📦 I found your latest order <strong>${latest.id}</strong> placed on ${latest.date}. Total: ₹${latest.total.toFixed(2)}.<br><br>Status: <strong>${statusStr}</strong><br><br>Open 'Track Orders' inside the Settings Sidebar to view all your orders and reorder!`;
    } else {
        return "🔍 I couldn't find any orders placed under your account yet. Try adding some fresh organic Garam Masala to your cart and complete checkout first!";
    }
}

async function getChatbotResponse(input) {
    const text = input.toLowerCase();
    if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('help')) {
        return BOT_REPLIES['default'];
    }
    if (text.includes('mill') || text.includes('grind') || text.includes('quality') || text.includes('organic') || text.includes('pure') || text.includes('natural')) {
        return BOT_REPLIES['spices-mill'];
    }
    if (text.includes('ship') || text.includes('deliver') || text.includes('location') || text.includes('address') || text.includes('where') || text.includes('pin') || text.includes('courier')) {
        return BOT_REPLIES['shipping'];
    }
    if (text.includes('refund') || text.includes('return') || text.includes('cancel') || text.includes('money back') || text.includes('exchange')) {
        return BOT_REPLIES['refund'];
    }
    if (text.includes('track') || text.includes('order') || text.includes('status') || text.includes('package') || text.includes('dispatch')) {
        return await fetchBotTrackingResponse();
    }
    if (text.includes('price') || text.includes('cost') || text.includes('rate') || text.includes('how much')) {
        const priceList = PRODUCTS.map(p => `• ${p.name}: ₹${p.price.toFixed(0)}`).join('\n');
        return `💰 Here are our current prices:\n\n${priceList}\n\nAll prices include free shipping! Add to cart from our shop section. 🛒`;
    }
    if (text.includes('product') || text.includes('spice') || text.includes('what do you') || text.includes('menu') || text.includes('catalog')) {
        return `🌶️ We offer ${PRODUCTS.length} premium organic spices:\n\n${PRODUCTS.map(p => `• <strong>${p.name}</strong> — ${p.badge}`).join('\n')}\n\nAll ground fresh in traditional stone mills! Browse our shop above. 🧡`;
    }
    if (text.includes('thank') || text.includes('thanks') || text.includes('bye')) {
        return "🙏 Thank you for choosing Bhavani Homemade Products! We appreciate your support. Have a wonderful day filled with flavors! 🌿";
    }
    return `I'd love to help! Could you ask about:\n• 🌿 Spice quality & milling\n• 📍 Shipping details\n• 🛡️ Refund policy\n• 📦 Order tracking\n• 💰 Prices\n\nOr type anything else and I'll do my best! 🧡`;
}

/* ==========================================================================
   ADMIN CONTROL PANEL FUNCTIONS
   ========================================================================== */

const ADMIN_EMAIL = 'hrishikeshkulkarni66@gmail.com';

function checkIsAdmin() {
    const userEmail = (localStorage.getItem('bhavani_user_email') || '').toLowerCase().trim();
    const isLoggedIn = localStorage.getItem('bhavani_user_logged_in');
    return isLoggedIn === 'true' && userEmail === ADMIN_EMAIL;
}

function syncAdminLinkVisibility() {
    if (dom.adminLink) {
        if (checkIsAdmin()) {
            dom.adminLink.classList.remove('hidden');
        } else {
            dom.adminLink.classList.add('hidden');
        }
    }
}

function openAdminDashboardDrawer() {
    if (!checkIsAdmin()) {
        syncAdminLinkVisibility();
        closeAllDrawers();
        showToast("Access Denied: Only Admin (hrishikeshkulkarni66@gmail.com) can access the Admin Panel.", "error");
        return;
    }
    closeAllDrawers();
    dom.adminDrawer.classList.add('active');
    dom.adminOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchAdminTab('orders');
}

function closeAdminDashboardDrawer() {
    dom.adminDrawer.classList.remove('active');
    dom.adminOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

async function switchAdminTab(tabName) {
    // Toggle tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    // Toggle tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `admin-tab-${tabName}`);
    });
    // Render the selected tab
    if (tabName === 'orders') await renderAdminOrders();
    else if (tabName === 'stock') await renderAdminStock();
    else if (tabName === 'customers') await renderAdminCustomers();
}

// Tab button click listener setup
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('admin-tab-btn')) {
        switchAdminTab(e.target.dataset.tab);
    }
});

/* ---- ORDERS TAB ---- */
async function renderAdminOrders() {
    const orders = await db.getAllOrders();

    const statsEl = document.getElementById('admin-orders-stats');
    const listEl = document.getElementById('admin-orders-list');

    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    statsEl.innerHTML = `
        <div class="admin-stat-card">
            <span class="admin-stat-num">${orders.length}</span>
            <span class="admin-stat-label">Total Orders</span>
        </div>
        <div class="admin-stat-card">
            <span class="admin-stat-num">₹${totalRevenue.toFixed(0)}</span>
            <span class="admin-stat-label">Total Revenue</span>
        </div>
        <div class="admin-stat-card">
            <span class="admin-stat-num">${orders.filter(o => !o.status || o.status === 'processing').length}</span>
            <span class="admin-stat-label">Pending</span>
        </div>
    `;

    if (orders.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; opacity:0.6; padding: 30px 0;">No orders placed yet.</p>';
        return;
    }

    listEl.innerHTML = '';
    orders.forEach(order => {
        const itemsSummary = order.items.map(it => `${it.name} x${it.quantity}`).join(', ');
        const elapsed = Date.now() - order.timestamp;
        let autoStatus = 'processing';
        if (order.status) autoStatus = order.status;
        else if (elapsed > 360000) autoStatus = 'delivered';
        else if (elapsed > 180000) autoStatus = 'shipped';
        else if (elapsed > 60000) autoStatus = 'milling';

        const card = document.createElement('div');
        card.className = 'admin-order-card';
        card.innerHTML = `
            <div class="admin-order-header">
                <span class="admin-order-id">${order.id}</span>
                <span class="admin-order-date">${order.date}</span>
            </div>
            <div class="admin-order-body">
                <div class="admin-order-row"><strong>👤 Customer:</strong> ${order.customerName || 'N/A'}</div>
                <div class="admin-order-row"><strong>📧 Email:</strong> ${order.user}</div>
                <div class="admin-order-row"><strong>📍 Address:</strong> ${order.customerAddress || 'N/A'}, ${order.customerCity || ''} ${order.customerPostal || ''}</div>
                <div class="admin-order-row"><strong>🛒 Items:</strong> ${itemsSummary}</div>
                <div class="admin-order-row admin-order-total"><strong>💰 Total:</strong> ₹${order.total.toFixed(2)}</div>
                <div class="admin-order-row" style="margin-top: 10px;">
                    <label style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-gold);">Update Status:</label>
                    <select class="admin-status-select" onchange="updateAdminOrderStatus('${order.id}', this.value)">
                        <option value="processing" ${autoStatus === 'processing' ? 'selected' : ''}>⏳ Processing</option>
                        <option value="milling" ${autoStatus === 'milling' ? 'selected' : ''}>🔄 Milling & Grinding</option>
                        <option value="shipped" ${autoStatus === 'shipped' ? 'selected' : ''}>🚚 Shipped</option>
                        <option value="delivered" ${autoStatus === 'delivered' ? 'selected' : ''}>✅ Delivered</option>
                    </select>
                </div>
            </div>
        `;
        listEl.appendChild(card);
    });
}

window.updateAdminOrderStatus = async (orderId, newStatus) => {
    if (!checkIsAdmin()) {
        showToast("Access Denied: Admin privileges required.", "error");
        return;
    }
    try {
        await db.updateOrderStatus(orderId, newStatus);
        showToast(`Order ${orderId} → ${newStatus.toUpperCase()}`, "success");
        await renderAdminOrders();
    } catch (err) {
        showToast('Failed to update order status.', 'error');
        console.error(err);
    }
};

/* ---- STOCK TAB ---- */
async function renderAdminStock() {
    const statsEl = document.getElementById('admin-stock-stats');
    const listEl = document.getElementById('admin-stock-list');
    
    // Load prices from Supabase cloud database
    const dbProducts = await db.getProducts();
    const customPrices = {};
    dbProducts.forEach(p => {
        customPrices[p.id] = p.price;
        customPrices[p.id + '_status'] = p.stock_status;
    });

    statsEl.innerHTML = `
        <div class="admin-stat-card">
            <span class="admin-stat-num">${PRODUCTS.length}</span>
            <span class="admin-stat-label">Total Products</span>
        </div>
        <div class="admin-stat-card">
            <span class="admin-stat-num">Active</span>
            <span class="admin-stat-label">Store Status</span>
        </div>
    `;

    listEl.innerHTML = '';
    PRODUCTS.forEach(product => {
        const currentPrice = customPrices[product.id] !== undefined ? customPrices[product.id] : product.price;
        const card = document.createElement('div');
        card.className = 'admin-stock-card';
        card.innerHTML = `
            <div class="admin-stock-info">
                <img src="${product.image}" alt="${product.name}" class="admin-stock-img">
                <div>
                    <div class="admin-stock-name">${product.name} ${product.badge ? `<span class="admin-badge">${product.badge}</span>` : ''}</div>
                    <div class="admin-stock-category">${product.category === 'blends' ? 'Signature Blend' : 'Single Spice'} · ⭐ ${product.rating}</div>
                </div>
            </div>
            <div class="admin-stock-controls">
                <label class="admin-price-label">Spice Title & Price (₹)</label>
                <div class="admin-price-row">
                    <input type="text" class="admin-price-input" id="name-${product.id}" value="${product.name}" placeholder="Item Title">
                    <input type="number" class="admin-price-input" id="price-${product.id}" value="${currentPrice}" min="1" step="10" style="max-width: 90px;" placeholder="Price">
                    <button class="admin-save-btn" onclick="saveAdminProductDetails('${product.id}')">Save Details</button>
                </div>
                <div class="admin-stock-status">
                    <label class="admin-price-label">Stock Status</label>
                    <select class="admin-status-select" id="stock-status-${product.id}" onchange="saveStockStatus('${product.id}', this.value)">
                        <option value="in-stock" ${(customPrices[product.id + '_status'] || product.stock_status || 'in-stock') === 'in-stock' ? 'selected' : ''}>✅ In Stock</option>
                        <option value="low-stock" ${(customPrices[product.id + '_status'] || product.stock_status) === 'low-stock' ? 'selected' : ''}>⚠️ Low Stock</option>
                        <option value="out-of-stock" ${(customPrices[product.id + '_status'] || product.stock_status) === 'out-of-stock' ? 'selected' : ''}>❌ Out of Stock</option>
                    </select>
                </div>
                <button class="admin-delete-btn" onclick="deleteAdminProduct('${product.id}')">🗑️ Remove Product</button>
            </div>
        `;
        listEl.appendChild(card);
    });
}

window.saveAdminProductDetails = async (productId) => {
    if (!checkIsAdmin()) {
        showToast("Access Denied: Admin privileges required.", "error");
        return;
    }
    const nameInput = document.getElementById(`name-${productId}`);
    const priceInput = document.getElementById(`price-${productId}`);
    const newName = nameInput ? nameInput.value.trim() : '';
    const newPrice = priceInput ? parseFloat(priceInput.value) : NaN;

    if (!newName) {
        showToast("Please enter a valid product title.", "warning");
        return;
    }
    if (isNaN(newPrice) || newPrice <= 0) {
        showToast("Please enter a valid price.", "warning");
        return;
    }

    try {
        await db.updateProductDetails(productId, newName, newPrice);
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
            product.name = newName;
            product.price = newPrice;
        }

        // Also update local storage if custom added product
        const localAdded = JSON.parse(localStorage.getItem('bhavani_added_products') || '[]');
        const localProd = localAdded.find(p => p.id === productId);
        if (localProd) {
            localProd.name = newName;
            localProd.price = newPrice;
            localStorage.setItem('bhavani_added_products', JSON.stringify(localAdded));
        }

        renderProducts();
        updateCartUI();
        showToast(`Updated details for "${newName}"!`, "success");
    } catch (err) {
        showToast('Failed to update product details.', 'error');
        console.error(err);
    }
};

window.saveAdminPrice = window.saveAdminProductDetails;

window.saveStockStatus = async (productId, status) => {
    if (!checkIsAdmin()) {
        showToast("Access Denied: Admin privileges required.", "error");
        return;
    }
    try {
        await db.updateStockStatus(productId, status);
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) product.stock_status = status;

        // Also update local storage if custom added product
        const localAdded = JSON.parse(localStorage.getItem('bhavani_added_products') || '[]');
        const localProd = localAdded.find(p => p.id === productId);
        if (localProd) {
            localProd.stock_status = status;
            localStorage.setItem('bhavani_added_products', JSON.stringify(localAdded));
        }

        renderProducts();
        showToast(`${product ? product.name : productId} stock status → ${status.toUpperCase()}`, "success");
    } catch (err) {
        showToast('Failed to update stock status.', 'error');
        console.error(err);
    }
};

// Apply saved custom prices and added products on page load
async function applyCustomPrices() {
    try {
        // 1. Load locally saved custom products
        const localAdded = JSON.parse(localStorage.getItem('bhavani_added_products') || '[]');
        localAdded.forEach(p => {
            if (!PRODUCTS.some(existing => existing.id === p.id)) {
                PRODUCTS.push(p);
            }
        });

        // 2. Load from Supabase cloud database
        const dbProducts = await db.getProducts();
        dbProducts.forEach(dbProd => {
            let product = PRODUCTS.find(p => p.id === dbProd.id);
            if (!product && dbProd.name) {
                // Product created in DB with full fields
                product = {
                    id: dbProd.id,
                    name: dbProd.name,
                    category: dbProd.category || 'single',
                    price: parseFloat(dbProd.price),
                    rating: parseFloat(dbProd.rating || 5.0),
                    reviewsCount: parseInt(dbProd.reviews_count || 1),
                    badge: dbProd.badge || 'New Harvest',
                    image: dbProd.image || 'assets/hero_spices.jpg',
                    description: dbProd.description || '',
                    stock_status: dbProd.stock_status || 'in-stock'
                };
                PRODUCTS.push(product);
            } else if (product && dbProd.price) {
                product.price = parseFloat(dbProd.price);
            }
            if (product && dbProd.stock_status) {
                product.stock_status = dbProd.stock_status;
            }
        });
    } catch (err) {
        console.error('Failed to load prices from cloud:', err);
    }
}

// Handle submit of Add New Product form
async function handleAddProductSubmit(e) {
    e.preventDefault();
    if (!checkIsAdmin()) {
        showToast("Access Denied: Admin privileges required.", "error");
        return;
    }

    const name = document.getElementById('add-prod-name').value.trim();
    const category = document.getElementById('add-prod-category').value;
    const price = parseFloat(document.getElementById('add-prod-price').value);
    const badge = document.getElementById('add-prod-badge').value.trim() || 'New Harvest';
    const stockStatus = document.getElementById('add-prod-status').value;
    const description = document.getElementById('add-prod-desc').value.trim();
    
    const imgPreview = document.getElementById('add-prod-img-preview');
    const urlInput = document.getElementById('add-prod-img-url');
    let imageSrc = 'assets/hero_spices.jpg';

    if (imgPreview && imgPreview.dataset.base64) {
        imageSrc = imgPreview.dataset.base64;
    } else if (urlInput && urlInput.value.trim()) {
        imageSrc = urlInput.value.trim();
    }

    if (!name || isNaN(price) || price <= 0 || !description) {
        showToast("Please fill in all required fields.", "warning");
        return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const newProd = {
        id: slug,
        name: name,
        category: category,
        price: price,
        rating: 5.0,
        reviewsCount: 1,
        badge: badge,
        image: imageSrc,
        description: description,
        stock_status: stockStatus
    };

    PRODUCTS.push(newProd);

    // Persist to local storage
    const localAdded = JSON.parse(localStorage.getItem('bhavani_added_products') || '[]');
    localAdded.push(newProd);
    localStorage.setItem('bhavani_added_products', JSON.stringify(localAdded));

    // Try saving to Supabase
    try {
        await db.addProduct(newProd);
    } catch (err) {
        console.warn('Supabase add product error:', err);
    }

    renderProducts();
    await renderAdminStock();

    // Reset form and UI
    e.target.reset();
    if (imgPreview) {
        imgPreview.classList.add('hidden');
        imgPreview.innerHTML = '';
        delete imgPreview.dataset.base64;
    }
    document.getElementById('admin-add-product-form').classList.add('hidden');
    const toggleIcon = document.getElementById('admin-add-toggle-icon');
    if (toggleIcon) toggleIcon.textContent = '➕';

    showToast(`✨ Successfully added "${name}" to storefront!`, "success");
}

window.deleteAdminProduct = async (productId) => {
    if (!checkIsAdmin()) {
        showToast("Access Denied: Admin privileges required.", "error");
        return;
    }
    if (!confirm('Are you sure you want to remove this product from the storefront?')) return;
    try {
        PRODUCTS = PRODUCTS.filter(p => p.id !== productId);
        
        // Update local storage
        const localAdded = JSON.parse(localStorage.getItem('bhavani_added_products') || '[]');
        const updatedLocal = localAdded.filter(p => p.id !== productId);
        localStorage.setItem('bhavani_added_products', JSON.stringify(updatedLocal));

        // Delete from Supabase
        await db.deleteProduct(productId);

        renderProducts();
        await renderAdminStock();
        showToast("Product removed from storefront.", "info");
    } catch (err) {
        console.error('Delete product error:', err);
        showToast("Failed to delete product.", "error");
    }
};

/* ---- CUSTOMERS TAB ---- */
async function renderAdminCustomers() {
    const statsEl = document.getElementById('admin-customers-stats');
    const listEl = document.getElementById('admin-customers-list');
    
    // Fetch users and orders from Supabase cloud
    const cloudUsers = await db.getAllUsers();
    const orders = await db.getAllOrders();
    
    const allUsers = cloudUsers.map(u => ({
        name: u.name || 'Unknown',
        email: u.email,
        isAdmin: u.email === ADMIN_EMAIL
    }));

    statsEl.innerHTML = `
        <div class="admin-stat-card">
            <span class="admin-stat-num">${allUsers.length}</span>
            <span class="admin-stat-label">Total Users</span>
        </div>
        <div class="admin-stat-card">
            <span class="admin-stat-num">${allUsers.filter(u => !u.isAdmin).length}</span>
            <span class="admin-stat-label">Customers</span>
        </div>
    `;

    listEl.innerHTML = '';
    allUsers.forEach(user => {
        const userOrders = orders.filter(o => o.user === user.email);
        const userTotal = userOrders.reduce((acc, o) => acc + o.total, 0);
        
        const card = document.createElement('div');
        card.className = 'admin-customer-card';
        card.innerHTML = `
            <div class="admin-customer-header">
                <div class="admin-customer-avatar">${(user.name || user.email)[0].toUpperCase()}</div>
                <div>
                    <div class="admin-customer-name">${user.name || 'Unknown'}${user.isAdmin ? ' <span class="admin-badge">ADMIN</span>' : ''}</div>
                    <div class="admin-customer-email">${user.email}</div>
                </div>
            </div>
            <div class="admin-customer-stats">
                <div class="admin-customer-stat">
                    <span class="admin-customer-stat-num">${userOrders.length}</span>
                    <span class="admin-customer-stat-label">Orders</span>
                </div>
                <div class="admin-customer-stat">
                    <span class="admin-customer-stat-num">₹${userTotal.toFixed(0)}</span>
                    <span class="admin-customer-stat-label">Spent</span>
                </div>
            </div>
            ${userOrders.length > 0 ? `
                <div class="admin-customer-orders">
                    <strong style="font-size: 0.75rem; color: var(--color-accent-gold);">Recent Orders:</strong>
                    ${userOrders.slice(0, 3).map(o => `
                        <div class="admin-customer-order-row">
                            <span>${o.id}</span>
                            <span>${o.date}</span>
                            <span>₹${o.total.toFixed(0)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="font-size: 0.75rem; opacity: 0.5; margin-top: 8px;">No orders yet</p>'}
        `;
        listEl.appendChild(card);
    });
}

/* ==========================================================================
   CUSTOMER PROFILE DRAWER & MANAGEMENT
   ========================================================================== */

function openProfileDrawer() {
    closeAllDrawers();
    dom.profileDrawer.classList.add('active');
    dom.profileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderProfileDetails();
}

function closeProfileDrawer() {
    dom.profileDrawer.classList.remove('active');
    dom.profileOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

async function renderProfileDetails() {
    if (!dom.profileContainer) return;
    
    const userEmail = (localStorage.getItem('bhavani_user_email') || '').trim().toLowerCase();
    const isLoggedIn = localStorage.getItem('bhavani_user_logged_in');
    
    if (!userEmail || isLoggedIn !== 'true') {
        dom.profileContainer.innerHTML = `
            <div class="empty-cart-message" style="padding: 40px 20px; text-align: center;">
                <p style="color: var(--color-text-muted); font-size: 1rem; margin-bottom: 16px;">
                    Please sign in to view and manage your personal profile details.
                </p>
                <button class="btn btn-secondary btn-sm" onclick="closeProfileDrawer(); handleSignOut(event);">Sign In / Register</button>
            </div>
        `;
        return;
    }

    // Fetch user profile securely from Server API
    let userName = userEmail.split('@')[0];
    let savedAddress = {};
    let savedPayment = {};

    try {
        const serverProf = await db.getUserProfile();
        if (serverProf) {
            userName = serverProf.name || userName;
            savedAddress = serverProf.address || {};
            savedPayment = serverProf.payment || {};
        }
    } catch (err) {
        console.warn('Profile fetch note:', err);
    }

    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const isAdmin = checkIsAdmin();

    dom.profileContainer.innerHTML = `
        <div class="profile-card">
            <div class="profile-header-info">
                <div class="profile-avatar">${initials}</div>
                <div>
                    <div class="profile-user-name">${userName}</div>
                    <div class="profile-user-email">${userEmail}</div>
                    <span class="profile-role-badge">${isAdmin ? '🛡️ Master Admin' : (isLoggedIn === 'true' ? '✨ Verified Member' : '👁️ Guest Visitor')}</span>
                </div>
            </div>
        </div>

        <form id="profile-name-form" class="profile-form-section">
            <h4>👤 Personal Information</h4>
            <div class="form-group">
                <label for="prof-display-name">Full Name</label>
                <input type="text" id="prof-display-name" value="${userName}" required placeholder="Your full name">
            </div>
            <button type="submit" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Save Name</button>
        </form>

        <form id="profile-address-form" class="profile-form-section">
            <h4>📍 Shipping Address</h4>
            <div class="form-group">
                <label for="prof-street">Street Address</label>
                <input type="text" id="prof-street" value="${savedAddress.street || ''}" placeholder="House / Flat No, Street, Area">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="prof-city">City</label>
                    <input type="text" id="prof-city" value="${savedAddress.city || ''}" placeholder="Mumbai">
                </div>
                <div class="form-group">
                    <label for="prof-postal">ZIP / Postal Code</label>
                    <input type="text" id="prof-postal" value="${savedAddress.postal || ''}" placeholder="400001">
                </div>
            </div>
            <button type="submit" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Save Address</button>
        </form>

        <form id="profile-payment-form" class="profile-form-section">
            <h4>💳 Saved Payment Details</h4>
            <div class="form-group">
                <label for="prof-pay-method">Preferred Payment Method</label>
                <select id="prof-pay-method" style="padding: 8px 12px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: #fff;">
                    <option value="upi" ${savedPayment.method === 'upi' ? 'selected' : ''}>📱 UPI (GPay / PhonePe / Paytm)</option>
                    <option value="card" ${savedPayment.method === 'card' ? 'selected' : ''}>💳 Credit / Debit Card</option>
                    <option value="cod" ${savedPayment.method === 'cod' ? 'selected' : ''}>💵 Cash on Delivery</option>
                </select>
            </div>
            <div class="form-group">
                <label for="prof-pay-detail">UPI VPA ID or Card Alias</label>
                <input type="text" id="prof-pay-detail" value="${savedPayment.detail || ''}" placeholder="e.g. name@upi">
            </div>
            <button type="submit" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Save Payment Details</button>
        </form>
    `;

    // Attach form submission handlers to post directly to Server API
    document.getElementById('profile-name-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('prof-display-name').value.trim();
        if (!newName) return;
        try {
            await db.updateUserProfile({ name: newName });
            showToast("Profile name saved to server!", "success");
            renderProfileDetails();
        } catch (err) {
            showToast("Failed to update profile name.", "error");
        }
    });

    document.getElementById('profile-address-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const addressData = {
            street: document.getElementById('prof-street').value.trim(),
            city: document.getElementById('prof-city').value.trim(),
            postal: document.getElementById('prof-postal').value.trim()
        };
        try {
            await db.updateUserProfile({ address: addressData });
            showToast("Shipping address saved to server!", "success");
        } catch (err) {
            showToast("Failed to save shipping address.", "error");
        }
    });

    document.getElementById('profile-payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const paymentData = {
            method: document.getElementById('prof-pay-method').value,
            detail: document.getElementById('prof-pay-detail').value.trim()
        };
        try {
            await db.updateUserProfile({ payment: paymentData });
            showToast("Payment preferences saved to server!", "success");
        } catch (err) {
            showToast("Failed to save payment preferences.", "error");
        }
    });
}
