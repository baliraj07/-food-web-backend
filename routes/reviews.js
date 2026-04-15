const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// GET /api/reviews/:restaurantId - Get reviews for restaurant (auth optional, but populate user)
router.get('/:restaurantId', reviewController.getRestaurantReviews);

// POST /api/reviews/:restaurantId - Create review (auth required)
router.post('/:restaurantId', auth, reviewController.createReview);

// PUT /api/reviews/:id - Update own review
router.put('/:id', auth, reviewController.updateReview);

// DELETE /api/reviews/:id - Delete own review
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;

