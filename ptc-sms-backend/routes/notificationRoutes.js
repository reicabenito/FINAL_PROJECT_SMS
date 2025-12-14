const express = require("express");
const router = express.Router();
const { protect } = require("../utils/auth");
const notificationController = require("../controllers/notificationController");

router.get("/", protect, notificationController.getUserNotifications);
router.put("/mark-read", protect, notificationController.markAllRead);
module.exports = router;
router.put("/:id/mark-read", protect, notificationController.markNotificationRead);
