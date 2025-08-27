const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Obtener todos los viajes
router.get("/", async (req, res) => {
  try {
    console.log("📌 Entrando a GET /api/viajes");  // <-- para debug
    const [rows] = await pool.query("SELECT * FROM Viajes");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error en GET /api/viajes:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Crear un viaje
router.post("/", async (req, res) => {
  try {
    console.log("📌 Datos recibidos en POST /api/viajes:", req.body);  // <-- debug
    const { idVehiculo, idConductor, fecha, horaSalida, horaLlegada, origen, destino } = req.body;

    const [result] = await pool.query(
      "INSERT INTO Viajes (idVehiculo, idConductor, fecha, horaSalida, horaLlegada, origen, destino) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [idVehiculo, idConductor, fecha, horaSalida, horaLlegada, origen, destino]
    );

    res.json({ idViaje: result.insertId, ...req.body });
  } catch (error) {
    console.error("❌ Error en POST /api/viajes:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

module.exports = router;
