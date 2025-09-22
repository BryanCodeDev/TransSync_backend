const db = require('../config/db');

const Viajes = {
  getAll: async (idEmpresa = 1) => {
    const [rows] = await db.query(`
      SELECT v.idViaje, v.fecHorSalViaje, v.fecHorLleViaje, v.estViaje, v.obsViaje,
             ve.plaVehiculo, u.nomUsuario, u.apeUsuario, r.nomRuta, r.oriRuta, r.desRuta
      FROM Viajes v
      INNER JOIN Vehiculos ve ON v.idVehiculo = ve.idVehiculo
      INNER JOIN Conductores c ON v.idConductor = c.idConductor
      INNER JOIN Usuarios u ON c.idUsuario = u.idUsuario
      INNER JOIN Rutas r ON v.idRuta = r.idRuta
      WHERE ve.idEmpresa = ?
      ORDER BY v.fecHorSalViaje DESC
    `, [idEmpresa]);
    return rows;
  },

  getById: async (id, idEmpresa = 1) => {
    const [rows] = await db.query(`
      SELECT v.*, ve.plaVehiculo, u.nomUsuario, u.apeUsuario, r.nomRuta, r.oriRuta, r.desRuta
      FROM Viajes v
      INNER JOIN Vehiculos ve ON v.idVehiculo = ve.idVehiculo
      INNER JOIN Conductores c ON v.idConductor = c.idConductor
      INNER JOIN Usuarios u ON c.idUsuario = u.idUsuario
      INNER JOIN Rutas r ON v.idRuta = r.idRuta
      WHERE v.idViaje = ? AND ve.idEmpresa = ?
    `, [id, idEmpresa]);
    return rows[0];
  },

  create: async (data, idEmpresa = 1) => {
    const { idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje, obsViaje } = data;

    // Validaciones básicas
    if (!idVehiculo || !idConductor || !idRuta || !fecHorSalViaje) {
      throw new Error('Campos requeridos: idVehiculo, idConductor, idRuta, fecHorSalViaje');
    }

    // Verificar que el vehículo pertenece a la empresa
    const [vehiculo] = await db.query('SELECT idVehiculo FROM Vehiculos WHERE idVehiculo = ? AND idEmpresa = ?', [idVehiculo, idEmpresa]);
    if (vehiculo.length === 0) {
      throw new Error('El vehículo no pertenece a la empresa');
    }

    // Verificar que el conductor pertenece a la empresa
    const [conductor] = await db.query('SELECT idConductor FROM Conductores WHERE idConductor = ? AND idEmpresa = ?', [idConductor, idEmpresa]);
    if (conductor.length === 0) {
      throw new Error('El conductor no pertenece a la empresa');
    }

    // Verificar que la ruta pertenece a la empresa
    const [ruta] = await db.query('SELECT idRuta FROM Rutas WHERE idRuta = ? AND idEmpresa = ?', [idRuta, idEmpresa]);
    if (ruta.length === 0) {
      throw new Error('La ruta no pertenece a la empresa');
    }

    const [result] = await db.query(
      'INSERT INTO Viajes (idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje, obsViaje) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje || 'PROGRAMADO', obsViaje]
    );
    return { idViaje: result.insertId, ...data };
  },

  update: async (id, data, idEmpresa = 1) => {
    const { idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje, obsViaje } = data;

    // Verificar que el viaje pertenece a la empresa
    const [viaje] = await db.query(`
      SELECT v.idViaje FROM Viajes v
      INNER JOIN Vehiculos ve ON v.idVehiculo = ve.idVehiculo
      WHERE v.idViaje = ? AND ve.idEmpresa = ?
    `, [id, idEmpresa]);

    if (viaje.length === 0) {
      throw new Error('El viaje no pertenece a la empresa');
    }

    // Validar referencias si se proporcionan
    if (idVehiculo) {
      const [vehiculo] = await db.query('SELECT idVehiculo FROM Vehiculos WHERE idVehiculo = ? AND idEmpresa = ?', [idVehiculo, idEmpresa]);
      if (vehiculo.length === 0) {
        throw new Error('El vehículo no pertenece a la empresa');
      }
    }

    if (idConductor) {
      const [conductor] = await db.query('SELECT idConductor FROM Conductores WHERE idConductor = ? AND idEmpresa = ?', [idConductor, idEmpresa]);
      if (conductor.length === 0) {
        throw new Error('El conductor no pertenece a la empresa');
      }
    }

    if (idRuta) {
      const [ruta] = await db.query('SELECT idRuta FROM Rutas WHERE idRuta = ? AND idEmpresa = ?', [idRuta, idEmpresa]);
      if (ruta.length === 0) {
        throw new Error('La ruta no pertenece a la empresa');
      }
    }

    await db.query(
      'UPDATE Viajes SET idVehiculo=?, idConductor=?, idRuta=?, fecHorSalViaje=?, fecHorLleViaje=?, estViaje=?, obsViaje=? WHERE idViaje=?',
      [idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje, obsViaje, id]
    );
    return { idViaje: id, ...data };
  },

  delete: async (id, idEmpresa = 1) => {
    // Verificar que el viaje pertenece a la empresa
    const [viaje] = await db.query(`
      SELECT v.idViaje FROM Viajes v
      INNER JOIN Vehiculos ve ON v.idVehiculo = ve.idVehiculo
      WHERE v.idViaje = ? AND ve.idEmpresa = ?
    `, [id, idEmpresa]);

    if (viaje.length === 0) {
      throw new Error('El viaje no pertenece a la empresa');
    }

    await db.query('DELETE FROM Viajes WHERE idViaje=?', [id]);
    return { message: 'Viaje eliminado correctamente' };
  }
};

module.exports = Viajes;
