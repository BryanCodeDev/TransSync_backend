// server.js
const express = require("express");
const cors = require("cors");
require('dotenv').config();

const routes = require("./src/routes"); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas ---
app.use("/api", routes); // Esto crea el prefijo /api

// --- Manejo de errores 404 global ---
app.use((req, res) => {
    res.status(404).json({
        status: 'ERROR',
        message: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});