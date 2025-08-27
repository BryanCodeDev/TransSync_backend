// src/routes/index.js - UPDATED to include dashboard routes

const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const authRoutes = require("./authRoutes");
const adminRoutes = require('./adminRoutes');
const conductoresRoutes = require('./conductoresRoutes');
const vehiculosRoutes = require('./vehiculosRoutes');
const rutasRoutes = require("./rutasRoutes");
const dashboardRoutes = require('./dashboardRoutes'); // ← NEW
const chatbotRoutes = require('./chatbotRoutes');

const viajesRoutes = require('./viajesRoutes');
router.use('/viajes', viajesRoutes);

// Ruta de verificación de salud
router.get('/health', async (req, res) => {
    try {
        // Verificar conexión a la base de datos
        const [result] = await pool.query('SELECT 1 as status');
        
        res.status(200).json({
            status: 'OK',
            message: 'Servidor y base de datos funcionando correctamente',
            timestamp: new Date().toISOString(),
            database: result.length > 0 ? 'Connected' : 'Disconnected'
        });
    } catch (error) {
        console.error('Error en health check:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error en la base de datos',
            timestamp: new Date().toISOString(),
            database: 'Disconnected'
        });
    }
});

// Rutas de la aplicación
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/conductores", conductoresRoutes);
router.use("/vehiculos", vehiculosRoutes);
router.use("/rutas", rutasRoutes);
router.use("/dashboard", dashboardRoutes); // ← NEW
router.use("/chatbot", chatbotRoutes);

// Ruta para manejo de errores 404
router.use((req, res) => {
    res.status(404).json({
        status: 'ERROR',
        message: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: [
            '/api/health',
            '/api/auth/*',
            '/api/admin/*',
            '/api/conductores/*',
            '/api/vehiculos/*',
            '/api/rutas/*',       // ← FALTA ESTA
            '/api/dashboard/*',
            '/api/chatbot/*'
        ]
    });
});

module.exports = router;