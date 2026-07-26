const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Logging Middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Security Configuration
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' })); // Mitigate DOS payload sizes
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Apply General Rate Limiter Globally
app.use(generalLimiter);

// Database connection retry helper
const connectDB = async () => {
  const connString = process.env.MONGODB_URI;
  if (!connString || connString.includes('<user>') || connString.includes('<pass>') || connString.includes('<cluster>') || connString.includes('<password>')) {
    console.error('\n========================================================================');
    console.error('CRITICAL CONFIGURATION ERROR: Invalid/placeholder MONGODB_URI detected.');
    console.error('Location: E:\\BUILDING\\tutorial-sync\\server\\.env');
    console.error('Please configure your database connection in your .env file:');
    console.error('1. Real Atlas: MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/devrefresh');
    console.error('2. Local Mongo: MONGODB_URI=mongodb://127.0.0.1:27017/devrefresh');
    console.error('========================================================================\n');
    process.exit(1);
  }

  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(connString, options);
      console.log('MongoDB Database connected successfully.');
      break;
    } catch (err) {
      console.error(`MongoDB connection failed. Retries remaining: ${retries - 1}. Error:`, err.message);
      retries -= 1;
      if (retries === 0) {
        console.error('CRITICAL: Could not connect to MongoDB database. Exiting.');
        process.exit(1);
      }
      // Wait 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

connectDB();

// 1. Health check endpoint (CORS allowed, no rate limits, handles Render cold starts)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);

// Catch-all route for undefined API endpoints (404 handler)
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error details:', err);

  const statusCode = err.status || 500;
  const response = {
    message: err.message || 'Internal Server Error'
  };

  // Append debug logs if in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.errors;
  }

  res.status(statusCode).json(response);
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});
