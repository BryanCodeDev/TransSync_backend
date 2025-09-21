-- =====================================================
-- SCRIPT COMPLETO DE DATOS DE PRUEBA PARA TRANSYNC
-- =====================================================
-- Este script inserta datos de prueba realistas para testing
-- con 10 ejemplos en cada tabla para un dashboard vivo
-- =====================================================

USE transync;

-- =====================================================
-- INSERTAR MÁS EMPRESAS (10 empresas)
-- =====================================================

INSERT INTO Empresas (nomEmpresa, nitEmpresa, dirEmpresa, emaEmpresa, telEmpresa) VALUES
('Transportes del Valle S.A.S', '901234567', 'Calle 10 # 5-23, Cali', 'contacto@transportesvalle.com', '3021234567'),
('Logística Andina Ltda', '902345678', 'Av. Circunvalar # 45-67, Medellín', 'info@logisticaandina.com', '3042345678'),
('Carga Pesada S.A.', '903456789', 'Km 5 Vía Bogotá-Girardot', 'operaciones@cargapesada.com', '3053456789'),
('Express Norte S.A.S', '904567890', 'Terminal de Carga, Bucaramanga', 'contacto@expressnorte.com', '3064567890'),
('Transporte Centro S.A.', '905678901', 'Zona Industrial, Barranquilla', 'info@transcentro.com', '3075678901'),
('Rápido del Sur Ltda', '906789012', 'Av. Las Américas # 12-34, Pasto', 'contacto@rapidosur.com', '3086789012'),
('Logística Integral S.A.S', '907890123', 'Parque Industrial, Cúcuta', 'operaciones@logistica.com', '3097890123'),
('Transporte Moderno Ltda', '908901234', 'Centro Logístico, Pereira', 'info@transportemoderno.com', '3108901234'),
('Carga Express S.A.', '909012345', 'Terminal Sur, Manizales', 'contacto@cargaexpress.com', '3119012345'),
('Logística Nacional S.A.S', '910123456', 'Zona Franca, Yumbo', 'info@logisticacional.com', '3120123456');

-- =====================================================
-- INSERTAR MÁS USUARIOS (10 usuarios)
-- =====================================================

