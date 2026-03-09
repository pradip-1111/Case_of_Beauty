const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    tag: { type: String },
    image: { type: String, required: true },
    rating: { type: Number, default: 5 },
    reviews: { type: Number, default: 0 },
    category: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
