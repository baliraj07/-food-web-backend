const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  house: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, 'Pincode must be 6 digits']
  }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);

