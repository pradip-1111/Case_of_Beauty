const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/users
// @desc    Get all users (Admin only)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/users/:id
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
