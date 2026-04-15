const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  }
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    city: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: true
    }
  },
  cuisine: {
    type: String,
    required: true
  },
  openingTime: {
    type: String,
    required: true
  },
  closingTime: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menu: [menuItemSchema],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
