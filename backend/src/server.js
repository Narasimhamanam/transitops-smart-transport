require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const routes = require('./routes');

const app = express();

// ==============================
// Security Middlewares
// ==============================
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ==============================
// Request Parsing
// ==============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Logging
// ==============================
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ==============================
// Health Check
// ==============================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TransitOps API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ==============================
// API Routes
// ==============================
app.use('/api', routes);

// ==============================
// Error Handling
// ==============================
app.use(notFoundHandler);
app.use(errorHandler);

// ==============================
// Start Server
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 TransitOps API running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
