const Order = require('../models/Order');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, addressId } = req.body;
    const userId = req.user.userId; // from auth middleware

    if (!addressId) {
      return res.status(400).json({ message: 'Address ID is required' });
    }

    const deliveryCharge = 50;
    const grandTotal = totalAmount + deliveryCharge;

    const order = new Order({
      userId,
      items,
      totalAmount,
      deliveryCharge,
      payment: {
        method: 'COD',
        status: 'pending'
      },
      addressId,
      status: 'pending'
    });

    await order.save();
    await order.populate(['userId', 'addressId'], 'name email phone house area city state pincode');

    res.status(201).json({
      message: 'Order created successfully',
      order,
      grandTotal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).populate('userId', 'name email').populate('addressId', 'house area city state pincode').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'name email').populate('addressId', 'house area city state pincode').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true }
    ).populate('userId', 'name email').populate('addressId', 'house area city state pincode');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reorderOrder = async (req, res) => {
  try {
    const { addressId } = req.body;
    const oldOrder = await Order.findById(req.params.id).populate('addressId');
    if (!oldOrder || oldOrder.userId.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Order not found or not yours' });
    }

    const newOrder = new Order({
      userId: req.user.userId,
      items: oldOrder.items.map(item => ({ ...item.toObject(), _id: undefined })),
      totalAmount: oldOrder.totalAmount,
      deliveryCharge: 50,
      payment: {
        method: 'COD',
        status: 'pending'
      },
      addressId: addressId || oldOrder.addressId,
      status: 'pending'
    });

    await newOrder.save();
    await newOrder.populate('addressId', 'name house area city state pincode');
    
    res.status(201).json({
      message: 'Order reordered successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

