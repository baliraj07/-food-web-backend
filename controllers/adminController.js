const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalRestaurants, totalOrders] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments()
    ]);

    res.json({
      totalUsers,
      totalRestaurants,
      totalOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

