// ptc-sms-backend/controllers/eventController.js
const db = require('../db');

// --- Admin CRUD Operations ---

// @desc    Create a new event
// @route   POST /api/events
// @access  Admin
exports.createEvent = async (req, res) => {
  let { title, description, date, time, location, organizer, status, max_capacity } = req.body;

  if (!title || !date || !location) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const event_date = time ? `${date} ${time}:00` : `${date} 00:00:00`;

  try {
    const [result] = await db.execute(
      `INSERT INTO Events (title, description, event_date, location, organizer, status, max_capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, location, organizer, status || 'Active', max_capacity || 0]
    );

    res.status(201).json({ message: 'Event created successfully.', eventId: result.insertId });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Server error creating event.' });
  }
};





// @desc    Update an existing event
// @route   PUT /api/events/:id
// @access  Admin


// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Admin

exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const [result] = await db.execute("DELETE FROM events WHERE event_id = ?", [eventId]);
    console.log(result); // see affectedRows
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};


// --- Student/Public Operations ---

// @desc    Get all active/upcoming events
// @route   GET /api/events
// @access  Public/Student
exports.getEvents = async (req, res) => {
    try {
        // Fetch only events that are 'Active' and have a future or current date
        const [events] = await db.execute(
            "SELECT * FROM Events WHERE status = 'Active' AND event_date >= NOW() ORDER BY event_date ASC"
        );
        res.json(events);
    } catch (err) {
        console.error('Get events error:', err);
        res.status(500).json({ error: 'Server error fetching events.' });
    }
};

// @desc    Student registers for an event
// @route   POST /api/events/:id/register
// @access  Student (Protected)
exports.registerForEvent = async (req, res) => {
    const event_id = req.params.id;
    const user_id = req.user.user_id; // From JWT payload

    try {
        // Check if already registered
        const [existing] = await db.execute(
            'SELECT * FROM Attendance WHERE event_id = ? AND user_id = ?',
            [event_id, user_id]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Already registered for this event.' });
        }

        // Insert attendance
        const [result] = await db.execute(
            `INSERT INTO Attendance (event_id, user_id) VALUES (?, ?)`,
            [event_id, user_id]
        );

        // 🌟 CREATE NOTIFICATION
        await db.execute(
            `INSERT INTO notifications (user_id, type, message, details)
             VALUES (?, 'success', 'You registered for an event', 'Event ID: ${event_id}')`,
            [user_id]
        );

        res.status(201).json({ message: 'Successfully registered for the event.' });
    } catch (err) {
        console.error('Event registration error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};


exports.getAllEvents = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT event_id, title, event_date, status, max_capacity, qr_image FROM events" 
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch events." });
  }
};


exports.updateEvent = async (req, res) => {
  const { title, description, date, time, location, status, max_capacity } = req.body;
  const { id } = req.params;

  const event_date = time ? `${date} ${time}:00` : `${date} 00:00:00`;

  try {
    const [result] = await db.execute(
      `UPDATE Events 
       SET title=?, description=?, event_date=?, location=?, status=?, max_capacity=? 
       WHERE event_id=?`,
      [title, description, event_date, location, status, max_capacity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json({ message: "Event updated successfully" });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

exports.getMyRegistrations = async (req, res) => {
    try {
        const userId = req.user.user_id; // comes from protect middleware
        if (!userId) return res.status(400).json({ error: 'User not authenticated' });

        const [rows] = await db.execute(
            'SELECT event_id FROM Attendance WHERE user_id = ?',
            [userId]
        );

        // Return an array of registered event IDs
        const registeredEventIds = rows.map(r => r.event_id);
        res.status(200).json(registeredEventIds);
    } catch (err) {
        console.error('Error fetching registered events:', err);
        res.status(500).json({ error: 'Failed to fetch registered events' });
    }
};

