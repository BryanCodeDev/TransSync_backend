// src/routes/dashboardRoutes.js

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

// Middleware de autenticación para todas las rutas dashboard
router.use(authMiddleware);

// ========================================
// RUTAS DEL DASHBOARD
// ========================================

// Estadísticas generales - Acceso para ADMINISTRADOR y SUPERADMIN
router.get("/estadisticas", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    dashboardController.getGeneralStatistics
);

// Datos para gráficos con filtro por período
router.get("/graficos", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    dashboardController.getChartsData
);

// Alertas activas del sistema
router.get("/alertas", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    dashboardController.getActiveAlerts
);

// Actividad reciente del sistema
router.get("/actividad", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    dashboardController.getRecentActivity
);

// Indicadores clave de rendimiento (KPIs)
router.get("/kpis", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    dashboardController.getKPIs
);

// Resumen ejecutivo por período
router.get("/resumen-ejecutivo", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    dashboardController.getExecutiveSummary
);

// Datos en tiempo real
router.get("/tiempo-real", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    dashboardController.getRealTimeData
);

// ========================================
// RUTA DE PRUEBA PARA VERIFICAR CONECTIVIDAD
// ========================================
router.get("/test", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    (req, res) => {
        res.json({
            status: 'success',
            message: 'Dashboard API funcionando correctamente',
            timestamp: new Date().toISOString(),
            user: {
                id: req.user.idUsuario,
                email: req.user.email,
                role: req.user.role,
                empresa: req.user.idEmpresa
            }
        });
    }
);

// ========================================
// MANEJO DE ERRORES 404 PARA RUTAS DASHBOARD
// ========================================
router.use((req, res) => {
    res.status(404).json({
        status: 'ERROR',
        message: 'Ruta de dashboard no encontrada',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            'GET /api/dashboard/estadisticas',
            'GET /api/dashboard/graficos?periodo={dia|semana|mes|trimestre|ano}',
            'GET /api/dashboard/alertas',
            'GET /api/dashboard/actividad?limite={number}',
            'GET /api/dashboard/kpis?fechaInicio={YYYY-MM-DD}&fechaFin={YYYY-MM-DD}',
            'GET /api/dashboard/resumen-ejecutivo?periodo={dia|semana|mes|trimestre}',
            'GET /api/dashboard/tiempo-real',
            'GET /api/dashboard/test'
        ]
    });
});

module.exports = router;