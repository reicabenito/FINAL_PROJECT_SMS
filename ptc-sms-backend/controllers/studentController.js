// controllers/studentController.js
const db = require('../db');

// @desc Get announcements for students
// @route GET /api/student/announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT announcement_id, title, content, created_at
            FROM announcements
            ORDER BY created_at DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching announcements:", err);
        res.status(500).json({ message: "Server error while fetching announcements." });
    }
};

// @desc Get upcoming events for student dashboard
// @route GET /api/student/events
exports.getEvents = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT event_id, title, description, event_date, location
            FROM Events
            ORDER BY event_date ASC
        `);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ message: "Server error while fetching events." });
    }
};
exports.getParticipation = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. No user info.' });
        }

        const [rows] = await db.query(`
            SELECT COUNT(*) AS total_events
            FROM attendance
            WHERE user_id = ?
        `, [req.user.user_id]);

        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching participation:", err);
        res.status(500).json({ message: "Server error while fetching participation." });
    }
};
exports.getRegisteredEvents = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. No user info." });
    }

    const studentId = req.user.user_id; // from JWT
    try {
        const [rows] = await db.query(
            `SELECT e.event_id AS id, e.title,
                IFNULL((SELECT COUNT(*) 
                        FROM attendance a 
                        WHERE a.event_id = e.event_id AND a.user_id = ?) / 1 * 100, 0) AS attendancePercentage
            FROM events e
            WHERE EXISTS (
                SELECT 1 
                FROM attendance a 
                WHERE a.event_id = e.event_id AND a.user_id = ?
            )`,
            [studentId, studentId]
        );

        res.json(rows);
    } catch (err) {
        console.error("Error fetching registered events:", err);
        res.status(500).json({ error: "Failed to fetch registered events" });
    }
};

