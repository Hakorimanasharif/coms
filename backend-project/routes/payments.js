const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order', 'productName orderedQuantity totalAmount')
      .populate('customer', 'customerName phoneNumber')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order', 'productName orderedQuantity totalAmount')
      .populate('customer', 'customerName phoneNumber');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { order, customer, paymentAmount, paymentMethod, paymentDate } = req.body;
    const payment = await Payment.create({
      order,
      customer,
      paymentAmount,
      paymentMethod,
      paymentDate: paymentDate || Date.now(),
    });
    await payment.populate([
      { path: 'order', select: 'productName orderedQuantity totalAmount' },
      { path: 'customer', select: 'customerName phoneNumber' },
    ]);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { order, customer, paymentAmount, paymentMethod, paymentDate } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { order, customer, paymentAmount, paymentMethod, paymentDate },
      { new: true, runValidators: true }
    )
      .populate('order', 'productName orderedQuantity totalAmount')
      .populate('customer', 'customerName phoneNumber');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
