const Restaurant = require('../models/Restaurant');

exports.getAllRestaurants = async (req, res) => {
  try {
    let pipeline = [
      {
        $addFields: {
          avgPrice: { $avg: '$menu.price' }
        }
      },
      {
        $addFields: {
          locationString: { $concat: ['$location.city', ', ', '$location.area'] }
        }
      },
      {
        $project: {
          name: 1,
          image: 1,
          rating: 1,
          cuisine: 1,
          avgPrice: 1,
          locationString: 1
        }
      }
    ];

    // Search
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      pipeline.unshift({
        $match: {
          $or: [
            { name: regex },
            { cuisine: regex }
          ]
        }
      });
    }

    // Min Rating
    if (req.query.minRating) {
      const minRating = parseFloat(req.query.minRating);
      pipeline.push({
        $match: {
          rating: { $gte: minRating }
        }
      });
    }

    // Price Range
    if (req.query.priceRange) {
      const priceRange = req.query.priceRange;
      let priceMatch = {};
      if (priceRange === 'low') {
        priceMatch.avgPrice = { $lte: 300 };
      } else if (priceRange === 'med') {
        priceMatch.avgPrice = { $gte: 300, $lte: 700 };
      } else if (priceRange === 'high') {
        priceMatch.avgPrice = { $gte: 700 };
      }
      if (Object.keys(priceMatch).length) {
        pipeline.push({ $match: priceMatch });
      }
    }

    // Veg filter (has veg items)
    if (req.query.isVeg === 'true') {
      pipeline.push({
        $addFields: {
          hasVeg: {
            $gt: [
              { $size: { $filter: { input: '$menu', cond: '$$this.isVeg' } } },
              0
            ]
          }
        }
      }, {
        $match: { hasVeg: true }
      });
    } else if (req.query.isVeg === 'false') {
      pipeline.push({
        $addFields: {
          hasNonVeg: {
            $gt: [
              { $size: { $filter: { input: '$menu', cond: { $not: '$$this.isVeg' } } } },
              0
            ]
          }
        }
      }, {
        $match: { hasNonVeg: true }
      });
    }

    // Category filter
    if (req.query.category) {
      pipeline.push({
        $addFields: {
          hasCategory: {
            $gt: [
              { $size: { $filter: { input: '$menu', cond: { $eq: ['$$this.category', req.query.category] } } } },
              0
            ]
          }
        }
      }, {
        $match: { hasCategory: true }
      });
    }

    // Sort
    let sortStage = { $sort: { createdAt: -1 } };
    if (req.query.sort === 'rating') {
      sortStage.$sort = { rating: -1 };
    } else if (req.query.sort === 'price-asc') {
      sortStage.$sort = { avgPrice: 1 };
    }
    pipeline.push(sortStage);

    const restaurants = await Restaurant.aggregate(pipeline);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    // Add foodItems
    const FoodItem = require('../models/FoodItem');
    const foods = await FoodItem.find({ restaurantId: req.params.id });
    res.json({ ...restaurant._doc, foods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    res.status(400).json({ 
      message: 'Error creating restaurant', 
      details: error.message 
    });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Optional: Check if user is owner or admin
    if (restaurant.owner.toString() !== req.user.userId && !['admin', 'restaurant_owner'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }

    res.json({
      message: 'Restaurant updated successfully!',
      restaurant
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

