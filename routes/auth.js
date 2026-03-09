const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide name, email and password' });
    }
    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Please provide a valid email' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log(`Registering user: ${email}`);
    try {
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log(`User already exists: ${email}`);
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Inserting user into public.users table...');
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ name, email, password: hashedPassword, role: role || 'user' }])
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error.message);
            throw error;
        }

        console.log('User registered successfully:', newUser.id);
        const payload = { user: { id: newUser.id, role: newUser.role, email: newUser.email } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, email: newUser.email });
        });
    } catch (err) {
        console.error('Registration internal error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    console.log(`Login attempt: ${email}`);
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.warn('Login lookup error (maybe user not found):', error.message);
        }

        if (!user || error) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log('User logged in successfully:', user.id);
        const payload = { user: { id: user.id, role: user.role, email: user.email } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role, email: user.email });
        });
    } catch (err) {
        console.error('Login internal error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
