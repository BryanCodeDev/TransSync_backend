// test_websocket.js - Script para probar la funcionalidad WebSocket
const io = require('socket.io-client');

// Configuración de prueba
const SERVER_URL = 'http://localhost:5000';
const TEST_TOKEN = 'tu_token_jwt_aqui'; // Reemplaza con un token válido

console.log('🧪 Iniciando pruebas de WebSocket...\n');

// Función para probar conexión WebSocket
function testWebSocketConnection() {
    console.log('1️⃣ Probando conexión WebSocket...');

    const socket = io(SERVER_URL, {
        auth: {
            token: TEST_TOKEN
        },
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('✅ Conexión WebSocket exitosa');
        console.log(`🔗 Socket ID: ${socket.id}`);

        // Unirse a sala de empresa de prueba
        socket.emit('join:empresa', { empresaId: 1 });
        console.log('📨 Unido a sala empresa_1');

        // Probar envío de notificación
        setTimeout(() => {
            socket.emit('notification:send', {
                targetType: 'empresa',
                targetId: 1,
                event: 'test:notification',
                data: { message: 'Prueba de notificación', timestamp: new Date() }
            });
            console.log('📨 Notificación de prueba enviada');
        }, 1000);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Desconectado del servidor WebSocket');
    });

    socket.on('connect_error', (error) => {
        console.log('❌ Error de conexión:', error.message);
    });

    // Escuchar eventos de notificación
    socket.on('conductor:created', (data) => {
        console.log('👨‍💼 Notificación de conductor creado:', data);
    });

    socket.on('vehiculo:created', (data) => {
        console.log('🚗 Notificación de vehículo creado:', data);
    });

    socket.on('ruta:created', (data) => {
        console.log('🗺️ Notificación de ruta creada:', data);
    });

    socket.on('viaje:created', (data) => {
        console.log('⏰ Notificación de viaje creado:', data);
    });

    socket.on('vencimiento:alert', (data) => {
        console.log('⚠️ Alerta de vencimiento:', data);
    });

    socket.on('browser:notification', (data) => {
        console.log('🔔 Notificación del navegador:', data);
    });

    socket.on('test:notification', (data) => {
        console.log('🧪 Notificación de prueba recibida:', data);
    });

    // Mantener conexión por 10 segundos para pruebas
    setTimeout(() => {
        console.log('\n⏰ Cerrando conexión de prueba...');
        socket.disconnect();
        process.exit(0);
    }, 10000);
}

// Función para probar endpoints REST de WebSocket
async function testWebSocketEndpoints() {
    console.log('\n2️⃣ Probando endpoints REST de WebSocket...');

    try {
        // Probar estadísticas de conexión
        const statsResponse = await fetch(`${SERVER_URL}/api/websocket/stats`);
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('✅ Estadísticas de WebSocket obtenidas:');
            console.log(`   📊 Conexiones totales: ${stats.stats.totalConnections}`);
            console.log(`   ⏱️ Uptime: ${Math.round(stats.stats.uptime / 60)} minutos`);
        } else {
            console.log('❌ Error obteniendo estadísticas:', statsResponse.status);
        }

        // Probar lista de clientes conectados
        const clientsResponse = await fetch(`${SERVER_URL}/api/websocket/clients`);
        if (clientsResponse.ok) {
            const clients = await clientsResponse.json();
            console.log('✅ Clientes conectados obtenidos:');
            console.log(`   👥 Total de clientes: ${clients.count}`);
        } else {
            console.log('❌ Error obteniendo clientes:', clientsResponse.status);
        }

    } catch (error) {
        console.log('❌ Error en pruebas REST:', error.message);
    }
}

// Función para probar health check con WebSocket
async function testHealthCheck() {
    console.log('\n3️⃣ Probando health check con WebSocket...');

    try {
        const response = await fetch(`${SERVER_URL}/api/health`);
        if (response.ok) {
            const health = await response.json();
            console.log('✅ Health check exitoso:');
            console.log(`   🚀 Estado: ${health.status}`);
            console.log(`   🔌 WebSocket: ${health.websocket}`);
            console.log(`   📦 Versión: ${health.version}`);
            console.log(`   🤖 Features: ${health.features.join(', ')}`);
        } else {
            console.log('❌ Error en health check:', response.status);
        }
    } catch (error) {
        console.log('❌ Error en health check:', error.message);
    }
}

// Ejecutar todas las pruebas
async function runAllTests() {
    console.log('🧪 SUITE DE PRUEBAS WEBSOCKET TRANSYNC\n');
    console.log('=' .repeat(50));

    // Prueba 1: Health Check
    await testHealthCheck();

    // Prueba 2: Endpoints REST
    await testWebSocketEndpoints();

    // Prueba 3: Conexión WebSocket
    testWebSocketConnection();

    console.log('\n📋 INSTRUCCIONES MANUALES:');
    console.log('1. Abre otra terminal y ejecuta: node server.js');
    console.log('2. Reemplaza TEST_TOKEN con un token JWT válido');
    console.log('3. Ejecuta: node test_websocket.js');
    console.log('4. Crea conductores/vehículos desde otra pestaña');
    console.log('5. Observa las notificaciones en tiempo real');
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testWebSocketConnection,
    testWebSocketEndpoints,
    testHealthCheck,
    runAllTests
};