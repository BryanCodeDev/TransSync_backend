// src/controllers/adminControllers.js

const pool = require("../config/db");

const listarConductoresYPendientes = async (req, res) => {
    try {
        const idEmpresa = 1; // O obténlo del token si es necesario: req.user.idEmpresa;

        // CAMBIO: La consulta ahora busca roles 'CONDUCTOR' y 'PENDIENTE'
        const query = `
        SELECT 
            u.idUsuario, 
            u.email, 
            u.estActivo,
            u.nomUsuario,      -- CAMBIO: Seleccionamos los campos genéricos
            u.apeUsuario,      -- de la tabla Usuarios
            u.numDocUsuario,
            u.telUsuario,
            r.nomRol AS rol
        FROM Usuarios u
        JOIN Roles r ON u.idRol = r.idRol
        -- CAMBIO: Se eliminó el JOIN con la tabla inexistente 'Administradores'
        WHERE 
            r.nomRol IN ('CONDUCTOR', 'GESTOR') 
            AND u.idEmpresa = ?
            ORDER BY u.fecCreUsuario DESC
    `;

        const [usuarios] = await pool.query(query, [idEmpresa]);

        res.json(usuarios);
    } catch (error) {
        console.error("Error al listar usuarios (conductores/pendientes):", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};


const eliminarUsuario = async (req, res) => {
    const { idUsuario } = req.params;
    const connection = await pool.getConnection(); // Usamos una conexión para manejar la transacción

    try {
        await connection.beginTransaction(); // ¡Iniciamos una transacción!

        // 1. Averiguar el rol del usuario para saber de qué tabla de perfil borrarlo
        const [userRows] = await connection.query(
            `SELECT r.nomRol FROM Usuarios u 
             JOIN Roles r ON u.idRol = r.idRol 
             WHERE u.idUsuario = ?`,
            [idUsuario]
        );

        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        
        const rol = userRows[0].nomRol;

        // 2. Eliminar el perfil secundario según el rol
        if (rol === 'GESTOR') {
            await connection.query("DELETE FROM Gestores WHERE idUsuario = ?", [idUsuario]);
        } else if (rol === 'CONDUCTOR') {
            await connection.query("DELETE FROM Conductores WHERE idUsuario = ?", [idUsuario]);
        }
        // Si hay más roles con tablas de perfil en el futuro, se añaden aquí

        // 3. Ahora que los perfiles secundarios fueron eliminados, borrar el usuario principal
        const [deleteResult] = await connection.query(
            "DELETE FROM Usuarios WHERE idUsuario = ?",
            [idUsuario]
        );
        
        if (deleteResult.affectedRows === 0) {
            // Esto no debería pasar si el paso 1 tuvo éxito, pero es una buena salvaguarda
            throw new Error("La eliminación del usuario principal falló.");
        }

        // 4. Si todo salió bien, confirmamos los cambios
        await connection.commit();
        res.json({ message: "Usuario y su perfil asociado han sido eliminados exitosamente." });

    } catch (error) {
        // Si algo falla en cualquier paso, revertimos TODOS los cambios
        await connection.rollback();
        console.error("Error al eliminar usuario (transacción revertida):", error);
        res.status(500).json({ message: "Error interno del servidor al intentar eliminar el usuario." });
    } finally {
        // Siempre liberamos la conexión al final
        connection.release();
    }
};

// ACTUALIZAR ROL (Update) - ¡NUEVA FUNCIÓN!
const actualizarRolUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;
        const { nuevoRol } = req.body; // ej: "GESTOR"

        if (!nuevoRol) {
            return res.status(400).json({ message: "El nuevo rol es requerido." });
        }

        // 1. Buscamos el ID del rol en la base de datos
        const [roles] = await pool.query("SELECT idRol FROM Roles WHERE nomRol = ?", [nuevoRol]);
        
        if (roles.length === 0) {
            return res.status(404).json({ message: `El rol '${nuevoRol}' no es válido.` });
        }
        const idNuevoRol = roles[0].idRol;

        // 2. Actualizamos el usuario con el nuevo ID de rol
        const [result] = await pool.query(
            "UPDATE Usuarios SET idRol = ? WHERE idUsuario = ?",
            [idNuevoRol, idUsuario]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        
        res.json({ message: "Rol del usuario actualizado exitosamente." });

    } catch (error) {
        console.error("Error al actualizar el rol del usuario:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

module.exports = {
    listarConductoresYPendientes,
    eliminarUsuario,
    actualizarRolUsuario,

};
