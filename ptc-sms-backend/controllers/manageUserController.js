// ptc-sms-backend/controllers/manageUserController.js

const db = require('../db');
const { hashPassword } = require('../utils/auth');
const sendEmail = require('../utils/email');

exports.createStudent = async (req, res) => {
    const { full_name, email, student_id, department, role } = req.body;

    // Validation 
    if (!full_name || !email || !student_id || !department || !role) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // AUTO-GENERATE TEMP PASSWORD 
        const tempPassword = Math.random().toString(36).slice(-8);
        
        // HASH TEMP PASSWORD 
        const hashedPassword = await hashPassword(tempPassword);
        
        // INSERT INTO DATABASE 
        const [result] = await db.execute(
            `INSERT INTO users (full_name, email, student_id, department, role, password_hash)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [full_name, email, student_id, department, role, hashedPassword]
        );

        const subject = 'Your Student Account Has Been Created';
        
        // --- FIXED: Used backticks for template literal ---
        const text = `Hello ${full_name},
Your student account has been successfully created in the PTC SMS system.
Here are your login credentials:
Email: ${email}
Temporary Password: ${tempPassword}
Please log in as soon as possible and change your password.
Thank you,
PTC SMS Admin`;
        // --------------------------------------------------

        await sendEmail({ to: email, subject, text });

        res.status(201).json({
            message: 'Student account created successfully and email sent.',
            userId: result.insertId,
        });
    } catch (err) {
        console.error('Create student error:', err);
        res.status(500).json({
            error: 'Failed to create student',
            details: err.message
        });
    }
};

// --------------------------------------------------

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute(
            'DELETE FROM users WHERE user_id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({
            error: 'Failed to delete user',
            details: err.message
        });
    }
};


// --------------------------------------------------

exports.resetPassword = async (req, res) => {
    const { id } = req.params;
    const tempPassword = Math.random().toString(36).slice(-8);
    
    try {
        const [result] = await db.execute(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [await hashPassword(tempPassword), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get user email and full_name
        const [rows] = await db.execute('SELECT email, full_name FROM users WHERE user_id = ?', [id]);
        
        // Check if user was actually found before proceeding
        if (rows.length === 0) {
            // This should ideally be caught by the affectedRows check, but added for robustness
            return res.status(404).json({ error: 'User not found after update, unable to send email.' });
        }

        const user = rows[0];
        const subject = 'Your Password Has Been Reset';
        
        // --- FIXED: Used backticks for template literal ---
        const text = `Hello ${user.full_name},
Your password has been reset by the admin.
Temporary password: ${tempPassword}
Please log in and change your password immediately.
Thank you,
PTC SMS Admin`;
        // --------------------------------------------------
        
        await sendEmail({ to: user.email, subject, text });
        
        res.json({ message: 'Password reset successfully', tempPassword });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            error: 'Failed to reset password',
            details: err.message
        });
    }
};


// Update own profile (student)
exports.updateProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { full_name, email, department, college } = req.body;

    await db.execute(
      `UPDATE users SET full_name = ?, email = ?, department = ?, college = ? WHERE user_id = ?`,
      [full_name, email, department, college, user_id]
    );

    // Return updated user data
    const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [user_id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
};

// Change own password (student)
exports.changePassword = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    const [rows] = await db.execute('SELECT password_hash FROM users WHERE user_id = ?', [user_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const { comparePassword, hashPassword } = require('../utils/auth');
    const valid = await comparePassword(oldPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Old password is incorrect' });

    const hashed = await hashPassword(newPassword);
    await db.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashed, user_id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error changing password.' });
  }
};



// Get logged-in user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; // Assuming you set req.user in your auth middleware
        const [rows] = await db.execute(
            'SELECT user_id, full_name, email, student_id, department, college, role FROM users WHERE user_id = ?',
            [userId]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};


// Update profile (name/email) + optional password change
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { full_name, email, password, newPassword } = req.body;

        // Check current password if trying to change password
        if (newPassword) {
            const [rows] = await db.execute('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
            const currentHash = rows[0].password_hash;
            const { comparePassword } = require('../utils/auth');
            const valid = await comparePassword(password, currentHash);
            if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Build update query dynamically
        let updateQuery = 'UPDATE users SET full_name = ?, email = ?';
        const params = [full_name, email];

        if (newPassword) {
            const hashed = await require('../utils/auth').hashPassword(newPassword);
            updateQuery += ', password_hash = ?';
            params.push(hashed);
        }

        updateQuery += ' WHERE user_id = ?';
        params.push(userId);

        await db.execute(updateQuery, params);

        // Return updated profile
        const [updatedRows] = await db.execute('SELECT user_id, full_name, email, student_id, department, college, role FROM users WHERE user_id = ?', [userId]);
        res.json(updatedRows[0]);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
};
