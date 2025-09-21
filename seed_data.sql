-- =====================================================
-- SCRIPT DE DATOS DE PRUEBA PARA TRANSYNC
-- =====================================================
-- Este script inserta datos de prueba realistas para testing

USE transync;

-- =====================================================
-- INSERTAR MÁS USUARIOS (CONDUCTORES Y GESTORES)
-- =====================================================

-- Insertar más usuarios para conductores
INSERT INTO Usuarios (email, nomUsuario, apeUsuario, numDocUsuario, telUsuario, passwordHash, idRol, idEmpresa, estActivo)
VALUES
    -- Conductores adicionales
    ('conductor1@transync.com', 'Carlos', 'Rodríguez', '1234567890', '3001111111', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor2@transync.com', 'María', 'González', '1234567891', '3001111112', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor3@transync.com', 'José', 'Martínez', '1234567892', '3001111113', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor4@transync.com', 'Ana', 'López', '1234567893', '3001111114', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor5@transync.com', 'Luis', 'García', '1234567894', '3001111115', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor6@transync.com', 'Carmen', 'Pérez', '1234567895', '3001111116', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor7@transync.com', 'Diego', 'Sánchez', '1234567896', '3001111117', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor8@transync.com', 'Laura', 'Ramírez', '1234567897', '3001111118', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor9@transync.com', 'Miguel', 'Torres', '1234567898', '3001111119', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
    ('conductor10@transync.com', 'Sofia', 'Flores', '1234567899', '3001111120', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),

    -- Gestores adicionales
    ('gestor1@transync.com', 'Roberto', 'Herrera', '9876543210', '3002222221', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
    ('gestor2@transync.com', 'Patricia', 'Morales', '9876543211', '3002222222', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
    ('gestor3@transync.com', 'Fernando', 'Ortiz', '9876543212', '3002222223', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1);

-- =====================================================
-- INSERTAR MÁS CONDUCTORES
-- =====================================================

INSERT INTO Conductores (idUsuario, tipLicConductor, fecVenLicConductor, estConductor, idEmpresa)
VALUES
    (3, 'B2', '2026-08-15', 'ACTIVO', 1),
    (4, 'B1', '2025-12-20', 'ACTIVO', 1),
    (5, 'C1', '2027-03-10', 'ACTIVO', 1),
    (6, 'B2', '2026-11-05', 'ACTIVO', 1),
    (7, 'B1', '2025-09-30', 'ACTIVO', 1),
    (8, 'C2', '2027-06-18', 'ACTIVO', 1),
    (9, 'B2', '2026-04-22', 'ACTIVO', 1),
    (10, 'B1', '2025-10-12', 'ACTIVO', 1),
    (11, 'C1', '2027-01-08', 'ACTIVO', 1),
    (12, 'B2', '2026-07-25', 'ACTIVO', 1),
    (13, 'B1', '2025-11-14', 'ACTIVO', 1),
    (14, 'C2', '2027-05-03', 'ACTIVO', 1);

-- =====================================================
-- INSERTAR MÁS VEHÍCULOS
-- =====================================================

INSERT INTO Vehiculos (numVehiculo, plaVehiculo, marVehiculo, modVehiculo, anioVehiculo, fecVenSOAT, fecVenTec, estVehiculo, idEmpresa, idConductorAsignado)
VALUES
    ('V001', 'ABC123', 'Toyota', 'Corolla', 2020, '2025-05-15', '2025-06-20', 'DISPONIBLE', 1, 3),
    ('V002', 'DEF456', 'Nissan', 'Sentra', 2019, '2025-03-10', '2025-04-15', 'DISPONIBLE', 1, 4),
    ('V003', 'GHI789', 'Honda', 'Civic', 2021, '2025-08-22', '2025-09-30', 'EN_RUTA', 1, 5),
    ('V004', 'JKL012', 'Mazda', 'CX-5', 2020, '2025-01-18', '2025-02-25', 'DISPONIBLE', 1, NULL),
    ('V005', 'MNO345', 'Kia', 'Sportage', 2019, '2025-07-12', '2025-08-08', 'EN_MANTENIMIENTO', 1, NULL),
    ('V006', 'PQR678', 'Hyundai', 'Tucson', 2021, '2025-04-05', '2025-05-12', 'DISPONIBLE', 1, 6),
    ('V007', 'STU901', 'Ford', 'Focus', 2020, '2025-09-28', '2025-10-31', 'DISPONIBLE', 1, 7),
    ('V008', 'VWX234', 'Chevrolet', 'Cruze', 2019, '2025-06-14', '2025-07-19', 'EN_RUTA', 1, 8),
    ('V009', 'YZA567', 'Renault', 'Duster', 2021, '2025-11-08', '2025-12-15', 'DISPONIBLE', 1, NULL),
    ('V010', 'BCD890', 'Volkswagen', 'Jetta', 2020, '2025-02-26', '2025-03-30', 'DISPONIBLE', 1, 9),
    ('V011', 'EFG123', 'BMW', 'X3', 2021, '2025-12-01', '2026-01-10', 'DISPONIBLE', 1, 10),
    ('V012', 'HIJ456', 'Mercedes', 'C-Class', 2020, '2025-08-15', '2025-09-20', 'EN_MANTENIMIENTO', 1, NULL);

-- =====================================================
-- INSERTAR MÁS RUTAS
-- =====================================================

INSERT INTO Rutas (nomRuta, oriRuta, desRuta, idEmpresa)
VALUES
    ('Ruta Centro-Norte', 'Centro Bogotá', 'Terminal Norte', 1),
    ('Ruta Sur-Occidente', 'Terminal Sur', 'Portal Américas', 1),
    ('Ruta Oriente-Centro', 'Portal Oriente', 'Centro Internacional', 1),
    ('Ruta Norte-Sur', 'Terminal Norte', 'Terminal Sur', 1),
    ('Ruta Aeropuerto-El Dorado', 'Centro Bogotá', 'Aeropuerto El Dorado', 1),
    ('Ruta Universidad-Nacional', 'Portal Norte', 'Universidad Nacional', 1),
    ('Ruta Zona-Rosa', 'Centro Bogotá', 'Zona Rosa Chapinero', 1),
    ('Ruta Estadio-Campín', 'Portal Suba', 'Estadio El Campín', 1),
    ('Ruta Centro-Comercial', 'Portal 80', 'Centro Comercial Titan Plaza', 1),
    ('Ruta Hospital-Universitario', 'Terminal Sur', 'Hospital Universitario San Ignacio', 1),
    ('Ruta Biblioteca-Virgilio', 'Portal Norte', 'Biblioteca Virgilio Barco', 1),
    ('Ruta Plaza-Bolívar', 'Portal Américas', 'Plaza de Bolívar', 1);

-- =====================================================
-- INSERTAR VIAJES DE PRUEBA
-- =====================================================

INSERT INTO Viajes (idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje, obsViaje)
VALUES
    (1, 3, 1, '2025-01-15 06:00:00', '2025-01-15 07:30:00', 'FINALIZADO', 'Viaje completado sin novedades'),
    (2, 4, 2, '2025-01-15 07:00:00', '2025-01-15 08:45:00', 'FINALIZADO', 'Retraso de 15 minutos por tráfico'),
    (3, 5, 3, '2025-01-15 08:00:00', NULL, 'EN_CURSO', 'Viaje en progreso'),
    (4, 6, 4, '2025-01-15 09:00:00', NULL, 'PROGRAMADO', 'Programado para mañana'),
    (5, 7, 5, '2025-01-15 10:00:00', '2025-01-15 11:15:00', 'FINALIZADO', 'Excelente servicio'),
    (6, 8, 6, '2025-01-15 11:00:00', NULL, 'EN_CURSO', 'Recogiendo pasajeros'),
    (7, 9, 7, '2025-01-15 12:00:00', '2025-01-15 13:20:00', 'FINALIZADO', 'Clima favorable'),
    (8, 10, 8, '2025-01-15 13:00:00', NULL, 'PROGRAMADO', 'Espera confirmación'),
    (9, 11, 9, '2025-01-15 14:00:00', '2025-01-15 15:30:00', 'FINALIZADO', 'Mantenimiento preventivo realizado'),
    (10, 12, 10, '2025-01-15 15:00:00', NULL, 'EN_CURSO', 'Tráfico moderado'),
    (11, 3, 11, '2025-01-15 16:00:00', '2025-01-15 17:45:00', 'FINALIZADO', 'Ruta escénica'),
    (12, 4, 12, '2025-01-15 17:00:00', NULL, 'PROGRAMADO', 'Último viaje del día');

-- =====================================================
-- ACTUALIZAR ESTADO DE VEHÍCULOS EN RUTA
-- =====================================================

UPDATE Vehiculos
SET estVehiculo = 'EN_RUTA'
WHERE idVehiculo IN (3, 6, 10);

UPDATE Vehiculos
SET estVehiculo = 'EN_MANTENIMIENTO'
WHERE idVehiculo IN (5, 12);

-- =====================================================
-- INSERTAR DATOS DE CHATBOT
-- =====================================================

INSERT INTO ConfiguracionChatbot (idEmpresa, nombreChatbot, mensajeBienvenida, mensajeNoComprendido, mensajeDespedida)
VALUES
    (1, 'Asistente TransSync', '¡Hola! Soy tu asistente de transporte. ¿En qué puedo ayudarte hoy?', 'Lo siento, no entendí tu consulta. ¿Puedes reformularla?', '¡Gracias por usar TransSync! Que tengas un excelente día.');

INSERT INTO RespuestasPredefinidas (idEmpresa, palabrasClave, categoria, respuesta, prioridad, activa)
VALUES
    (1, 'hola,saludos,buenos días,buenas tardes,buenas noches', 'saludo', '¡Hola! Soy tu asistente de TransSync. ¿En qué puedo ayudarte con tu transporte?', 10, 1),
    (1, 'horarios,rutas,cuándo sale,qué hora', 'horarios', 'Puedo informarte sobre los horarios de nuestras rutas. ¿Qué ruta te interesa?', 8, 1),
    (1, 'conductores,quién conduce,conductor', 'conductores', 'Todos nuestros conductores están certificados y tienen experiencia. ¿Necesitas información específica?', 7, 1),
    (1, 'vehículos,buses,transporte', 'vehiculos', 'Contamos con una flota moderna y bien mantenida. ¿Quieres saber sobre algún vehículo en particular?', 7, 1),
    (1, 'ayuda,qué puedes hacer,cómo funciona', 'ayuda', 'Puedo ayudarte con información sobre rutas, horarios, conductores y vehículos. ¿Qué necesitas saber?', 9, 1),
    (1, 'gracias,excelente,muy bien', 'despedida', '¡De nada! Me alegra haber podido ayudarte. ¡Que tengas un buen viaje!', 6, 1);

-- =====================================================
-- MOSTRAR RESUMEN DE DATOS INSERTADOS
-- =====================================================

SELECT 'Usuarios insertados:' as Info, COUNT(*) as Cantidad FROM Usuarios WHERE idEmpresa = 1
UNION ALL
SELECT 'Conductores insertados:', COUNT(*) FROM Conductores WHERE idEmpresa = 1
UNION ALL
SELECT 'Vehículos insertados:', COUNT(*) FROM Vehiculos WHERE idEmpresa = 1
UNION ALL
SELECT 'Rutas insertadas:', COUNT(*) FROM Rutas WHERE idEmpresa = 1
UNION ALL
SELECT 'Viajes insertados:', COUNT(*) FROM Viajes
UNION ALL
SELECT 'Respuestas predefinidas:', COUNT(*) FROM RespuestasPredefinidas WHERE idEmpresa = 1;