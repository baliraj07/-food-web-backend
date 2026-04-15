const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['COD', 'stripe'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Payment', paymentSchema);

