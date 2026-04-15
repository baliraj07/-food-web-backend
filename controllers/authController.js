const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'  // Allow admin registration via body (for seeding), default user
    });
    await user.save();

    // Generate JWT with role
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return without password
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userResponse._id, name: userResponse.name, email: userResponse.email, role: userResponse.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT with role
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password');

    res.json({
      message: 'Login successful',
      token,
      user: { id: userResponse._id, name: userResponse.name, email: userResponse.email, role: userResponse.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
