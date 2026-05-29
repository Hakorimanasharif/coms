const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { customerName, phoneNumber, address } = req.body;
    const customer = await Customer.create({ customerName, phoneNumber, address });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
