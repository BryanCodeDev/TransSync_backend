// src/controllers/rutasController.js
const pool = require('../config/db');

// Lista simple de rutas para SELECT
const getRutasSelect = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1;

    const [rutas] = await pool.query(`
      SELECT idRuta, nomRuta
      FROM Rutas
      WHERE idEmpresa = ?
      ORDER BY nomRuta ASC
    `, [idEmpresa]);

    const formateadas = rutas.map(r => ({
      idRuta: r.idRuta,
      nomRuta: r.nomRuta
    }));

    res.json({
      success: true,
      data: formateadas,
      total: formateadas.length
    });
  } catch (error) {
    console.error("Error al obtener rutas:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Error del servidor al obtener rutas."
      }
    });
  }
};

const getRutas = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1;

    const [rutas] = await pool.query(
      `SELECT * FROM Rutas WHERE idEmpresa = ? ORDER BY nomRuta ASC`,
      [idEmpresa]
    );

    res.json({
      success: true,
      data: rutas,
      total: rutas.length
    });
  } catch (error) {
    console.error("Error al obtener rutas:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Error del servidor al obtener rutas."
      }
    });
  }
};

const crearRuta = async (req, res) => {
  const { nomRuta, oriRuta, desRuta } = req.body;
  const idEmpresa = req.user?.idEmpresa || 1;

  // Validaciones básicas
  if (!nomRuta || !oriRuta || !desRuta) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Todos los campos son requeridos",
        details: {
          nomRuta: !nomRuta ? "Nombre de ruta es requerido" : null,
          oriRuta: !oriRuta ? "Origen es requerido" : null,
          desRuta: !desRuta ? "Destino es requerido" : null
        }
      }
    });
  }

  try {
    // Verificar que no exista una ruta con el mismo nombre en la empresa
    const [existingRoute] = await pool.query(
      "SELECT idRuta FROM Rutas WHERE nomRuta = ? AND idEmpresa = ?",
      [nomRuta.trim(), idEmpresa]
    );

    if (existingRoute.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: "ROUTE_NAME_EXISTS",
          message: "Ya existe una ruta con ese nombre en la empresa."
        }
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Rutas (nomRuta, oriRuta, desRuta, idEmpresa) VALUES (?, ?, ?, ?)`,
      [nomRuta.trim(), oriRuta.trim(), desRuta.trim(), idEmpresa]
    );

    res.status(201).json({
      success: true,
      message: "Ruta creada exitosamente.",
      data: {
        idRuta: result.insertId,
        nomRuta: nomRuta.trim(),
        oriRuta: oriRuta.trim(),
        desRuta: desRuta.trim(),
        idEmpresa: idEmpresa
      }
    });
  } catch (error) {
    console.error("Error al crear ruta:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Error del servidor al crear ruta."
      }
    });
  }
};

const actualizarRuta = async (req, res) => {
  const { id } = req.params;
  const { nomRuta, oriRuta, desRuta } = req.body;
  const idEmpresa = req.user?.idEmpresa || 1;

  // Validaciones básicas
  if (!nomRuta || !oriRuta || !desRuta) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Todos los campos son requeridos",
        details: {
          nomRuta: !nomRuta ? "Nombre de ruta es requerido" : null,
          oriRuta: !oriRuta ? "Origen es requerido" : null,
          desRuta: !desRuta ? "Destino es requerido" : null
        }
      }
    });
  }

  try {
    // Verificar que la ruta existe y pertenece a la empresa
    const [existingRoute] = await pool.query(
      "SELECT idRuta FROM Rutas WHERE idRuta = ? AND idEmpresa = ?",
      [id, idEmpresa]
    );

    if (existingRoute.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ROUTE_NOT_FOUND",
          message: "Ruta no encontrada o no pertenece a la empresa."
        }
      });
    }

    // Verificar que no exista otra ruta con el mismo nombre en la empresa
    const [duplicateRoute] = await pool.query(
      "SELECT idRuta FROM Rutas WHERE nomRuta = ? AND idEmpresa = ? AND idRuta != ?",
      [nomRuta.trim(), idEmpresa, id]
    );

    if (duplicateRoute.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: "ROUTE_NAME_EXISTS",
          message: "Ya existe otra ruta con ese nombre en la empresa."
        }
      });
    }

    await pool.query(
      `UPDATE Rutas SET nomRuta = ?, oriRuta = ?, desRuta = ? WHERE idRuta = ?`,
      [nomRuta.trim(), oriRuta.trim(), desRuta.trim(), id]
    );

    res.json({
      success: true,
      message: "Ruta actualizada exitosamente.",
      data: {
        idRuta: parseInt(id),
        nomRuta: nomRuta.trim(),
        oriRuta: oriRuta.trim(),
        desRuta: desRuta.trim()
      }
    });
  } catch (error) {
    console.error("Error al actualizar ruta:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Error del servidor al actualizar ruta."
      }
    });
  }
};

const eliminarRuta = async (req, res) => {
  const { id } = req.params;
  const idEmpresa = req.user?.idEmpresa || 1;

  try {
    // Verificar que la ruta existe y pertenece a la empresa
    const [existingRoute] = await pool.query(
      "SELECT idRuta FROM Rutas WHERE idRuta = ? AND idEmpresa = ?",
      [id, idEmpresa]
    );

    if (existingRoute.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ROUTE_NOT_FOUND",
          message: "Ruta no encontrada o no pertenece a la empresa."
        }
      });
    }

    // Verificar que la ruta no tenga viajes activos
    const [viajesActivos] = await pool.query(
      "SELECT COUNT(*) as count FROM Viajes WHERE idRuta = ? AND estViaje IN ('PROGRAMADO', 'EN_CURSO')",
      [id]
    );

    if (viajesActivos[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "ROUTE_HAS_ACTIVE_TRIPS",
          message: "No se puede eliminar la ruta porque tiene viajes activos."
        }
      });
    }

    await pool.query(`DELETE FROM Rutas WHERE idRuta = ?`, [id]);

    res.json({
      success: true,
      message: "Ruta eliminada exitosamente.",
      data: {
        idRuta: parseInt(id)
      }
    });
  } catch (error) {
    console.error("Error al eliminar ruta:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Error del servidor al eliminar ruta."
      }
    });
  }
};

const getParadasRuta = async (req, res) => {
  try {
    const { id } = req.params;
    const idEmpresa = req.user?.idEmpresa || 1;

    // Verificar que la ruta existe y pertenece a la empresa
    const [ruta] = await pool.query('SELECT * FROM Rutas WHERE idRuta = ? AND idEmpresa = ?', [id, idEmpresa]);
    if (ruta.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ROUTE_NOT_FOUND",
          message: 'Ruta no encontrada o no pertenece a la empresa.'
        }
      });
    }

    // Por ahora retornar array vacío ya que no hay tabla de paradas
    // En el futuro se puede implementar con coordenadas de la ruta
    res.json({
      success: true,
      data: [],
      message: "Funcionalidad de paradas pendiente de implementar"
    });

  } catch (error) {
    console.error('Error al obtener paradas de ruta:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: 'Error del servidor al obtener paradas de ruta.'
      }
    });
  }
};

module.exports = {
  getRutasSelect,
  getRutas,
  crearRuta,
  actualizarRuta,
  eliminarRuta,
  getParadasRuta
};
