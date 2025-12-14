const db = require('../db');

// --- Admin Dashboard Stats ---
exports.getAdminStats = async (req, res) => {
  try {
    const [totalStudentsResult] = await db.execute(
      "SELECT COUNT(user_id) AS totalStudents FROM Users WHERE role = 'student'"
    );
    const totalStudents = totalStudentsResult[0].totalStudents;

    const [totalEventsResult] = await db.execute(
      "SELECT COUNT(event_id) AS totalEvents FROM Events"
    );
    const totalEvents = totalEventsResult[0].totalEvents;

    const [upcomingEventsResult] = await db.execute(
      "SELECT COUNT(event_id) AS upcomingEvents FROM Events WHERE status = 'Active' AND event_date > NOW()"
    );
    const upcomingEvents = upcomingEventsResult[0].upcomingEvents;

    const [uniqueAttendanceResult] = await db.execute(
      "SELECT COUNT(DISTINCT user_id) AS uniqueAttendees FROM Attendance"
    );
    const uniqueAttendees = uniqueAttendanceResult[0].uniqueAttendees;

    let participationRate = 0;
    if (totalStudents > 0) {
      participationRate = Math.round((uniqueAttendees / totalStudents) * 100);
    }

    res.json({
      totalStudents,
      totalEvents,
      upcomingEvents,
      uniqueAttendees,
      participationRate,
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({ error: 'Server error fetching dashboard statistics.' });
  }
};

// --- Event Participation Report ---
exports.getEventParticipationReport = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        E.event_id,
        E.title AS event_name,
        E.event_date AS date_time,
        E.max_capacity,
        COUNT(A.attendance_id) AS participants,
        IF(E.max_capacity > 0, ROUND((COUNT(A.attendance_id)/E.max_capacity)*100, 2), 0) AS participation_rate
      FROM Events E
      LEFT JOIN Attendance A ON E.event_id = A.event_id
      GROUP BY E.event_id, E.title, E.event_date, E.max_capacity
      ORDER BY E.event_date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching event participation report:', err);
    res.status(500).json({ error: 'Server error fetching event participation report.' });
  }
};

// --- Event Participants List ---
// reportController.js
exports.getEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const [rows] = await db.execute(`
      SELECT 
        A.attendance_id,
        U.user_id,
        U.full_name,
        U.email,
        A.register_time
      FROM Attendance A
      JOIN Users U ON A.user_id = U.user_id
      WHERE A.event_id = ?
    `, [eventId]);

    res.json(rows);

  } catch (err) {
    console.error('Error fetching event participants:', err);
    res.status(500).json({ error: 'Server error fetching event participants.' });
  }
};


// --- Attendance Summary (Optional) ---
exports.getAttendanceSummary = async (req, res) => {
  try {
    const [summary] = await db.execute(`
      SELECT event_id, title, COUNT(attendance_id) AS checked_in
      FROM Events E
      LEFT JOIN Attendance A ON E.event_id = A.event_id
      GROUP BY E.event_id
    `);
    res.json(summary);
  } catch (err) {
    console.error('Error fetching attendance summary:', err);
    res.status(500).json({ error: 'Server error fetching attendance summary.' });
  }
};
