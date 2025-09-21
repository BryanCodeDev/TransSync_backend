// src/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminControllers");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

// Aplicar seguridad a todas las rutas de este archivo
router.use(authMiddleware);

// GET /api/admin/users - Ruta para listar usuarios (le cambiamos el nombre para que sea más claro)
router.get(
    "/users", 
    allowRoles("SUPERADMIN"), 
    adminController.listarConductoresYPendientes
);

// DELETE /api/admin/users/:idUsuario - ¡NUEVA RUTA!
router.delete(
    "/users/:idUsuario",
    allowRoles("SUPERADMIN"),
    adminController.eliminarUsuario
);

// PUT /api/admin/users/:idUsuario/role - ¡NUEVA RUTA!
router.put(
    "/users/:idUsuario/role",
    allowRoles("SUPERADMIN"),
    adminController.actualizarRolUsuario
);

module.exports = router;