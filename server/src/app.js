const express = require('express');
const cors = require('cors');
const problemRoutes = require("./routes/problemRoutes");
const app = express();
//Middleware
app.use(cors());
app.use(express.json());
//Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: "Server is running" });
});
//Routes
const executeRoutes = require("./routes/execute");
app.use('/api/problems', problemRoutes);
app.use('/api/execute', executeRoutes);
module.exports = app;
