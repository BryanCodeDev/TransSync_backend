// server.js
const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const cors = require("cors");
const path = require("path");
require('dotenv').config();

const routes = require("./src/routes");

// Crear servidor HTTP y Express
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Hacer app disponible globalmente para rutas WebSocket
global.app = app;

// Configurar Socket.IO con CORS
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',        // Web app
      'http://10.0.2.2:8081',         // Emulador Android con Expo
      'http://localhost:8081',        // Expo local
      'http://192.168.1.100:8081',    // Dispositivo físico (ajusta tu IP)
      'exp://192.168.1.100:19000',    // Expo tunnel
      'http://localhost:19006',       // Expo web
      '*://localhost*',               // Cualquier puerto localhost
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware de autenticación WebSocket
const websocketAuth = require('./src/middleware/websocketAuth');

// Aplicar autenticación a conexiones WebSocket
io.use(websocketAuth);

// Hacer io disponible globalmente
global.io = io;

// Importar y usar rutas WebSocket
require('./src/routes/websocketRoutes')(io);

// Importar servicio de programador para alertas automáticas
require('./src/services/schedulerService');

// --- Configuración CORS para React Native ---
const corsOptions = {
  origin: [
    'http://localhost:3000',        // Web app
    'http://10.0.2.2:8081',         // Emulador Android con Expo
    'http://localhost:8081',        // Expo local
    'http://192.168.1.100:8081',    // Dispositivo físico (ajusta tu IP)
    'exp://192.168.1.100:19000',    // Expo tunnel
    'http://localhost:19006',       // Expo web
    '*://localhost*',               // Cualquier puerto localhost
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

// --- Middlewares ---
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging de requests (desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
    next();
  });
}

// --- Servir archivos estáticos ---
app.use(express.static('public'));

// --- Manejar favicon.ico ---
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// --- Health check endpoint ---
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'TranSync Backend API está funcionando',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        database: 'Connected',
        websocket: 'Enabled',
        environment: process.env.NODE_ENV || 'development',
        features: [
            'REST API',
            'WebSocket Real-time',
            'JWT Authentication',
            'Advanced ChatBot AI',
            'Intelligent Caching',
            'Conversation Memory'
        ]
    });
});

// --- Ruta raíz de bienvenida ---
app.get('/', (req, res) => {
    res.json({
        status: 'SUCCESS',
        message: '🚀 TRANSSYNC Backend API con WebSocket',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            admin: '/api/admin',
            conductores: '/api/conductores',
            vehiculos: '/api/vehiculos',
            rutas: '/api/rutas',
            viajes: '/api/viajes',
            dashboard: '/api/dashboard',
            chatbot: '/api/chatbot',
            websocket: {
                stats: '/api/websocket/stats',
                clients: '/api/websocket/clients'
            }
        },
        websocket: {
            enabled: true,
            url: `ws://localhost:${PORT}`,
            features: [
                'Real-time notifications',
                'Live chat updates',
                'Expiration alerts',
                'Connection monitoring'
            ]
        },
        cors: {
            enabled: true,
            allowedOrigins: corsOptions.origin
        },
        documentation: 'Visita /api/health para verificar el estado del servidor'
    });
});

// --- Rutas de la API ---
app.use("/api", routes);

// --- Manejo de errores 404 ---
app.use((req, res) => {
    res.status(404).json({
        status: 'ERROR',
        message: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET /api/health',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/verify',
            'GET /api/auth/profile',
            'GET /api/websocket/stats',
            'GET /api/websocket/clients',
            'POST /api/chatbot/consulta'
        ],
        websocket: {
            url: `ws://localhost:${PORT}`,
            auth: 'Requiere token JWT en handshake'
        },
        suggestion: 'Verifica que la URL sea correcta y que incluya el prefijo /api'
    });
});

// --- Manejo de errores del servidor ---
app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);
    res.status(500).json({
        status: 'ERROR',
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { 
            error: error.message,
            stack: error.stack 
        })
    });
});

// --- Iniciar Servidor con WebSocket ---
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log(`🔗 Health check en http://localhost:${PORT}/api/health`);
    console.log(`🔌 WebSocket disponible en ws://localhost:${PORT}`);
    console.log(`📱 Para React Native emulador: http://10.0.2.2:${PORT}/api`);
    console.log(`🌐 CORS habilitado para múltiples orígenes`);
    console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 WebSocket: Habilitado con autenticación JWT`);
});

// Exportar para testing
module.exports = { app, server, io };