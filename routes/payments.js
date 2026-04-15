const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// POST /api/payments - Process payment
router.post('/', auth, paymentController.processPayment);

// GET /api/payments/:id - Get payment details
router.get('/:id', auth, paymentController.getPayment);

module.exports = router;

