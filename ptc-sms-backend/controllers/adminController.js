const pool = require('../db');

exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id, full_name, role, department, email, student_id FROM users');
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error fetching users' });
    }
};
