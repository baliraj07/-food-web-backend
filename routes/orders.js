const express = require('express');
const { createOrder, getUserOrders, reorderOrder } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createOrder);
router.get('/user', auth, getUserOrders);
router.post('/:id/reorder', auth, reorderOrder);

module.exports = router;
