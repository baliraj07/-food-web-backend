const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

// Get all reviews for restaurant
exports.getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create review (only logged-in users)
exports.createReview = async (req, res) => {
  try {
    const { rating, comment, foodItem } = req.body;
    const restaurantId = req.params.restaurantId;

    // Check if user already reviewed this restaurant
    const existingReview = await Review.findOne({
      userId: req.user.userId,
      restaurantId
    });
    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this restaurant' });
    }

    const review = new Review({
      userId: req.user.userId,
      restaurantId,
      foodItem,
      rating,
      comment
    });
    await review.save();

    // Update restaurant avg rating
    const reviews = await Review.find({ restaurantId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, { rating: Math.round(avgRating * 10) / 10 });

    await review.populate('userId', 'name');
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update own review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    // Update avg rating
    const reviews = await Review.find({ restaurantId: review.restaurantId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Restaurant.findByIdAndUpdate(review.restaurantId, { rating: Math.round(avgRating * 10) / 10 });

    await review.populate('userId', 'name');
    res.json({ message: 'Review updated', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete own review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update avg rating
    const reviews = await Review.find({ restaurantId: review.restaurantId });
    const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Restaurant.findByIdAndUpdate(review.restaurantId, { rating: Math.round(avgRating * 10) / 10 });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

