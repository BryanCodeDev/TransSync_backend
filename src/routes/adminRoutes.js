// src/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminControllers");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

// Middleware de autenticación para todas las rutas admin
router.use(authMiddleware);

// ========================================
// RUTAS ESPECÍFICAS (van ANTES que las parametrizadas)
// ========================================

// Solo SUPERADMIN puede acceder a esta ruta
router.get("/solo-superadmin", allowRoles("SUPERADMIN"), (req, res) => {
    res.json({ 
        message: "Acceso autorizado para SUPERADMIN",
        timestamp: new Date().toISOString(),
        user: req.user
    });
});

// Listar administradores (SUPERADMIN y ADMINISTRADOR pueden ver)
router.get("/listar-administradores", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    adminController.listarAdministradores
);

// ========================================
// RUTAS DE GESTIÓN DE ROLES Y USUARIOS
// ========================================

// Asignar rol (solo SUPERADMIN)
router.put("/asignar-rol", 
    allowRoles("SUPERADMIN"), 
    adminController.asignarRol
);

// ========================================
// RUTAS PARAMETRIZADAS (van DESPUÉS de las específicas)
// ========================================

// Editar administrador (SUPERADMIN y el mismo ADMINISTRADOR)
router.put("/editar-administrador/:idUsuario", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    adminController.editarAdministrador
);

// Eliminar administrador (solo SUPERADMIN)
router.delete("/eliminar-administrador/:idUsuario", 
    allowRoles("SUPERADMIN"), 
    adminController.eliminarAdministrador
);

// Obtener administrador por ID (opcional - si necesitas esta funcionalidad)
router.get("/administrador/:idUsuario", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    (req, res) => {
        // Implementar si necesitas obtener un admin específico
        res.json({ message: "Función por implementar" });
    }
);

// ========================================
// MANEJO DE ERRORES 404 PARA RUTAS ADMIN
// ========================================
router.use((req, res) => {
    res.status(404).json({
        status: 'ERROR',
        message: 'Ruta de administración no encontrada',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            'GET /api/admin/solo-superadmin',
            'GET /api/admin/listar-administradores',
            'PUT /api/admin/asignar-rol',
            'PUT /api/admin/editar-administrador/:id',
            'DELETE /api/admin/eliminar-administrador/:id'
        ]
    });
});

module.exports = router;