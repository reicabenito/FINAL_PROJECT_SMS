// ptc-sms-backend/utils/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION_TIME = process.env.TOKEN_EXPIRATION_TIME;
const SALT_ROUNDS = 10;

// Hashing function
exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};
// Comparison function
exports.comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

// JWT generation function
exports.generateToken = (user) => {
    const payload = {
        user_id: user.user_id,
        role: user.role,
        student_id: user.student_id // Helpful for student role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION_TIME });
};

// Middleware to protect routes (Authentication)
exports.protect = async (req, res, next) => {
    try {
        // 1. Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // 2. Extract the token
        const token = authHeader.split(' ')[1];

        // 3. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach user info to request (optional)
        req.user = decoded;

        next(); // allow access
    } catch (err) {
        console.error('Protect middleware error:', err);
        res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }
};


// Middleware for role-based access control (Authorization)
exports.restrictTo = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. You do not have permission to perform this action.' });
        }
        next();
    };
};