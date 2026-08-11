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
        try {
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });
            if (data.token) localStorage.setItem('bhavani_auth_token', data.token);
            return [data.user];
        } catch (err) {
            // Direct Supabase fallback if API server is not reached
            const { data, error } = await supabaseClient
                .from('profiles')
                .insert([{ name, email, password }])
                .select();
            if (error) {
                if (error.code === '23505') throw new Error('An account with this email already exists.');
                throw new Error(error.message);
            }
            return data;
        }
    },

    async signIn(email, password) {
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            if (data.token) localStorage.setItem('bhavani_auth_token', data.token);
            return data.user;
        } catch (err) {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .maybeSingle();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    async getAllUsers() {
        try {
            const { data, error } = await supabaseClient.from('profiles').select('*');
            if (error) return [];
            return data || [];
        } catch (err) {
            return [];
        }
    },

    async updateUserProfile(email, newName) {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .update({ name: newName })
                .eq('email', email)
                .select();
            return data;
        } catch (err) {
            console.warn(err);
        }
    },

    // ---- PRODUCTS (Stock & Prices) ----

    async getProducts() {
        try {
            const products = await apiRequest('/products');
            return products;
        } catch (err) {
            const { data } = await supabaseClient.from('products').select('*');
            return data || [];
        }
    },

    async updateProductPrice(productId, newPrice) {
        try {
            return await apiRequest(`/admin/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify({ price: newPrice })
            });
        } catch (err) {
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
