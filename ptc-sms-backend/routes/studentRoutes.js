// controllers/studentRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../utils/auth');

const studentController = require('../controllers/studentController');

router.get('/announcements', studentController.getAnnouncements);
router.get('/events', studentController.getEvents);
router.get('/participation', protect, studentController.getParticipation);
router.get('/registered-events', protect, studentController.getRegisteredEvents);

module.exports = router;
