const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { auth, isOwner } = require('../middleware/auth');

// GET /api/foods/:restaurantId - Get available foods
router.get('/:restaurantId', foodController.getRestaurantFoods);

// POST /api/foods/:restaurantId - Create food (owner/admin)
router.post('/:restaurantId', auth, isOwner, foodController.createFood);

// PUT /api/foods/:restaurantId/:id - Update food
router.put('/:restaurantId/:id', auth, isOwner, foodController.updateFood);

// DELETE /api/foods/:restaurantId/:id - Delete food
router.delete('/:restaurantId/:id', auth, isOwner, foodController.deleteFood);

// PATCH /api/foods/:id/availability - Toggle availability
router.patch('/:id/availability', auth, isOwner, foodController.toggleAvailability);

module.exports = router;

