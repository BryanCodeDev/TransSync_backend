// src/controllers/conductoresController.js
const pool = require("../config/db");
const bcrypt = require('bcryptjs');

// LEER (GET /)
const listarConductores = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1; // Fallback a empresa 1 si no hay usuario
    // Obtenemos los filtros desde los query params de la URL
    const { estConductor, tipLicConductor, conVehiculo } = req.query;

        let query = `
            SELECT
                c.idConductor, c.tipLicConductor, c.fecVenLicConductor, c.estConductor,
                u.idUsuario, u.nomUsuario, u.apeUsuario, u.email,
                u.numDocUsuario, u.telUsuario, u.estActivo,
                v.plaVehiculo
            FROM Conductores c
            JOIN Usuarios u ON c.idUsuario = u.idUsuario
            LEFT JOIN Vehiculos v ON c.idConductor = v.idConductorAsignado
            WHERE c.idEmpresa = ?
        `;

        const params = [idEmpresa];

        // Construimos la consulta dinámicamente si llegan filtros
        if (estConductor) {
            query += ` AND c.estConductor = ?`;
            params.push(estConductor);
        }
        if (tipLicConductor) {
            query += ` AND c.tipLicConductor = ?`;
            params.push(tipLicConductor);
        }
        if (conVehiculo === 'true') {
            query += ` AND v.plaVehiculo IS NOT NULL`;
        } else if (conVehiculo === 'false') {
            query += ` AND v.plaVehiculo IS NULL`;
        }

        query += ` ORDER BY u.nomUsuario ASC;`;

        const [conductores] = await pool.query(query, params);

        // Formatear respuesta
        const conductoresFormateados = conductores.map(conductor => ({
            idConductor: conductor.idConductor,
            idUsuario: conductor.idUsuario,
            nombre: `${conductor.nomUsuario} ${conductor.apeUsuario}`.trim(),
            email: conductor.email,
            numDocUsuario: conductor.numDocUsuario,
            telUsuario: conductor.telUsuario,
            tipLicConductor: conductor.tipLicConductor,
            fecVenLicConductor: conductor.fecVenLicConductor,
            estConductor: conductor.estConductor,
            estActivo: conductor.estActivo,
            plaVehiculo: conductor.plaVehiculo
        }));

        res.json({
            success: true,
            data: conductoresFormateados,
            total: conductoresFormateados.length
        });

    } catch (error) {
        console.error("Error al listar conductores:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Error del servidor al listar conductores."
            }
        });
    }
};

