const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/address', require('./routes/addressRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/payments', require('./routes/payments'));

// MongoDB connection (ONLY ONCE)
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,  // wait 30 seconds instead of 10
  socketTimeoutMS: 45000,
});
  app.get('/api/test', (req, res) => {
  res.send('API working');
});
// Test route
app.get('/', (req, res) => {
  res.send('Food Ordering API Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("RESTAURANTS ROUTE LOADED");  