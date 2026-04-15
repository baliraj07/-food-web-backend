const jwt = require('jsonwebtoken');

// ✅ Auth Middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // contains userId & role
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ✅ Admin Middleware
const isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Admin access denied' });
  }
};

// ✅ Restaurant Owner Middleware
const isRestaurantOwner = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'restaurant_owner') {
      return res.status(403).json({ message: 'Restaurant owner access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Restaurant owner access denied' });
  }
};

// ✅ Specific Owner Check (for restaurant/food)
const isOwner = async (req, res, next) => {
  try {
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(req.params.id || req.body.restaurantId);
    if (!restaurant || (restaurant.owner.toString() !== req.user.userId && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not the owner or admin' });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Ownership verification failed' });
  }
};

module.exports = { auth, isAdmin, isRestaurantOwner, isOwner };
