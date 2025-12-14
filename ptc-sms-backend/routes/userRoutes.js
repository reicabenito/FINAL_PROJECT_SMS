// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../utils/auth');
const userController = require('../controllers/userController');

// Protected routes for logged-in students
router.get('/profile', protect, userController.getProfile);
router.put('/update-profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

module.exports = router;
