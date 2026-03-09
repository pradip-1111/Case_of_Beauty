const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Helper to map DB fields to Frontend camelCase (highly resilient)
const mapOrderToFrontend = (o) => {
    if (!o) return o;
    return {
        id: o.id,
        user_id: o.user_id,
        status: o.status || 'Pending',
        productId: o.product_id || 'N/A',
        productName: o.product_name || 'Product',
        productImage: o.product_image || '',
        price: parseFloat(o.price || 0),
        quantity: parseInt(o.quantity || 1),
        customerEmail: o.customer_email || 'customer@example.com',
        shipping_name: o.shipping_name || '',
        shipping_phone: o.shipping_phone || '',
        shipping_address: o.shipping_address || '',
        shipping_city: o.shipping_city || '',
        shipping_state: o.shipping_state || '',
        shipping_pincode: o.shipping_pincode || '',
        created_at: o.created_at
    };
};

// @route   POST api/orders
router.post('/', auth, async (req, res) => {
    try {
        const orders = Array.isArray(req.body) ? req.body : [req.body];
        const userId = req.user.id;
        const userEmail = req.user.email;

        if (orders.length === 0) {
            return res.status(400).json({ error: 'No items in order' });
        }

        const ordersToInsert = orders.map(item => ({
            user_id: userId,
            product_id: item.productId,
            product_name: item.productName,
            product_image: item.productImage,
            price: item.price,
            quantity: item.quantity || 1,
            customer_email: item.customerEmail || userEmail,
            shipping_name: item.shipping_name,
            shipping_phone: item.shipping_phone,
            shipping_address: item.shipping_address,
            shipping_city: item.shipping_city,
            shipping_state: item.shipping_state,
            shipping_pincode: item.shipping_pincode,
            status: 'Pending'
        }));

        const { data, error } = await supabase
            .from('orders')
            .insert(ordersToInsert)
            .select();

        if (error) throw error;

        // Return the first item if it was a single order, otherwise return the array
        const responseData = data.map(mapOrderToFrontend);
        res.json(Array.isArray(req.body) ? responseData : responseData[0]);
    } catch (err) {
        console.error('POST /api/orders error:', err.message);
        res.status(500).json({ error: 'Failed to place order(s)', details: err.message });
    }
});

// @route   GET api/orders/mine
router.get('/mine', auth, async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json((orders || []).map(mapOrderToFrontend));
    } catch (err) {
        console.error('GET /api/orders/mine error:', err.message);
        res.status(500).json({ error: 'Failed to fetch your orders' });
    }
});

// @route   GET api/orders (admin)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('GET /api/orders: All columns select failed, retrying basic columns...', error.message);
            const retry = await supabase
                .from('orders')
                .select('id, user_id, status, price, created_at')
                .order('created_at', { ascending: false });

            if (retry.error) throw retry.error;
            return res.json((retry.data || []).map(mapOrderToFrontend));
        }

        res.json((orders || []).map(mapOrderToFrontend));
    } catch (err) {
        console.error('GET /api/orders error:', err.message);
        res.status(500).json({ error: 'Failed to fetch all orders' });
    }
});

// @route   PUT api/orders/:id (admin)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const updateData = { ...req.body };
        // NEVER try to update the primary key or user_id in Supabase
        delete updateData.id;
        delete updateData._id;
        delete updateData.user_id;
        delete updateData.created_at;

        const { data: order, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(mapOrderToFrontend(order));
    } catch (err) {
        console.error('PUT /api/orders error:', err.message);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// @route   DELETE api/orders/:id (admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Order removed' });
    } catch (err) {
        console.error('DELETE /api/orders error:', err.message);
        res.status(500).json({ error: 'Failed to remove order' });
    }
});

module.exports = router;
