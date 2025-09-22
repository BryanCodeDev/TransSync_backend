// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'NO_TOKEN',
                message: 'Token de autenticación no proporcionado.'
            }
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Asegurar que el token contenga la información necesaria
        if (!decoded.id || !decoded.role || !decoded.idEmpresa) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Token inválido - información de usuario incompleta.'
                }
            });
        }

        // Normalizar el campo 'role' a 'rol' para consistencia
        req.user = {
            id: decoded.id,
            role: decoded.role || decoded.rol,
            rol: decoded.role || decoded.rol, // Mantener ambos para compatibilidad
            idEmpresa: decoded.idEmpresa,
            empresa: decoded.empresa
        };

        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Token inválido o expirado.'
            }
        });
    }
};

module.exports = authMiddleware;
