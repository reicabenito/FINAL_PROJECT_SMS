// ptc-sms-backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

// Database Connection
const db = require('./db'); 

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes'); // New Import
const adminRoutes = require('./routes/adminRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const manageuserRoutes = require('./routes/manageuserRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const studentRoutes = require('./routes/studentRoutes');
const userRoutes = require('./routes/userRoutes');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes); // New Mount
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin/users', manageuserRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/student', studentRoutes);
app.use('/api/user', userRoutes);

app.use('/api/user', require('./routes/manageuserRoutes'));

// Simple root check
app.get('/', (req, res) => {
    res.send('PTC SMS API is running.');
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});





