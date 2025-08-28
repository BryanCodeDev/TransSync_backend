// src/controllers/conductoresController.js
const pool = require('../config/db');

// Obtener todos los conductores
const getConductores = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Conductores`);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener conductores:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Obtener conductor por ID
const getConductorById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Conductores WHERE idConductor = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Conductor no encontrado.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener conductor:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Crear nuevo conductor
const crearConductor = async (req, res) => {
  const { nomConductor, apeConductor, licencia, telefono, idEmpresa } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Conductores (nomConductor, apeConductor, licencia, telefono, idEmpresa) 
       VALUES (?, ?, ?, ?, ?)`,
      [nomConductor, apeConductor, licencia, telefono, idEmpresa]
    );

    res.status(201).json({
      message: 'Conductor creado correctamente.',
      idConductor: result.insertId
    });
  } catch (error) {
    console.error('Error al crear conductor:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Actualizar conductor
const actualizarConductor = async (req, res) => {
  const { id } = req.params;
  const { nomConductor, apeConductor, licencia, telefono } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE Conductores 
       SET nomConductor = ?, apeConductor = ?, licencia = ?, telefono = ?
       WHERE idConductor = ?`,
      [nomConductor, apeConductor, licencia, telefono, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conductor no encontrado.' });
    }

    res.json({ message: 'Conductor actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar conductor:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Eliminar conductor
const eliminarConductor = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM Conductores WHERE idConductor = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conductor no encontrado.' });
    }

    res.json({ message: 'Conductor eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar conductor:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Cambiar estado del conductor (activo/inactivo)
const cambiarEstadoConductor = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE Conductores SET estado = ? WHERE idConductor = ?`,
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conductor no encontrado.' });
    }

    res.json({ message: 'Estado del conductor actualizado correctamente.' });
  } catch (error) {
    console.error('Error al cambiar estado del conductor:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Asignar vehículo a conductor
const asignarVehiculoConductor = async (req, res) => {
  const { id } = req.params;
  const { idVehiculo } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE Conductores SET idVehiculo = ? WHERE idConductor = ?`,
      [idVehiculo, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conductor no encontrado.' });
    }

    res.json({ message: 'Vehículo asignado correctamente.' });
  } catch (error) {
    console.error('Error al asignar vehículo:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Desasignar vehículo de conductor
const desasignarVehiculoConductor = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `UPDATE Conductores SET idVehiculo = NULL WHERE idConductor = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conductor no encontrado.' });
    }

    res.json({ message: 'Vehículo desasignado correctamente.' });
  } catch (error) {
    console.error('Error al desasignar vehículo:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Obtener conductores para SELECT
const getConductoresSelect = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        idConductor, 
        CONCAT(nomConductor, ' ', apeConductor) AS nombreCompleto
      FROM Conductores
      ORDER BY nomConductor, apeConductor
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener conductores para select:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// ==================== NUEVAS FUNCIONES ====================

// Obtener conductores disponibles (ejemplo: sin vehículo asignado)
const getConductoresDisponibles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM Conductores WHERE idVehiculo IS NULL
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener conductores disponibles:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Obtener estadísticas de conductores (ejemplo: activos e inactivos)
const getEstadisticasConductores = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT estado, COUNT(*) AS total
      FROM Conductores
      GROUP BY estado
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas de conductores:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// Verificar vencimiento de licencias (ejemplo: fecha anterior a hoy)
const verificarVencimientoLicencias = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM Conductores 
      WHERE licencia < CURDATE()
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al verificar licencias:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

// ==================== EXPORTS ====================

module.exports = {
  getConductores,
  getConductorById,
  crearConductor,
  actualizarConductor,
  eliminarConductor,
  cambiarEstadoConductor,
  asignarVehiculoConductor,
  desasignarVehiculoConductor,
  getConductoresSelect,
  getConductoresDisponibles,
  getEstadisticasConductores,
  verificarVencimientoLicencias
};
