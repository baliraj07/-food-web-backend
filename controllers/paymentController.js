const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Process payment (COD or Stripe mock)
exports.processPayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    const userId = req.user.userId;

    const order = await Order.findById(orderId).populate('userId');
    if (!order || order.userId._id.toString() !== userId) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let transactionId = null;
    let status = 'paid';

    if (method === 'COD') {
      transactionId = `COD-${Date.now()}`;
    } else if (method === 'stripe') {
      // Mock Stripe (production: use stripe.charges.create)
      transactionId = `stripe_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      // Simulate failure 5%
      if (Math.random() < 0.05) {
        status = 'failed';
      }
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const payment = new Payment({
      orderId,
      userId,
      amount: order.totalAmount + order.deliveryCharge,
      method,
      status,
      transactionId
    });
    await payment.save();

    // Update order
    order.payment = {
      method,
      status,
      transactionId
    };
    await order.save();

    res.json({
      message: `Payment ${status} successfully`,
      payment,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment details
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('orderId userId', 'totalAmount status items');
    if (!payment || payment.userId.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

