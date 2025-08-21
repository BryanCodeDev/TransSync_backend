// src/routes/conductoresRoutes.js

const express = require('express');
const router = express.Router();
const conductoresController = require('../controllers/conductoresController');
const authMiddleware = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas con parámetros

// Obtener conductores disponibles para asignación (ADMIN y SUPERADMIN)
router.get('/disponibles/lista', 
    allowRoles('ADMINISTRADOR', 'SUPERADMIN'), 
    conductoresController.getConductoresDisponibles
);

// Obtener estadísticas de conductores (ADMIN y SUPERADMIN)
router.get('/estadisticas/resumen', 
    allowRoles('ADMINISTRADOR', 'SUPERADMIN'), 
    conductoresController.getEstadisticasConductores
);

// Verificar vencimiento de licencias (ADMIN y SUPERADMIN)
router.get('/licencias/vencimiento', 
    allowRoles('ADMINISTRADOR', 'SUPERADMIN'), 
    conductoresController.verificarVencimientoLicencias
);

// Obtener todos los conductores (ADMIN y SUPERADMIN)
router.get('/', 
    allowRoles('ADMINISTRADOR', 'SUPERADMIN'), 
    conductoresController.getConductores
);

// Obtener conductor por ID (ADMIN y SUPERADMIN)
// ESTA RUTA DEBE IR DESPUÉS de las rutas específicas
router.get('/:id', 
    allowRoles('ADMINISTRADOR', 'SUPERADMIN'), 
    conductoresController.getConductorById
);

// Crear nuevo conductor (ADMIN y SUPERADMIN)
router.post('/', 
    allowRoles('ADMINISTRADOR', 'SUPERADMIN'), 
    conductoresController.crearConductor
);

// Actualizar conductor (ADMIN y SUPERADMIN)
router.put('/:id', 
    allowRoles('ADMINISTRADOR', 'SUPERADMIN'), 
    conductoresController.actualizarConductor
);

// Cambiar estado de conductor (ADMIN y SUPERADMIN)
router.patch('/:id/estado', 
    allowRoles('ADMINISTRADOR', 'SUPERADMIN'), 
    conductoresController.cambiarEstadoConductor
);

// Eliminar conductor (solo SUPERADMIN)
router.delete('/:id', 
    allowRoles('SUPERADMIN'), 
    conductoresController.eliminarConductor
);

module.exports = router;