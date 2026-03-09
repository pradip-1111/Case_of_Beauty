const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/reviews
router.get('/', async (req, res) => {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(reviews || []);
    } catch (err) {
        console.error('GET reviews error:', err.message);
        res.json([]);
    }
});

// @route   POST api/reviews
router.post('/', async (req, res) => {
    try {
        const { data: review, error } = await supabase
            .from('reviews')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        res.json(review);
    } catch (err) {
        console.error('POST review error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/reviews/:id (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Review removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
