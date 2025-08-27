// src/controllers/chatbotController.js

const pool = require('../config/db');

/**
 * Procesar consulta del chatbot y generar respuesta inteligente
 */
const procesarConsulta = async (req, res) => {
    try {
        const { mensaje, idEmpresa = 1, idUsuario = null } = req.body;

        if (!mensaje || mensaje.trim() === '') {
            return res.status(400).json({ 
                message: 'El mensaje es requerido',
                respuesta: 'Por favor, escribe tu consulta.'
            });
        }

        // Analizar el mensaje y determinar la intención
        const intencion = analizarIntencion(mensaje.toLowerCase());
        
        // Generar respuesta basada en la intención y datos reales
        const respuesta = await generarRespuesta(intencion, mensaje, idEmpresa);

        // Registrar la interacción para análisis posterior
        await registrarInteraccion(mensaje, respuesta, idEmpresa, idUsuario);

        res.json({
            success: true,
            intencion: intencion.tipo,
            respuesta: respuesta,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error en procesarConsulta:', error);
        res.status(500).json({ 
            message: 'Error del servidor',
            respuesta: 'Lo siento, ocurrió un error procesando tu consulta. Por favor intenta de nuevo.'
        });
    }
};

/**
 * Analizar la intención del mensaje del usuario
 */
function analizarIntencion(mensaje) {
    const intenciones = {
        saludo: {
            palabras: ['hola', 'buenos', 'buenas', 'saludos', 'hey', 'hi'],
            tipo: 'saludo'
        },
        conductores: {
            palabras: ['conductor', 'conductores', 'chofer', 'choferes', 'driver'],
            tipo: 'conductores'
        },
        vehiculos: {
            palabras: ['vehiculo', 'vehiculos', 'vehículo', 'vehículos', 'bus', 'buses', 'auto', 'carro', 'flota'],
            tipo: 'vehiculos'
        },
        rutas: {
            palabras: ['ruta', 'rutas', 'recorrido', 'recorridos', 'trayecto', 'itinerario'],
            tipo: 'rutas'
        },
        horarios: {
            palabras: ['horario', 'horarios', 'tiempo', 'hora', 'programacion', 'cronograma'],
            tipo: 'horarios'
        },
        estado: {
            palabras: ['estado', 'estatus', 'situacion', 'condicion', 'disponible', 'activo', 'inactivo'],
            tipo: 'estado'
        },
        reportes: {
            palabras: ['reporte', 'reportes', 'informe', 'informes', 'estadistica', 'estadisticas', 'datos'],
            tipo: 'reportes'
        },
        vencimientos: {
            palabras: ['vencimiento', 'vencimientos', 'expira', 'caduca', 'licencia', 'soat', 'tecnica'],
            tipo: 'vencimientos'
        },
        ayuda: {
            palabras: ['ayuda', 'help', 'que puedes hacer', 'opciones', 'menu', 'funciones'],
            tipo: 'ayuda'
        },
        despedida: {
            palabras: ['gracias', 'thanks', 'adios', 'bye', 'chao', 'hasta luego'],
            tipo: 'despedida'
        }
    };

    // Buscar coincidencias
    for (const [key, intencion] of Object.entries(intenciones)) {
        if (intencion.palabras.some(palabra => mensaje.includes(palabra))) {
            return { tipo: intencion.tipo, confianza: 0.8 };
        }
    }

    return { tipo: 'desconocido', confianza: 0.1 };
}

/**
 * Generar respuesta basada en la intención y datos reales
 */
async function generarRespuesta(intencion, mensaje, idEmpresa) {
    try {
        switch (intencion.tipo) {
            case 'saludo':
                return await responderSaludo();

            case 'conductores':
                return await responderConductores(mensaje, idEmpresa);

            case 'vehiculos':
                return await responderVehiculos(mensaje, idEmpresa);

            case 'rutas':
                return await responderRutas(mensaje, idEmpresa);

            case 'horarios':
                return await responderHorarios(mensaje, idEmpresa);

            case 'estado':
                return await responderEstado(mensaje, idEmpresa);

            case 'reportes':
                return await responderReportes(mensaje, idEmpresa);

            case 'vencimientos':
                return await responderVencimientos(mensaje, idEmpresa);

            case 'ayuda':
                return responderAyuda();

            case 'despedida':
                return responderDespedida();

            default:
                return responderDesconocido();
        }
    } catch (error) {
        console.error('Error generando respuesta:', error);
        return 'Lo siento, no pude procesar tu consulta en este momento. Por favor contacta al administrador del sistema.';
    }
}

/**
 * Respuestas específicas por tipo
 */
async function responderSaludo() {
    const saludos = [
        '¡Hola! Soy tu asistente virtual de TransSync. ¿En qué puedo ayudarte hoy?',
        '¡Buenos días! Estoy aquí para ayudarte con información sobre conductores, vehículos, rutas y más.',
        '¡Saludos! ¿Qué información necesitas del sistema TransSync?'
    ];
    return saludos[Math.floor(Math.random() * saludos.length)];
}

async function responderConductores(mensaje, idEmpresa) {
    try {
        const [estadisticas] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estConductor = 'ACTIVO' THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN estConductor = 'INACTIVO' THEN 1 ELSE 0 END) as inactivos,
                SUM(CASE WHEN v.idConductorAsignado IS NOT NULL THEN 1 ELSE 0 END) as conVehiculo
            FROM Conductores c
            LEFT JOIN Vehiculos v ON c.idConductor = v.idConductorAsignado
            WHERE c.idEmpresa = ?
        `, [idEmpresa]);

        const stats = estadisticas[0];
        
        if (mensaje.includes('activo') || mensaje.includes('disponible')) {
            return `📊 **Estado de Conductores:**\n• **Activos:** ${stats.activos} conductores\n• **Con vehículo asignado:** ${stats.conVehiculo}\n• **Disponibles:** ${stats.activos - stats.conVehiculo}\n\nPuedes consultar más detalles en la sección Conductores del panel principal.`;
        }

        return `👨‍💼 **Resumen de Conductores:**\n• **Total:** ${stats.total} conductores registrados\n• **Activos:** ${stats.activos}\n• **Inactivos:** ${stats.inactivos}\n• **Con vehículo asignado:** ${stats.conVehiculo}\n\n¿Te interesa información específica sobre licencias o asignaciones?`;
    } catch (error) {
        return 'No pude acceder a la información de conductores en este momento. Verifica tu conexión o contacta al administrador.';
    }
}

async function responderVehiculos(mensaje, idEmpresa) {
    try {
        const [estadisticas] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estVehiculo = 'DISPONIBLE' THEN 1 ELSE 0 END) as disponibles,
                SUM(CASE WHEN estVehiculo = 'EN_RUTA' THEN 1 ELSE 0 END) as enRuta,
                SUM(CASE WHEN estVehiculo = 'EN_MANTENIMIENTO' THEN 1 ELSE 0 END) as enMantenimiento,
                SUM(CASE WHEN idConductorAsignado IS NOT NULL THEN 1 ELSE 0 END) as conConductor
            FROM Vehiculos
            WHERE idEmpresa = ?
        `, [idEmpresa]);

        const stats = estadisticas[0];

        if (mensaje.includes('disponible') || mensaje.includes('libre')) {
            return `🚌 **Vehículos Disponibles:**\n• **Disponibles:** ${stats.disponibles} vehículos\n• **En ruta:** ${stats.enRuta}\n• **En mantenimiento:** ${stats.enMantenimiento}\n\nConsulta el panel de Vehículos para ver detalles específicos de cada unidad.`;
        }

        return `🚗 **Estado de la Flota:**\n• **Total:** ${stats.total} vehículos\n• **Disponibles:** ${stats.disponibles}\n• **En ruta:** ${stats.enRuta}\n• **En mantenimiento:** ${stats.enMantenimiento}\n• **Con conductor:** ${stats.conConductor}\n\n¿Necesitas información sobre mantenimientos o asignaciones?`;
    } catch (error) {
        return 'No pude acceder a la información de vehículos. Por favor intenta más tarde.';
    }
}

