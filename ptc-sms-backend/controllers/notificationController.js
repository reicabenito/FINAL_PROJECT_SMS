const db = require("../db");

// Get notifications for logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [rows] = await db.execute(
      `SELECT * FROM notifications 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Notification fetch error:", err);
    res.status(500).json({ error: "Server error fetching notifications." });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    await db.execute(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [user_id]
    );

    res.json({ message: "All notifications marked as read" });

  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ error: "Server error marking notifications as read." });
  }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(
            "UPDATE notifications SET is_read = 1 WHERE id = ?",
            [id]
        );
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};
