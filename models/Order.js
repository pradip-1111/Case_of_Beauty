const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    customerEmail: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
