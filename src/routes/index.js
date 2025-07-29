// routes/index.js - Archivo principal de rutas mejorado
const express = require('express');
const router = express.Router();

// Middleware de logging para desarrollo
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
};

// Aplicar logging en desarrollo
if (process.env.NODE_ENV !== 'production') {
  router.use(requestLogger);
}

// Importar todas las rutas
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const mapRoutes = require('./mapRoutes');

// Ruta de salud del API
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configurar rutas con prefijos
router.use('/auth', authRoutes);
router.use('/users', userRoutes); // Cambié 'user' por 'users' para ser más RESTful
router.use('/maps', mapRoutes); // Cambié 'map' por 'maps' para consistencia

// Ruta catch-all para rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    availableRoutes: {
      auth: ['/auth/register', '/auth/login'],
      users: ['/users'],
      maps: [
        '/maps/search/:query',
        '/maps/reverse/:lat/:lon',
        '/maps/nearby/:lat/:lon/:type',
        '/maps/route/:startLat/:startLon/:endLat/:endLon',
        '/maps/place/:id'
      ],
      system: ['/health']
    }
  });
});

// Middleware de manejo de errores
router.use((error, req, res, next) => {
  console.error('Error en API:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

module.exports = router;