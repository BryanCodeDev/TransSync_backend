// src/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminControllers");
const authMiddleware = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");

// Middleware de autenticación para todas las rutas admin
router.use(authMiddleware);

// Solo SUPERADMIN puede acceder a estas rutas
router.get("/solo-superadmin", allowRoles("SUPERADMIN"), (req, res) => {
    res.json({ message: "Acceso autorizado para SUPERADMIN" });
});

// Listar administradores (SUPERADMIN y ADMINISTRADOR pueden ver)
router.get("/listar-administradores", 
    allowRoles("SUPERADMIN", "ADMINISTRADOR"), 
    adminController.listarAdministradores
);

// Asignar rol (solo SUPERADMIN)
router.put("/asignar-rol", 
    allowRoles("SUPERADMIN"), 
    adminController.asignarRol
);

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

module.exports = router;