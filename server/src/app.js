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
const userRoutes = require("./routes/userRoutes");

app.use('/api/problems', problemRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
