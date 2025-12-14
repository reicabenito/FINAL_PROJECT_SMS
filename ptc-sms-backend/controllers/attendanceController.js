// ptc-sms-backend/controllers/attendanceController.js
const db = require('../db');
const crypto = require('crypto');
require('dotenv').config();

const QR_TOKEN_EXPIRATION_SECONDS = parseInt(process.env.QR_TOKEN_EXPIRATION_SECONDS, 10) || 300; // Default 5 mins

// @desc    Admin generates a new QR token for event attendance
// @route   POST /api/attendance/:eventId/token
// @access  Admin
exports.generateQrToken = async (req, res) => {
    const { eventId } = req.params;

    try {
        // 1. Check if event exists and is active
        const [eventRows] = await db.execute('SELECT event_id, title FROM Events WHERE event_id = ? AND status = ?', [eventId, 'Active']);
        if (eventRows.length === 0) {
            return res.status(404).json({ error: 'Active event not found.' });
        }

        // 2. Generate secure random token and expiration time
        const secret_token = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + QR_TOKEN_EXPIRATION_SECONDS * 1000);

        // 3. Insert or Update the token in QRTokens table
        // We use REPLACE INTO to ensure only one active token per event
        await db.execute(
            `REPLACE INTO QRTokens (event_id, secret_token, expires_at) VALUES (?, ?, ?)`,
            [eventId, secret_token, expires_at]
        );

        res.json({ 
            message: 'New QR token generated.',
            eventId: parseInt(eventId),
            secretToken: secret_token, // This is the data the frontend QR component will encode
            expiresInSeconds: QR_TOKEN_EXPIRATION_SECONDS 
        });

    } catch (err) {
        console.error('QR token generation error:', err);
        res.status(500).json({ error: 'Server error generating token.' });
    }
};

// @desc    Student checks in using the QR code token
// @route   POST /api/attendance/checkin
// @access  Student (Protected)
exports.checkIn = async (req, res) => {
    const { eventId, scannedToken } = req.body;
    const user_id = req.user.user_id; // From Student's JWT

    if (!eventId || !scannedToken) {
        return res.status(400).json({ error: 'Missing event ID or scanned token.' });
    }

    try {
        // 1. Validate the scanned token against the database
        const [tokenRows] = await db.execute(
            'SELECT * FROM QRTokens WHERE event_id = ? AND secret_token = ? AND expires_at > NOW()',
            [eventId, scannedToken]
        );

        if (tokenRows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired QR code token.' });
        }

        // 2. Check if the student is already registered for this event
        const [attendanceRows] = await db.execute(
            'SELECT * FROM Attendance WHERE event_id = ? AND user_id = ?',
            [eventId, user_id]
        );

        if (attendanceRows.length === 0) {
            return res.status(403).json({ error: 'You are not registered for this event.' });
        }

        // 3. Check if they have already checked in
        if (attendanceRows[0].check_in_time) {
            return res.status(409).json({ error: 'You have already checked in for this event.' });
        }

        // 4. Record the check-in time
        await db.execute(
            'UPDATE Attendance SET check_in_time = NOW() WHERE event_id = ? AND user_id = ?',
            [eventId, user_id]
        );

        res.json({ message: 'Attendance successfully recorded!' });

    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Server error during check-in.' });
    }
};