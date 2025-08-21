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
app.use("/api", routes);

// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});


