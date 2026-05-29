const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'customerName phoneNumber')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'customerName phoneNumber');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { customer, productName, orderedQuantity, unitPrice } = req.body;
    const totalAmount = orderedQuantity * unitPrice;
    const order = await Order.create({
      customer,
      productName,
      orderedQuantity,
      unitPrice,
      totalAmount,
    });
    const populated = await order.populate('customer', 'customerName phoneNumber');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
