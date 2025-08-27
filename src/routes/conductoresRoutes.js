// src/routes/conductoresRoutes.js
const express = require('express');
const router = express.Router();
const conductoresController = require('../controllers/conductoresController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// ✅ Todas las rutas requieren login
router.use(authMiddleware);

// === Utils (Select) ===
router.get('/utils/select', conductoresController.getConductoresSelect);

// Obtener todos los conductores
router.get('/', allowRoles('ADMINISTRADOR', 'SUPERADMIN'), conductoresController.getConductores);

// Obtener un conductor por ID
router.get('/:id', allowRoles('ADMINISTRADOR', 'SUPERADMIN'), conductoresController.getConductorById);

// Crear un nuevo conductor
router.post('/', allowRoles('ADMINISTRADOR', 'SUPERADMIN'), conductoresController.crearConductor);

// Actualizar un conductor por ID
router.put('/:id', allowRoles('ADMINISTRADOR', 'SUPERADMIN'), conductoresController.actualizarConductor);

// Eliminar un conductor por ID
router.delete('/:id', allowRoles('SUPERADMIN'), conductoresController.eliminarConductor);

// Cambiar estado del conductor
router.patch('/:id/estado', allowRoles('ADMINISTRADOR', 'SUPERADMIN'), conductoresController.cambiarEstadoConductor);

// Asignar vehículo a un conductor
router.patch('/:id/asignarVehiculo', allowRoles('ADMINISTRADOR', 'SUPERADMIN'), conductoresController.asignarVehiculoConductor);

// Desasignar vehículo de un conductor
router.patch('/:id/desasignarVehiculo', allowRoles('ADMINISTRADOR', 'SUPERADMIN'), conductoresController.desasignarVehiculoConductor);

module.exports = router;
