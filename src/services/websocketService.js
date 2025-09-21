// src/services/websocketService.js
class WebSocketService {
  constructor(io) {
    this.io = io;
    this.connectedClients = new Map();
    this.setupConnectionHandlers();
  }

  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      // Registrar cliente conectado
      this.registerClient(socket);

      // Unir a salas específicas
      this.joinRooms(socket);

      // Configurar handlers de eventos
      this.setupEventHandlers(socket);

      // Handler de desconexión
      socket.on('disconnect', () => {
        this.unregisterClient(socket);
      });
    });
  }

  registerClient(socket) {
    this.connectedClients.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      empresaId: socket.empresaId,
      rol: socket.rol,
      connectedAt: new Date()
    });
  }

  unregisterClient(socket) {
    this.connectedClients.delete(socket.userId);
  }

  joinRooms(socket) {
    // Unir a sala de empresa
    socket.join(`empresa_${socket.empresaId}`);

    // Unir a sala de usuario
    socket.join(`usuario_${socket.userId}`);

    // Unir a sala de rol
    socket.join(`rol_${socket.rol}`);
  }

  setupEventHandlers(socket) {
    // Unir a sala específica
    socket.on('join:empresa', (data) => {
      socket.join(`empresa_${data.empresaId}`);
    });

    socket.on('join:usuario', (data) => {
      socket.join(`usuario_${data.userId}`);
    });

    socket.on('join:rol', (data) => {
      socket.join(`rol_${data.rol}`);
    });

    // Enviar notificación
    socket.on('notification:send', (data) => {
      this.sendNotification(data);
    });
  }

  // ===============================
  // MÉTODOS PARA ENVIAR NOTIFICACIONES
  // ===============================

  // Notificar nuevo conductor
  notifyNewConductor(conductorData, empresaId) {
    const notification = {
      type: 'conductor_nuevo',
      title: '👨‍💼 Nuevo Conductor Registrado',
      message: `Se ha registrado el conductor ${conductorData.nomConductor} ${conductorData.apeConductor}`,
      data: conductorData,
      timestamp: new Date(),
      priority: 'medium'
    };

    this.sendToEmpresa(empresaId, 'conductor:created', notification);
    this.sendBrowserNotification(notification);
  }

  // Notificar nuevo vehículo
  notifyNewVehicle(vehicleData, empresaId) {
    const notification = {
      type: 'vehiculo_nuevo',
      title: '🚗 Nuevo Vehículo Registrado',
      message: `Se ha registrado el vehículo ${vehicleData.marVehiculo} ${vehicleData.modVehiculo} (${vehicleData.plaVehiculo})`,
      data: vehicleData,
      timestamp: new Date(),
      priority: 'medium'
    };

    this.sendToEmpresa(empresaId, 'vehiculo:created', notification);
    this.sendBrowserNotification(notification);
  }

  // Notificar nueva ruta
  notifyNewRoute(routeData, empresaId) {
    const notification = {
      type: 'ruta_nueva',
      title: '🗺️ Nueva Ruta Registrada',
      message: `Se ha registrado la ruta "${routeData.nomRuta}"`,
      data: routeData,
      timestamp: new Date(),
      priority: 'low'
    };

    this.sendToEmpresa(empresaId, 'ruta:created', notification);
  }

  // Notificar nuevo viaje
  notifyNewTrip(tripData, empresaId) {
    const notification = {
      type: 'viaje_nuevo',
      title: '⏰ Nuevo Viaje Programado',
      message: `Se programó un nuevo viaje para la ruta ${tripData.nomRuta || 'sin nombre'}`,
      data: tripData,
      timestamp: new Date(),
      priority: 'medium'
    };

    this.sendToEmpresa(empresaId, 'viaje:created', notification);
    this.sendBrowserNotification(notification);
  }

  // Notificar alerta de vencimiento
  notifyExpirationAlert(expirationData, empresaId) {
    const notification = {
      type: 'vencimiento_alerta',
      title: '⚠️ Alerta de Vencimiento',
      message: `Documento próximo a vencer: ${expirationData.tipoDocumento} - ${expirationData.titular}`,
      data: expirationData,
      timestamp: new Date(),
      priority: 'high'
    };

    this.sendToEmpresa(empresaId, 'vencimiento:alert', notification);
    this.sendBrowserNotification(notification);
  }

  // ===============================
  // MÉTODOS DE ENVÍO
  // ===============================

  sendToEmpresa(empresaId, event, data) {
    this.io.to(`empresa_${empresaId}`).emit(event, data);
  }

  sendToUsuario(userId, event, data) {
    this.io.to(`usuario_${userId}`).emit(event, data);
  }

  sendToRol(rol, event, data) {
    this.io.to(`rol_${rol}`).emit(event, data);
  }

  sendNotification(notificationData) {
    const { targetType, targetId, event, data } = notificationData;

    switch (targetType) {
      case 'empresa':
        this.sendToEmpresa(targetId, event, data);
        break;
      case 'usuario':
        this.sendToUsuario(targetId, event, data);
        break;
      case 'rol':
        this.sendToRol(targetId, event, data);
        break;
      default:
        console.error('Tipo de destino no válido:', targetType);
    }
  }

  sendBrowserNotification(notification) {
    // Enviar notificación del navegador (se maneja en el frontend)
    this.io.emit('browser:notification', notification);
  }

  // ===============================
  // MÉTODOS DE GESTIÓN
  // ===============================

  getConnectedClients() {
    return Array.from(this.connectedClients.values());
  }

  getClientCount() {
    return this.connectedClients.size;
  }

  isUserConnected(userId) {
    return this.connectedClients.has(userId);
  }

  getConnectionStats() {
    const clients = this.getConnectedClients();
    const stats = {
      totalConnections: clients.length,
      connectionsByEmpresa: {},
      connectionsByRol: {},
      uptime: process.uptime()
    };

    clients.forEach(client => {
      // Contar por empresa
      stats.connectionsByEmpresa[client.empresaId] =
        (stats.connectionsByEmpresa[client.empresaId] || 0) + 1;

      // Contar por rol
      stats.connectionsByRol[client.rol] =
        (stats.connectionsByRol[client.rol] || 0) + 1;
    });

    return stats;
  }
}

module.exports = WebSocketService;