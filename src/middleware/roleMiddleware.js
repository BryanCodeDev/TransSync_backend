// src/middleware/roleMiddleware.js

const allowRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Usuario no autenticado.'
                }
            });
        }

        // Usar 'rol' en lugar de 'role' para consistencia con la base de datos
        const userRole = req.user.rol || req.user.role;

        if (!userRole) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_USER',
                    message: 'Información de rol del usuario no encontrada.'
                }
            });
        }

        // Verificar si el rol del usuario está permitido
        if (!rolesPermitidos.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
                }
            });
        }

        next();
    };
};

module.exports = allowRoles;
