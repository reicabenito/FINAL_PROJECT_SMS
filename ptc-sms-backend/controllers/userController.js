// controllers/userController.js
const db = require('../db');
const { hashPassword, comparePassword } = require('../utils/auth');

// Get logged-in user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; // set by protect middleware
        const [rows] = await db.execute(
            'SELECT user_id, full_name, email, student_id, department, college, role FROM users WHERE user_id = ?',
            [userId]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        res.json(rows[0]);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update profile (name/email) + optional password change
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { full_name, email, password, newPassword } = req.body;

        // If changing password, check current password
        if (newPassword) {
            const [rows] = await db.execute('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
            const currentHash = rows[0].password_hash;
            const valid = await comparePassword(password, currentHash);
            if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Build update query dynamically
        let query = 'UPDATE users SET full_name = ?, email = ?';
        const params = [full_name, email];

        if (newPassword) {
            const hashed = await hashPassword(newPassword);
            query += ', password_hash = ?';
            params.push(hashed);
        }

        query += ' WHERE user_id = ?';
        params.push(userId);

        await db.execute(query, params);

        // Return updated user data
        const [updatedRows] = await db.execute(
            'SELECT user_id, full_name, email, student_id, department, college, role FROM users WHERE user_id = ?',
            [userId]
        );
        res.json(updatedRows[0]);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
};

// Change password only
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { oldPassword, newPassword } = req.body;

        const [rows] = await db.execute('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const valid = await comparePassword(oldPassword, rows[0].password_hash);
        if (!valid) return res.status(400).json({ error: 'Old password is incorrect' });

        const hashed = await hashPassword(newPassword);
        await db.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashed, userId]);

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Server error changing password.' });
    }
};
