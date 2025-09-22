const pool = require("../config/db");

class User {
  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        `SELECT u.*, r.nomRol as rol, e.nomEmpresa
         FROM Usuarios u
         JOIN Roles r ON u.idRol = r.idRol
         JOIN Empresas e ON u.idEmpresa = e.idEmpresa
         WHERE u.email = ? AND u.estActivo = 1`,
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT u.*, r.nomRol as rol, e.nomEmpresa
         FROM Usuarios u
         JOIN Roles r ON u.idRol = r.idRol
         JOIN Empresas e ON u.idEmpresa = e.idEmpresa
         WHERE u.idUsuario = ? AND u.estActivo = 1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo usuario
  static async create(userData) {
    const {
      nomUsuario,
      apeUsuario,
      numDocUsuario,
      telUsuario,
      email,
      passwordHash,
      idRol,
      idEmpresa = 1
    } = userData;

    try {
      const [result] = await pool.query(
        `INSERT INTO Usuarios
         (nomUsuario, apeUsuario, numDocUsuario, telUsuario, email, passwordHash, idRol, idEmpresa)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nomUsuario, apeUsuario, numDocUsuario, telUsuario, email, passwordHash, idRol, idEmpresa]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios activos
  static async getAll() {
    try {
      const [rows] = await pool.query(
        `SELECT u.idUsuario, u.nomUsuario, u.apeUsuario, u.email, u.numDocUsuario,
                u.telUsuario, u.fecCreUsuario, r.nomRol as rol, e.nomEmpresa
         FROM Usuarios u
         JOIN Roles r ON u.idRol = r.idRol
         JOIN Empresas e ON u.idEmpresa = e.idEmpresa
         WHERE u.estActivo = 1
         ORDER BY u.nomUsuario, u.apeUsuario`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuarios por rol
  static async getByRole(rol) {
    try {
      const [rows] = await pool.query(
        `SELECT u.idUsuario, u.nomUsuario, u.apeUsuario, u.email, u.numDocUsuario,
                u.telUsuario, u.fecCreUsuario, r.nomRol as rol, e.nomEmpresa
         FROM Usuarios u
         JOIN Roles r ON u.idRol = r.idRol
         JOIN Empresas e ON u.idEmpresa = e.idEmpresa
         WHERE r.nomRol = ? AND u.estActivo = 1
         ORDER BY u.nomUsuario, u.apeUsuario`,
        [rol]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, userData) {
    const {
      nomUsuario,
      apeUsuario,
      numDocUsuario,
      telUsuario,
      email,
      idRol
    } = userData;

    try {
      const [result] = await pool.query(
        `UPDATE Usuarios SET
         nomUsuario = ?, apeUsuario = ?, numDocUsuario = ?,
         telUsuario = ?, email = ?, idRol = ?, fecUltModUsuario = CURRENT_TIMESTAMP
         WHERE idUsuario = ? AND estActivo = 1`,
        [nomUsuario, apeUsuario, numDocUsuario, telUsuario, email, idRol, id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar contraseña
  static async updatePassword(id, hashedPassword) {
    try {
      const [result] = await pool.query(
        `UPDATE Usuarios SET
         passwordHash = ?, fecUltModUsuario = CURRENT_TIMESTAMP
         WHERE idUsuario = ? AND estActivo = 1`,
        [hashedPassword, id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Desactivar usuario (soft delete)
  static async deactivate(id) {
    try {
      const [result] = await pool.query(
        `UPDATE Usuarios SET
         estActivo = 0, fecUltModUsuario = CURRENT_TIMESTAMP
         WHERE idUsuario = ?`,
        [id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Verificar si email ya existe (excluyendo un usuario específico)
  static async emailExists(email, excludeId = null) {
    try {
      let query = "SELECT idUsuario FROM Usuarios WHERE email = ?";
      let params = [email];

      if (excludeId) {
        query += " AND idUsuario != ?";
        params.push(excludeId);
      }

      const [rows] = await pool.query(query, params);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Verificar si documento ya existe (excluyendo un usuario específico)
  static async documentExists(numDocUsuario, excludeId = null) {
    try {
      let query = "SELECT idUsuario FROM Usuarios WHERE numDocUsuario = ?";
      let params = [numDocUsuario];

      if (excludeId) {
        query += " AND idUsuario != ?";
        params.push(excludeId);
      }

      const [rows] = await pool.query(query, params);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;