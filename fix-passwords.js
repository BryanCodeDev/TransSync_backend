// fix-passwords.js
// Script directo para hashear las contraseñas existentes en la base de datos

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

async function fixPasswords() {
    console.log('🔄 Corrigiendo contraseñas en la base de datos...');
    
    try {
        // Contraseñas por defecto
        const users = [
            { email: 'admintransync@gmail.com', password: 'admin123' },
            { email: 'adminrapidotolima@gmail.com', password: 'admin124' }
        ];

        for (const user of users) {
            console.log(`🔐 Procesando ${user.email}...`);
            
            // Hashear la contraseña
            const hashedPassword = await hashPassword(user.password);
            
            // Actualizar en la base de datos
            const [result] = await pool.query(
                'UPDATE Usuarios SET passwordHash = ? WHERE email = ?',
                [hashedPassword, user.email]
            );
            
            if (result.affectedRows > 0) {
                console.log(`✅ ${user.email} actualizado (password: ${user.password})`);
                
                // Verificar que funciona
                const isValid = await verifyPassword(user.password, hashedPassword);
                console.log(`🔍 Verificación: ${isValid ? 'CORRECTA' : 'ERROR'}`);
            } else {
                console.log(`❌ No se encontró usuario: ${user.email}`);
            }
        }
        
        console.log('\n🎉 Proceso completado!');
        console.log('🚀 Ahora puedes hacer login con:');
        console.log('   Email: admintransync@gmail.com');
        console.log('   Password: admin123');
        console.log('   Email: adminrapidotolima@gmail.com');
        console.log('   Password: admin124');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

// Ejecutar el script
fixPasswords();