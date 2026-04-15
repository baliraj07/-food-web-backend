const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['starter', 'main', 'dessert', 'beverage'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('FoodItem', foodItemSchema);

