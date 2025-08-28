// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authController.verifyAccount);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rutas protegidas
router.get('/profile', authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user,
        message: 'Perfil obtenido correctamente'
    });
});

// Verificar token
router.get('/verify-token', authMiddleware, (req, res) => {
    res.json({
        success: true,
        valid: true,
        user: req.user
    });
});

module.exports = router;