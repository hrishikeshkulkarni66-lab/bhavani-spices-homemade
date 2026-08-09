/* ==========================================================================
   SUPABASE DATABASE HELPER FUNCTIONS
   All Supabase CRUD operations in one place.
   ========================================================================== */

const db = {

    // ---- PROFILES (Users) ----

    async signUp(name, email, password) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .insert([{ name, email, password }])
            .select();
        if (error) {
            console.error('Supabase signUp error:', error);
            if (error.code === '23505') throw new Error('An account with this email already exists.');
            throw new Error(error.message);
        }
        return data;
    },

    async signIn(email, password) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .maybeSingle();
        if (error) {
            console.error('Supabase signIn error:', error);
            throw new Error(error.message);
        }
        return data; // null if not found, user object if found
    },

    async getAllUsers() {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Supabase getAllUsers error:', error);
            return [];
        }
        return data || [];
    },

    // ---- ORDERS ----

    async placeOrder(orderData) {
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
                status: 'processing'
            }])
            .select();
        if (error) {
            console.error('Supabase placeOrder error:', error);
            throw new Error(error.message);
        }
        return data;
    },

    async getUserOrders(email) {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Supabase getUserOrders error:', error);
            return [];
        }
        // Map to app format
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
    },

    async getAllOrders() {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Supabase getAllOrders error:', error);
            return [];
        }
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
    },

    async updateOrderStatus(orderId, newStatus) {
        const { data, error } = await supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('order_id', orderId)
            .select();
        if (error) {
            console.error('Supabase updateOrderStatus error:', error);
            throw new Error(error.message);
        }
        return data;
    },

    // ---- PRODUCTS (Stock & Prices) ----

    async getProducts() {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*');
        if (error) {
            console.error('Supabase getProducts error:', error);
            return [];
        }
        return data || [];
    },

    async updateProductPrice(productId, newPrice) {
        const { data, error } = await supabaseClient
            .from('products')
            .update({ price: newPrice, updated_at: new Date().toISOString() })
            .eq('id', productId)
            .select();
        if (error) {
            console.error('Supabase updateProductPrice error:', error);
            throw new Error(error.message);
        }
        return data;
    },

    async updateStockStatus(productId, status) {
        const { data, error } = await supabaseClient
            .from('products')
            .update({ stock_status: status, updated_at: new Date().toISOString() })
            .eq('id', productId)
            .select();
        if (error) {
            console.error('Supabase updateStockStatus error:', error);
            throw new Error(error.message);
        }
        return data;
    },

    async addProduct(product) {
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
        const { data, error } = await supabaseClient
            .from('products')
            .upsert([record])
            .select();
        if (error) {
            console.warn('Supabase addProduct note (used local storage fallback):', error.message);
        }
        return data;
    },

    async deleteProduct(productId) {
        const { data, error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);
        if (error) {
            console.warn('Supabase deleteProduct note:', error.message);
        }
        return data;
    }
};

console.log('✅ Supabase helpers loaded');