async function responderRutas(mensaje, idEmpresa) {
    try {
        const [rutas] = await pool.query(`
            SELECT nomRuta, oriRuta, desRuta
            FROM Rutas 
            WHERE idEmpresa = ?
            LIMIT 10
        `, [idEmpresa]);

        if (rutas.length === 0) {
            return '📍 No hay rutas registradas en el sistema para tu empresa.';
        }

        let respuesta = `📍 **Rutas Registradas (${rutas.length}):**\n\n`;
        rutas.forEach((ruta, index) => {
            respuesta += `${index + 1}. **${ruta.nomRuta}**\n   📍 ${ruta.oriRuta} → ${ruta.desRuta}\n\n`;
        });

        respuesta += 'Consulta la sección Rutas para ver mapas interactivos y más detalles.';
        return respuesta;
    } catch (error) {
        return 'No pude acceder a la información de rutas. Verifica tu conexión.';
    }
}

async function responderHorarios(mensaje, idEmpresa) {
    try {
        const [viajes] = await pool.query(`
            SELECT 
                COUNT(*) as totalViajes,
                SUM(CASE WHEN estViaje = 'PROGRAMADO' THEN 1 ELSE 0 END) as programados,
                SUM(CASE WHEN estViaje = 'EN_CURSO' THEN 1 ELSE 0 END) as enCurso,
                SUM(CASE WHEN DATE(fecHorSalViaje) = CURDATE() THEN 1 ELSE 0 END) as hoy
            FROM Viajes v
            JOIN Vehiculos ve ON v.idVehiculo = ve.idVehiculo
            WHERE ve.idEmpresa = ?
        `, [idEmpresa]);

        const stats = viajes[0];
        
        return `⏰ **Programación de Viajes:**\n• **Total programados:** ${stats.programados}\n• **En curso:** ${stats.enCurso}\n• **Viajes de hoy:** ${stats.hoy}\n\nVisita la sección Horarios para programar nuevos viajes o consultar la agenda completa.`;
    } catch (error) {
        return '⏰ La información de horarios no está disponible momentáneamente. Consulta directamente en el panel de Horarios.';
    }
}

