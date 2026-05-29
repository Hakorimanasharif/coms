const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalPayments = await Payment.countDocuments();

    const revenueResult = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate('customer', 'customerName phoneNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ orderDate: { $gte: today } });
    const todayRevenueResult = await Payment.aggregate([
      { $match: { paymentDate: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
    ]);
    const todayRevenue = todayRevenueResult[0]?.total || 0;

    res.json({
      totalCustomers,
      totalOrders,
      totalPayments,
      totalRevenue,
      todayOrders,
      todayRevenue,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/daily-orders', requireAuth, async (req, res) => {
  try {
    const { date: dateStr } = req.query;
    const now = new Date();
    const d = dateStr ? dateStr.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1, now.getDate()];
    const startOfDay = new Date(d[0], d[1] - 1, d[2], 0, 0, 0, 0);
    const endOfDay = new Date(d[0], d[1] - 1, d[2], 23, 59, 59, 999);

    const orders = await Order.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('customer', 'customerName phoneNumber address')
      .sort({ orderDate: -1 });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      date: dateStr || `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`,
      totalOrders: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/payment-status', requireAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order', 'productName orderedQuantity totalAmount')
      .populate('customer', 'customerName phoneNumber')
      .sort({ paymentDate: -1 });

    const report = payments.map((p) => ({
      customerName: p.customer?.customerName || 'N/A',
      productName: p.order?.productName || 'N/A',
      paymentAmount: p.paymentAmount,
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      orderTotal: p.order?.totalAmount || 0,
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
