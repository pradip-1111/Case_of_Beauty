const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Use memory storage — we pipe the buffer to Supabase Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

// @route   POST /api/upload
// @desc    Upload a file to Supabase Storage and return the public URL
// @access  Admin only
router.post('/', [auth, admin], upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided.' });
        }

        const file = req.file;
        const timestamp = Date.now();
        // Sanitize original name and build a unique path
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `uploads/${timestamp}_${safeName}`;

        // Upload file buffer to Supabase Storage bucket "images"
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        // Get the public URL
        const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        res.json({ url: urlData.publicUrl });
    } catch (err) {
        console.error('Upload error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