async function responderEstado(mensaje, idEmpresa) {
    try {
        const [resumen] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM Conductores WHERE idEmpresa = ? AND estConductor = 'ACTIVO') as conductoresActivos,
                (SELECT COUNT(*) FROM Vehiculos WHERE idEmpresa = ? AND estVehiculo = 'DISPONIBLE') as vehiculosDisponibles,
                (SELECT COUNT(*) FROM Viajes v JOIN Vehiculos ve ON v.idVehiculo = ve.idVehiculo WHERE ve.idEmpresa = ? AND v.estViaje = 'EN_CURSO') as viajesEnCurso
        `, [idEmpresa, idEmpresa, idEmpresa]);

        const stats = resumen[0];

        return `📊 **Estado General del Sistema:**\n\n🟢 **Conductores activos:** ${stats.conductoresActivos}\n🟢 **Vehículos disponibles:** ${stats.vehiculosDisponibles}\n🔵 **Viajes en curso:** ${stats.viajesEnCurso}\n\nTodo funcionando correctamente. Consulta cada sección para más detalles específicos.`;
    } catch (error) {
        return '📊 No puedo acceder al estado general en este momento. Verifica las secciones individuales del sistema.';
    }
}

async function responderVencimientos(mensaje, idEmpresa) {
    try {
        const [licencias] = await pool.query(`
            SELECT COUNT(*) as count
            FROM Conductores 
            WHERE idEmpresa = ? 
            AND fecVenLicConductor <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            AND fecVenLicConductor >= CURDATE()
        `, [idEmpresa]);

        const [vehiculos] = await pool.query(`
            SELECT COUNT(*) as count
            FROM Vehiculos 
            WHERE idEmpresa = ? 
            AND (
                fecVenSOAT <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) OR
                fecVenTec <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            )
        `, [idEmpresa]);

        const licenciasVencen = licencias[0].count;
        const vehiculosVencen = vehiculos[0].count;

        if (licenciasVencen === 0 && vehiculosVencen === 0) {
            return '✅ **Vencimientos:** ¡Perfecto! No hay documentos próximos a vencer en los próximos 30 días.';
        }

        let respuesta = '⚠️ **Alertas de Vencimiento (próximos 30 días):**\n\n';
        if (licenciasVencen > 0) {
            respuesta += `🪪 **${licenciasVencen} licencias de conducir** próximas a vencer\n`;
        }
        if (vehiculosVencen > 0) {
            respuesta += `🚗 **${vehiculosVencen} vehículos** con documentos próximos a vencer\n`;
        }
        respuesta += '\nRevisa las secciones correspondientes para tomar las acciones necesarias.';

        return respuesta;
    } catch (error) {
        return '⚠️ No pude verificar los vencimientos. Consulta directamente las secciones de Conductores y Vehículos.';
    }
}

async function responderReportes(mensaje, idEmpresa) {
    return `📊 **Reportes Disponibles:**\n\n• **Dashboard Principal:** Métricas en tiempo real\n• **Informes de Conductores:** Rendimiento y estadísticas\n• **Reportes de Flota:** Estado y utilización de vehículos\n• **Análisis de Rutas:** Eficiencia y tiempos\n• **Reportes de Mantenimiento:** Historial y programación\n\nAccede a la sección Informes para generar reportes detallados y exportar datos.`;
}

function responderAyuda() {
    return `🔧 **¿En qué puedo ayudarte?**\n\nPuedo proporcionarte información sobre:\n\n🚗 **Vehículos:** Estado, disponibilidad, mantenimiento\n👨‍💼 **Conductores:** Disponibilidad, licencias, asignaciones\n📍 **Rutas:** Recorridos registrados y programación\n⏰ **Horarios:** Viajes programados y en curso\n📊 **Reportes:** Estadísticas y análisis del sistema\n⚠️ **Vencimientos:** Alertas de documentos próximos a vencer\n\n**Ejemplos de consultas:**\n• "¿Cuántos conductores están activos?"\n• "Muéstrame el estado de los vehículos"\n• "¿Hay licencias por vencer?"\n• "¿Qué rutas tenemos disponibles?"`;
}

function responderDespedida() {
    const despedidas = [
        '¡De nada! Estoy aquí cuando necesites información del sistema TransSync.',
        '¡Perfecto! No dudes en consultarme cuando requieras datos actualizados.',
        '¡Hasta pronto! Estaré disponible para ayudarte con el sistema.'
    ];
    return despedidas[Math.floor(Math.random() * despedidas.length)];
}

function responderDesconocido() {
    return `🤔 No entendí completamente tu consulta. \n\n**Puedo ayudarte con:**\n• Estado de conductores y vehículos\n• Información de rutas y horarios\n• Reportes y estadísticas\n• Alertas de vencimientos\n\n**Prueba preguntando:**\n• "¿Cuántos conductores están disponibles?"\n• "Muestra el estado de la flota"\n• "¿Hay documentos por vencer?"\n\nO simplemente escribe "ayuda" para ver todas mis funciones.`;
}

/**
 * Registrar interacción para análisis posterior
 */
async function registrarInteraccion(mensaje, respuesta, idEmpresa, idUsuario) {
    try {
        // Crear tabla de interacciones si no existe (opcional)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS InteraccionesChatbot (
                idInteraccion INT AUTO_INCREMENT PRIMARY KEY,
                mensaje TEXT NOT NULL,
                respuesta TEXT NOT NULL,
                idEmpresa INT,
                idUsuario INT NULL,
                fechaInteraccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_empresa (idEmpresa),
                INDEX idx_fecha (fechaInteraccion)
            )
        `);

        await pool.query(`
            INSERT INTO InteraccionesChatbot (mensaje, respuesta, idEmpresa, idUsuario)
            VALUES (?, ?, ?, ?)
        `, [mensaje, respuesta, idEmpresa, idUsuario]);

    } catch (error) {
        // No fallar si no se puede registrar la interacción
        console.log('No se pudo registrar la interacción:', error.message);
    }
}

/**
 * Obtener estadísticas de uso del chatbot
 */
const getEstadisticasChatbot = async (req, res) => {
    try {
        const { idEmpresa = 1, dias = 30 } = req.query;

        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as totalInteracciones,
                COUNT(DISTINCT DATE(fechaInteraccion)) as diasActivos,
                AVG(CHAR_LENGTH(mensaje)) as promedioLongitudMensaje,
                DATE(fechaInteraccion) as fecha,
                COUNT(*) as interaccionesPorDia
            FROM InteraccionesChatbot 
            WHERE idEmpresa = ? 
            AND fechaInteraccion >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(fechaInteraccion)
            ORDER BY fecha DESC
        `, [idEmpresa, dias]);

        res.json({
            success: true,
            estadisticas: stats,
            periodo: `${dias} días`
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas del chatbot:', error);
        res.status(500).json({ 
            message: 'Error obteniendo estadísticas',
            estadisticas: []
        });
    }
};

module.exports = {
    procesarConsulta,
    getEstadisticasChatbot
};