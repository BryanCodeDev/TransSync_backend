const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes - notice the paths start with './src'
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
// If you have an index.js in routes, you might also need:
// const indexRoutes = require("./src/routes/index");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
// If you have index routes:
// app.use("/", indexRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("TransSync API running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});