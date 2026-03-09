const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/categories
router.get('/', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(categories || []);
    } catch (err) {
        console.error('GET categories error:', err.message);
        res.json([]);
    }
});

// @route   POST api/categories
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { data: category, error } = await supabase
            .from('categories')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        res.json(category);
    } catch (err) {
        console.error('POST category error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT api/categories/:id
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { data: category, error } = await supabase
            .from('categories')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/categories/:id
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
