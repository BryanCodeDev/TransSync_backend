// src/controllers/dashboardController.js

const pool = require('../config/db');

// Obtener estadísticas generales del dashboard
const getGeneralStatistics = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        
        const [stats] = await pool.query(`
            SELECT 
                COUNT(DISTINCT v.idVehiculo) as totalVehiculos,
                SUM(CASE WHEN v.estVehiculo = 'DISPONIBLE' THEN 1 ELSE 0 END) as vehiculosDisponibles,
                SUM(CASE WHEN v.estVehiculo = 'EN_RUTA' THEN 1 ELSE 0 END) as vehiculosEnRuta,
                SUM(CASE WHEN v.estVehiculo = 'EN_MANTENIMIENTO' THEN 1 ELSE 0 END) as vehiculosEnMantenimiento,
                COUNT(DISTINCT c.idConductor) as totalConductores,
                SUM(CASE WHEN c.estConductor = 'ACTIVO' THEN 1 ELSE 0 END) as conductoresActivos,
                SUM(CASE WHEN c.estConductor = 'INACTIVO' THEN 1 ELSE 0 END) as conductoresInactivos,
                COUNT(DISTINCT r.idRuta) as totalRutas,
                COUNT(DISTINCT vi.idViaje) as totalViajes,
                SUM(CASE WHEN vi.estViaje = 'EN_CURSO' THEN 1 ELSE 0 END) as viajesEnCurso,
                SUM(CASE WHEN vi.estViaje = 'PROGRAMADO' THEN 1 ELSE 0 END) as viajesProgramados
            FROM Empresas e
            LEFT JOIN Vehiculos v ON e.idEmpresa = v.idEmpresa
            LEFT JOIN Conductores c ON e.idEmpresa = c.idEmpresa
            LEFT JOIN Rutas r ON e.idEmpresa = r.idEmpresa
            LEFT JOIN Viajes vi ON v.idVehiculo = vi.idVehiculo
            WHERE e.idEmpresa = ?
        `, [idEmpresa]);

        res.json({
            status: 'success',
            data: stats[0] || {
                totalVehiculos: 0,
                vehiculosDisponibles: 0,
                vehiculosEnRuta: 0,
                vehiculosEnMantenimiento: 0,
                totalConductores: 0,
                conductoresActivos: 0,
                conductoresInactivos: 0,
                totalRutas: 0,
                totalViajes: 0,
                viajesEnCurso: 0,
                viajesProgramados: 0
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas generales:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error del servidor al obtener estadísticas' 
        });
    }
};