INSERT INTO Usuarios (email, nomUsuario, apeUsuario, numDocUsuario, telUsuario, passwordHash, idRol, idEmpresa, estActivo) VALUES
('gestor1@transync.com', 'Carlos', 'Rodríguez', '1234567890', '3001111111', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('gestor2@transync.com', 'Ana', 'Martínez', '1234567891', '3002222222', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor3@transync.com', 'Pedro', 'García', '1234567892', '3003333333', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
('conductor4@transync.com', 'María', 'López', '1234567893', '3004444444', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
('conductor5@transync.com', 'Juan', 'Hernández', '1234567894', '3005555555', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
('admin1@transync.com', 'Roberto', 'Sánchez', '1234567895', '3006666666', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 1, 1, 1),
('gestor3@transync.com', 'Laura', 'González', '1234567896', '3007777777', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor6@transync.com', 'Diego', 'Ramírez', '1234567897', '3008888888', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
('conductor7@transync.com', 'Sofia', 'Torres', '1234567898', '3009999999', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 3, 1, 1),
('gestor4@transync.com', 'Miguel', 'Vargas', '1234567899', '3010000000', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1);

-- =====================================================
-- INSERTAR GESTORES (10 gestores)
-- =====================================================

INSERT INTO Gestores (idUsuario, idEmpresa) VALUES
(3, 1), (4, 1), (7, 1), (10, 1),
(3, 2), (4, 2), (7, 2), (10, 2),
(3, 3), (4, 3), (7, 3), (10, 3);

-- =====================================================
-- INSERTAR CONDUCTORES (10 conductores)
-- =====================================================

INSERT INTO Conductores (idUsuario, tipLicConductor, fecVenLicConductor, estConductor, idEmpresa) VALUES
(5, 'B2', '2025-08-15', 'ACTIVO', 1),
(6, 'C1', '2025-12-20', 'INACTIVO', 1),
(8, 'B1', '2025-06-10', 'DIA_DESCANSO', 1),
(9, 'B3', '2025-09-30', 'ACTIVO', 1),
(5, 'C2', '2025-11-05', 'INCAPACITADO', 2),
(6, 'B2', '2025-07-25', 'DE_VACACIONES', 2),
(8, 'C1', '2025-10-18', 'ACTIVO', 2),
(9, 'B1', '2025-05-12', 'ACTIVO', 3),
(5, 'B3', '2025-08-22', 'ACTIVO', 3),
(6, 'C2', '2025-09-08', 'ACTIVO', 3);

-- =====================================================
-- INSERTAR VEHÍCULOS (10 vehículos)
-- =====================================================

INSERT INTO Vehiculos (numVehiculo, plaVehiculo, marVehiculo, modVehiculo, anioVehiculo, fecVenSOAT, fecVenTec, estVehiculo, idEmpresa) VALUES
('V001', 'ABC123', 'Chevrolet', 'Spark GT', 2020, '2025-06-15', '2025-08-20', 'DISPONIBLE', 1),
('V002', 'DEF456', 'Renault', 'Logan', 2019, '2025-03-10', '2025-05-15', 'EN_RUTA', 1),
('V003', 'GHI789', 'Toyota', 'Corolla', 2021, '2025-09-25', '2025-11-30', 'EN_MANTENIMIENTO', 1),
('V004', 'JKL012', 'Nissan', 'Sentra', 2020, '2025-04-18', '2025-06-22', 'DISPONIBLE', 1),
('V005', 'MNO345', 'Mazda', 'CX-5', 2022, '2025-12-01', '2026-02-05', 'DISPONIBLE', 1),
('V006', 'PQR678', 'Ford', 'Ranger', 2021, '2025-07-14', '2025-09-18', 'EN_RUTA', 2),
('V007', 'STU901', 'Volkswagen', 'Gol', 2019, '2025-05-30', '2025-08-03', 'EN_MANTENIMIENTO', 2),
('V008', 'VWX234', 'Hyundai', 'Tucson', 2022, '2025-11-12', '2026-01-16', 'DISPONIBLE', 2),
('V009', 'YZA567', 'Kia', 'Sportage', 2020, '2025-08-28', '2025-10-31', 'DISPONIBLE', 3),
('V010', 'BCD890', 'Honda', 'Civic', 2021, '2025-06-20', '2025-08-25', 'EN_RUTA', 3);

-- =====================================================
-- INSERTAR RUTAS (10 rutas)
-- =====================================================

INSERT INTO Rutas (nomRuta, oriRuta, desRuta, idEmpresa) VALUES
('Ruta Norte-Centro', 'Terminal Norte Bogotá', 'Centro Internacional Bogotá', 1),
('Expreso Medellín-Rionegro', 'Terminal Sur Medellín', 'Aeropuerto José María Córdova', 1),
('Ruta Sur-Chapinero', 'Terminal Sur Bogotá', 'Zona Rosa Chapinero', 1),
('Ruta Envigado-Centro', 'Envigado', 'Centro Medellín', 1),
('Ruta Centro-Occidente', 'Centro Bogotá', 'Terminal de Transportes', 1),
('Ruta Norte-Sur', 'Portal Norte', 'Portal Sur', 1),
('Ruta Cali-Buenaventura', 'Terminal Cali', 'Puerto Buenaventura', 2),
('Ruta Medellín-Cartagena', 'Terminal Norte Medellín', 'Terminal Cartagena', 2),
('Ruta Barranquilla-Santa Marta', 'Terminal Barranquilla', 'Terminal Santa Marta', 3),
('Ruta Pereira-Manizales', 'Terminal Pereira', 'Terminal Manizales', 3);

-- =====================================================
-- INSERTAR VIAJES (10 viajes)
-- =====================================================

INSERT INTO Viajes (idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje, obsViaje) VALUES
(1, 1, 1, '2025-01-15 08:00:00', '2025-01-15 09:30:00', 'FINALIZADO', 'Viaje completado sin incidencias'),
(2, 2, 2, '2025-01-15 10:00:00', '2025-01-15 12:15:00', 'FINALIZADO', 'Retraso de 15 minutos por tráfico'),
(3, 1, 3, '2025-01-15 14:00:00', '2025-01-15 15:45:00', 'FINALIZADO', 'Viaje normal'),
(4, 2, 1, '2025-01-16 06:30:00', '2025-01-16 08:00:00', 'FINALIZADO', 'Salida puntual'),
(5, 1, 4, '2025-01-16 09:00:00', '2025-01-16 11:30:00', 'FINALIZADO', 'Buen clima durante el viaje'),
(1, 2, 2, '2025-01-16 13:00:00', '2025-01-16 15:20:00', 'EN_CURSO', 'En progreso'),
(2, 1, 3, '2025-01-17 07:00:00', NULL, 'PROGRAMADO', 'Programado para mañana'),
(3, 2, 1, '2025-01-17 10:00:00', NULL, 'PROGRAMADO', 'Pendiente de confirmación'),
(4, 1, 5, '2025-01-17 14:00:00', NULL, 'PROGRAMADO', 'Espera confirmación del cliente'),
(5, 2, 6, '2025-01-18 08:00:00', NULL, 'PROGRAMADO', 'Ruta de fin de semana');

-- =====================================================
-- INSERTAR INTERACCIONES CHATBOT (10 ejemplos)
-- =====================================================

INSERT INTO InteraccionesChatbot (mensaje, respuesta, intencion, idEmpresa, idUsuario, tiempoRespuesta, exitosa, valoracion, ipUsuario) VALUES
('Hola, ¿cómo estás?', '¡Hola! Soy tu asistente de TransSync. ¿En qué puedo ayudarte hoy?', 'saludo', 1, 1, 120, 1, 5, '192.168.1.100'),
('¿Cuáles son los conductores disponibles?', 'Actualmente tenemos 3 conductores activos: Pedro García, María López y Juan Hernández.', 'conductores', 1, 2, 85, 1, 4, '192.168.1.101'),
('¿Dónde está el vehículo ABC123?', 'El vehículo ABC123 (Chevrolet Spark GT) está actualmente DISPONIBLE en la terminal.', 'vehiculos', 1, 1, 150, 1, 5, '192.168.1.102'),
('¿Hay rutas disponibles para mañana?', 'Sí, tenemos varias rutas programadas para mañana. ¿Te gustaría ver el horario completo?', 'rutas', 1, 3, 95, 1, 4, '192.168.1.103'),
('Necesito un reporte de viajes', 'Puedo generar un reporte de viajes. ¿Qué período te interesa? (día, semana, mes)', 'reportes', 1, 1, 200, 1, 5, '192.168.1.104'),
('¿Cómo cambio mi contraseña?', 'Para cambiar tu contraseña, ve a Configuración > Perfil > Cambiar contraseña.', 'ayuda', 1, 2, 110, 1, 3, '192.168.1.105'),
('Gracias por tu ayuda', '¡De nada! Siempre estoy aquí para ayudarte. ¡Que tengas un excelente día!', 'despedida', 1, 1, 75, 1, 5, '192.168.1.106'),
('No entiendo esta función', 'Lo siento, no pude entender tu consulta. ¿Puedes reformularla o ser más específico?', 'personalizada', 1, 3, 90, 0, 2, '192.168.1.107'),
('¿Cuántos vehículos tenemos?', 'Actualmente la flota cuenta con 5 vehículos activos en el sistema.', 'vehiculos', 1, 1, 130, 1, 4, '192.168.1.108'),
('¿Hay algún problema con el sistema?', 'El sistema está funcionando correctamente. ¿Hay algo específico que te preocupa?', 'ayuda', 1, 2, 140, 1, 4, '192.168.1.109');

-- =====================================================
-- INSERTAR CONFIGURACIÓN CHATBOT (para cada empresa)
-- =====================================================

INSERT INTO ConfiguracionChatbot (idEmpresa, mensajeBienvenida, mensajeNoComprendido, mensajeDespedida) VALUES
(1, '¡Hola! Soy tu asistente virtual de TransSync. ¿En qué puedo ayudarte hoy con tu flota de transporte?', 'Lo siento, no pude entender tu consulta. ¿Puedes ser más específico o reformular tu pregunta?', '¡Gracias por usar TransSync! Que tengas un excelente día.'),
(2, 'Bienvenido al asistente de Logística Andina. ¿Cómo puedo ayudarte con tus operaciones de transporte?', 'No logré comprender tu consulta. Intenta usar términos más específicos como "conductores", "vehículos" o "rutas".', '¡Hasta luego! Gracias por preferir Logística Andina.'),
(3, '¡Hola! Soy el asistente de Carga Pesada. ¿Qué necesitas saber sobre tus vehículos de carga?', 'Perdón, no entendí tu pregunta. Prueba con consultas sobre "conductores", "mantenimiento" o "horarios".', '¡Gracias por tu consulta! Que tengas un buen viaje con Carga Pesada.');

-- =====================================================
-- INSERTAR RESPUESTAS PREDEFINIDAS (10 ejemplos)
-- =====================================================

INSERT INTO RespuestasPredefinidas (idEmpresa, palabrasClave, categoria, respuesta, prioridad, activa) VALUES
(1, 'hola,saludos,buenos dias,buenas tardes,buenas noches', 'saludo', '¡Hola! Soy tu asistente virtual de TransSync. ¿En qué puedo ayudarte hoy?', 10, 1),
(1, 'conductores,choferes,pilotos,disponibles,activos', 'conductores', 'Actualmente tenemos conductores activos: Pedro García, María López, Juan Hernández, Sofia Torres y Diego Ramírez.', 9, 1),
(1, 'vehiculos,camiones,carros,flota,disponibles', 'vehiculos', 'Nuestra flota incluye: Chevrolet Spark GT (ABC123), Renault Logan (DEF456), Toyota Corolla (GHI789), Nissan Sentra (JKL012) y Mazda CX-5 (MNO345).', 9, 1),
(1, 'rutas,recorridos,trayectos,horarios,disponibles', 'rutas', 'Tenemos rutas activas: Norte-Centro, Medellín-Rionegro, Sur-Chapinero, Envigado-Centro, Centro-Occidente y Norte-Sur.', 8, 1),
(1, 'reportes,estadisticas,kpis,metricas,dashboard', 'reportes', 'Puedo generar reportes de viajes, conductores, vehículos y rutas. ¿Qué período te interesa?', 8, 1),
(1, 'ayuda,como,que,necesito,no se,problema', 'ayuda', 'Estoy aquí para ayudarte. Puedes preguntarme sobre conductores, vehículos, rutas, horarios o reportes.', 7, 1),
(1, 'gracias,excelente,perfecto,buen trabajo,genial', 'despedida', '¡De nada! Siempre estoy aquí para ayudarte. ¡Que tengas un excelente día!', 6, 1),
(1, 'mantenimiento,reparacion,taller,averiado,dañado', 'vehiculos', 'Para mantenimiento, contacta al taller autorizado. Actualmente tenemos 1 vehículo en mantenimiento (GHI789).', 8, 1),
(1, 'emergencia,urgente,problema,critico,ayuda inmediata', 'ayuda', 'Para emergencias, llama inmediatamente al +57 300 123 4567 o contacta al supervisor de turno.', 10, 1),
(1, 'horarios,salidas,arribos,tiempo,estimado', 'horarios', 'Los horarios varían por ruta. ¿Te gustaría consultar una ruta específica?', 7, 1);

-- =====================================================
-- MOSTRAR RESUMEN DE DATOS INSERTADOS
-- =====================================================

SELECT
    'Empresas' as tabla,
    COUNT(*) as registros
FROM Empresas
UNION ALL
SELECT
    'Usuarios',
    COUNT(*)
FROM Usuarios
UNION ALL
SELECT
    'Gestores',
    COUNT(*)
FROM Gestores
UNION ALL
SELECT
    'Conductores',
    COUNT(*)
FROM Conductores
UNION ALL
SELECT
    'Vehículos',
    COUNT(*)
FROM Vehiculos
UNION ALL
SELECT
    'Rutas',
    COUNT(*)
FROM Rutas
UNION ALL
SELECT
    'Viajes',
    COUNT(*)
FROM Viajes
UNION ALL
SELECT
    'Interacciones Chatbot',
    COUNT(*)
FROM InteraccionesChatbot
UNION ALL
SELECT
    'Configuración Chatbot',
    COUNT(*)
FROM ConfiguracionChatbot
UNION ALL
SELECT
    'Respuestas Predefinidas',
    COUNT(*)
FROM RespuestasPredefinidas;