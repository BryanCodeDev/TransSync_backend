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

        // Asegurar que siempre retornamos valores numéricos
        const data = stats[0] || {};
        const result = {
            totalVehiculos: parseInt(data.totalVehiculos) || 0,
            vehiculosDisponibles: parseInt(data.vehiculosDisponibles) || 0,
            vehiculosEnRuta: parseInt(data.vehiculosEnRuta) || 0,
            vehiculosEnMantenimiento: parseInt(data.vehiculosEnMantenimiento) || 0,
            totalConductores: parseInt(data.totalConductores) || 0,
            conductoresActivos: parseInt(data.conductoresActivos) || 0,
            conductoresInactivos: parseInt(data.conductoresInactivos) || 0,
            totalRutas: parseInt(data.totalRutas) || 0,
            totalViajes: parseInt(data.totalViajes) || 0,
            viajesEnCurso: parseInt(data.viajesEnCurso) || 0,
            viajesProgramados: parseInt(data.viajesProgramados) || 0
        };

        res.json({
            status: 'success',
            data: result
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

        // Configurar consulta según el período
        switch (periodo) {
            case 'dia':
                dateCondition = "DATE(vi.fecHorSalViaje) = CURDATE()";
                groupBy = "HOUR(vi.fecHorSalViaje)";
                orderBy = "HOUR(vi.fecHorSalViaje)";
                labels = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
                break;
            case 'semana':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 6 DAY";
                groupBy = "DATE(vi.fecHorSalViaje)";
                orderBy = "DATE(vi.fecHorSalViaje)";
                // Generar etiquetas de los últimos 7 días
                labels = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    labels.push(date.toLocaleDateString('es-CO', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    }));
                }
                break;
            case 'mes':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 29 DAY";
                groupBy = "WEEK(vi.fecHorSalViaje, 1)";
                orderBy = "WEEK(vi.fecHorSalViaje, 1)";
                labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
                break;
            case 'trimestre':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 89 DAY";
                groupBy = "MONTH(vi.fecHorSalViaje)";
                orderBy = "MONTH(vi.fecHorSalViaje)";
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const currentMonth = new Date().getMonth();
                labels = [];
                for (let i = 2; i >= 0; i--) {
                    const monthIndex = (currentMonth - i + 12) % 12;
                    labels.push(monthNames[monthIndex]);
                }
                break;
            case 'ano':
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 364 DAY";
                groupBy = "MONTH(vi.fecHorSalViaje)";
                orderBy = "MONTH(vi.fecHorSalViaje)";
                labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                break;
            default:
                dateCondition = "DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 6 DAY";
                groupBy = "DATE(vi.fecHorSalViaje)";
                orderBy = "DATE(vi.fecHorSalViaje)";
                labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        }

        // Obtener viajes por período
        const [viajesData] = await pool.query(`
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

        // Obtener distribución por rutas (top 5)
        const [rutasData] = await pool.query(`
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
                AND vi.fecHorSalViaje IS NOT NULL 
                AND ${dateCondition}
            WHERE r.idEmpresa = ?
            GROUP BY r.idRuta, r.nomRuta
            HAVING COUNT(vi.idViaje) > 0
            ORDER BY totalViajes DESC
            LIMIT 5
        `, [idEmpresa]);

        res.json({
            status: 'success',
            data: {
                viajes: {
                    labels,
                    data: viajesData.map(v => ({
                        ...v,
                        totalViajes: parseInt(v.totalViajes) || 0,
                        viajesCompletados: parseInt(v.viajesCompletados) || 0
                    }))
                },
                rutas: rutasData.map(r => ({
                    ...r,
                    totalViajes: parseInt(r.totalViajes) || 0,
                    tiempoPromedio: parseFloat(r.tiempoPromedio) || 0
                })),
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

// Obtener alertas activas - CORREGIDO
const getActiveAlerts = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        
        // Consulta directa sin usar la vista problemática
        const [alerts] = await pool.query(`
            SELECT 
                'LICENCIA' as tipoDocumento,
                CONCAT(c.nomConductor, ' ', c.apeConductor) as titular,
                c.fecVenLicConductor as fechaVencimiento,
                DATEDIFF(c.fecVenLicConductor, CURDATE()) as diasParaVencer,
                CASE 
                    WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) < 0 THEN 'VENCIDO'
                    WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) <= 30 THEN 'CRITICO'
                    WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) <= 60 THEN 'ADVERTENCIA'
                    ELSE 'NORMAL'
                END as estado,
                CASE 
                    WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) < 0 THEN 'critical'
                    WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) <= 30 THEN 'critical'
                    WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) <= 60 THEN 'warning'
                    ELSE 'info'
                END as severity,
                CONCAT(
                    'Licencia de conducción de ', c.nomConductor, ' ', c.apeConductor,
                    CASE 
                        WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) < 0 THEN ' está vencida'
                        WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) = 0 THEN ' vence hoy'
                        ELSE CONCAT(' vence en ', DATEDIFF(c.fecVenLicConductor, CURDATE()), ' días')
                    END
                ) as title,
                DATE_FORMAT(c.fecVenLicConductor, '%d/%m/%Y') as time
            FROM Conductores c
            WHERE c.idEmpresa = ?
            AND DATEDIFF(c.fecVenLicConductor, CURDATE()) <= 60
            
            UNION ALL
            
            SELECT 
                'SOAT' as tipoDocumento,
                CONCAT(v.marVehiculo, ' ', v.modVehiculo, ' - ', v.plaVehiculo) as titular,
                v.fecVenSOAT as fechaVencimiento,
                DATEDIFF(v.fecVenSOAT, CURDATE()) as diasParaVencer,
                CASE 
                    WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) < 0 THEN 'VENCIDO'
                    WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) <= 30 THEN 'CRITICO'
                    WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) <= 60 THEN 'ADVERTENCIA'
                    ELSE 'NORMAL'
                END as estado,
                CASE 
                    WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) < 0 THEN 'critical'
                    WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) <= 30 THEN 'critical'
                    WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) <= 60 THEN 'warning'
                    ELSE 'info'
                END as severity,
                CONCAT(
                    'SOAT de ', v.marVehiculo, ' ', v.modVehiculo, ' - ', v.plaVehiculo,
                    CASE 
                        WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) < 0 THEN ' está vencido'
                        WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) = 0 THEN ' vence hoy'
                        ELSE CONCAT(' vence en ', DATEDIFF(v.fecVenSOAT, CURDATE()), ' días')
                    END
                ) as title,
                DATE_FORMAT(v.fecVenSOAT, '%d/%m/%Y') as time
            FROM Vehiculos v
            WHERE v.idEmpresa = ?
            AND DATEDIFF(v.fecVenSOAT, CURDATE()) <= 60
            
            UNION ALL
            
            SELECT 
                'TECNOMECANICA' as tipoDocumento,
                CONCAT(v.marVehiculo, ' ', v.modVehiculo, ' - ', v.plaVehiculo) as titular,
                v.fecVenTec as fechaVencimiento,
                DATEDIFF(v.fecVenTec, CURDATE()) as diasParaVencer,
                CASE 
                    WHEN DATEDIFF(v.fecVenTec, CURDATE()) < 0 THEN 'VENCIDO'
                    WHEN DATEDIFF(v.fecVenTec, CURDATE()) <= 30 THEN 'CRITICO'
                    WHEN DATEDIFF(v.fecVenTec, CURDATE()) <= 60 THEN 'ADVERTENCIA'
                    ELSE 'NORMAL'
                END as estado,
                CASE 
                    WHEN DATEDIFF(v.fecVenTec, CURDATE()) < 0 THEN 'critical'
                    WHEN DATEDIFF(v.fecVenTec, CURDATE()) <= 30 THEN 'critical'
                    WHEN DATEDIFF(v.fecVenTec, CURDATE()) <= 60 THEN 'warning'
                    ELSE 'info'
                END as severity,
                CONCAT(
                    'Revisión tecnomecánica de ', v.marVehiculo, ' ', v.modVehiculo, ' - ', v.plaVehiculo,
                    CASE 
                        WHEN DATEDIFF(v.fecVenTec, CURDATE()) < 0 THEN ' está vencida'
                        WHEN DATEDIFF(v.fecVenTec, CURDATE()) = 0 THEN ' vence hoy'
                        ELSE CONCAT(' vence en ', DATEDIFF(v.fecVenTec, CURDATE()), ' días')
                    END
                ) as title,
                DATE_FORMAT(v.fecVenTec, '%d/%m/%Y') as time
            FROM Vehiculos v
            WHERE v.idEmpresa = ?
            AND DATEDIFF(v.fecVenTec, CURDATE()) <= 60
            
            ORDER BY diasParaVencer ASC
            LIMIT 10
        `, [idEmpresa, idEmpresa, idEmpresa]);

        res.json({
            status: 'success',
            data: alerts || []
        });
    } catch (error) {
        console.error('Error al obtener alertas:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error del servidor al obtener alertas',
            details: error.message
        });
    }
};

// Obtener actividad reciente
const getRecentActivity = async (req, res) => {
    try {
        const idEmpresa = req.user.idEmpresa;
        const limite = parseInt(req.query.limite) || 10;
        
        const [actividad] = await pool.query(`
            SELECT 
                'VIAJE' as tipo,
                CONCAT(
                    'Viaje en ruta ', 
                    COALESCE(r.nomRuta, 'Sin ruta'), 
                    ' - ', 
                    CASE vi.estViaje 
                        WHEN 'PROGRAMADO' THEN 'Programado'
                        WHEN 'EN_CURSO' THEN 'En curso'
                        WHEN 'FINALIZADO' THEN 'Finalizado'
                        WHEN 'CANCELADO' THEN 'Cancelado'
                        ELSE 'Estado desconocido'
                    END
                ) as descripcion,
                CONCAT(
                    COALESCE(c.nomConductor, 'Sin conductor'), 
                    ' ', 
                    COALESCE(c.apeConductor, '')
                ) as usuario,
                CONCAT(
                    COALESCE(v.marVehiculo, 'Marca'), 
                    ' ', 
                    COALESCE(v.modVehiculo, 'Modelo'), 
                    ' - ', 
                    COALESCE(v.plaVehiculo, 'SIN-PLACA')
                ) as recurso,
                vi.fecHorSalViaje as fecha,
                vi.estViaje as estado
            FROM Viajes vi
            JOIN Vehiculos v ON vi.idVehiculo = v.idVehiculo
            LEFT JOIN Conductores c ON vi.idConductor = c.idConductor
            LEFT JOIN Rutas r ON vi.idRuta = r.idRuta
            WHERE v.idEmpresa = ?
            AND vi.fecHorSalViaje IS NOT NULL
            ORDER BY vi.fecHorSalViaje DESC
            LIMIT ?
        `, [idEmpresa, limite]);

        res.json({
            status: 'success',
            data: actividad || []
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
        const params = [idEmpresa, idEmpresa];
        
        if (fechaInicio && fechaFin) {
            dateCondition = `AND DATE(vi.fecHorSalViaje) BETWEEN ? AND ?`;
            params.push(fechaInicio, fechaFin);
        } else {
            dateCondition = `AND DATE(vi.fecHorSalViaje) >= CURDATE() - INTERVAL 30 DAY`;
        }

        const [kpis] = await pool.query(`
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
        `, params);

        const data = kpis[0] || {};
        const result = {
            totalViajes: parseInt(data.totalViajes) || 0,
            viajesCompletados: parseInt(data.viajesCompletados) || 0,
            porcentajeCompletados: parseFloat(data.porcentajeCompletados) || 0,
            tiempoPromedioViaje: parseFloat(data.tiempoPromedioViaje) || 0,
            conductoresActivos: parseInt(data.conductoresActivos) || 0,
            vehiculosUtilizados: parseInt(data.vehiculosUtilizados) || 0,
            porcentajeUsoFlota: parseFloat(data.porcentajeUsoFlota) || 0
        };

        res.json({
            status: 'success',
            data: result
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

        // Consulta directa sin usar vistas problemáticas
        const [resumen] = await pool.query(`
            SELECT 
                e.nomEmpresa,
                COUNT(DISTINCT c.idConductor) as conductoresTotales,
                COUNT(DISTINCT v.idVehiculo) as flotaTotal,
                COUNT(DISTINCT r.idRuta) as rutasTotales,
                (SELECT COUNT(*) FROM Viajes vi2 
                 JOIN Vehiculos v2 ON vi2.idVehiculo = v2.idVehiculo 
                 WHERE v2.idEmpresa = ? AND ${dateCondition}) as viajesRealizados,
                (SELECT COUNT(*) FROM Viajes vi2 
                 JOIN Vehiculos v2 ON vi2.idVehiculo = v2.idVehiculo 
                 WHERE v2.idEmpresa = ? AND vi2.estViaje = 'FINALIZADO' AND ${dateCondition}) as viajesCompletados,
                (SELECT COUNT(*) FROM Viajes vi2 
                 JOIN Vehiculos v2 ON vi2.idVehiculo = v2.idVehiculo 
                 WHERE v2.idEmpresa = ? AND vi2.estViaje = 'CANCELADO' AND ${dateCondition}) as viajesCancelados,
                -- Contar documentos vencidos directamente
                (SELECT COUNT(*) FROM Conductores c2 WHERE c2.idEmpresa = ? AND c2.fecVenLicConductor < CURDATE()) +
                (SELECT COUNT(*) FROM Vehiculos v2 WHERE v2.idEmpresa = ? AND v2.fecVenSOAT < CURDATE()) +
                (SELECT COUNT(*) FROM Vehiculos v2 WHERE v2.idEmpresa = ? AND v2.fecVenTec < CURDATE()) as documentosVencidos,
                -- Contar documentos críticos directamente
                (SELECT COUNT(*) FROM Conductores c2 WHERE c2.idEmpresa = ? AND DATEDIFF(c2.fecVenLicConductor, CURDATE()) BETWEEN 0 AND 30) +
                (SELECT COUNT(*) FROM Vehiculos v2 WHERE v2.idEmpresa = ? AND DATEDIFF(v2.fecVenSOAT, CURDATE()) BETWEEN 0 AND 30) +
                (SELECT COUNT(*) FROM Vehiculos v2 WHERE v2.idEmpresa = ? AND DATEDIFF(v2.fecVenTec, CURDATE()) BETWEEN 0 AND 30) as documentosCriticos
            FROM Empresas e
            LEFT JOIN Conductores c ON e.idEmpresa = c.idEmpresa
            LEFT JOIN Vehiculos v ON e.idEmpresa = v.idEmpresa
            LEFT JOIN Rutas r ON e.idEmpresa = r.idEmpresa
            WHERE e.idEmpresa = ?
            GROUP BY e.idEmpresa, e.nomEmpresa
        `, [idEmpresa, idEmpresa, idEmpresa, idEmpresa, idEmpresa, idEmpresa, idEmpresa, idEmpresa, idEmpresa, idEmpresa]);

        const data = resumen[0] || {};
        const result = {
            nomEmpresa: data.nomEmpresa || 'Empresa sin nombre',
            flotaTotal: parseInt(data.flotaTotal) || 0,
            conductoresTotales: parseInt(data.conductoresTotales) || 0,
            rutasTotales: parseInt(data.rutasTotales) || 0,
            viajesRealizados: parseInt(data.viajesRealizados) || 0,
            viajesCompletados: parseInt(data.viajesCompletados) || 0,
            viajesCancelados: parseInt(data.viajesCancelados) || 0,
            documentosVencidos: parseInt(data.documentosVencidos) || 0,
            documentosCriticos: parseInt(data.documentosCriticos) || 0,
            periodo,
            fechaGeneracion: new Date().toISOString()
        };

        res.json({
            status: 'success',
            data: result
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
        
        const [datos] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM Vehiculos WHERE idEmpresa = ? AND estVehiculo = 'EN_RUTA') as vehiculosEnRuta,
                (SELECT COUNT(*) FROM Viajes vi 
                 JOIN Vehiculos v ON vi.idVehiculo = v.idVehiculo 
                 WHERE v.idEmpresa = ? AND vi.estViaje = 'EN_CURSO') as viajesEnCurso,
                (SELECT COUNT(*) FROM Conductores WHERE idEmpresa = ? AND estConductor = 'ACTIVO') as conductoresActivos,
                -- Contar alertas críticas directamente
                ((SELECT COUNT(*) FROM Conductores WHERE idEmpresa = ? AND DATEDIFF(fecVenLicConductor, CURDATE()) BETWEEN -30 AND 30) +
                 (SELECT COUNT(*) FROM Vehiculos WHERE idEmpresa = ? AND DATEDIFF(fecVenSOAT, CURDATE()) BETWEEN -30 AND 30) +
                 (SELECT COUNT(*) FROM Vehiculos WHERE idEmpresa = ? AND DATEDIFF(fecVenTec, CURDATE()) BETWEEN -30 AND 30)) as alertasCriticas
        `, [idEmpresa, idEmpresa, idEmpresa, idEmpresa, idEmpresa, idEmpresa]);

        const data = datos[0] || {};
        const result = {
            vehiculosEnRuta: parseInt(data.vehiculosEnRuta) || 0,
            viajesEnCurso: parseInt(data.viajesEnCurso) || 0,
            conductoresActivos: parseInt(data.conductoresActivos) || 0,
            alertasCriticas: parseInt(data.alertasCriticas) || 0,
            timestamp: new Date().toISOString()
        };

        res.json({
            status: 'success',
            data: result
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