// src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminControllers');

// Solo accesible para SUPERADMIN
router.get('/solo-superadmin', authMiddleware, allowRoles('SUPERADMIN'), (req, res) => {
    res.json({ message: `Hola SUPERADMIN ${req.user.id}, Bienvenido Al Panel Privado.` });
});

// Endpoint para listar a los Usuarios con rol de ADMINISTRADOR o PENDIENTE para posterior asignacion.
router.get('/listar-administradores', authMiddleware, allowRoles('SUPERADMIN'),
adminController.listarAdministradores
);

// Endpoint para asignar Roles.
router.put('/asignar-rol', authMiddleware, allowRoles('SUPERADMIN'), adminController.asignarRol
);

// Endpoint para editar la informacion de los administradores.
router.put('/editar-administrador/:idUsuario', authMiddleware, allowRoles('SUPERADMIN'), adminController.editarAdministrador
);

// Endpoint para eliminar Administradores.
router.delete('/eliminar-administrador/:idUsuario', authMiddleware, allowRoles('SUPERADMIN'), adminController.eliminarAdministrador
);

module.exports = router;
