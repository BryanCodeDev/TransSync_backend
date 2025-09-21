// src/services/schedulerService.js
const WebSocketController = require('../controllers/websocketController');

class SchedulerService {
  constructor(wsController) {
    this.wsController = wsController;
    this.intervals = new Map();
  }

  // Verificar vencimientos cada hora
  startExpirationCheck() {
    const interval = setInterval(async () => {
      try {
        await this.wsController.checkExpirations();
      } catch (error) {
        console.error('❌ Error en verificación programada de vencimientos:', error);
      }
    }, 60 * 60 * 1000); // Cada hora

    this.intervals.set('expirationCheck', interval);
    console.log('⏰ Verificación de vencimientos programada cada hora');
  }

  // Verificar vencimientos diariamente a las 9 AM
  startDailyExpirationCheck() {
    const now = new Date();
    const next9AM = new Date(now);
    next9AM.setHours(9, 0, 0, 0);

    if (now > next9AM) {
      next9AM.setDate(next9AM.getDate() + 1);
    }

    const timeUntil9AM = next9AM - now;

    setTimeout(() => {
      // Ejecutar inmediatamente
      this.wsController.checkExpirations();

      // Programar para cada día a las 9 AM
      const dailyInterval = setInterval(async () => {
        try {
          await this.wsController.checkExpirations();
        } catch (error) {
          console.error('❌ Error en verificación diaria de vencimientos:', error);
        }
      }, 24 * 60 * 60 * 1000); // Cada 24 horas

      this.intervals.set('dailyExpirationCheck', dailyInterval);
    }, timeUntil9AM);

    console.log(`⏰ Verificación diaria de vencimientos programada para las 9:00 AM (en ${Math.round(timeUntil9AM / 1000 / 60)} minutos)`);
  }

  // Detener todos los intervalos
  stopAll() {
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`🛑 Intervalo detenido: ${name}`);
    });
    this.intervals.clear();
  }
}

// Función para inicializar el programador cuando wsController esté disponible
const initializeScheduler = () => {
  if (!global.wsController) {
    console.log('⏰ Esperando wsController para inicializar programador...');
    setTimeout(initializeScheduler, 500);
    return;
  }

  // Iniciar programador
  const scheduler = new SchedulerService(global.wsController);

  // Iniciar verificaciones programadas
  scheduler.startExpirationCheck();
  scheduler.startDailyExpirationCheck();

  console.log('✅ Programador de alertas inicializado');

  // Cleanup al cerrar la aplicación
  process.on('SIGINT', () => {
    console.log('🛑 Deteniendo programador de alertas...');
    scheduler.stopAll();
    process.exit(0);
  });

  return scheduler;
};

// Inicializar programador
const scheduler = initializeScheduler();

module.exports = scheduler;