const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const problemRoutes = require("./routes/problemRoutes");
const app = express();

const { limiter } = require("./middleware/rateLimiter");

//Middleware
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // Allow secure cross-origin cookies
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Global Rate Limiting
app.use(limiter);

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
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminPricingRoutes = require("./routes/adminPricingRoutes");

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/pricing', adminPricingRoutes);
app.use('/api/admin', adminRoutes);

const aiRoutes = require("./routes/aiRoutes");
app.use('/api/ai', aiRoutes);

const companyQuestionRoutes = require('./routes/companyQuestionRoutes');
app.use('/api/company-questions', companyQuestionRoutes);

const platformRoutes = require("./routes/platform");
app.use('/api/platform', platformRoutes);

const announcementRoutes = require("./routes/announcementRoutes");
app.use('/api/announcements', announcementRoutes);

const webhookRoutes = require("./routes/webhookRoutes");
app.use('/api/webhooks', webhookRoutes);

// Certificate routes (PDFs are generated in-memory, no static file serving needed)
const path = require("path");

// Serve frontend public folder for certificate images
app.use(express.static(path.join(__dirname, '../../public')));

const certificateRoutes = require("./routes/certificateRoutes");
app.use('/api/certificates', certificateRoutes);

// Maintenance Mode Middleware
const PlatformSettings = require("./models/PlatformSettings");

app.use(async (req, res, next) => {
  // Skip if checking status or admin routes or login
  if (req.path.startsWith('/api/platform') ||
    req.path.startsWith('/api/users/login') ||
    req.path.startsWith('/api/admin') ||
    req.path === '/api/health') return next();

  try {
    const settings = await PlatformSettings.findById('PLATFORM_SETTINGS');
    if (settings?.maintenanceMode) {
      // For simplicity, allow GET requests (browsing) but block mutations? Or block all APIs except admins?
      // Let's block everything for now unless user is admin token (complex to verify here without decoding).
      // Strategy: The frontend will handle the redirection. The API just needs a flag.
      // But for security, we should return 503 if maintenance is on.

      // However, to allow admins to work, we need to decode token.
      // Since this is global middleware, decoding token on every request might be heavy but necessary.
      // For now, let's rely on frontend redirection + critical mutations being protected.
      // A true maintenance mode usually blocks ALL traffic.

      // Let's return a specific header so frontend knows to redirect.
      res.set('X-Maintenance-Mode', 'true');
    }
  } catch (err) {
    console.error("Maintenance check failed", err);
  }
  next();
});

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
