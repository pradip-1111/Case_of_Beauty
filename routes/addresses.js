const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// @route   GET api/addresses
router.get('/', auth, async (req, res) => {
    try {
        const { data: addresses, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(addresses || []);
    } catch (err) {
        console.error('GET addresses error:', err.message);
        res.json([]);
    }
});

// @route   POST api/addresses
router.post('/', auth, async (req, res) => {
    try {
        const { full_name, phone, address_line, city, state, pincode } = req.body;
        const { data: address, error } = await supabase
            .from('addresses')
            .insert([{ user_id: req.user.id, full_name, phone, address_line, city, state, pincode }])
            .select()
            .single();

        if (error) throw error;
        res.json(address);
    } catch (err) {
        console.error('POST address error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT api/addresses/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { full_name, phone, address_line, city, state, pincode } = req.body;
        const { data: address, error } = await supabase
            .from('addresses')
            .update({ full_name, phone, address_line, city, state, pincode })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json(address);
    } catch (err) {
        console.error('PUT address error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/addresses/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ msg: 'Address removed' });
    } catch (err) {
        console.error('DELETE address error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
