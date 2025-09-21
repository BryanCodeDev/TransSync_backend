// src/controllers/websocketController.js
const pool = require('../config/db');
const WebSocketService = require('../services/websocketService');

class WebSocketController {
  constructor(io) {
    this.wsService = new WebSocketService(io);
  }

  // ===============================
  // MÉTODOS PARA CONTROLADORES EXISTENTES
  // ===============================

  // Llamar después de crear un conductor
  async notifyNewConductor(conductorData) {
    try {
      await this.wsService.notifyNewConductor(conductorData, conductorData.idEmpresa);
      console.log('✅ Notificación de nuevo conductor enviada');
    } catch (error) {
      console.error('❌ Error enviando notificación de conductor:', error);
    }
  }

  // Llamar después de crear un vehículo
  async notifyNewVehicle(vehicleData) {
    try {
      await this.wsService.notifyNewVehicle(vehicleData, vehicleData.idEmpresa);
      console.log('✅ Notificación de nuevo vehículo enviada');
    } catch (error) {
      console.error('❌ Error enviando notificación de vehículo:', error);
    }
  }

  // Llamar después de crear una ruta
  async notifyNewRoute(routeData) {
    try {
      await this.wsService.notifyNewRoute(routeData, routeData.idEmpresa);
      console.log('✅ Notificación de nueva ruta enviada');
    } catch (error) {
      console.error('❌ Error enviando notificación de ruta:', error);
    }
  }

  // Llamar después de crear un viaje
  async notifyNewTrip(tripData) {
    try {
      // Obtener empresa del vehículo
      const vehicleResponse = await pool.query(
        'SELECT idEmpresa FROM Vehiculos WHERE idVehiculo = ?',
        [tripData.idVehiculo]
      );

      if (vehicleResponse[0].length > 0) {
        const empresaId = vehicleResponse[0][0].idEmpresa;
        await this.wsService.notifyNewTrip(tripData, empresaId);
        console.log('✅ Notificación de nuevo viaje enviada');
      }
    } catch (error) {
      console.error('❌ Error enviando notificación de viaje:', error);
    }
  }

  // ===============================
  // MÉTODOS PARA ALERTAS PROGRAMADAS
  // ===============================

  // Verificar vencimientos diariamente
  async checkExpirations() {
    try {
      const [expirations] = await pool.query(`
        SELECT
          'LICENCIA' as tipoDocumento,
          CONCAT(c.nomConductor, ' ', c.apeConductor) as titular,
          c.fecVenLicConductor as fechaVencimiento,
          DATEDIFF(c.fecVenLicConductor, CURDATE()) as diasParaVencer,
          c.idEmpresa
        FROM Conductores c
        WHERE c.fecVenLicConductor BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)

        UNION ALL

        SELECT
          'SOAT' as tipoDocumento,
          CONCAT(v.marVehiculo, ' ', v.modVehiculo, ' - ', v.plaVehiculo) as titular,
          v.fecVenSOAT as fechaVencimiento,
          DATEDIFF(v.fecVenSOAT, CURDATE()) as diasParaVencer,
          v.idEmpresa
        FROM Vehiculos v
        WHERE v.fecVenSOAT BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)

        UNION ALL

        SELECT
          'TECNOMECANICA' as tipoDocumento,
          CONCAT(v.marVehiculo, ' ', v.modVehiculo, ' - ', v.plaVehiculo) as titular,
          v.fecVenTec as fechaVencimiento,
          DATEDIFF(v.fecVenTec, CURDATE()) as diasParaVencer,
          v.idEmpresa
        FROM Vehiculos v
        WHERE v.fecVenTec BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      `);

      // Enviar alertas para cada vencimiento
      for (const expiration of expirations) {
        if (expiration.diasParaVencer <= 7) { // Solo alertas críticas
          await this.wsService.notifyExpirationAlert(expiration, expiration.idEmpresa);
        }
      }

      console.log(`📊 Verificación de vencimientos completada: ${expirations.length} alertas enviadas`);

    } catch (error) {
      console.error('❌ Error verificando vencimientos:', error);
    }
  }

  // ===============================
  // MÉTODOS DE ESTADÍSTICAS
  // ===============================

  getConnectionStats() {
    return this.wsService.getConnectionStats();
  }

  getConnectedClients() {
    return this.wsService.getConnectedClients();
  }
}

module.exports = WebSocketController;