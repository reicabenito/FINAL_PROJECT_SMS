// ptc-sms-backend/controllers/authController.js (FIXED TEMPORARY VERSION)
const db = require('../db');
const sendEmail = require('../utils/email');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

// CREATE ADMIN (POSTMAN ONLY)
exports.createAdmin = async (req, res) => {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
        return res.status(400).json({ error: "Missing email, password, or full_name." });
    }

    try {
        const hashed = await hashPassword(password);

        await db.execute(
            `INSERT INTO Users (email, password_hash, full_name, role)
             VALUES (?, ?, ?, 'admin')`,
            [email, hashed, full_name]
        );

        res.json({ message: "Admin account created successfully." });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Email already exists." });
        }

        console.error("Create admin error:", err);
        res.status(500).json({ error: "Server error creating admin." });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await comparePassword(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        
        // Generate JWT
        const token = generateToken(user);

        // Return user data (excluding hash) and token
        const { password_hash, ...userData } = user;
        res.json({ token, user: userData });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT user_id, student_id, email, full_name, role, department, college FROM Users WHERE user_id = ?', [req.user.user_id]);
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Server error fetching profile.' });
    }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const [rows] = await db.execute('SELECT user_id, full_name FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'Email not found' });

    const user = rows[0];

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashed = await hashPassword(tempPassword);

    // Update user password
    await db.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashed, user.user_id]);

    // Send email
    const subject = 'Reset Your Password';
    const text = `Hello ${user.full_name},
    
Your password has been reset. Here is your temporary password:

${tempPassword}

Please log in and change your password immediately.

Thank you,
PTC SMS Admin`;

    await sendEmail({ to: email, subject, text });

    res.json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error sending reset link' });
  }
};