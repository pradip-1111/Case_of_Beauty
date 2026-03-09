const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/products
router.get('/', async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(products || []);
    } catch (err) {
        console.error('GET products error:', err.message);
        res.json([]);
    }
});

// @route   POST api/products
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { name, price, image } = req.body;
        if (!name || !price || !image) {
            return res.status(400).json({ error: 'Name, price, and image are required' });
        }

        const { data: product, error } = await supabase
            .from('products')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        res.json(product);
    } catch (err) {
        console.error('POST product error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT api/products/:id
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(product);
    } catch (err) {
        console.error('PUT product error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/products/:id
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
