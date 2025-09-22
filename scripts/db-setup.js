#!/usr/bin/env node

/**
 * Script de configuración de base de datos cross-platform
 * Compatible con Windows, macOS y Linux
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Función para obtener variables de entorno con valores por defecto
function getEnvVar(name, defaultValue = '') {
    return process.env[name] || defaultValue;
}

// Función para construir comando mysql cross-platform
function buildMySQLCommand(user, password, host, port, database) {
    const baseCmd = isWindows ? 'mysql.exe' : 'mysql';

    const args = [];

    if (user) args.push(`-u${user}`);
    if (password) args.push(`-p${password}`);
    if (host) args.push(`-h${host}`);
    if (port) args.push(`-P${port}`);
    if (database) args.push(database);

    return { command: baseCmd, args };
}

// Función para verificar si mysql está disponible
function checkMySQLAvailability() {
    try {
        if (isWindows) {
            // En Windows, intentar ejecutar mysql directamente
            execSync('mysql --version', { stdio: 'pipe' });
        } else {
            // En Unix-like, usar which
            execSync('which mysql', { stdio: 'pipe' });
        }
        return true;
    } catch (error) {
        return false;
    }
}

// Función para ejecutar comando MySQL
function executeMySQLCommand(user, password, host, port, database, sqlFile) {
    const { command, args } = buildMySQLCommand(user, password, host, port, database);

    console.log(`🔧 Ejecutando: ${command} ${args.join(' ')} < ${sqlFile}`);
    console.log(`📊 Configuración:`);
    console.log(`   Usuario: ${user || 'root'}`);
    console.log(`   Host: ${host || 'localhost'}`);
    console.log(`   Puerto: ${port || '3306'}`);
    console.log(`   Base de datos: ${database || 'transync'}`);
    console.log(`   Archivo SQL: ${sqlFile}`);
    console.log('');

    return new Promise((resolve, reject) => {
        const mysqlProcess = isWindows
            ? spawn(command, args, {
                stdio: ['pipe', 'inherit', 'inherit'],
                shell: true
              })
            : spawn(command, args, {
                stdio: ['pipe', 'inherit', 'inherit']
              });

        // Escribir el contenido del archivo SQL a stdin
        const fs = require('fs');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        mysqlProcess.stdin.write(sqlContent);
        mysqlProcess.stdin.end();

        mysqlProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Base de datos configurada exitosamente');
                resolve();
            } else {
                console.error(`❌ Error ejecutando MySQL (código: ${code})`);
                reject(new Error(`MySQL process exited with code ${code}`));
            }
        });

        mysqlProcess.on('error', (error) => {
            console.error('❌ Error ejecutando MySQL:', error.message);
            reject(error);
        });
    });
}

// Función principal
async function main() {
    const command = process.argv[2] || 'setup';

    console.log('🚀 TransSync Database Setup');
    console.log('==============================');

    // Verificar si MySQL está disponible
    if (!checkMySQLAvailability()) {
        console.error('❌ MySQL no está disponible en el sistema');
        console.log('');
        console.log('💡 Soluciones:');
        console.log('   1. Instalar MySQL Server');
        console.log('   2. Agregar MySQL al PATH');
        console.log('   3. Usar XAMPP/WAMP/MAMP');
        console.log('   4. Verificar que MySQL esté ejecutándose');
        process.exit(1);
    }

    // Obtener configuración de variables de entorno
    const dbUser = getEnvVar('DB_USER', 'root');
    const dbPassword = getEnvVar('DB_PASSWORD', '');
    const dbHost = getEnvVar('DB_HOST', 'localhost');
    const dbPort = getEnvVar('DB_PORT', '3306');
    const dbDatabase = getEnvVar('DB_DATABASE', 'transync');
    const sqlFile = './Version_final.sql';

    try {
        if (command === 'setup') {
            console.log('📋 Configurando base de datos...');
            await executeMySQLCommand(dbUser, dbPassword, dbHost, dbPort, dbDatabase, sqlFile);
        } else if (command === 'migrate') {
            console.log('🔄 Ejecutando migración...');
            await executeMySQLCommand('root', dbPassword, dbHost, dbPort, dbDatabase, sqlFile);
        } else {
            console.error(`❌ Comando desconocido: ${command}`);
            console.log('💡 Comandos disponibles: setup, migrate');
            process.exit(1);
        }

        console.log('');
        console.log('🎉 ¡Configuración completada!');
        console.log('');
        console.log('📋 Resumen:');
        console.log(`   Base de datos: ${dbDatabase}`);
        console.log(`   Host: ${dbHost}:${dbPort}`);
        console.log(`   Usuario: ${dbUser}`);
        console.log(`   Estado: ✅ Configurada`);

    } catch (error) {
        console.error('');
        console.error('❌ Error durante la configuración:');
        console.error(error.message);
        console.log('');
        console.log('🔧 Solución de problemas:');
        console.log('   1. Verificar que MySQL esté ejecutándose');
        console.log('   2. Verificar las credenciales en el archivo .env');
        console.log('   3. Verificar que la base de datos exista');
        console.log('   4. Verificar que el archivo Version_final.sql exista');
        console.log('   5. Probar la conexión manualmente:');
        console.log(`      mysql -u ${dbUser} -p -h ${dbHost} -P ${dbPort} ${dbDatabase}`);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    executeMySQLCommand,
    checkMySQLAvailability,
    buildMySQLCommand
};