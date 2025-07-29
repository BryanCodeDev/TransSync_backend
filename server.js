// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const routes = require("./routes"); // Cambiamos para importar el index.js de routes

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

// Usar las rutas definidas en routes/index.js
app.use("/api", routes); // Todas las rutas estarán bajo /api

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
  console.log(`🗺️  Maps API: http://localhost:${PORT}/api/maps`);
  console.log(`🚌 Transport API: http://localhost:${PORT}/api/transport`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /health`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/users`);
    console.log(`   GET  /api/maps/search/:query`);
    console.log(`   GET  /api/maps/reverse/:lat/:lon`);
    console.log(`   GET  /api/maps/nearby/:lat/:lon/:type`);
    console.log(`   GET  /api/maps/route/:startLat/:startLon/:endLat/:endLon`);
    console.log(`   GET  /api/maps/place/:id`);
    console.log(`   GET  /api/transport/routes`);
    console.log(`   GET  /api/transport/stops`);
    console.log(`   POST /api/transport/stops\n`);
  }
});