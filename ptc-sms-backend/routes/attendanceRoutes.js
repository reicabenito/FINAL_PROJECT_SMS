// ptc-sms-backend/routes/attendanceRoutes.js
const express = require('express');
const { generateQrToken, checkIn } = require('../controllers/attendanceController');
const { protect, restrictTo } = require('../utils/auth');

const router = express.Router();

// Admin route to generate the temporary token
router.post('/:eventId/token', protect, restrictTo(['admin']), generateQrToken);

// Student route to submit the scanned token
router.post('/checkin', protect, restrictTo(['student']), checkIn);

module.exports = router;