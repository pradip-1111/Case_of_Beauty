const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/banners
router.get('/', async (req, res) => {
    try {
        const { data: banners, error } = await supabase
            .from('banners')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(banners || []);
    } catch (err) {
        console.error('GET banners error:', err.message);
        res.json([]);
    }
});

// @route   POST api/banners
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { data: banner, error } = await supabase
            .from('banners')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        res.json(banner);
    } catch (err) {
        console.error('POST banner error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT api/banners/:id
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { data: banner, error } = await supabase
            .from('banners')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(banner);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/banners/:id
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Banner removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