// CREAR (POST /)
const crearConductor = async (req, res) => {
    const { nomUsuario, apeUsuario, email, numDocUsuario, telUsuario, tipLicConductor, fecVenLicConductor } = req.body;
    const idEmpresa = req.user?.idEmpresa || 1;
    const connection = await pool.getConnection();

    // Validaciones básicas
    if (!nomUsuario || !apeUsuario || !email || !numDocUsuario || !telUsuario || !tipLicConductor || !fecVenLicConductor) {
        return res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Todos los campos son requeridos",
                details: {
                    nomUsuario: !nomUsuario ? "Nombre es requerido" : null,
                    apeUsuario: !apeUsuario ? "Apellido es requerido" : null,
                    email: !email ? "Email es requerido" : null,
                    numDocUsuario: !numDocUsuario ? "Documento es requerido" : null,
                    telUsuario: !telUsuario ? "Teléfono es requerido" : null,
                    tipLicConductor: !tipLicConductor ? "Tipo de licencia es requerido" : null,
                    fecVenLicConductor: !fecVenLicConductor ? "Fecha de vencimiento es requerida" : null
                }
            }
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: {
                code: "INVALID_EMAIL",
                message: "Formato de email inválido"
            }
        });
    }

    // Validar tipo de licencia
    const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
    if (!validLicenses.includes(tipLicConductor)) {
        return res.status(400).json({
            success: false,
            error: {
                code: "INVALID_LICENSE",
                message: "Tipo de licencia inválido",
                details: `Debe ser uno de: ${validLicenses.join(', ')}`
            }
        });
    }

    try {
        await connection.beginTransaction();
        const [rol] = await connection.query("SELECT idRol FROM Roles WHERE nomRol = 'CONDUCTOR'");
        if (rol.length === 0) {
            await connection.rollback();
            return res.status(500).json({
                success: false,
                error: {
                    code: "ROLE_NOT_FOUND",
                    message: "Rol CONDUCTOR no encontrado"
                }
            });
        }

        const passwordHash = await bcrypt.hash('Password123!', 10); // Contraseña por defecto

        const [userResult] = await connection.query(
            `INSERT INTO Usuarios (nomUsuario, apeUsuario, email, numDocUsuario, telUsuario, passwordHash, idRol, idEmpresa, estActivo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [nomUsuario.trim(), apeUsuario.trim(), email, numDocUsuario, telUsuario, passwordHash, rol[0].idRol, idEmpresa]
        );
        const idUsuario = userResult.insertId;

        const [driverResult] = await connection.query(
            `INSERT INTO Conductores (idUsuario, tipLicConductor, fecVenLicConductor, idEmpresa, estConductor)
             VALUES (?, ?, ?, ?, 'ACTIVO')`,
            [idUsuario, tipLicConductor, fecVenLicConductor, idEmpresa]
        );

        await connection.commit();

        // Notificar vía WebSocket después de crear el conductor
        if (global.realTimeService) {
            const notification = {
                type: 'conductor_nuevo',
                title: '👨‍💼 Nuevo Conductor Registrado',
                message: `Se ha registrado el conductor ${nomUsuario} ${apeUsuario}`,
                data: {
                    idConductor: driverResult.insertId,
                    nomConductor: nomUsuario,
                    apeConductor: apeUsuario,
                    idEmpresa: idEmpresa,
                    tipLicConductor: tipLicConductor,
                    fecVenLicConductor: fecVenLicConductor,
                    estConductor: 'ACTIVO'
                },
                priority: 'medium'
            };

            global.realTimeService.sendToEmpresa(idEmpresa, 'conductor:created', notification);
        }

        res.status(201).json({
            success: true,
            message: "Conductor creado exitosamente.",
            data: {
                idConductor: driverResult.insertId,
                idUsuario: idUsuario,
                nomUsuario: nomUsuario.trim(),
                apeUsuario: apeUsuario.trim(),
                email: email
            }
        });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: {
                    code: "DUPLICATE_ENTRY",
                    message: "El correo o documento ya está registrado."
                }
            });
        }
        console.error("Error al crear conductor:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Error al crear conductor."
            }
        });
    } finally {
        connection.release();
    }
};

// ACTUALIZAR (PUT /:idConductor)
const actualizarConductor = async (req, res) => {
    const { idConductor } = req.params;
    const { nomUsuario, apeUsuario, email, numDocUsuario, telUsuario, tipLicConductor, fecVenLicConductor, estConductor } = req.body;
    const connection = await pool.getConnection();

    // Validaciones básicas
    if (!nomUsuario || !apeUsuario || !email || !telUsuario || !tipLicConductor || !fecVenLicConductor || !estConductor) {
        return res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Todos los campos son requeridos",
                details: {
                    nomUsuario: !nomUsuario ? "Nombre es requerido" : null,
                    apeUsuario: !apeUsuario ? "Apellido es requerido" : null,
                    email: !email ? "Email es requerido" : null,
                    telUsuario: !telUsuario ? "Teléfono es requerido" : null,
                    tipLicConductor: !tipLicConductor ? "Tipo de licencia es requerido" : null,
                    fecVenLicConductor: !fecVenLicConductor ? "Fecha de vencimiento es requerida" : null,
                    estConductor: !estConductor ? "Estado es requerido" : null
                }
            }
        });
    }

    // Validar tipo de licencia
    const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
    if (!validLicenses.includes(tipLicConductor)) {
        return res.status(400).json({
            success: false,
            error: {
                code: "INVALID_LICENSE",
                message: "Tipo de licencia inválido",
                details: `Debe ser uno de: ${validLicenses.join(', ')}`
            }
        });
    }

    // Validar estado
    const validStates = ['ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES'];
    if (!validStates.includes(estConductor)) {
        return res.status(400).json({
            success: false,
            error: {
                code: "INVALID_STATE",
                message: "Estado de conductor inválido",
                details: `Debe ser uno de: ${validStates.join(', ')}`
            }
        });
    }

    try {
        await connection.beginTransaction();
        const [driver] = await connection.query("SELECT idUsuario FROM Conductores WHERE idConductor = ?", [idConductor]);
        if (driver.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: {
                    code: "CONDUCTOR_NOT_FOUND",
                    message: "Conductor no encontrado"
                }
            });
        }

        await connection.query(
            `UPDATE Usuarios SET nomUsuario = ?, apeUsuario = ?, email = ?, numDocUsuario = ?, telUsuario = ?
             WHERE idUsuario = ?`,
            [nomUsuario.trim(), apeUsuario.trim(), email, numDocUsuario, telUsuario, driver[0].idUsuario]
        );

        await connection.query(
            `UPDATE Conductores SET tipLicConductor = ?, fecVenLicConductor = ?, estConductor = ?
             WHERE idConductor = ?`,
            [tipLicConductor, fecVenLicConductor, estConductor, idConductor]
        );

        await connection.commit();
        res.json({
            success: true,
            message: "Conductor actualizado exitosamente.",
            data: {
                idConductor: parseInt(idConductor),
                nomUsuario: nomUsuario.trim(),
                apeUsuario: apeUsuario.trim(),
                email: email,
                tipLicConductor: tipLicConductor,
                estConductor: estConductor
            }
        });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: {
                    code: "DUPLICATE_ENTRY",
                    message: "El correo o documento ya pertenece a otro usuario."
                }
            });
        }
        console.error("Error al actualizar conductor:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Error al actualizar conductor."
            }
        });
    } finally {
        connection.release();
    }
};

// ELIMINAR (DELETE /:idConductor)
const eliminarConductor = async (req, res) => {
    const { idConductor } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const [driver] = await connection.query("SELECT idUsuario FROM Conductores WHERE idConductor = ?", [idConductor]);
        if (driver.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: {
                    code: "CONDUCTOR_NOT_FOUND",
                    message: "Conductor no encontrado"
                }
            });
        }

        // Verificar que el conductor no tenga viajes activos
        const [viajesActivos] = await connection.query(
            "SELECT COUNT(*) as count FROM Viajes WHERE idConductor = ? AND estViaje IN ('PROGRAMADO', 'EN_CURSO')",
            [idConductor]
        );

        if (viajesActivos[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: {
                    code: "CONDUCTOR_HAS_ACTIVE_TRIPS",
                    message: "No se puede eliminar el conductor porque tiene viajes activos"
                }
            });
        }

        await connection.query("DELETE FROM Conductores WHERE idConductor = ?", [idConductor]);
        await connection.query("DELETE FROM Usuarios WHERE idUsuario = ?", [driver[0].idUsuario]);

        await connection.commit();
        res.json({
            success: true,
            message: "Conductor eliminado exitosamente.",
            data: {
                idConductor: parseInt(idConductor)
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error al eliminar conductor:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Error al eliminar conductor."
            }
        });
    } finally {
        connection.release();
    }
};

const getConductoresDisponibles = async (req, res) => {
  try {
    const idEmpresa = req.user?.idEmpresa || 1;

    const [conductores] = await pool.query(`
      SELECT
        c.idConductor,
        u.nomUsuario,
        u.apeUsuario,
        c.tipLicConductor,
        c.fecVenLicConductor
      FROM Conductores c
      JOIN Usuarios u ON c.idUsuario = u.idUsuario
      WHERE c.estConductor = 'ACTIVO'
      AND c.idEmpresa = ?
      AND c.idConductor NOT IN (
        SELECT DISTINCT idConductorAsignado
        FROM Vehiculos
        WHERE idConductorAsignado IS NOT NULL
      )
      ORDER BY u.nomUsuario ASC
    `, [idEmpresa]);

    // Formatear respuesta
    const conductoresFormateados = conductores.map(conductor => ({
      idConductor: conductor.idConductor,
      nombre: `${conductor.nomUsuario} ${conductor.apeUsuario}`.trim(),
      tipLicConductor: conductor.tipLicConductor,
      fecVenLicConductor: conductor.fecVenLicConductor
    }));

    res.json({
      success: true,
      data: conductoresFormateados,
      total: conductoresFormateados.length
    });
  } catch (error) {
    console.error('Error al obtener conductores disponibles:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: 'Error del servidor al obtener conductores disponibles.'
      }
    });
  }
};

module.exports = {
  listarConductores,
  crearConductor,
  actualizarConductor,
  eliminarConductor,
  getConductoresDisponibles
};