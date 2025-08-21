// src/controllers/adminControllers.js

const pool = require('../config/db');
const asignarRol = async (req, res) => {
    const {
        idUsuario,
        nuevoRol,
        nomAdministrador,
        apeAdministrador,
        numDocAdministrador,
        idEmpresa
    } = req.body;

    if (!idUsuario || !nuevoRol) {
        return res.status(400).json({ message: "idUsuario y nuevoRol son requeridos." });
    }

    try {
        // Obtener el ID del nuevo rol
        const [roles] = await pool.query("SELECT idRol FROM Roles WHERE nomRol = ?", [nuevoRol]);
        if (roles.length === 0) {
            return res.status(404).json({ message: "Rol no encontrado." });
        }
        const idRol = roles[0].idRol;

        // Actualizar el rol del usuario
        const [updateResult] = await pool.query(
            "UPDATE Usuarios SET idRol = ? WHERE idUsuario = ?",
            [idRol, idUsuario]
        );
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Si es ADMINISTRADOR, insertar en la tabla de Administradores
        if (nuevoRol === "ADMINISTRADOR") {
            // Validar datos necesarios
            if (!nomAdministrador || !apeAdministrador || !numDocAdministrador || !idEmpresa) {
                return res.status(400).json({ message: "Datos del administrador incompletos." });
            }

            // Validar que no exista un administrador con ese documento en la empresa
            const [existingAdmin] = await pool.query(
                "SELECT * FROM Administradores WHERE idEmpresa = ? AND numDocAdministrador = ?",
                [idEmpresa, numDocAdministrador]
            );
            if (existingAdmin.length > 0) {
                return res.status(409).json({ message: "Ya existe un administrador con ese número de documento en la empresa." });
            }

            // Insertar el perfil en Administradores
            await pool.query(
                "INSERT INTO Administradores (idUsuario, nomAdministrador, apeAdministrador, numDocAdministrador, idEmpresa) VALUES (?, ?, ?, ?, ?)",
                [idUsuario, nomAdministrador, apeAdministrador, numDocAdministrador, idEmpresa]
            );
        }

        res.status(200).json({ message: "Rol asignado correctamente." });
    } catch (error) {
        console.error("Error al asignar rol:", error);
        res.status(500).json({ message: "Error del servidor." });
    }
};

const listarAdministradores = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT 
                u.idUsuario, u.email, u.estActivo,
                r.nomRol AS rol,
                a.nomAdministrador, a.apeAdministrador, a.numDocAdministrador, a.idEmpresa
            FROM Usuarios u
            JOIN Roles r ON u.idRol = r.idRol
            LEFT JOIN Administradores a ON u.idUsuario = a.idUsuario
            WHERE r.nomRol IN ('ADMINISTRADOR', 'PENDIENTE')
        `);

        res.json({ administradores: result });
    } catch (error) {
        console.error("Error al listar administradores:", error);
        res.status(500).json({ message: "Error del servidor al obtener administradores." });
    }
};

const editarAdministrador = async (req, res) => {
    const { idUsuario } = req.params;
    const { nomAdministrador, apeAdministrador, numDocAdministrador } = req.body;

    if (!nomAdministrador || !apeAdministrador || !numDocAdministrador) {
        return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    try {
        // Verificar si existe el administrador
        const [adminExiste] = await pool.query(
            "SELECT * FROM Administradores WHERE idUsuario = ?",
            [idUsuario]
        );

        if (adminExiste.length === 0) {
            return res.status(404).json({ message: "Administrador no encontrado." });
        }

        const idEmpresa = adminExiste[0].idEmpresa;

        // Validar que no haya otro admin con ese mismo documento en la misma empresa
        const [docDuplicado] = await pool.query(
            "SELECT * FROM Administradores WHERE idEmpresa = ? AND numDocAdministrador = ? AND idUsuario != ?",
            [idEmpresa, numDocAdministrador, idUsuario]
        );

        if (docDuplicado.length > 0) {
            return res.status(409).json({ message: "Ya existe un administrador con ese documento en esta empresa." });
        }

        // Actualizar
        await pool.query(
            `UPDATE Administradores 
       SET nomAdministrador = ?, apeAdministrador = ?, numDocAdministrador = ?
       WHERE idUsuario = ?`,
            [nomAdministrador, apeAdministrador, numDocAdministrador, idUsuario]
        );

        res.json({ message: "Información del administrador actualizada correctamente." });

    } catch (error) {
        console.error("Error al editar administrador:", error);
        res.status(500).json({ message: "Error del servidor." });
    }
};


const eliminarAdministrador = async (req, res) => {
    const { idUsuario } = req.params;

    if (!idUsuario) {
        return res.status(400).json({ message: "idUsuario es requerido." });
    }

    try {
        // Verificar si existe el administrador
        const [adminRows] = await pool.query(
            "SELECT * FROM Administradores WHERE idUsuario = ?",
            [idUsuario]
        );

        if (adminRows.length === 0) {
            return res.status(404).json({ message: "Administrador no encontrado." });
        }

        // Eliminar el usuario (esto eliminará en cascada el perfil de Administrador)
        const [result] = await pool.query(
            "DELETE FROM Usuarios WHERE idUsuario = ?",
            [idUsuario]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.json({ message: "Administrador eliminado correctamente." });
    } catch (error) {
        console.error("Error al eliminar administrador:", error);
        res.status(500).json({ message: "Error del servidor." });
    }
};


module.exports = {
    listarAdministradores,
    asignarRol,
    editarAdministrador,
    eliminarAdministrador
};