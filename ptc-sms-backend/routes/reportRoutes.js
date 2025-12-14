const express = require('express');
const router = express.Router();

const {
  getAdminStats,
  getAttendanceSummary,
  getEventParticipationReport,
  getEventParticipants
} = require('../controllers/reportController');

const { protect, restrictTo } = require('../utils/auth');

// Admin-only routes
router.get('/stats', protect, restrictTo(['admin']), getAdminStats);
router.get('/attendance-summary', protect, restrictTo(['admin']), getAttendanceSummary);
router.get('/event-participation', protect, restrictTo(['admin']), getEventParticipationReport);
router.get('/event-participants/:eventId', protect, restrictTo(['admin']), getEventParticipants);

module.exports = router;
