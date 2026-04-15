const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const restaurantController = require('../controllers/restaurantController');

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(isAdmin);

// Stats
router.get('/stats', adminController.getStats);

// Orders - admin only
// router.get('/orders', orderController.getAllOrders);  // to be added
// router.put('/orders/:id/status', orderController.updateOrderStatus);  // to be added
// router.delete('/orders/:id', orderController.deleteOrder);  // to be added

// Restaurants - admin CRUD
// router.post('/restaurants', restaurantController.createRestaurant);
// router.put('/restaurants/:id', restaurantController.updateRestaurant);  // to be added
// router.delete('/restaurants/:id', restaurantController.deleteRestaurant);  // to be added
router.get('/restaurants', restaurantController.getAllRestaurants);

module.exports = router;

