// src/routes/index.js

const express = require("express");
const router = express.Router();


const authRoutes = require("./authRoutes");
const adminRoutes = require('./adminRoutes');

// Todas las rutas de autenticación estarán bajo /auth
// Ejemplo: /api/auth/register
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;