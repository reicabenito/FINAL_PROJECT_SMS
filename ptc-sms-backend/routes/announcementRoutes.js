const express = require('express');
const {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController'); // import deleteAnnouncement

const { protect, restrictTo } = require('../utils/auth');

const router = express.Router();

// CREATE announcement (admin only)
router.post('/', protect, restrictTo(['admin']), createAnnouncement);

// GET all announcements (admin only)
router.get('/', protect, restrictTo(['admin']), getAnnouncements);

// UPDATE announcement (admin only)
router.put('/:id', protect, restrictTo(['admin']), updateAnnouncement);

// DELETE announcement (admin only)
router.delete('/:id', protect, restrictTo(['admin']), deleteAnnouncement);

module.exports = router;
