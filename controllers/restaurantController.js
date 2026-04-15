const Restaurant = require('../models/Restaurant');

// GET ALL RESTAURANTS
exports.getAllRestaurants = async (req, res) => {
  try {
    let pipeline = [];

    // 🔍 Search filter
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { name: regex },
            { cuisine: regex }
          ]
        }
      });
    }

    // 📊 Add computed fields safely
    pipeline.push({
      $addFields: {
        avgPrice: {
          $ifNull: [{ $avg: '$menu.price' }, 0]
        },
        locationString: {
          $concat: [
            { $ifNull: ['$location.city', ''] },
            ', ',
            { $ifNull: ['$location.area', ''] }
          ]
        }
      }
    });

    // ⭐ Rating filter
    if (req.query.minRating) {
      pipeline.push({
        $match: {
          rating: { $gte: parseFloat(req.query.minRating) }
        }
      });
    }

    const restaurants = await Restaurant.aggregate(pipeline);
    res.json(restaurants);

  } catch (error) {
    console.error("GET RESTAURANTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET RESTAURANT BY ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('reviews', 'rating comment userId')
      .populate({
        path: 'reviews.userId',
        select: 'name'
      });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const FoodItem = require('../models/FoodItem');
    const foods = await FoodItem.find({ restaurantId: req.params.id });

    res.json({ ...restaurant._doc, foods });

  } catch (error) {
    console.error("GET RESTAURANT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE RESTAURANT
exports.createRestaurant = async (req, res) => {
  try {
    const restaurantData = {
      ...req.body,
      owner: req.user.userId
    };

    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();

    res.status(201).json({
      message: 'Restaurant registered successfully!',
      restaurant
    });

  } catch (error) {
    console.error("CREATE RESTAURANT ERROR:", error);
    res.status(400).json({
      message: 'Error creating restaurant',
      details: error.message
    });
  }
};

// UPDATE RESTAURANT (FIXED SECURITY ISSUE)
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // permission check BEFORE update
    if (
      restaurant.owner.toString() !== req.user.userId &&
      !['admin', 'restaurant_owner'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Restaurant updated successfully!',
      restaurant: updated
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE RESTAURANT
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (
      restaurant.owner.toString() !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: 'Restaurant deleted successfully' });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};