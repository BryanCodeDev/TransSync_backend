// src/routes/index.js - ACTUALIZADO

const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const authRoutes = require("./authRoutes");
const adminRoutes = require('./adminRoutes');

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

// Todas las rutas de autenticación estarán bajo /auth
// Ejemplo: /api/auth/register
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;