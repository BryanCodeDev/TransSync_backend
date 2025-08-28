// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config();

const routes = require("./src/routes"); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Servir archivos estáticos (para favicon, etc.) ---
app.use(express.static('public'));

// --- Manejar favicon.ico específicamente ---
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No Content - ignora la solicitud del favicon
});

// --- Ruta raíz de bienvenida ---
app.get('/', (req, res) => {
    res.json({
        status: 'SUCCESS',
        message: '🚀 TRANSSYNC Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            admin: '/api/admin',
            conductores: '/api/conductores',
            vehiculos: '/api/vehiculos',
            rutas: '/api/rutas',
            viajes: '/api/viajes',
            dashboard: '/api/dashboard',
            chatbot: '/api/chatbot'
        },
        documentation: 'Visita /api/health para verificar el estado del servidor'
    });
});

// --- Rutas de la API ---
app.use("/api", routes); // Esto crea el prefijo /api

// --- Manejo de errores 404 global ---
app.use((req, res) => {
    res.status(404).json({
        status: 'ERROR',
        message: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        suggestion: 'Verifica que la URL sea correcta y que incluya el prefijo /api para las rutas de la API'
    });
});

// --- Manejo de errores del servidor ---
app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);
    res.status(500).json({
        status: 'ERROR',
        message: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log(`🔍 Health check en http://localhost:${PORT}/api/health`);
});