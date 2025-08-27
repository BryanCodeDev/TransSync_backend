// src/routes/chatbotRoutes.js

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * POST /api/chatbot/consulta
 * Procesar consulta del usuario y generar respuesta inteligente
 * Acceso: Todos los roles autenticados
 */
router.post('/consulta', chatbotController.procesarConsulta);

/**
 * GET /api/chatbot/estadisticas
 * Obtener estadísticas de uso del chatbot
 * Acceso: Solo administradores
 */
router.get('/estadisticas', 
    require('../middleware/roleMiddleware')('ADMINISTRADOR', 'SUPERADMIN'), 
    chatbotController.getEstadisticasChatbot
);

/**
 * GET /api/chatbot/health
 * Verificar estado del servicio de chatbot
 * Acceso: Todos los roles autenticados
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'ChatBot API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;