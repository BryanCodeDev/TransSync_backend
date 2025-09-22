// src/utilidades/errorHandler.js

/**
 * Sistema unificado de manejo de errores para TranSync Backend
 * Proporciona clases de error personalizadas y funciones de manejo centralizadas
 */

// Clases de error personalizadas
class AppError extends Error {
    constructor(message, statusCode, errorCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

class NetworkError extends AppError {
    constructor(message, details = null) {
        super(message, 503, 'NETWORK_ERROR', details);
    }
}

class ConnectionTimeoutError extends AppError {
    constructor(message, details = null) {
        super(message, 408, 'CONNECTION_TIMEOUT', details);
    }
}

class AuthTokenExpiredError extends AppError {
    constructor(message = 'Token de autenticación expirado', details = null) {
        super(message, 401, 'AUTH_TOKEN_EXPIRED', details);
    }
}

class ResourceNotFoundError extends AppError {
    constructor(resource = 'Recurso', details = null) {
        super(`${resource} no encontrado`, 404, 'RESOURCE_NOT_FOUND', details);
    }
}

class SystemError extends AppError {
    constructor(message, details = null) {
        super(message, 500, 'SYSTEM_ERROR', details);
    }
}

// Función para manejar errores de forma centralizada
const handleError = (error, req, res, next) => {
    let statusCode = 500;
    let errorCode = 'SYSTEM_ERROR';
    let message = 'Error interno del servidor';
    let details = null;

    // Log del error para debugging
    console.error('Error capturado:', {
        message: error.message,
        stack: error.stack,
        url: req?.originalUrl,
        method: req?.method,
        ip: req?.ip,
        timestamp: new Date().toISOString()
    });

    // Determinar el tipo de error y configurar la respuesta apropiada
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        errorCode = error.errorCode;
        message = error.message;
        details = error.details;
    } else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorCode = 'INVALID_TOKEN';
        message = 'Token de autenticación inválido';
    } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = 'AUTH_TOKEN_EXPIRED';
        message = 'Token de autenticación expirado';
    } else if (error.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = 'Error de validación';
        details = error.details;
    } else if (error.code === 'ECONNREFUSED') {
        statusCode = 503;
        errorCode = 'DATABASE_CONNECTION_ERROR';
        message = 'Error de conexión a la base de datos';
    } else if (error.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        errorCode = 'DUPLICATE_ENTRY';
        message = 'Registro duplicado';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
        statusCode = 503;
        errorCode = 'DATABASE_SCHEMA_ERROR';
        message = 'Error en el esquema de la base de datos';
    }

    // En desarrollo, incluir más detalles del error
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
        success: false,
        error: {
            code: errorCode,
            message: message,
            ...(details && { details }),
            ...(isDevelopment && {
                originalMessage: error.message,
                stack: error.stack
            })
        },
        timestamp: new Date().toISOString()
    };

    // Enviar respuesta de error
    res.status(statusCode).json(errorResponse);
};

// Middleware para capturar errores 404
const notFoundHandler = (req, res, next) => {
    const error = new ResourceNotFoundError(`Ruta ${req.originalUrl} no encontrada`);
    res.status(404);
    handleError(error, req, res, next);
};

// Función para crear errores personalizados de forma rápida
const createError = (type, message, details = null) => {
    const errorMap = {
        validation: (msg, det) => new ValidationError(msg, det),
        network: (msg, det) => new NetworkError(msg, det),
        timeout: (msg, det) => new ConnectionTimeoutError(msg, det),
        auth: (msg, det) => new AuthTokenExpiredError(msg, det),
        notFound: (msg, det) => new ResourceNotFoundError(msg, det),
        system: (msg, det) => new SystemError(msg, det)
    };

    if (errorMap[type]) {
        return errorMap[type](message, details);
    }

    return new AppError(message, 500, 'UNKNOWN_ERROR', details);
};

// Función para validar datos y lanzar errores de validación
const validateRequired = (data, requiredFields) => {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new ValidationError(
            `Campos requeridos faltantes: ${missingFields.join(', ')}`,
            { missingFields }
        );
    }
};

// Función para validar formato de email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Formato de email inválido');
    }
};

// Función para validar contraseña segura
const validatePassword = (password) => {
    if (password.length < 6) {
        throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }
};

// Función para validar teléfono
const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        throw new ValidationError('Formato de teléfono inválido');
    }
};

// Función para validar nombre (solo letras y espacios)
const validateName = (name, fieldName = 'Nombre') => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!nameRegex.test(name.trim())) {
        throw new ValidationError(`${fieldName} solo puede contener letras y espacios`);
    }
};

module.exports = {
    AppError,
    ValidationError,
    NetworkError,
    ConnectionTimeoutError,
    AuthTokenExpiredError,
    ResourceNotFoundError,
    SystemError,
    handleError,
    notFoundHandler,
    createError,
    validateRequired,
    validateEmail,
    validatePassword,
    validatePhone,
    validateName
};