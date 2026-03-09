const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/videos
router.get('/', async (req, res) => {
    try {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(videos || []);
    } catch (err) {
        console.error('GET videos error:', err.message);
        res.json([]);
    }
});

// @route   POST api/videos
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { data: video, error } = await supabase
            .from('videos')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        res.json(video);
    } catch (err) {
        console.error('POST video error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT api/videos/:id
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { data: video, error } = await supabase
            .from('videos')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(video);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/videos/:id
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Video removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
