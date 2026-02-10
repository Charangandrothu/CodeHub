const express = require('express');
const cors = require('cors');
const problemRoutes = require("./routes/problemRoutes");
const app = express();

//Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

//Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: "Server is running" });
});

//Routes
const executeRoutes = require("./routes/execute");
const userRoutes = require("./routes/userRoutes");

app.use('/api/problems', problemRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/users', userRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use('/api/payment', paymentRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
