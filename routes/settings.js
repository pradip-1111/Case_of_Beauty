const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/settings
// @desc    Get all settings
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('GET settings error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/settings/:key
// @desc    Get setting by key
router.get('/:key', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('key', req.params.key)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(`GET setting ${req.params.key} error:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT api/settings/:key
// @desc    Update setting
router.put('/:key', [auth, admin], async (req, res) => {
    try {
        const { value } = req.body;
        console.log(`Updating setting [${req.params.key}] to: ${value}`);

        const { data, error } = await supabase
            .from('settings')
            .update({
                value: String(value),
                updated_at: new Date().toISOString()
            })
            .eq('key', req.params.key)
            .select();

        if (error) {
            console.error('Supabase settings update error:', error);
            return res.status(400).json(error);
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        res.json(data[0]);
    } catch (err) {
        console.error(`CRITICAL: PUT setting ${req.params.key} error:`, err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

module.exports = router;
