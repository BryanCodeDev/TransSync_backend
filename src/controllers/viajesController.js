const Viajes = require('../models/viajesModel');

exports.getViajes = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1;
    const viajes = await Viajes.getAll(idEmpresa);

    res.json({
      success: true,
      data: viajes,
      total: viajes.length
    });
  } catch (err) {
    console.error("Error al obtener viajes:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Error del servidor al obtener viajes."
      }
    });
  }
};

exports.getViaje = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1;
    const viaje = await Viajes.getById(req.params.id, idEmpresa);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        error: {
          code: "TRIP_NOT_FOUND",
          message: 'Viaje no encontrado o no pertenece a la empresa.'
        }
      });
    }
    res.json({
      success: true,
      data: viaje
    });
  } catch (err) {
    console.error("Error al obtener viaje:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Error del servidor al obtener viaje."
      }
    });
  }
};

exports.createViaje = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1;
    const nuevo = await Viajes.create(req.body, idEmpresa);
    res.status(201).json({
      success: true,
      message: "Viaje creado exitosamente.",
      data: nuevo
    });
  } catch (err) {
    console.error("Error al crear viaje:", err);
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";

    if (err.message.includes('requeridos')) {
      statusCode = 400;
      errorCode = "VALIDATION_ERROR";
    } else if (err.message.includes('pertenece a la empresa')) {
      statusCode = 403;
      errorCode = "ACCESS_DENIED";
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: err.message
      }
    });
  }
};

exports.updateViaje = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1;
    const actualizado = await Viajes.update(req.params.id, req.body, idEmpresa);
    res.json({
      success: true,
      message: "Viaje actualizado exitosamente.",
      data: actualizado
    });
  } catch (err) {
    console.error("Error al actualizar viaje:", err);
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";

    if (err.message.includes('requeridos')) {
      statusCode = 400;
      errorCode = "VALIDATION_ERROR";
    } else if (err.message.includes('pertenece a la empresa')) {
      statusCode = 403;
      errorCode = "ACCESS_DENIED";
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: err.message
      }
    });
  }
};

exports.deleteViaje = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1;
    const result = await Viajes.delete(req.params.id, idEmpresa);
    res.json({
      success: true,
      message: "Viaje eliminado exitosamente.",
      data: result
    });
  } catch (err) {
    console.error("Error al eliminar viaje:", err);
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";

    if (err.message.includes('pertenece a la empresa')) {
      statusCode = 403;
      errorCode = "ACCESS_DENIED";
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: err.message
      }
    });
  }
};