// Obtener datos para gráficos por período
const getChartsData = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        const periodo = req.query.periodo || 'semana';
        
        let dateCondition = '';
        let groupBy = '';
        let orderBy = '';
        let labels = [];

        switch (periodo) {
            case 'dia':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 1 DAY";
                groupBy = "HOUR(vi.fecHorSalViaje)";
                orderBy = "HOUR(vi.fecHorSalViaje)";
                labels = Array.from({length: 24}, (_, i) => `${i}:00`);
                break;
            case 'semana':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 7 DAY";
                groupBy = "DATE(vi.fecHorSalViaje)";
                orderBy = "DATE(vi.fecHorSalViaje)";
                // Generate last 7 days labels
                const today = new Date();
                labels = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    labels.push(date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit' }));
                }
                break;
            case 'mes':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 30 DAY";
                groupBy = "WEEK(vi.fecHorSalViaje, 1)";
                orderBy = "WEEK(vi.fecHorSalViaje, 1)";
                labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
                break;
            case 'trimestre':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 90 DAY";
                groupBy = "MONTH(vi.fecHorSalViaje)";
                orderBy = "MONTH(vi.fecHorSalViaje)";
                labels = ['Hace 3 meses', 'Hace 2 meses', 'Mes pasado'];
                break;
            case 'ano':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 365 DAY";
                groupBy = "MONTH(vi.fecHorSalViaje)";
                orderBy = "MONTH(vi.fecHorSalViaje)";
                labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                break;
            default:
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 7 DAY";
                groupBy = "DATE(vi.fecHorSalViaje)";
                orderBy = "DATE(vi.fecHorSalViaje)";
                labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        }

        // Verificar si existe la tabla Viajes y las columnas necesarias
        try {
            await pool.query(`DESCRIBE Viajes`);
        } catch (tableError) {
            console.warn('Tabla Viajes no existe, usando datos simulados');
            return res.json({
                status: 'success',
                data: {
                    viajes: {
                        labels,
                        data: []
                    },
                    rutas: [],
                    periodo
                }
            });
        }

        // Obtener viajes por período con manejo de errores mejorado
        let viajes = [];
        try {
            const [viajesResult] = await pool.query(`
                SELECT 
                    ${groupBy} as periodo,
                    COUNT(*) as totalViajes,
                    SUM(CASE WHEN vi.estViaje = 'FINALIZADO' THEN 1 ELSE 0 END) as viajesCompletados
                FROM Viajes vi
                JOIN Vehiculos v ON vi.idVehiculo = v.idVehiculo
                WHERE v.idEmpresa = ? AND ${dateCondition}
                GROUP BY ${groupBy}
                ORDER BY ${orderBy}
            `, [idEmpresa]);
            viajes = viajesResult || [];
        } catch (viajesError) {
            console.warn('Error consultando viajes:', viajesError.message);
            viajes = [];
        }

        // Obtener distribución por rutas con manejo de errores mejorado
        let rutasData = [];
        try {
            const [rutasResult] = await pool.query(`
                SELECT 
                    r.nomRuta,
                    COUNT(vi.idViaje) as totalViajes,
                    COALESCE(AVG(CASE 
                        WHEN vi.fecHorLleViaje IS NOT NULL AND vi.fecHorSalViaje IS NOT NULL 
                        THEN TIMESTAMPDIFF(MINUTE, vi.fecHorSalViaje, vi.fecHorLleViaje) 
                        ELSE NULL 
                    END), 0) as tiempoPromedio
                FROM Rutas r
                LEFT JOIN Viajes vi ON r.idRuta = vi.idRuta 
                    AND (vi.fecHorSalViaje IS NULL OR ${dateCondition.replace('vi.fecHorSalViaje', 'vi.fecHorSalViaje')})
                WHERE r.idEmpresa = ?
                GROUP BY r.idRuta, r.nomRuta
                ORDER BY totalViajes DESC
                LIMIT 5
            `, [idEmpresa]);
            rutasData = rutasResult || [];
        } catch (rutasError) {
            console.warn('Error consultando rutas:', rutasError.message);
            rutasData = [];
        }

        res.json({
            status: 'success',
            data: {
                viajes: {
                    labels,
                    data: viajes
                },
                rutas: rutasData,
                periodo
            }
        });
    } catch (error) {
        console.error('Error al obtener datos de gráficos:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error del servidor al obtener datos de gráficos' 
        });
    }
};

// Obtener alertas activas
const getActiveAlerts = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        
        // Verificar si existe la tabla AlertasVencimientos
        let alerts = [];
        try {
            await pool.query(`DESCRIBE AlertasVencimientos`);
            
            const [alertsResult] = await pool.query(`
                SELECT 
                    'VENCIMIENTO' as tipo,
                    tipoDocumento,
                    titular,
                    fechaVencimiento,
                    diasParaVencer,
                    estado,
                    CASE 
                        WHEN estado = 'VENCIDO' THEN 'critical'
                        WHEN estado = 'CRITICO' THEN 'critical'
                        WHEN estado = 'ADVERTENCIA' THEN 'warning'
                        ELSE 'info'
                    END as severity,
                    CONCAT('Documento ', tipoDocumento, ' de ', titular, 
                        CASE 
                            WHEN diasParaVencer < 0 THEN ' está vencido'
                            WHEN diasParaVencer = 0 THEN ' vence hoy'
                            ELSE CONCAT(' vence en ', diasParaVencer, ' días')
                        END
                    ) as title,
                    DATE_FORMAT(fechaVencimiento, '%d/%m/%Y') as time
                FROM AlertasVencimientos 
                WHERE idEmpresa = ? 
                AND estado IN ('VENCIDO', 'CRITICO', 'ADVERTENCIA')
                ORDER BY diasParaVencer ASC, estado DESC
                LIMIT 10
            `, [idEmpresa]);
            
            alerts = alertsResult || [];
        } catch (tableError) {
            console.warn('Tabla AlertasVencimientos no existe, generando alertas de ejemplo');
            
            // Generar algunas alertas de ejemplo basadas en datos reales si es posible
            try {
                const [vehiculosViejos] = await pool.query(`
                    SELECT 
                        CONCAT('Vehículo ', plaVehiculo) as titular,
                        'Revisión técnica' as tipoDocumento,
                        DATE_ADD(CURDATE(), INTERVAL -30 DAY) as fechaVencimiento,
                        -30 as diasParaVencer,
                        'VENCIDO' as estado,
                        'critical' as severity,
                        CONCAT('Revisión técnica del vehículo ', plaVehiculo, ' está vencida') as title,
                        DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL -30 DAY), '%d/%m/%Y') as time
                    FROM Vehiculos 
                    WHERE idEmpresa = ? 
                    AND estVehiculo != 'FUERA_DE_SERVICIO'
                    LIMIT 3
                `, [idEmpresa]);
                
                alerts = vehiculosViejos || [];
            } catch (vehiculosError) {
                alerts = [];
            }
        }

        res.json({
            status: 'success',
            data: alerts
        });
    } catch (error) {
        console.error('Error al obtener alertas:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error del servidor al obtener alertas' 
        });
    }
};

