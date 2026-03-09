const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/sales
router.get('/', async (req, res) => {
    try {
        const { data: sales, error } = await supabase
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(sales);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// @route   POST api/sales
router.post('/', [auth, admin], async (req, res) => {
    try {
        // Normalize: always store end date as "enddate" (lowercase — Postgres column name)
        const body = { ...req.body };
        if (body.endDate) {
            body.enddate = body.endDate;
            delete body.endDate;
        }

        const { data: sale, error } = await supabase
            .from('sales')
            .insert([body])
            .select()
            .single();

        if (error) throw error;
        res.json(sale);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/sales/:id
// @route   PUT api/sales/:id
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { data: sale, error } = await supabase
            .from('sales')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(sale);
    } catch (err) {
        console.error('PUT sale error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/sales/:id
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Sale removed' });
    } catch (err) {
        console.error('DELETE sale error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
