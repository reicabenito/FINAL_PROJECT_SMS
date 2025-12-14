// ptc-sms-backend/routes/manageuserRoutes.js

const express = require('express');
const router = express.Router();
const manageUserController = require('../controllers/manageUserController'); // notice the exact capitalization

const { protect } = require('../utils/auth'); // if using protected routes

// --- Admin routes ---
router.post('/', manageUserController.createStudent);
router.delete('/:id', manageUserController.deleteUser);
router.put('/:id/reset-password', manageUserController.resetPassword);


module.exports = router;
