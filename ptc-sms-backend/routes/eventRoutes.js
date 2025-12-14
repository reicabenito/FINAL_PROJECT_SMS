// ptc-sms-backend/routes/eventRoutes.js
const express = require('express');
const { createEvent, updateEvent, deleteEvent, getEvents, registerForEvent , getMyRegistrations } = require('../controllers/eventController');
const { protect, restrictTo } = require('../utils/auth');
const { getAllEvents } = require('../controllers/eventController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const db = require('../db');
const router = express.Router();

// Public/Student routes
router.get('/', getEvents);
router.post('/:id/register', protect, restrictTo(['student']), registerForEvent);

// Admin routes (Protected by Admin role check)
router.post('/', protect, restrictTo(['admin']), createEvent);
router.put('/:id', protect, restrictTo(['admin']), updateEvent);
router.delete('/events/:id', protect, restrictTo(['admin']), deleteEvent);
router.get('/all', protect, restrictTo(['admin']), getAllEvents);
router.get('/my-registrations', protect, restrictTo(['student']), getMyRegistrations);


router.put('/:id/qr', upload.single('qr_image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const base64Image = req.file.buffer.toString('base64');

    await db.execute(
      "UPDATE Events SET qr_image = ? WHERE event_id = ?",
      [base64Image, req.params.id]
    );

    res.json({ message: "QR uploaded successfully!", qr_image: base64Image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload QR image' });
  }
});

router.delete('/:id/qr', async (req, res) => {
  try {
    await db.execute("UPDATE Events SET qr_image = NULL WHERE event_id = ?", [req.params.id]);
    res.json({ message: "QR image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete QR image" });
  }
});

router.get('/:id/qr', async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT qr_image FROM Events WHERE event_id = ?",
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].qr_image) {
      return res.status(404).json({ error: "QR image not found for this event." });
    }

    // Return the Base64 string. The frontend expects an object { qr_image: "BASE64..." }
    res.json({ qr_image: rows[0].qr_image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve QR image.' });
  }
});

router.get('/:id/qr', async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT qr_image FROM Events WHERE event_id = ?",
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].qr_image) {
      return res.status(404).json({ error: "QR image not found for this event." });
    }

    // Return the Base64 string. The frontend expects an object { qr_image: "BASE64..." }
    res.json({ qr_image: rows[0].qr_image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve QR image.' });
  }
});

// ptc-sms-backend/routes/eventRoutes.js

// ... (existing imports)
// ... (existing routes)

// NEW: Dedicated route to fetch the QR code image (Base64)
router.get('/:id/qr', async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT qr_image FROM Events WHERE event_id = ?",
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].qr_image) {
      return res.status(404).json({ error: "QR image not found for this event." });
    }

    // Return the Base64 string. The frontend expects an object { qr_image: "BASE64..." }
    res.json({ qr_image: rows[0].qr_image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve QR image.' });
  }
});

router.put('/:id/qr', upload.single('qr_image'), async (req, res) => {
  // ... (existing PUT logic is fine)
});

// ... (rest of eventRoutes.js)
module.exports = router;