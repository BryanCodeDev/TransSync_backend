// server.js - Versión corregida y optimizada
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const mapRoutes = require("./src/routes/mapRoutes");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware más robusto
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes - IMPORTANTE: mantener consistencia con /maps
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/maps", mapRoutes); // Confirmar que es /maps no /map

// Health check route mejorado
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: "TransSync API running",
    version: "1.1.0",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route mejorado
app.get("/", (req, res) => {
  res.json({
    message: "TransSync API running",
    version: "1.1.0",
    status: "healthy",
    endpoints: {
      auth: "/auth (POST /register, POST /login)",
      users: "/users (GET /)",
      maps: "/maps (GET /search/:query, GET /reverse/:lat/:lon, etc.)",
      health: "/health (GET)"
    },
    documentation: "Consulta README.md para más detalles de la API"
  });
});

// 404 handler mejorado
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    availableEndpoints: {
      root: "GET /",
      health: "GET /health",
      auth: [
        "POST /auth/register",
        "POST /auth/login"
      ],
      users: [
        "GET /users"
      ],
      maps: [
        "GET /maps/search/:query",
        "GET /maps/reverse/:lat/:lon", 
        "GET /maps/nearby/:lat/:lon/:type",
        "GET /maps/route/:startLat/:startLon/:endLat/:endLon",
        "GET /maps/place/:id"
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Error handler mejorado
app.use((error, req, res, next) => {
  console.error('🚨 Error en API:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.details 
    }),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TransSync API Server running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🗺️  Maps API: http://localhost:${PORT}/maps`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /health`);
    console.log(`   POST /auth/register`);
    console.log(`   POST /auth/login`);
    console.log(`   GET  /users`);
    console.log(`   GET  /maps/search/:query`);
    console.log(`   GET  /maps/reverse/:lat/:lon`);
    console.log(`   GET  /maps/nearby/:lat/:lon/:type`);
    console.log(`   GET  /maps/route/:startLat/:startLon/:endLat/:endLon`);
    console.log(`   GET  /maps/place/:id\n`);
  }
});