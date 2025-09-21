// src/routes/websocketRoutes.js
const WebSocketController = require('../controllers/websocketController');

module.exports = (io) => {
  const wsController = new WebSocketController(io);

  // Función para configurar rutas cuando app esté disponible
  const setupRoutes = () => {
    if (!global.app) {
      console.log('⚠️ Esperando que app esté disponible...');
      setTimeout(setupRoutes, 100);
      return;
    }

    // Endpoint para estadísticas de conexiones
    global.app.get('/api/websocket/stats', (req, res) => {
      try {
        const stats = wsController.getConnectionStats();
        res.json({
          success: true,
          stats: stats,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('❌ Error obteniendo estadísticas WebSocket:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Endpoint para clientes conectados
    global.app.get('/api/websocket/clients', (req, res) => {
      try {
        const clients = wsController.getConnectedClients();
        res.json({
          success: true,
          clients: clients,
          count: clients.length,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('❌ Error obteniendo clientes WebSocket:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    console.log('✅ Rutas WebSocket configuradas exitosamente');
  };

  // Hacer controlador disponible globalmente
  global.wsController = wsController;

  // Configurar rutas
  setupRoutes();
};