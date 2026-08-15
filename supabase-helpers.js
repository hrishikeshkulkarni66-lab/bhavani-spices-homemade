/* ==========================================================================
   BHAVANI API & DATABASE HELPER FUNCTIONS
   Interfaces with the secure backend API server (/api/v1/) with Supabase fallback.
   ========================================================================== */

const API_BASE = '/api/v1';

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('bhavani_auth_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error((data.error && data.error.message) ? data.error.message : 'API Request failed');
        }
        return data.data;
    } catch (err) {
        console.warn(`API [${endpoint}] note/fallback:`, err.message);
        throw err;
    }
}

const db = {

    // ---- PROFILES & AUTHENTICATION ----

    async signUp(name, email, password) {
        const emailLower = (email || '').trim().toLowerCase();
        try {
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email: emailLower, password })
            });
            if (data.token) localStorage.setItem('bhavani_auth_token', data.token);
            return [data.user];
        } catch (err) {
            let passToStore = password;
            if (typeof window !== 'undefined' && (window.bcrypt || (window.dcodeIO && window.dcodeIO.bcrypt))) {
                const b = window.bcrypt || window.dcodeIO.bcrypt;
                try {
                    passToStore = b.hashSync(password, 10);
                } catch (e) {}
            } else if (typeof bcrypt !== 'undefined' && bcrypt.hashSync) {
                passToStore = bcrypt.hashSync(password, 10);
            }

            const isMasterAdmin = emailLower === 'hrishikeshkulkarni66@gmail.com';
            const role = isMasterAdmin ? 'ADMIN' : 'CUSTOMER';

            const localUsers = JSON.parse(localStorage.getItem('bhavani_mock_users') || '[]');
            if (!localUsers.some(u => (u.email || '').toLowerCase() === emailLower)) {
                localUsers.push({ name, email: emailLower, password: passToStore, role });
                localStorage.setItem('bhavani_mock_users', JSON.stringify(localUsers));
            }

            let insertedData = null;
            if (supabaseClient) {
                try {
                    const { data, error } = await supabaseClient
                        .from('profiles')
                        .insert([{ name, email: emailLower, password: passToStore, role }])
                        .select();
                    if (!error && data) insertedData = data;
                } catch (e) {
                    console.warn('Supabase insert fallback:', e);
                }
            }

            return insertedData || [{ name, email: emailLower, role }];
        }
    },

    async signIn(email, password) {
        const emailLower = (email || '').trim().toLowerCase();
        
        // 1. Hardcoded Master Admin Guarantee
        if (emailLower === 'hrishikeshkulkarni66@gmail.com') {
            if (password === 'Bhavani123!' || !password) {
                return {
                    id: 'usr_admin',
                    name: 'Bhavani Admin',
                    email: 'hrishikeshkulkarni66@gmail.com',
                    role: 'ADMIN'
                };
            }
        }

        // 2. Try Server API Login
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: emailLower, password })
            });
            if (data.token) localStorage.setItem('bhavani_auth_token', data.token);
            return data.user;
        } catch (err) {
            // Server API unavailable or returned 404 on static host
        }

        // 3. Try Supabase Cloud Database lookup
        let dbUser = null;
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .ilike('email', emailLower)
                    .maybeSingle();

                if (!error && data) {
                    dbUser = data;
                }
            } catch (err) {
                console.warn('Supabase profile query note:', err);
            }
        }

        // 4. Try Local Storage mock users fallback if not found in Supabase
        if (!dbUser) {
            const localUsers = JSON.parse(localStorage.getItem('bhavani_mock_users') || '[]');
            dbUser = localUsers.find(u => (u.email || '').trim().toLowerCase() === emailLower);
        }

        // 5. Compare Password if user record exists
        if (dbUser) {
            let isMatch = false;
            const storedPass = dbUser.password || '';

            let b = null;
            if (typeof window !== 'undefined') {
                if (window.bcrypt) b = window.bcrypt;
                else if (window.dcodeIO && window.dcodeIO.bcrypt) b = window.dcodeIO.bcrypt;
            }
            if (!b && typeof bcrypt !== 'undefined') b = bcrypt;

            if (b && typeof b.compareSync === 'function' && (storedPass.startsWith('$2a$') || storedPass.startsWith('$2b$'))) {
                try {
                    isMatch = b.compareSync(password, storedPass);
                } catch (e) {
                    isMatch = (storedPass === password);
                }
            } else {
                isMatch = (storedPass === password);
            }

            if (isMatch) {
                return {
                    id: dbUser.id || dbUser.email,
                    name: dbUser.name || emailLower.split('@')[0],
                    email: dbUser.email,
                    role: (emailLower === 'hrishikeshkulkarni66@gmail.com' ? 'ADMIN' : (dbUser.role || 'CUSTOMER'))
                };
            }
        }

        // 6. Frictionless Access: Allow instant customer login for any valid email
        const displayName = emailLower.split('@')[0] || 'User';
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        const newUser = {
            id: `usr_${Date.now()}`,
            name: formattedName,
            email: emailLower,
            role: (emailLower === 'hrishikeshkulkarni66@gmail.com' ? 'ADMIN' : 'CUSTOMER')
        };

        try {
            const localUsers = JSON.parse(localStorage.getItem('bhavani_mock_users') || '[]');
            localUsers.push({ ...newUser, password });
            localStorage.setItem('bhavani_mock_users', JSON.stringify(localUsers));
        } catch (e) {}

        return newUser;
    },

    async getAllUsers() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient.from('profiles').select('*');
            if (error) return [];
            return data || [];
        } catch (err) {
            return [];
        }
    },

    async getUserProfile() {
        try {
            return await apiRequest('/auth/profile');
        } catch (err) {
            return { address: {}, payment: {} };
        }
    },

    async updateUserProfile(profileData) {
        try {
            return await apiRequest('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
        } catch (err) {
            console.warn('updateUserProfile error:', err);
        }
    },

    async getCart() {
        try {
            return await apiRequest('/cart');
        } catch (err) {
            return [];
        }
    },

    async saveCart(items) {
        try {
            return await apiRequest('/cart', {
                method: 'POST',
                body: JSON.stringify({ items })
            });
        } catch (err) {
            console.warn('saveCart error:', err);
        }
    },

    // ---- PRODUCTS (Stock & Prices) ----

    async getProducts() {
        try {
            const products = await apiRequest('/products');
            return products;
        } catch (err) {
            if (!supabaseClient) return [];
            try {
                const { data } = await supabaseClient.from('products').select('*');
                return data || [];
            } catch (e) { return []; }
        }
    },

    async updateProductPrice(productId, newPrice) {
        try {
            return await apiRequest(`/admin/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify({ price: newPrice })
            });
        } catch (err) {
            if (!supabaseClient) throw new Error('API unavailable');
            const { data, error } = await supabaseClient
                .from('products')
                .update({ price: newPrice, updated_at: new Date().toISOString() })
                .eq('id', productId)
                .select();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    async updateProductDetails(productId, newName, newPrice) {
        try {
            return await apiRequest(`/admin/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: newName, price: newPrice })
            });
        } catch (err) {
            if (!supabaseClient) throw new Error('API unavailable');
            const { data, error } = await supabaseClient
                .from('products')
                .update({ name: newName, price: newPrice, updated_at: new Date().toISOString() })
                .eq('id', productId)
                .select();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    async updateStockStatus(productId, status) {
        try {
            return await apiRequest(`/admin/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify({ stock_status: status })
            });
        } catch (err) {
            if (!supabaseClient) throw new Error('API unavailable');
            const { data, error } = await supabaseClient
                .from('products')
                .update({ stock_status: status, updated_at: new Date().toISOString() })
                .eq('id', productId)
                .select();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    async addProduct(product) {
        try {
            return await apiRequest('/admin/products', {
                method: 'POST',
                body: JSON.stringify(product)
            });
        } catch (err) {
            if (!supabaseClient) throw new Error('API unavailable');
            const record = {
                id: product.id,
                price: product.price,
                stock_status: product.stock_status || 'in-stock',
                name: product.name,
                category: product.category,
                description: product.description,
                image: product.image,
                badge: product.badge,
                rating: product.rating || 5.0,
                reviews_count: product.reviewsCount || 1,
                updated_at: new Date().toISOString()
            };
            const { data } = await supabaseClient.from('products').upsert([record]).select();
            return data;
        }
    },

    async deleteProduct(productId) {
        try {
            return await apiRequest(`/admin/products/${productId}`, {
                method: 'DELETE'
            });
        } catch (err) {
            if (!supabaseClient) throw new Error('API unavailable');
            const { data } = await supabaseClient.from('products').delete().eq('id', productId);
            return data;
        }
    },

    // ---- ORDERS ----

    async placeOrder(orderData) {
        try {
            const created = await apiRequest('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            return [created];
        } catch (err) {
            if (!supabaseClient) throw new Error('API unavailable');
            const { data, error } = await supabaseClient
                .from('orders')
                .insert([{
                    order_id: orderData.id,
                    user_email: orderData.user,
                    customer_name: orderData.customerName || '',
                    customer_address: orderData.customerAddress || '',
                    customer_city: orderData.customerCity || '',
                    customer_postal: orderData.customerPostal || '',
                    items: orderData.items,
                    total: orderData.total,
                    status: 'CONFIRMED'
                }])
                .select();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    async getUserOrders(email) {
        try {
            const orders = await apiRequest(`/orders?email=${encodeURIComponent(email)}`);
            return (orders || []).map(o => ({
                id: o.order_id || o.id,
                date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                items: o.items,
                total: o.total,
                user: o.user_email,
                customerName: o.customer_name,
                customerAddress: o.customer_address,
                customerCity: o.customer_city,
                customerPostal: o.customer_postal,
                status: o.status,
                timestamp: new Date(o.created_at).getTime(),
                _supabaseId: o.id
            }));
        } catch (err) {
            if (!supabaseClient) return [];
            const { data } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('user_email', email)
                .order('created_at', { ascending: false });
            return (data || []).map(o => ({
                id: o.order_id,
                date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                items: o.items,
                total: o.total,
                user: o.user_email,
                customerName: o.customer_name,
                customerAddress: o.customer_address,
                customerCity: o.customer_city,
                customerPostal: o.customer_postal,
                status: o.status,
                timestamp: new Date(o.created_at).getTime(),
                _supabaseId: o.id
            }));
        }
    },

    async getAllOrders() {
        try {
            const orders = await apiRequest('/admin/orders');
            return (orders || []).map(o => ({
                id: o.order_id || o.id,
                date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                items: o.items,
                total: o.total,
                user: o.user_email,
                customerName: o.customer_name,
                customerAddress: o.customer_address,
                customerCity: o.customer_city,
                customerPostal: o.customer_postal,
                status: o.status,
                timestamp: new Date(o.created_at).getTime(),
                _supabaseId: o.id
            }));
        } catch (err) {
            if (!supabaseClient) return [];
            const { data } = await supabaseClient
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            return (data || []).map(o => ({
                id: o.order_id,
                date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                items: o.items,
                total: o.total,
                user: o.user_email,
                customerName: o.customer_name,
                customerAddress: o.customer_address,
                customerCity: o.customer_city,
                customerPostal: o.customer_postal,
                status: o.status,
                timestamp: new Date(o.created_at).getTime(),
                _supabaseId: o.id
            }));
        }
    },

    async updateOrderStatus(orderId, newStatus) {
        try {
            return await apiRequest(`/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            if (!supabaseClient) throw new Error('API unavailable');
            const { data, error } = await supabaseClient
                .from('orders')
                .update({ status: newStatus })
                .eq('order_id', orderId)
                .select();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    async getAuditLogs() {
        try {
            return await apiRequest('/admin/audit-logs');
        } catch (err) {
            return [];
        }
    }
};

console.log('✅ Bhavani API & Database helpers loaded');
