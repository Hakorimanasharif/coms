const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card'],
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