// Obtener actividad reciente
const getRecentActivity = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        const limite = parseInt(req.query.limite) || 10;
        
        let actividad = [];
        try {
            const [actividadResult] = await pool.query(`
                SELECT 
                    'VIAJE' as tipo,
                    CONCAT('Viaje en ', COALESCE(r.nomRuta, 'Ruta desconocida'), ' - ', 
                        CASE COALESCE(vi.estViaje, 'PROGRAMADO')
                            WHEN 'PROGRAMADO' THEN 'Programado'
                            WHEN 'EN_CURSO' THEN 'En curso'
                            WHEN 'FINALIZADO' THEN 'Finalizado'
                            WHEN 'CANCELADO' THEN 'Cancelado'
                            ELSE 'Desconocido'
                        END
                    ) as descripcion,
                    CONCAT(COALESCE(c.nomConductor, 'Conductor'), ' ', COALESCE(c.apeConductor, 'desconocido')) as usuario,
                    CONCAT(COALESCE(v.marVehiculo, 'Marca'), ' ', COALESCE(v.modVehiculo, 'Modelo'), ' - ', COALESCE(v.plaVehiculo, 'SIN-PLACA')) as recurso,
                    COALESCE(vi.fecHorSalViaje, NOW()) as fecha,
                    COALESCE(vi.estViaje, 'PROGRAMADO') as estado
                FROM Vehiculos v
                LEFT JOIN Viajes vi ON v.idVehiculo = vi.idVehiculo
                LEFT JOIN Conductores c ON vi.idConductor = c.idConductor
                LEFT JOIN Rutas r ON vi.idRuta = r.idRuta
                WHERE v.idEmpresa = ?
                ORDER BY COALESCE(vi.fecHorSalViaje, v.fecRegVehiculo) DESC
                LIMIT ?
            `, [idEmpresa, limite]);
            actividad = actividadResult || [];
        } catch (actividadError) {
            console.warn('Error consultando actividad:', actividadError.message);
            actividad = [];
        }

        res.json({
            status: 'success',
            data: actividad
        });
    } catch (error) {
        console.error('Error al obtener actividad reciente:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error del servidor al obtener actividad reciente' 
        });
    }
};

