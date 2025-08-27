// src/routes/conductoresRoutes.js

const express = require('express');
const router = express.Router();
const conductoresController = require('../controllers/conductoresController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// 🔐 Middleware de autenticación para TODAS las rutas
router.use(authMiddleware);

// ⚠️ Importante: las rutas específicas SIEMPRE van antes de las genéricas (/:id)

// 👉 Obtener conductores disponibles para asignación (ADMINISTRADOR, SUPERADMIN)
router.get(
  '/disponibles',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.getConductoresDisponibles
);

// 👉 Obtener estadísticas de conductores (ADMINISTRADOR, SUPERADMIN)
router.get(
  '/estadisticas',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.getEstadisticasConductores
);

// 👉 Verificar vencimiento de licencias (ADMINISTRADOR, SUPERADMIN)
router.get(
  '/licencias/vencimiento',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.verificarVencimientoLicencias
);

// 👉 Obtener todos los conductores (ADMINISTRADOR, SUPERADMIN)
router.get(
  '/',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.getConductores
);

// 👉 Crear nuevo conductor (ADMINISTRADOR, SUPERADMIN)
router.post(
  '/',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.crearConductor
);

// ---------- Rutas genéricas con parámetro (:id) ----------

// 👉 Obtener conductor por ID (ADMINISTRADOR, SUPERADMIN)
router.get(
  '/:id',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.getConductorById
);

// 👉 Actualizar conductor (ADMINISTRADOR, SUPERADMIN)
router.put(
  '/:id',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.actualizarConductor
);

// 👉 Eliminar conductor (SOLO SUPERADMIN)
router.delete(
  '/:id',
  allowRoles('SUPERADMIN'),
  conductoresController.eliminarConductor
);

// 👉 Cambiar estado de conductor (ADMINISTRADOR, SUPERADMIN)
router.patch(
  '/:id/estado',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.cambiarEstadoConductor
);

// 👉 Asignar vehículo a conductor (ADMINISTRADOR, SUPERADMIN)
router.patch(
  '/:id/asignar-vehiculo',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.asignarVehiculoConductor
);

// 👉 Desasignar vehículo de conductor (ADMINISTRADOR, SUPERADMIN)
router.patch(
  '/:id/desasignar-vehiculo',
  allowRoles('ADMINISTRADOR', 'SUPERADMIN'),
  conductoresController.desasignarVehiculoConductor
);

module.exports = router;
