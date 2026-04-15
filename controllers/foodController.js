const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');

// Get foods by restaurant (public)
exports.getRestaurantFoods = async (req, res) => {
  try {
    const foods = await FoodItem.find({ 
      restaurantId: req.params.restaurantId, 
      isAvailable: true 
    }).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create food (restaurant_owner/admin)
exports.createFood = async (req, res) => {
  try {
    const foodData = {
      ...req.body,
      restaurantId: req.params.restaurantId
    };
    const food = new FoodItem(foodData);
    await food.save();
    res.status(201).json({ message: 'Food item added', food });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update food (owner/admin)
exports.updateFood = async (req, res) => {
  try {
    const food = await FoodItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ message: 'Food updated', food });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete food (owner/admin)
exports.deleteFood = async (req, res) => {
  try {
    const food = await FoodItem.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle availability
exports.toggleAvailability = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    food.isAvailable = !food.isAvailable;
    await food.save();
    res.json({ message: 'Availability toggled', food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

