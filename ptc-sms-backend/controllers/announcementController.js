// ptc-sms-backend/controllers/announcementController.js
const db = require('../db');

// CREATE announcement

exports.createAnnouncement = async (req, res) => {
  const { title, content, priority = "Normal", date_time } = req.body;

  if (!title || !content || !date_time) {
    return res.status(400).json({ error: "Title, content, and date_time are required." });
  }

  try {
    const formattedDate = new Date(date_time).toISOString().slice(0, 19).replace("T", " ");

    const [result] = await db.execute(
      `INSERT INTO announcements (title, content, priority, date_time)
       VALUES (?, ?, ?, ?)`,
      [title, content, priority, formattedDate]
    );

    const announcementId = result.insertId;

    // 🌟 GET ALL STUDENT USERS
    const [students] = await db.execute(
      "SELECT user_id FROM users WHERE role = 'student'"
    );

    // 🌟 CREATE A NOTIFICATION FOR EACH STUDENT
    for (const s of students) {
      await db.execute(
        `INSERT INTO notifications (user_id, type, message, details)
         VALUES (?, 'info', ?, ?)`,
        [s.user_id, title, content]
      );
    }

    res.status(201).json({
      message: "Announcement created successfully.",
      announcementId,
    });

  } catch (err) {
    console.error("Create announcement error:", err);
    res.status(500).json({ error: "Server error creating announcement." });
  }
};


exports.getAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM Announcements ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch announcement error:", err);
    res.status(500).json({ error: "Server error fetching announcements." });
  }
};

// DELETE announcement
exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM Announcements WHERE announcement_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }
    res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (err) {
    console.error('Delete announcement error:', err);
    res.status(500).json({ error: 'Server error deleting announcement.' });
  }
};

// UPDATE announcement
// UPDATE announcement
exports.updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, date_time } = req.body;

  if (!title || !content || !date_time) {
    return res.status(400).json({ error: "Title, content, and date_time are required." });
  }

  try {
    const formattedDate = new Date(date_time).toISOString().slice(0, 19).replace("T", " "); // "YYYY-MM-DD HH:MM:SS"

    const [result] = await db.execute(
      "UPDATE announcements SET title = ?, content = ?, date_time = ? WHERE announcement_id = ?",
      [title, content, formattedDate, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    res.status(200).json({ message: "Announcement updated successfully." });
  } catch (err) {
    console.error("Update announcement error:", err);
    res.status(500).json({ error: "Server error updating announcement." });
  }
};
