const express = require('express');
const { getAllRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant } = require('../controllers/restaurantController');

const { auth, isOwner } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.post('/', auth, createRestaurant);
router.put('/:id', auth, isOwner, updateRestaurant);
router.delete('/:id', auth, isOwner, deleteRestaurant);


module.exports = router;
console.log("SERVER STARTED");