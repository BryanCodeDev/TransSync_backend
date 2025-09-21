# RealTimeService - Servicio de Notificaciones en Tiempo Real

## Descripción

El `RealTimeService` es un servicio avanzado de notificaciones en tiempo real construido sobre Socket.IO que proporciona funcionalidades completas para la comunicación bidireccional entre el servidor y los clientes.

## Características Principales

- ✅ **Conexiones WebSocket seguras** con autenticación JWT
- ✅ **Sistema de notificaciones en tiempo real** con prioridades
- ✅ **Reconexión automática** con backoff exponencial
- ✅ **Gestión de salas** por empresa, usuario y rol
- ✅ **Notificaciones del navegador** con permisos
- ✅ **Monitoreo de conexiones** y estadísticas
- ✅ **API REST** para gestión de notificaciones
- ✅ **Cola de notificaciones** para procesamiento asíncrono
- ✅ **Limpieza automática** de clientes inactivos

## Instalación

El servicio ya está integrado en el proyecto. Asegúrate de tener las dependencias necesarias:

```bash
npm install socket.io-client  # Para el frontend
```

## Uso Básico

### 1. Conexión desde el Frontend

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  auth: {
    token: localStorage.getItem('authToken'),
    userId: userContext.idUsuario,
    empresaId: userContext.idEmpresa
  }
});

// Escuchar eventos
socket.on('conductor:created', (data) => {
  console.log('Nuevo conductor:', data);
});

socket.on('connect', () => {
  console.log('Conectado al servidor');
});
```

### 2. Enviar Notificaciones desde el Backend

```javascript
// En cualquier controlador o servicio
const realTimeService = global.realTimeService;

// Notificar a una empresa específica
realTimeService.sendToEmpresa(empresaId, 'conductor:created', {
  nomConductor: 'Juan',
  apeConductor: 'Pérez',
  // ... otros datos
});

// Notificar a un usuario específico
realTimeService.sendToUsuario(userId, 'viaje:updated', {
  idViaje: 123,
  estado: 'completado'
});

// Broadcast a todos
realTimeService.broadcast('system:maintenance', {
  message: 'Mantenimiento programado',
  duration: '2 horas'
});
```

### 3. Usar la API REST

```bash
# Obtener estadísticas
GET /api/realtime/stats
Authorization: Bearer YOUR_JWT_TOKEN

# Obtener clientes conectados
GET /api/realtime/clients
Authorization: Bearer YOUR_JWT_TOKEN

# Enviar notificación
POST /api/realtime/notifications
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "targetType": "empresa",
  "targetId": "123",
  "event": "custom:notification",
  "data": {
    "message": "Notificación personalizada",
    "type": "info"
  },
  "priority": "medium"
}
```

## Eventos Disponibles

### Eventos del Sistema
- `connection:established` - Conexión establecida
- `connection:error` - Error de conexión
- `connection:failed` - Fallo de reconexión
- `connection:reestablished` - Reconexión exitosa

### Eventos de Datos
- `conductor:created` - Nuevo conductor registrado
- `conductor:updated` - Conductor actualizado
- `vehiculo:created` - Nuevo vehículo registrado
- `vehiculo:updated` - Vehículo actualizado
- `ruta:created` - Nueva ruta registrada
- `viaje:created` - Nuevo viaje programado
- `viaje:updated` - Viaje actualizado
- `vencimiento:alert` - Alerta de vencimiento
- `system:status_changed` - Cambio en estado del sistema
- `chatbot:notification` - Notificación del chatbot

## Configuración

### Variables de Entorno

```env
# URL del frontend para CORS
FRONTEND_URL=http://localhost:3000

# Configuración de WebSocket
WS_PING_TIMEOUT=60000
WS_PING_INTERVAL=25000
```

### Configuración del Cliente

```javascript
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  forceNew: true,
  auth: {
    token: localStorage.getItem('authToken'),
    userId: userContext?.idUsuario,
    empresaId: userContext?.idEmpresa
  }
});
```

## Monitoreo y Estadísticas

### Health Check
```bash
GET /api/health
```

### Estadísticas en Tiempo Real
```bash
GET /api/realtime/stats
```

### Clientes Conectados
```bash
GET /api/realtime/clients
```

### Métricas de Rendimiento
```bash
GET /api/realtime/metrics
```

## Seguridad

- ✅ **Autenticación JWT** requerida para conexiones WebSocket
- ✅ **CORS configurado** para múltiples orígenes
- ✅ **Validación de tokens** en middleware
- ✅ **Sanitización de datos** en notificaciones
- ✅ **Rate limiting** en conexiones

## Ejemplos de Uso

### Ejemplo 1: Notificar Nuevo Conductor

```javascript
// En el controlador de conductores
const { nomConductor, apeConductor, idEmpresa } = req.body;

realTimeService.sendToEmpresa(idEmpresa, 'conductor:created', {
  nomConductor,
  apeConductor,
  timestamp: new Date()
});
```

### Ejemplo 2: Alerta de Vencimiento

```javascript
// En el servicio de scheduler
realTimeService.sendToUsuario(userId, 'vencimiento:alert', {
  tipoDocumento: 'Licencia de conducir',
  titular: 'Juan Pérez',
  fechaVencimiento: '2024-02-15',
  prioridad: 'high'
});
```

### Ejemplo 3: Notificación del Sistema

```javascript
// En cualquier parte del sistema
realTimeService.broadcast('system:notification', {
  message: 'Sistema actualizado a versión 2.1.0',
  priority: 'medium',
  showBrowserNotification: true
});
```

## Solución de Problemas

### Error: "RealTimeService no está disponible"
- Verifica que el servicio esté inicializado en `server.js`
- Asegúrate de que Socket.IO esté instalado

### Error: "Cliente no autenticado"
- Verifica que el token JWT sea válido
- Asegúrate de que los datos de autenticación estén completos

### Conexiones se caen frecuentemente
- Revisa la configuración de ping/pong
- Verifica la estabilidad de la red
- Considera aumentar los timeouts

## Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  RealTimeService │    │   Controllers   │
│   (React)       │◄──►│  (Socket.IO)     │◄──►│   (Express)     │
│                 │    │                  │    │                 │
│ - Socket Client │    │ - Connection Mgmt│    │ - REST API      │
│ - Event Listeners│   │ - Room Management│    │ - Notifications │
│ - Reconnection  │    │ - Notification Q │    │ - Data Models   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Contribución

Para extender el servicio:

1. Agrega nuevos eventos en `setupDataEventListeners()`
2. Crea métodos de notificación en la sección de manejadores
3. Actualiza la documentación con los nuevos eventos
4. Agrega endpoints REST si es necesario

## Licencia

Este servicio es parte del proyecto TransSync y está bajo la misma licencia.