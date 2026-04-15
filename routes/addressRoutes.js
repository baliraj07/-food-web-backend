const express = require('express');
const { createAddress, getUserAddresses } = require('../controllers/addressController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createAddress);
router.get('/user', auth, getUserAddresses);

module.exports = router;

