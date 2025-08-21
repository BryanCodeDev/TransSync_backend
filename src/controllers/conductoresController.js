// src/controllers/conductoresController.js

const pool = require('../config/db');

// Obtener todos los conductores con información de vehículos asignados
const getConductores = async (req, res) => {
    try {
        const { 
            estado, 
            idEmpresa = 1, // Por defecto empresa 1 
            page = 1, 
            limit = 100 
        } = req.query;

        let query = `
            SELECT 
                c.idConductor,
                c.nomConductor,
                c.apeConductor,
                c.numDocConductor,
                c.tipLicConductor,
                c.fecVenLicConductor,
                c.telConductor,
                c.estConductor,
                c.fecCreConductor,
                c.fecUltModConductor,
                v.idVehiculo,
                v.numVehiculo,
                v.plaVehiculo,
                v.marVehiculo,
                v.modVehiculo,
                e.nomEmpresa
            FROM Conductores c
            LEFT JOIN Vehiculos v ON c.idConductor = v.idConductorAsignado
            LEFT JOIN Empresas e ON c.idEmpresa = e.idEmpresa
            WHERE c.idEmpresa = ?
        `;
        
        const queryParams = [idEmpresa];

        // Filtro por estado si se proporciona
        if (estado) {
            query += ` AND c.estConductor = ?`;
            queryParams.push(estado);
        }

        query += ` ORDER BY c.nomConductor, c.apeConductor`;

        // Paginación
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const [conductores] = await pool.query(query, queryParams);

        // Formatear los datos para incluir información del vehículo si existe
        const conductoresFormateados = conductores.map(conductor => ({
            ...conductor,
            vehiculo: conductor.idVehiculo ? {
                idVehiculo: conductor.idVehiculo,
                numVehiculo: conductor.numVehiculo,
                plaVehiculo: conductor.plaVehiculo,
                marVehiculo: conductor.marVehiculo,
                modVehiculo: conductor.modVehiculo
            } : null
        }));

        // Obtener el total para paginación
        const [totalResult] = await pool.query(
            `SELECT COUNT(*) as total FROM Conductores WHERE idEmpresa = ?${estado ? ' AND estConductor = ?' : ''}`,
            estado ? [idEmpresa, estado] : [idEmpresa]
        );
        const total = totalResult[0].total;

        res.json({
            conductores: conductoresFormateados,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener conductores:', error);
        res.status(500).json({ message: 'Error del servidor al obtener conductores.' });
    }
};

// Obtener conductor por ID
const getConductorById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT 
                c.*,
                v.idVehiculo,
                v.numVehiculo,
                v.plaVehiculo,
                v.marVehiculo,
                v.modVehiculo,
                e.nomEmpresa,
                u.email
            FROM Conductores c
            LEFT JOIN Vehiculos v ON c.idConductor = v.idConductorAsignado
            LEFT JOIN Empresas e ON c.idEmpresa = e.idEmpresa
            LEFT JOIN Usuarios u ON c.idUsuario = u.idUsuario
            WHERE c.idConductor = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Conductor no encontrado.' });
        }

        const conductor = {
            ...rows[0],
            vehiculo: rows[0].idVehiculo ? {
                idVehiculo: rows[0].idVehiculo,
                numVehiculo: rows[0].numVehiculo,
                plaVehiculo: rows[0].plaVehiculo,
                marVehiculo: rows[0].marVehiculo,
                modVehiculo: rows[0].modVehiculo
            } : null
        };

        res.json({ conductor });
    } catch (error) {
        console.error('Error al obtener conductor:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// Crear nuevo conductor
const crearConductor = async (req, res) => {
    const {
        nomConductor,
        apeConductor,
        numDocConductor,
        tipLicConductor,
        fecVenLicConductor,
        telConductor,
        estConductor = 'INACTIVO',
        idEmpresa = 1,
        idUsuario = null
    } = req.body;

    // Validaciones
    if (!nomConductor || !apeConductor || !numDocConductor || !tipLicConductor || !fecVenLicConductor) {
        return res.status(400).json({ 
            message: 'Nombre, apellido, documento, tipo de licencia y fecha de vencimiento son requeridos.' 
        });
    }

    // Validar tipo de licencia
    const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
    if (!validLicenses.includes(tipLicConductor)) {
        return res.status(400).json({ message: 'Tipo de licencia inválido.' });
    }

    // Validar estado
    const validStates = ['ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES'];
    if (!validStates.includes(estConductor)) {
        return res.status(400).json({ message: 'Estado inválido.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar que no exista conductor con el mismo documento en la empresa
        const [existingDoc] = await connection.query(
            'SELECT idConductor FROM Conductores WHERE idEmpresa = ? AND numDocConductor = ?',
            [idEmpresa, numDocConductor]
        );

        if (existingDoc.length > 0) {
            await connection.rollback();
            return res.status(409).json({ 
                message: 'Ya existe un conductor con ese número de documento en la empresa.' 
            });
        }

        // Validar fecha de vencimiento
        const fechaVencimiento = new Date(fecVenLicConductor);
        const hoy = new Date();
        if (fechaVencimiento <= hoy) {
            await connection.rollback();
            return res.status(400).json({ 
                message: 'La fecha de vencimiento de la licencia debe ser futura.' 
            });
        }

        // Insertar conductor
        const [result] = await connection.query(`
            INSERT INTO Conductores (
                nomConductor, apeConductor, numDocConductor, 
                tipLicConductor, fecVenLicConductor, telConductor, 
                estConductor, idEmpresa, idUsuario
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nomConductor.trim(),
            apeConductor.trim(),
            numDocConductor.trim(),
            tipLicConductor,
            fecVenLicConductor,
            telConductor?.trim() || null,
            estConductor,
            idEmpresa,
            idUsuario
        ]);

        await connection.commit();

        res.status(201).json({
            message: 'Conductor creado exitosamente.',
            conductorId: result.insertId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear conductor:', error);
        res.status(500).json({ message: 'Error del servidor al crear conductor.' });
    } finally {
        connection.release();
    }
};

// Actualizar conductor
const actualizarConductor = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Verificar que el conductor existe
        const [existingConductor] = await pool.query(
            'SELECT * FROM Conductores WHERE idConductor = ?',
            [id]
        );

        if (existingConductor.length === 0) {
            return res.status(404).json({ message: 'Conductor no encontrado.' });
        }

        // Validar tipo de licencia si se proporciona
        if (updateData.tipLicConductor) {
            const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
            if (!validLicenses.includes(updateData.tipLicConductor)) {
                return res.status(400).json({ message: 'Tipo de licencia inválido.' });
            }
        }

        // Validar estado si se proporciona
        if (updateData.estConductor) {
            const validStates = ['ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES'];
            if (!validStates.includes(updateData.estConductor)) {
                return res.status(400).json({ message: 'Estado inválido.' });
            }
        }

        // Validar fecha de vencimiento si se proporciona
        if (updateData.fecVenLicConductor) {
            const fechaVencimiento = new Date(updateData.fecVenLicConductor);
            const hoy = new Date();
            if (fechaVencimiento <= hoy) {
                return res.status(400).json({ 
                    message: 'La fecha de vencimiento de la licencia debe ser futura.' 
                });
            }
        }

        // Verificar unicidad del documento si se actualiza
        if (updateData.numDocConductor) {
            const [docDuplicado] = await pool.query(
                'SELECT idConductor FROM Conductores WHERE idEmpresa = ? AND numDocConductor = ? AND idConductor != ?',
                [existingConductor[0].idEmpresa, updateData.numDocConductor, id]
            );

            if (docDuplicado.length > 0) {
                return res.status(409).json({ 
                    message: 'Ya existe otro conductor con ese número de documento en la empresa.' 
                });
            }
        }

        // Construir query de actualización dinámicamente
        const fieldsToUpdate = [];
        const values = [];

        Object.keys(updateData).forEach(field => {
            if (updateData[field] !== undefined && updateData[field] !== null) {
                fieldsToUpdate.push(`${field} = ?`);
                if (typeof updateData[field] === 'string') {
                    values.push(updateData[field].trim());
                } else {
                    values.push(updateData[field]);
                }
            }
        });

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        values.push(id);

        const query = `UPDATE Conductores SET ${fieldsToUpdate.join(', ')} WHERE idConductor = ?`;
        
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No se pudo actualizar el conductor.' });
        }

        res.json({ message: 'Conductor actualizado exitosamente.' });

    } catch (error) {
        console.error('Error al actualizar conductor:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar conductor.' });
    }
};

// Eliminar conductor
const eliminarConductor = async (req, res) => {
    const { id } = req.params;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar que el conductor existe
        const [conductor] = await connection.query(
            'SELECT * FROM Conductores WHERE idConductor = ?',
            [id]
        );

        if (conductor.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Conductor no encontrado.' });
        }

        // Verificar si tiene vehículos asignados
        const [vehiculosAsignados] = await connection.query(
            'SELECT COUNT(*) as count FROM Vehiculos WHERE idConductorAsignado = ?',
            [id]
        );

        if (vehiculosAsignados[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({ 
                message: 'No se puede eliminar el conductor porque tiene vehículos asignados. Desasigne primero los vehículos.' 
            });
        }

        // Eliminar conductor (esto también eliminará registros relacionados por CASCADE)
        await connection.query('DELETE FROM Conductores WHERE idConductor = ?', [id]);

        await connection.commit();

        res.json({ message: 'Conductor eliminado exitosamente.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar conductor:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar conductor.' });
    } finally {
        connection.release();
    }
};

// Cambiar estado de conductor
const cambiarEstadoConductor = async (req, res) => {
    const { id } = req.params;
    const { estConductor } = req.body;

    if (!estConductor) {
        return res.status(400).json({ message: 'Estado del conductor es requerido.' });
    }

    const validStates = ['ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES'];
    if (!validStates.includes(estConductor)) {
        return res.status(400).json({ message: 'Estado inválido.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Conductores SET estConductor = ? WHERE idConductor = ?',
            [estConductor, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Conductor no encontrado.' });
        }

        res.json({ message: 'Estado del conductor actualizado exitosamente.' });

    } catch (error) {
        console.error('Error al cambiar estado del conductor:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// Asignar vehículo a conductor
const asignarVehiculoConductor = async (req, res) => {
    const { id } = req.params;
    const { idVehiculo } = req.body;

    if (!idVehiculo) {
        return res.status(400).json({ message: 'ID del vehículo es requerido.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar que el conductor existe y está activo
        const [conductor] = await connection.query(
            'SELECT * FROM Conductores WHERE idConductor = ? AND estConductor = "ACTIVO"',
            [id]
        );

        if (conductor.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                message: 'Conductor no encontrado o no está activo.' 
            });
        }

        // Verificar que el vehículo existe y no está asignado
        const [vehiculo] = await connection.query(
            'SELECT * FROM Vehiculos WHERE idVehiculo = ? AND (idConductorAsignado IS NULL OR idConductorAsignado = ?)',
            [idVehiculo, id]
        );

        if (vehiculo.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                message: 'Vehículo no encontrado o ya está asignado a otro conductor.' 
            });
        }

        // Desasignar cualquier vehículo previo del conductor
        await connection.query(
            'UPDATE Vehiculos SET idConductorAsignado = NULL WHERE idConductorAsignado = ?',
            [id]
        );

        // Asignar el nuevo vehículo
        await connection.query(
            'UPDATE Vehiculos SET idConductorAsignado = ? WHERE idVehiculo = ?',
            [id, idVehiculo]
        );

        await connection.commit();

        res.json({ message: 'Vehículo asignado al conductor exitosamente.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al asignar vehículo:', error);
        res.status(500).json({ message: 'Error del servidor al asignar vehículo.' });
    } finally {
        connection.release();
    }
};

// Desasignar vehículo de conductor
const desasignarVehiculoConductor = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el conductor existe
        const [conductor] = await pool.query(
            'SELECT * FROM Conductores WHERE idConductor = ?',
            [id]
        );

        if (conductor.length === 0) {
            return res.status(404).json({ message: 'Conductor no encontrado.' });
        }

        // Desasignar vehículo
        const [result] = await pool.query(
            'UPDATE Vehiculos SET idConductorAsignado = NULL WHERE idConductorAsignado = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'El conductor no tiene vehículos asignados.' 
            });
        }

        res.json({ message: 'Vehículo desasignado del conductor exitosamente.' });

    } catch (error) {
        console.error('Error al desasignar vehículo:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// Obtener conductores disponibles (para asignación a vehículos)
const getConductoresDisponibles = async (req, res) => {
    try {
        const [conductores] = await pool.query(`
            SELECT 
                c.idConductor,
                c.nomConductor,
                c.apeConductor,
                c.numDocConductor,
                c.tipLicConductor,
                c.telConductor
            FROM Conductores c
            LEFT JOIN Vehiculos v ON c.idConductor = v.idConductorAsignado
            WHERE c.estConductor = 'ACTIVO' 
            AND v.idConductorAsignado IS NULL
            ORDER BY c.nomConductor, c.apeConductor
        `);

        res.json({ conductoresDisponibles: conductores });

    } catch (error) {
        console.error('Error al obtener conductores disponibles:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// Obtener estadísticas de conductores
const getEstadisticasConductores = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estConductor = 'ACTIVO' THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN estConductor = 'INACTIVO' THEN 1 ELSE 0 END) as inactivos,
                SUM(CASE WHEN estConductor = 'DIA_DESCANSO' THEN 1 ELSE 0 END) as enDescanso,
                SUM(CASE WHEN estConductor = 'INCAPACITADO' THEN 1 ELSE 0 END) as incapacitados,
                SUM(CASE WHEN estConductor = 'DE_VACACIONES' THEN 1 ELSE 0 END) as deVacaciones,
                SUM(CASE WHEN v.idConductorAsignado IS NOT NULL THEN 1 ELSE 0 END) as conVehiculoAsignado,
                SUM(CASE WHEN v.idConductorAsignado IS NULL THEN 1 ELSE 0 END) as sinVehiculoAsignado
            FROM Conductores c
            LEFT JOIN Vehiculos v ON c.idConductor = v.idConductorAsignado
            WHERE c.idEmpresa = ?
        `, [1]); // Por defecto empresa 1

        res.json({ estadisticas: stats[0] });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// Verificar vencimiento de licencias
const verificarVencimientoLicencias = async (req, res) => {
    const { dias = 30 } = req.query;

    try {
        const [conductores] = await pool.query(`
            SELECT 
                c.idConductor,
                c.nomConductor,
                c.apeConductor,
                c.numDocConductor,
                c.tipLicConductor,
                c.fecVenLicConductor,
                c.telConductor,
                DATEDIFF(c.fecVenLicConductor, CURDATE()) as diasRestantes
            FROM Conductores c
            WHERE c.fecVenLicConductor <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND c.fecVenLicConductor >= CURDATE()
            AND c.estConductor IN ('ACTIVO', 'DIA_DESCANSO')
            ORDER BY c.fecVenLicConductor ASC
        `, [parseInt(dias)]);

        res.json({ 
            conductoresConLicenciasPorVencer: conductores,
            totalConductores: conductores.length,
            diasAnticipacion: parseInt(dias)
        });

    } catch (error) {
        console.error('Error al verificar vencimientos:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

module.exports = {
    getConductores,
    getConductorById,
    crearConductor,
    actualizarConductor,
    eliminarConductor,
    cambiarEstadoConductor,
    asignarVehiculoConductor,
    desasignarVehiculoConductor,
    getConductoresDisponibles,
    getEstadisticasConductores,
    verificarVencimientoLicencias
};