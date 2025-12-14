const express = require('express');
const { protect, restrictTo } = require('../utils/auth');
const { getAllUsers } = require('../controllers/adminController');
const { getAllEvents, deleteEvent } = require('../controllers/eventController'); // <-- add deleteEvent

const router = express.Router();

// Protect all admin routes
router.use(protect, restrictTo(['admin']));

// --- Events ---
router.get('/events/all', getAllEvents); // Returns all events (admin view)
router.delete('/events/:id', deleteEvent); // <-- use real deleteEvent function

// --- Users ---
router.get('/users', getAllUsers); // Returns all users

module.exports = router;
