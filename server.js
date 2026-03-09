const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity in this project (adjust if needed)
}));
app.use(express.json());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Log Supabase init
console.log('Supabase initialized as backend data store.');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/settings', require('./routes/settings'));

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[Error] ${req.method} ${req.url}:`, err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
