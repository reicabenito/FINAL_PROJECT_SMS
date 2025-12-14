// ptc-sms-backend/routes/authRoutes.js
const express = require('express');
const { loginUser, getProfile, forgotPassword, createAdmin } = require('../controllers/authController');
const { protect } = require('../utils/auth');

const router = express.Router();

router.post('/create-admin', createAdmin);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.post('/forgot-password', forgotPassword);

module.exports = router;