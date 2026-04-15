const express = require('express');
const { getProfile } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, getProfile);

module.exports = router;
