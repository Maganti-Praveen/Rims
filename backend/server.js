// Load env vars first (before any imports that use process.env)
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const autoSeedAcademicYears = require('./utils/autoSeedAcademicYears');
const autoSeedScoreConfig = require('./utils/autoSeedScoreConfig');

// Connect to database, then auto-ensure current academic years exist & seed score configs
connectDB().then(() => {
    autoSeedAcademicYears();
    autoSeedScoreConfig();
});


const app = express();

// Middleware
// CORS — open to all origins so any device on the college LAN can connect
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files from memory folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'memory')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/certifications', require('./routes/certificationRoutes'));
app.use('/api/publications', require('./routes/publicationRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/patents', require('./routes/patentRoutes'));
app.use('/api/workshops', require('./routes/workshopRoutes'));
app.use('/api/seminars', require('./routes/seminarRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/academic-years', require('./routes/academicYearRoutes'));
app.use('/api/scores', require('./routes/scoreRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/domains', require('./routes/domainRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'RDMS API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
