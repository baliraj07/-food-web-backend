const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  deliveryCharge: {
    type: Number,
    default: 50
  },
  payment: {
    method: {
      type: String,
      enum: ['COD', 'online'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    transactionId: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

