// src/config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306, // Agregar puerto, por defecto 3306
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Configuraciones adicionales para debugging
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL');
        console.log(`📊 Base de datos: ${process.env.DB_DATABASE}`);
        console.log(`🌐 Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        console.error('📋 Verificar configuración en .env:');
        console.error(`   DB_HOST: ${process.env.DB_HOST}`);
        console.error(`   DB_USER: ${process.env.DB_USER}`);
        console.error(`   DB_DATABASE: ${process.env.DB_DATABASE}`);
        console.error(`   DB_PORT: ${process.env.DB_PORT || 3306}`);
        return false;
    }
}

// Probar conexión al inicializar
testConnection();

module.exports = pool;