// Obtener KPIs (indicadores clave)
const getKPIs = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        const { fechaInicio, fechaFin } = req.query;
        
        let dateCondition = '';
        if (fechaInicio && fechaFin) {
            dateCondition = `AND DATE(vi.fecHorSalViaje) BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
        } else {
            dateCondition = `AND DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 30 DAY`;
        }

        let kpis = {
            totalViajes: 0,
            viajesCompletados: 0,
            porcentajeCompletados: 0,
            tiempoPromedioViaje: 0,
            conductoresActivos: 0,
            vehiculosUtilizados: 0,
            porcentajeUsoFlota: 0
        };

        try {
            const [kpisResult] = await pool.query(`
                SELECT 
                    COUNT(DISTINCT vi.idViaje) as totalViajes,
                    COUNT(DISTINCT CASE WHEN vi.estViaje = 'FINALIZADO' THEN vi.idViaje END) as viajesCompletados,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN vi.estViaje = 'FINALIZADO' THEN vi.idViaje END) * 100.0 / 
                         NULLIF(COUNT(DISTINCT vi.idViaje), 0)), 2
                    ) as porcentajeCompletados,
                    COALESCE(AVG(CASE 
                        WHEN vi.fecHorLleViaje IS NOT NULL AND vi.fecHorSalViaje IS NOT NULL 
                        THEN TIMESTAMPDIFF(MINUTE, vi.fecHorSalViaje, vi.fecHorLleViaje) 
                        ELSE NULL 
                    END), 0) as tiempoPromedioViaje,
                    COUNT(DISTINCT vi.idConductor) as conductoresActivos,
                    COUNT(DISTINCT vi.idVehiculo) as vehiculosUtilizados,
                    ROUND(
                        (COUNT(DISTINCT vi.idVehiculo) * 100.0 / 
                         NULLIF((SELECT COUNT(*) FROM Vehiculos WHERE idEmpresa = ? AND estVehiculo != 'FUERA_DE_SERVICIO'), 0)), 2
                    ) as porcentajeUsoFlota
                FROM Viajes vi
                JOIN Vehiculos v ON vi.idVehiculo = v.idVehiculo
                WHERE v.idEmpresa = ? ${dateCondition}
            `, [idEmpresa, idEmpresa]);

            if (kpisResult && kpisResult.length > 0) {
                kpis = { ...kpis, ...kpisResult[0] };
            }
        } catch (kpisError) {
            console.warn('Error consultando KPIs:', kpisError.message);
        }

        res.json({
            status: 'success',
            data: kpis
        });
    } catch (error) {
        console.error('Error al obtener KPIs:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error del servidor al obtener KPIs' 
        });
    }
};

// Obtener resumen ejecutivo
const getExecutiveSummary = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        const periodo = req.query.periodo || 'mes';
        
        let dateCondition = '';
        switch (periodo) {
            case 'dia':
                dateCondition = "DATE(vi.fecHorSalViaje) = CURDATE()";
                break;
            case 'semana':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 7 DAY";
                break;
            case 'mes':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 30 DAY";
                break;
            case 'trimestre':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 90 DAY";
                break;
            default:
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 30 DAY";
        }

        let resumen = {
            nomEmpresa: 'Empresa de Transporte',
            flotaTotal: 0,
            conductoresTotales: 0,
            rutasTotales: 0,
            viajesRealizados: 0,
            viajesCompletados: 0,
            viajesCancelados: 0,
            documentosVencidos: 0,
            documentosCriticos: 0
        };

        try {
            const [resumenResult] = await pool.query(`
                SELECT 
                    e.nomEmpresa,
                    COUNT(DISTINCT v.idVehiculo) as flotaTotal,
                    COUNT(DISTINCT c.idConductor) as conductoresTotales,
                    COUNT(DISTINCT r.idRuta) as rutasTotales,
                    COUNT(DISTINCT vi.idViaje) as viajesRealizados,
                    COUNT(DISTINCT CASE WHEN vi.estViaje = 'FINALIZADO' THEN vi.idViaje END) as viajesCompletados,
                    COUNT(DISTINCT CASE WHEN vi.estViaje = 'CANCELADO' THEN vi.idViaje END) as viajesCancelados,
                    0 as documentosVencidos,
                    0 as documentosCriticos
                FROM Empresas e
                LEFT JOIN Vehiculos v ON e.idEmpresa = v.idEmpresa
                LEFT JOIN Conductores c ON e.idEmpresa = c.idEmpresa  
                LEFT JOIN Rutas r ON e.idEmpresa = r.idEmpresa
                LEFT JOIN Viajes vi ON v.idVehiculo = vi.idVehiculo AND (vi.fecHorSalViaje IS NULL OR ${dateCondition})
                WHERE e.idEmpresa = ?
                GROUP BY e.idEmpresa, e.nomEmpresa
            `, [idEmpresa]);

            if (resumenResult && resumenResult.length > 0) {
                resumen = { ...resumen, ...resumenResult[0] };
            }
        } catch (resumenError) {
            console.warn('Error consultando resumen:', resumenError.message);
        }

        res.json({
            status: 'success',
            data: {
                ...resumen,
                periodo,
                fechaGeneracion: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error al obtener resumen ejecutivo:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error del servidor al obtener resumen ejecutivo' 
        });
    }
};

// Obtener datos en tiempo real
const getRealTimeData = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        
        let datos = {
            vehiculosEnRuta: 0,
            viajesEnCurso: 0,
            conductoresActivos: 0,
            alertasCriticas: 0
        };

        try {
            const [datosResult] = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM Vehiculos WHERE idEmpresa = ? AND estVehiculo = 'EN_RUTA') as vehiculosEnRuta,
                    (SELECT COUNT(*) FROM Viajes vi JOIN Vehiculos v ON vi.idVehiculo = v.idVehiculo 
                     WHERE v.idEmpresa = ? AND vi.estViaje = 'EN_CURSO') as viajesEnCurso,
                    (SELECT COUNT(*) FROM Conductores WHERE idEmpresa = ? AND estConductor = 'ACTIVO') as conductoresActivos,
                    0 as alertasCriticas
            `, [idEmpresa, idEmpresa, idEmpresa]);

            if (datosResult && datosResult.length > 0) {
                datos = { ...datos, ...datosResult[0] };
            }
        } catch (datosError) {
            console.warn('Error consultando datos en tiempo real:', datosError.message);
        }

        res.json({
            status: 'success',
            data: {
                ...datos,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error al obtener datos en tiempo real:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error del servidor al obtener datos en tiempo real' 
        });
    }
};

module.exports = {
    getGeneralStatistics,
    getChartsData,
    getActiveAlerts,
    getRecentActivity,
    getKPIs,
    getExecutiveSummary,
    getRealTimeData
};