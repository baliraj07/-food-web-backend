const Address = require('../models/Address');
const User = require('../models/User');

exports.createAddress = async (req, res) => {
  try {
    const { name, phone, house, area, city, state, pincode } = req.body;
    const userId = req.user.userId;

    // Check if user exists (optional)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = new Address({
      userId,
      name,
      phone,
      house,
      area,
      city,
      state,
      pincode
    });

    await address.save();
    await address.populate('userId', 'name email');

    res.status(201).json({
      message: 'Address created successfully',
      address
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addresses = await Address.find({ userId }).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

