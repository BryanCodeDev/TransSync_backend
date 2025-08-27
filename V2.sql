-- =====================================================
-- TRANSYNC - BASE DE DATOS COMPLETA CON CHATBOT INTEGRADO
-- Versión: 2.1 (Incluye funcionalidades de ChatBot) - CORREGIDA
-- =====================================================

-- Se elimina la base de datos si ya existe para asegurar una instalación limpia.
DROP DATABASE IF EXISTS transync;

-- Creación de la base de datos transync.
CREATE DATABASE transync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sentencia para usar la base de datos recién creada.
USE transync;

-- =====================================================
-- TABLAS PRINCIPALES DEL SISTEMA
-- =====================================================

-- -----------------------------------------------------
-- Tabla: Roles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Roles (
    idRol INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    nomRol VARCHAR(50) NOT NULL UNIQUE
);

-- -----------------------------------------------------
-- Tabla: Empresas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Empresas (
    -- Identificador único de la Empresa.
    idEmpresa INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Nombre de la Empresa.
    nomEmpresa VARCHAR(100) NOT NULL,
    -- NIT de la Empresa (único).
    nitEmpresa VARCHAR(20) NOT NULL UNIQUE,
    -- Dirección de la Empresa.
    dirEmpresa VARCHAR(100) NOT NULL,
    -- Correo electrónico de contacto de la Empresa.
    emaEmpresa VARCHAR(80) NOT NULL,
    -- Teléfono de contacto de la Empresa.
    telEmpresa VARCHAR(15) NOT NULL UNIQUE,
    -- Fecha y hora en que se registra una nueva empresa en el sistema.
    fecRegEmpresa TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: Usuarios
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Usuarios (
    -- Identificador único del Usuario.
    idUsuario INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Email para el login (debe ser único en todo el sistema).
    email VARCHAR(80) NOT NULL UNIQUE,
    -- Contraseña cifrada (hash).
    passwordHash VARCHAR(255) NOT NULL,
    -- Rol del usuario que define sus permisos.
    idRol INT NOT NULL,
    -- Empresa a la que pertenece el usuario.
    idEmpresa INT NOT NULL,
    -- Los usuarios inician desactivados en el sistema hasta hacer la validación.
    estActivo BOOLEAN DEFAULT FALSE,
    -- Fecha de creación del usuario.
    fecCreUsuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación (se actualiza sola).
    fecUltModUsuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Llave foránea: Con la tabla de Roles
    CONSTRAINT Fk_Usuarios_Roles FOREIGN KEY (idRol) REFERENCES Roles(idRol),
    -- Llave foránea: Si se borra una empresa, se borran sus usuarios.
    CONSTRAINT Fk_Usuarios_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: Administradores
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Administradores (
    -- Identificador único del Administrador.
    idAdministrador INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Vínculo con sus credenciales en la tabla Usuarios.
    idUsuario INT NOT NULL UNIQUE,
    -- Nombre(s) del Administrador.
    nomAdministrador VARCHAR(80) NOT NULL,
    -- Apellido(s) del Administrador.
    apeAdministrador VARCHAR(80) NOT NULL,
    -- Número de documento del Administrador (único por empresa).
    numDocAdministrador VARCHAR(15) NOT NULL,
    -- Identificador de la Empresa a la que pertenece.
    idEmpresa INT NOT NULL,
    -- Restricción de unicidad para el documento por empresa.
    UNIQUE(idEmpresa, numDocAdministrador),
    -- Llave foránea: Si se borra una empresa, se borran sus perfiles de admin.
    CONSTRAINT Fk_Administradores_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE,
    -- Llave foránea: Si se borra un usuario, se borra su perfil de admin.
    CONSTRAINT Fk_Administradores_Usuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: Conductores
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Conductores (
    -- Identificador único del Conductor.
    idConductor INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Vínculo opcional a Usuarios para el login en la app.
    idUsuario INT NULL UNIQUE,
    -- Nombre(s) del Conductor.
    nomConductor VARCHAR(80) NOT NULL,
    -- Apellido(s) del Conductor.
    apeConductor VARCHAR(80) NOT NULL,
    -- Número de documento del Conductor (único por empresa).
    numDocConductor VARCHAR(15) NOT NULL,
    -- Tipo de licencia de conducción.
    tipLicConductor ENUM('B1', 'B2', 'B3', 'C1', 'C2', 'C3') NOT NULL,
    -- Fecha de vencimiento de la licencia.
    fecVenLicConductor DATE NOT NULL,
    -- Teléfono de contacto del Conductor.
    telConductor VARCHAR(15),
    -- Estado laboral del Conductor.
    estConductor ENUM('ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES') NOT NULL DEFAULT 'INACTIVO',
    -- Empresa a la que pertenece el Conductor.
    idEmpresa INT NOT NULL,
    -- Fecha de creación del registro.
    fecCreConductor TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación.
    fecUltModConductor TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Restricción de unicidad para el documento por empresa.
    UNIQUE(idEmpresa, numDocConductor),
    -- Llave foránea: Si se borra la empresa, se borran sus conductores.
    CONSTRAINT Fk_Conductores_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE,
    -- Llave foránea: Si se borra el usuario, el conductor no se borra, solo se desvincula (SET NULL).
    CONSTRAINT Fk_Conductores_Usuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Tabla: Vehiculos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Vehiculos (
    -- Identificador único del Vehículo.
    idVehiculo INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Número interno del Vehículo (único por empresa).
    numVehiculo VARCHAR(10) NOT NULL,
    -- Placa del Vehículo (única a nivel nacional).
    plaVehiculo VARCHAR(10) NOT NULL UNIQUE,
    -- Marca del Vehículo.
    marVehiculo VARCHAR(50) NOT NULL,
    -- Modelo del Vehículo.
    modVehiculo VARCHAR(50) NOT NULL,
    -- Año del Vehículo.
    anioVehiculo YEAR NOT NULL,
    -- Fecha de vencimiento del SOAT.
    fecVenSOAT DATE NOT NULL,
    -- Fecha de vencimiento de la Revisión Técnico-Mecánica.
    fecVenTec DATE NOT NULL,
    -- Estado actual del Vehículo.
    estVehiculo ENUM('DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO') NOT NULL DEFAULT 'DISPONIBLE',
    -- Empresa propietaria del Vehículo.
    idEmpresa INT NOT NULL,
    -- Conductor asignado actualmente (puede no tener uno).
    idConductorAsignado INT NULL,
    -- Fecha de creación del registro.
    fecCreVehiculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación.
    fecUltModVehiculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Restricción de unicidad para el número interno por empresa.
    UNIQUE(idEmpresa, numVehiculo),
    -- Llave foránea: Si se borra la empresa, se borran sus vehículos.
    CONSTRAINT Fk_Vehiculos_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE,
    -- Llave foránea: Si se borra el conductor, el vehículo queda sin conductor asignado.
    CONSTRAINT Fk_Vehiculos_Conductor_Asignado FOREIGN KEY (idConductorAsignado) REFERENCES Conductores(idConductor) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Tabla: Rutas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Rutas (
    -- Identificador único de la Ruta.
    idRuta INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Nombre de la Ruta (único por empresa).
    nomRuta VARCHAR(100) NOT NULL,
    -- Origen de la Ruta.
    oriRuta VARCHAR(100) NOT NULL,
    -- Destino de la Ruta.
    desRuta VARCHAR(100) NOT NULL,
    -- Empresa que opera la ruta.
    idEmpresa INT NOT NULL,
    -- Restricción de unicidad para el nombre de la ruta por empresa.
    UNIQUE(idEmpresa, nomRuta),
    -- Llave foránea: Si se borra la empresa, se borran sus rutas.
    CONSTRAINT Fk_Rutas_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: Viajes
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Viajes (
    -- Identificador único del Viaje.
    idViaje INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Vehículo del viaje.
    idVehiculo INT NOT NULL,
    -- Conductor del viaje.
    idConductor INT NOT NULL,
    -- Ruta del viaje.
    idRuta INT NOT NULL,
    -- Fecha y hora de salida.
    fecHorSalViaje DATETIME NOT NULL,
    -- Fecha y hora de llegada.
    fecHorLleViaje DATETIME NULL,
    -- Estado del Viaje.
    estViaje ENUM('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'PROGRAMADO',
    -- Observaciones o novedades.
    obsViaje TEXT,
    -- Llave foránea hacia Vehiculos.
    CONSTRAINT Fk_Viajes_Vehiculos FOREIGN KEY (idVehiculo) REFERENCES Vehiculos(idVehiculo),
    -- Llave foránea hacia Conductores.
    CONSTRAINT Fk_Viajes_Conductores FOREIGN KEY (idConductor) REFERENCES Conductores(idConductor),
    -- Llave foránea hacia Rutas.
    CONSTRAINT Fk_Viajes_Rutas FOREIGN KEY (idRuta) REFERENCES Rutas(idRuta)
);

-- =====================================================
-- TABLAS DEL SISTEMA DE CHATBOT
-- =====================================================

-- -----------------------------------------------------
-- Tabla: InteraccionesChatbot
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS InteraccionesChatbot (
    -- Identificador único de la interacción
    idInteraccion INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Mensaje enviado por el usuario
    mensaje TEXT NOT NULL,
    -- Respuesta generada por el chatbot
    respuesta TEXT NOT NULL,
    -- Intención detectada (opcional)
    intencion VARCHAR(50) NULL,
    -- Empresa del usuario que hizo la consulta
    idEmpresa INT NOT NULL,
    -- Usuario que hizo la consulta (puede ser NULL si no está autenticado)
    idUsuario INT NULL,
    -- Tiempo de respuesta en milisegundos
    tiempoRespuesta INT NULL,
    -- Si la respuesta fue exitosa
    exitosa BOOLEAN DEFAULT TRUE,
    -- Valoración del usuario (1-5, opcional)
    valoracion TINYINT NULL CHECK (valoracion >= 1 AND valoracion <= 5),
    -- Comentario del usuario sobre la respuesta
    comentario TEXT NULL,
    -- Dirección IP del usuario (para análisis de uso)
    ipUsuario VARCHAR(45) NULL,
    -- User Agent del navegador
    userAgent TEXT NULL,
    -- Fecha y hora de la interacción
    fechaInteraccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación (para valoraciones posteriores)
    fechaModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para mejor rendimiento
    INDEX idx_empresa (idEmpresa),
    INDEX idx_usuario (idUsuario),
    INDEX idx_fecha (fechaInteraccion),
    INDEX idx_intencion (intencion),
    INDEX idx_exitosa (exitosa),
    
    -- Claves foráneas
    CONSTRAINT Fk_InteraccionesChatbot_Empresas 
        FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE,
    CONSTRAINT Fk_InteraccionesChatbot_Usuarios 
        FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Tabla: ConfiguracionChatbot (CORREGIDA)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ConfiguracionChatbot (
    -- Identificador único de configuración
    idConfiguracion INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Empresa a la que pertenece la configuración
    idEmpresa INT NOT NULL UNIQUE,
    -- Nombre personalizado del chatbot
    nombreChatbot VARCHAR(100) NOT NULL DEFAULT 'Asistente TransSync',
    -- Mensaje de bienvenida personalizado (SIN DEFAULT)
    mensajeBienvenida TEXT NOT NULL,
    -- Mensaje para consultas no comprendidas (SIN DEFAULT)
    mensajeNoComprendido TEXT NOT NULL,
    -- Mensaje de despedida (SIN DEFAULT)
    mensajeDespedida TEXT NOT NULL,
    -- Avatar/icono del chatbot
    avatar VARCHAR(255) DEFAULT '🤖',
    -- Color primario del tema (hexadecimal)
    colorPrimario VARCHAR(7) DEFAULT '#1a237e',
    -- Color secundario del tema
    colorSecundario VARCHAR(7) DEFAULT '#3949ab',
    -- Activar/desactivar el chatbot
    activo BOOLEAN DEFAULT TRUE,
    -- Activar registro detallado de interacciones
    registroDetallado BOOLEAN DEFAULT TRUE,
    -- Tiempo máximo de respuesta esperado (segundos)
    tiempoMaximoRespuesta INT DEFAULT 30,
    -- Fecha de creación de la configuración
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación
    fechaModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Clave foránea
    CONSTRAINT Fk_ConfiguracionChatbot_Empresas 
        FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: RespuestasPredefinidas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS RespuestasPredefinidas (
    -- Identificador único de respuesta
    idRespuesta INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Empresa propietaria de la respuesta
    idEmpresa INT NOT NULL,
    -- Palabras clave que activan esta respuesta (separadas por comas)
    palabrasClave TEXT NOT NULL,
    -- Categoría de la respuesta
    categoria ENUM('saludo', 'conductores', 'vehiculos', 'rutas', 'horarios', 'reportes', 'ayuda', 'despedida', 'personalizada') NOT NULL,
    -- Respuesta personalizada
    respuesta TEXT NOT NULL,
    -- Prioridad de la respuesta (mayor número = mayor prioridad)
    prioridad INT DEFAULT 1,
    -- Si está activa
    activa BOOLEAN DEFAULT TRUE,
    -- Contador de veces que se ha usado
    vecesUtilizada INT DEFAULT 0,
    -- Fecha de creación
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación
    fechaModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_empresa (idEmpresa),
    INDEX idx_categoria (categoria),
    INDEX idx_activa (activa),
    INDEX idx_prioridad (prioridad),
    
    -- Clave foránea
    CONSTRAINT Fk_RespuestasPredefinidas_Empresas 
        FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);

-- =====================================================
-- INSERCIÓN DE DATOS INICIALES Y EJEMPLOS
-- =====================================================

-- Insertar roles básicos del sistema
INSERT INTO Roles (nomRol) VALUES 
('SUPERADMIN'),
('PENDIENTE'),
('ADMINISTRADOR'),
('CONDUCTOR');

-- Insertar empresas de ejemplo
INSERT INTO Empresas (nomEmpresa, nitEmpresa, dirEmpresa, emaEmpresa, telEmpresa) VALUES
('TransSync Demo', '900123456-1', 'Calle 123 #45-67, Bogotá', 'demo@transync.com', '3001234567'),
('Transportes El Rápido S.A.S', '901234567-2', 'Avenida 80 #25-30, Medellín', 'info@elrapido.com', '3009876543');

-- Crear usuarios con credenciales de ejemplo
-- Email: transsync1@gmail.com, Contraseña: admin123 (hasheada)
INSERT INTO Usuarios (email, passwordHash, idRol, idEmpresa, estActivo) VALUES
('transsync1@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIrsKR8lGhcnDbPvN/d9YbKrOTGO0xGq', 1, 1, TRUE),
('admin@elrapido.com', '$2a$10$8K1p5Uj3N2B4F7D8G1H5JuO9LmNqPrStUvWxYzAbCdEfGhIjKlMnO', 3, 2, TRUE),
('conductor@elrapido.com', '$2a$10$9L2q6Vk4O3C5G8E9H2I6KvP0MnQrSuVxYzBcDfGhJkLnOpQrSuVx', 4, 2, TRUE);

-- Crear perfiles de administradores
INSERT INTO Administradores (idUsuario, nomAdministrador, apeAdministrador, numDocAdministrador, idEmpresa) VALUES
(1, 'Bryan', 'Munoz', '1073155317', 1),
(2, 'María José', 'Rodríguez Pérez', '98765432', 2);

-- Insertar conductores de ejemplo
INSERT INTO Conductores (idUsuario, nomConductor, apeConductor, numDocConductor, tipLicConductor, fecVenLicConductor, telConductor, estConductor, idEmpresa) VALUES
(3, 'Carlos Alberto', 'González Martínez', '87654321', 'C2', '2025-12-31', '3156789012', 'ACTIVO', 2),
(NULL, 'Ana Lucía', 'Vásquez Torres', '11223344', 'C1', '2026-06-15', '3187654321', 'INACTIVO', 1),
(NULL, 'Roberto', 'Silva Mendoza', '55667788', 'C2', '2025-10-20', '3198765432', 'ACTIVO', 1),
(NULL, 'Patricia', 'López García', '99887766', 'C1', '2026-03-10', '3145678901', 'DIA_DESCANSO', 2);

-- Insertar vehículos de ejemplo
INSERT INTO Vehiculos (numVehiculo, plaVehiculo, marVehiculo, modVehiculo, anioVehiculo, fecVenSOAT, fecVenTec, estVehiculo, idEmpresa, idConductorAsignado) VALUES
('BUS001', 'ABC123', 'Mercedes-Benz', 'OH 1626', 2020, '2025-08-30', '2025-12-15', 'DISPONIBLE', 1, NULL),
('VAN002', 'DEF456', 'Chevrolet', 'NPR', 2019, '2025-09-15', '2026-01-20', 'EN_RUTA', 2, 1),
('BUS003', 'GHI789', 'Volvo', 'B290R', 2021, '2025-11-20', '2026-02-28', 'DISPONIBLE', 1, 3),
('VAN004', 'JKL012', 'Iveco', 'Daily', 2018, '2025-10-05', '2025-12-30', 'EN_MANTENIMIENTO', 2, NULL);

-- Insertar rutas de ejemplo
INSERT INTO Rutas (nomRuta, oriRuta, desRuta, idEmpresa) VALUES
('Ruta Norte-Centro', 'Terminal Norte Bogotá', 'Centro Internacional Bogotá', 1),
('Expreso Medellín-Rionegro', 'Terminal Sur Medellín', 'Aeropuerto José María Córdova', 2),
('Ruta Sur-Chapinero', 'Terminal Sur Bogotá', 'Zona Rosa Chapinero', 1),
('Ruta Envigado-Centro', 'Envigado', 'Centro Medellín', 2);

-- Insertar viajes de ejemplo
INSERT INTO Viajes (idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje, obsViaje) VALUES
(1, 2, 1, '2025-08-21 08:00:00', '2025-08-21 09:30:00', 'FINALIZADO', 'Viaje completado sin novedades'),
(2, 1, 2, '2025-08-21 14:30:00', NULL, 'EN_CURSO', 'Salida a tiempo, tráfico normal'),
(3, 3, 3, '2025-08-22 06:30:00', '2025-08-22 08:15:00', 'FINALIZADO', 'Tráfico pesado en la Autopista Norte'),
(1, 2, 1, '2025-08-22 16:00:00', NULL, 'PROGRAMADO', 'Viaje programado para la tarde');

-- =====================================================
-- CONFIGURACIONES INICIALES DEL CHATBOT (CORREGIDAS)
-- =====================================================

-- Configuración inicial para las empresas existentes
INSERT INTO ConfiguracionChatbot (
    idEmpresa, 
    nombreChatbot, 
    mensajeBienvenida,
    mensajeNoComprendido,
    mensajeDespedida
) VALUES
(1, 'Asistente TransSync Demo', 
 'Hola! Soy el asistente virtual de TransSync Demo. Tengo acceso a datos reales del sistema y puedo ayudarte con conductores, vehículos, rutas y mucho más. ¿En qué puedo ayudarte?',
 'Lo siento, no entendí tu consulta. ¿Podrías reformularla o ser más específico?',
 'Hasta pronto! No dudes en contactarme cuando necesites ayuda con TransSync Demo.'
),
(2, 'Asistente El Rápido', 
 'Bienvenido! Soy el asistente virtual de Transportes El Rápido. Puedo consultar información actualizada sobre nuestra flota, conductores y rutas. ¿Qué información necesitas?',
 'No he podido comprender tu solicitud. ¿Podrías explicarme de otra manera?',
 'Perfecto! Fue un gusto ayudarte. Estoy disponible 24/7 para consultar cualquier información de El Rápido.'
);

-- Respuestas predefinidas básicas
INSERT INTO RespuestasPredefinidas (idEmpresa, palabrasClave, categoria, respuesta, prioridad) VALUES
-- Respuestas para empresa 1 (TransSync Demo)
(1, 'hola,buenos dias,buenas tardes,saludos', 'saludo', 'Hola! Bienvenido a TransSync Demo. Soy tu asistente virtual y tengo acceso a todos los datos del sistema. ¿En qué puedo ayudarte hoy?', 5),
(1, 'gracias,thanks,muchas gracias', 'despedida', 'De nada! Ha sido un placer ayudarte. Recuerda que siempre estoy aquí para consultar información actualizada del sistema TransSync.', 5),
(1, 'ayuda,help,que puedes hacer,opciones', 'ayuda', 'Puedo ayudarte consultando datos reales del sistema sobre:\n• Estado de conductores y disponibilidad\n• Información de vehículos y flota\n• Rutas y recorridos registrados\n• Horarios y programación de viajes\n• Reportes y estadísticas\n• Alertas de vencimientos\n\nSolo pregúntame lo que necesites saber!', 5),
(1, 'conductores,conductor,chofer,chofer', 'conductores', 'Puedo consultar información sobre conductores como: estado actual, licencias, vencimientos, asignaciones de vehículos y disponibilidad. ¿Qué específicamente necesitas saber?', 4),
(1, 'vehiculos,vehiculo,buses,bus,flota', 'vehiculos', 'Tengo acceso a toda la información de la flota: estado de vehículos, mantenimientos, vencimientos de SOAT y revisión técnica, asignaciones y disponibilidad. ¿Qué consulta necesitas hacer?', 4),
(1, 'rutas,ruta,destinos,origen', 'rutas', 'Puedo brindarte información sobre todas las rutas registradas, orígenes, destinos y programación. ¿Sobre qué ruta necesitas información?', 4),

-- Respuestas para empresa 2 (El Rápido)
(2, 'hola,buenos dias,buenas tardes,saludos', 'saludo', 'Hola! Bienvenido a Transportes El Rápido. Soy tu asistente virtual con acceso directo a nuestra base de datos. ¿Qué información necesitas?', 5),
(2, 'gracias,thanks,muchas gracias', 'despedida', 'Perfecto! Fue un gusto ayudarte. Estoy disponible 24/7 para consultar cualquier información de El Rápido.', 5),
(2, 'ayuda,help,que puedes hacer', 'ayuda', 'Tengo acceso completo a los datos de Transportes El Rápido y puedo consultar:\n• Conductores activos y disponibles\n• Estado de nuestra flota de vehículos\n• Rutas y destinos\n• Programación de servicios\n• Estadísticas operacionales\n• Vencimientos de documentos\n\n¿Qué te gustaría saber?', 5),
(2, 'conductores,conductor,chofer', 'conductores', 'Estoy conectado a nuestra base de datos de conductores. Puedo consultar disponibilidad, estados, licencias y asignaciones. ¿Qué información específica necesitas?', 4),
(2, 'vehiculos,vehiculo,buses,bus,flota', 'vehiculos', 'Tengo acceso en tiempo real al estado de toda nuestra flota. Puedo consultar disponibilidad, mantenimientos, documentación y asignaciones. ¿Qué vehículo te interesa?', 4),
(2, 'rutas,ruta,destinos', 'rutas', 'Conozco todas nuestras rutas operativas, horarios y destinos. ¿Sobre qué ruta específica necesitas información?', 4);

-- =====================================================
-- VISTAS PARA ANÁLISIS Y REPORTES
-- =====================================================

-- Vista para estadísticas de uso del chatbot por empresa
CREATE VIEW EstadisticasChatbotPorEmpresa AS
SELECT 
    e.idEmpresa,
    e.nomEmpresa,
    COUNT(ic.idInteraccion) as totalInteracciones,
    COUNT(DISTINCT ic.idUsuario) as usuariosUnicos,
    COUNT(DISTINCT DATE(ic.fechaInteraccion)) as diasActivos,
    AVG(ic.tiempoRespuesta) as tiempoPromedioRespuesta,
    SUM(CASE WHEN ic.exitosa = TRUE THEN 1 ELSE 0 END) as respuestasExitosas,
    AVG(ic.valoracion) as valoracionPromedio,
    MAX(ic.fechaInteraccion) as ultimaInteraccion
FROM Empresas e
LEFT JOIN InteraccionesChatbot ic ON e.idEmpresa = ic.idEmpresa
GROUP BY e.idEmpresa, e.nomEmpresa;

-- Vista para intenciones más consultadas
CREATE VIEW IntencionesPopulares AS
SELECT 
    ic.idEmpresa,
    e.nomEmpresa,
    ic.intencion,
    COUNT(*) as frecuencia,
    AVG(ic.tiempoRespuesta) as tiempoPromedio,
    SUM(CASE WHEN ic.exitosa = TRUE THEN 1 ELSE 0 END) as exitosas
FROM InteraccionesChatbot ic
JOIN Empresas e ON ic.idEmpresa = e.idEmpresa
WHERE ic.intencion IS NOT NULL
GROUP BY ic.idEmpresa, e.nomEmpresa, ic.intencion
ORDER BY ic.idEmpresa, frecuencia DESC;

-- Vista consolidada de información operacional (útil para el chatbot)
CREATE VIEW ResumenOperacional AS
SELECT 
    e.idEmpresa,
    e.nomEmpresa,
    COUNT(DISTINCT c.idConductor) as totalConductores,
    SUM(CASE WHEN c.estConductor = 'ACTIVO' THEN 1 ELSE 0 END) as conductoresActivos,
    COUNT(DISTINCT v.idVehiculo) as totalVehiculos,
    SUM(CASE WHEN v.estVehiculo = 'DISPONIBLE' THEN 1 ELSE 0 END) as vehiculosDisponibles,
    SUM(CASE WHEN v.estVehiculo = 'EN_RUTA' THEN 1 ELSE 0 END) as vehiculosEnRuta,
    COUNT(DISTINCT r.idRuta) as totalRutas,
    COUNT(DISTINCT vi.idViaje) as totalViajes,
    SUM(CASE WHEN vi.estViaje = 'EN_CURSO' THEN 1 ELSE 0 END) as viajesEnCurso,
    SUM(CASE WHEN vi.estViaje = 'PROGRAMADO' THEN 1 ELSE 0 END) as viajesProgramados
FROM Empresas e
LEFT JOIN Conductores c ON e.idEmpresa = c.idEmpresa
LEFT JOIN Vehiculos v ON e.idEmpresa = v.idEmpresa
LEFT JOIN Rutas r ON e.idEmpresa = r.idEmpresa
LEFT JOIN Viajes vi ON v.idVehiculo = vi.idVehiculo
GROUP BY e.idEmpresa, e.nomEmpresa;

-- Vista para alertas de vencimientos (útil para el chatbot)
CREATE VIEW AlertasVencimientos AS
SELECT 
    e.idEmpresa,
    e.nomEmpresa,
    'LICENCIA' as tipoDocumento,
    CONCAT(c.nomConductor, ' ', c.apeConductor) as titular,
    c.fecVenLicConductor as fechaVencimiento,
    DATEDIFF(c.fecVenLicConductor, CURDATE()) as diasParaVencer,
    CASE 
        WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) < 0 THEN 'VENCIDO'
        WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) <= 30 THEN 'CRÍTICO'
        WHEN DATEDIFF(c.fecVenLicConductor, CURDATE()) <= 60 THEN 'ADVERTENCIA'
        ELSE 'NORMAL'
    END as estado
FROM Empresas e
JOIN Conductores c ON e.idEmpresa = c.idEmpresa

UNION ALL

SELECT 
    e.idEmpresa,
    e.nomEmpresa,
    'SOAT' as tipoDocumento,
    CONCAT(v.marVehiculo, ' ', v.modVehiculo, ' - ', v.plaVehiculo) as titular,
    v.fecVenSOAT as fechaVencimiento,
    DATEDIFF(v.fecVenSOAT, CURDATE()) as diasParaVencer,
    CASE 
        WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) < 0 THEN 'VENCIDO'
        WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) <= 30 THEN 'CRÍTICO'
        WHEN DATEDIFF(v.fecVenSOAT, CURDATE()) <= 60 THEN 'ADVERTENCIA'
        ELSE 'NORMAL'
    END as estado
FROM Empresas e
JOIN Vehiculos v ON e.idEmpresa = v.idEmpresa

UNION ALL

SELECT 
    e.idEmpresa,
    e.nomEmpresa,
    'TECNOMECANICA' as tipoDocumento,
    CONCAT(v.marVehiculo, ' ', v.modVehiculo, ' - ', v.plaVehiculo) as titular,
    v.fecVenTec as fechaVencimiento,
    DATEDIFF(v.fecVenTec, CURDATE()) as diasParaVencer,
    CASE 
        WHEN DATEDIFF(v.fecVenTec, CURDATE()) < 0 THEN 'VENCIDO'
        WHEN DATEDIFF(v.fecVenTec, CURDATE()) <= 30 THEN 'CRÍTICO'
        WHEN DATEDIFF(v.fecVenTec, CURDATE()) <= 60 THEN 'ADVERTENCIA'
        ELSE 'NORMAL'
    END as estado
FROM Empresas e
JOIN Vehiculos v ON e.idEmpresa = v.idEmpresa

ORDER BY diasParaVencer ASC;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

-- Procedimiento para limpiar interacciones antiguas del chatbot
DELIMITER //
CREATE PROCEDURE LimpiarInteraccionesAntiguas(IN diasAntiguedad INT)
BEGIN
    DELETE FROM InteraccionesChatbot 
    WHERE fechaInteraccion < DATE_SUB(NOW(), INTERVAL diasAntiguedad DAY);
    
    SELECT ROW_COUNT() as interaccionesEliminadas;
END//
DELIMITER ;

-- Procedimiento para obtener estadísticas detalladas del chatbot
DELIMITER //
CREATE PROCEDURE ObtenerEstadisticasChatbot(IN empresaId INT, IN diasAtras INT)
BEGIN
    SELECT 
        DATE(fechaInteraccion) as fecha,
        COUNT(*) as totalInteracciones,
        COUNT(DISTINCT idUsuario) as usuariosActivos,
        AVG(tiempoRespuesta) as tiempoPromedio,
        SUM(CASE WHEN exitosa = TRUE THEN 1 ELSE 0 END) as exitosas,
        GROUP_CONCAT(DISTINCT intencion ORDER BY intencion) as intenciones
    FROM InteraccionesChatbot 
    WHERE idEmpresa = empresaId
    AND fechaInteraccion >= DATE_SUB(CURDATE(), INTERVAL diasAtras DAY)
    GROUP BY DATE(fechaInteraccion)
    ORDER BY fecha DESC;
END//
DELIMITER ;

-- Procedimiento para registrar una interacción del chatbot
DELIMITER //
CREATE PROCEDURE RegistrarInteraccionChatbot(
    IN p_mensaje TEXT,
    IN p_respuesta TEXT,
    IN p_intencion VARCHAR(50),
    IN p_idEmpresa INT,
    IN p_idUsuario INT,
    IN p_tiempoRespuesta INT,
    IN p_exitosa BOOLEAN,
    IN p_ipUsuario VARCHAR(45),
    IN p_userAgent TEXT
)
BEGIN
    INSERT INTO InteraccionesChatbot (
        mensaje, respuesta, intencion, idEmpresa, idUsuario, 
        tiempoRespuesta, exitosa, ipUsuario, userAgent
    ) VALUES (
        p_mensaje, p_respuesta, p_intencion, p_idEmpresa, p_idUsuario,
        p_tiempoRespuesta, p_exitosa, p_ipUsuario, p_userAgent
    );
    
    SELECT LAST_INSERT_ID() as idInteraccion;
END//
DELIMITER ;

-- Procedimiento para obtener información rápida de la empresa (útil para chatbot)
DELIMITER //
CREATE PROCEDURE ObtenerResumenEmpresa(IN empresaId INT)
BEGIN
    SELECT 
        ro.idEmpresa,
        ro.nomEmpresa,
        ro.totalConductores,
        ro.conductoresActivos,
        ro.totalVehiculos,
        ro.vehiculosDisponibles,
        ro.vehiculosEnRuta,
        ro.totalRutas,
        ro.totalViajes,
        ro.viajesEnCurso,
        ro.viajesProgramados,
        -- Alertas críticas
        (SELECT COUNT(*) FROM AlertasVencimientos WHERE idEmpresa = empresaId AND estado = 'VENCIDO') as documentosVencidos,
        (SELECT COUNT(*) FROM AlertasVencimientos WHERE idEmpresa = empresaId AND estado = 'CRÍTICO') as documentosCriticos
    FROM ResumenOperacional ro
    WHERE ro.idEmpresa = empresaId;
END//
DELIMITER ;

-- Función para buscar respuestas predefinidas del chatbot
DELIMITER //
CREATE FUNCTION BuscarRespuestaPredefinida(empresaId INT, palabraBuscar VARCHAR(255))
RETURNS TEXT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE respuestaEncontrada TEXT DEFAULT NULL;
    
    SELECT respuesta INTO respuestaEncontrada
    FROM RespuestasPredefinidas 
    WHERE idEmpresa = empresaId 
    AND activa = TRUE
    AND FIND_IN_SET(LOWER(palabraBuscar), LOWER(REPLACE(palabrasClave, ' ', ''))) > 0
    ORDER BY prioridad DESC, vecesUtilizada ASC
    LIMIT 1;
    
    -- Actualizar contador de uso si se encontró respuesta
    IF respuestaEncontrada IS NOT NULL THEN
        UPDATE RespuestasPredefinidas 
        SET vecesUtilizada = vecesUtilizada + 1,
            fechaModificacion = CURRENT_TIMESTAMP
        WHERE idEmpresa = empresaId 
        AND activa = TRUE
        AND FIND_IN_SET(LOWER(palabraBuscar), LOWER(REPLACE(palabrasClave, ' ', ''))) > 0
        ORDER BY prioridad DESC, vecesUtilizada ASC
        LIMIT 1;
    END IF;
    
    RETURN respuestaEncontrada;
END//
DELIMITER ;

-- =====================================================
-- TRIGGERS ÚTILES
-- =====================================================

-- Trigger para crear configuración automática del chatbot cuando se crea una empresa
DELIMITER //
CREATE TRIGGER CrearConfiguracionChatbotEmpresa
AFTER INSERT ON Empresas
FOR EACH ROW
BEGIN
    INSERT INTO ConfiguracionChatbot (
        idEmpresa, 
        nombreChatbot, 
        mensajeBienvenida,
        mensajeNoComprendido,
        mensajeDespedida
    ) VALUES (
        NEW.idEmpresa,
        CONCAT('Asistente ', NEW.nomEmpresa),
        CONCAT('Hola! Soy el asistente virtual de ', NEW.nomEmpresa, '. ¿En qué puedo ayudarte hoy?'),
        'Lo siento, no entendí tu consulta. ¿Podrías reformularla?',
        'Hasta pronto! No dudes en contactarme cuando necesites ayuda.'
    );
END//
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para mejorar el rendimiento de consultas frecuentes del chatbot
CREATE INDEX idx_conductores_empresa_estado ON Conductores(idEmpresa, estConductor);
CREATE INDEX idx_vehiculos_empresa_estado ON Vehiculos(idEmpresa, estVehiculo);
CREATE INDEX idx_viajes_estado_fecha ON Viajes(estViaje, fecHorSalViaje);
CREATE INDEX idx_respuestas_empresa_categoria ON RespuestasPredefinidas(idEmpresa, categoria, activa);

-- =====================================================
-- VERIFICACIÓN COMPLETA DE LA INSTALACIÓN
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 'Tablas principales del sistema:' as Info;
SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'transync' 
AND TABLE_NAME IN ('Empresas', 'Usuarios', 'Administradores', 'Conductores', 'Vehiculos', 'Rutas', 'Viajes')
ORDER BY TABLE_NAME;

SELECT 'Tablas del ChatBot:' as Info;
SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'transync' 
AND TABLE_NAME IN ('InteraccionesChatbot', 'ConfiguracionChatbot', 'RespuestasPredefinidas')
ORDER BY TABLE_NAME;

-- Verificar datos iniciales
SELECT 'Empresas registradas:' as Info;
SELECT 
    e.idEmpresa,
    e.nomEmpresa,
    e.nitEmpresa,
    e.telEmpresa,
    cc.nombreChatbot,
    cc.activo as chatbotActivo
FROM Empresas e
JOIN ConfiguracionChatbot cc ON e.idEmpresa = cc.idEmpresa;

-- Verificar usuarios del sistema
SELECT 'Usuarios del sistema:' as Info;
SELECT 
    u.idUsuario, 
    u.email, 
    r.nomRol as rol, 
    u.estActivo,
    e.nomEmpresa
FROM Usuarios u
JOIN Roles r ON u.idRol = r.idRol
JOIN Empresas e ON u.idEmpresa = e.idEmpresa
ORDER BY u.idUsuario;

-- Verificar resumen operacional
SELECT 'Resumen operacional por empresa:' as Info;
SELECT * FROM ResumenOperacional;

-- Verificar configuraciones del chatbot
SELECT 'Configuraciones del ChatBot:' as Info;
SELECT 
    cc.idEmpresa,
    e.nomEmpresa,
    cc.nombreChatbot,
    cc.activo,
    cc.fechaCreacion,
    COUNT(rp.idRespuesta) as respuestasPredefinidas
FROM ConfiguracionChatbot cc
JOIN Empresas e ON cc.idEmpresa = e.idEmpresa
LEFT JOIN RespuestasPredefinidas rp ON cc.idEmpresa = rp.idEmpresa AND rp.activa = TRUE
GROUP BY cc.idEmpresa, e.nomEmpresa, cc.nombreChatbot, cc.activo, cc.fechaCreacion;

-- Verificar alertas de vencimientos
SELECT 'Alertas de vencimientos críticos:' as Info;
SELECT 
    nomEmpresa,
    tipoDocumento,
    titular,
    fechaVencimiento,
    diasParaVencer,
    estado
FROM AlertasVencimientos 
WHERE estado IN ('VENCIDO', 'CRÍTICO')
ORDER BY diasParaVencer ASC;

-- Verificar vistas creadas
SELECT 'Vistas disponibles:' as Info;
SELECT TABLE_NAME as Vista
FROM information_schema.VIEWS 
WHERE TABLE_SCHEMA = 'transync'
ORDER BY TABLE_NAME;

-- Verificar procedimientos almacenados
SELECT 'Procedimientos almacenados:' as Info;
SELECT ROUTINE_NAME as Procedimiento, ROUTINE_TYPE as Tipo
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'transync'
ORDER BY ROUTINE_TYPE, ROUTINE_NAME;

-- Mensaje final de éxito
SELECT '🚀 BASE DE DATOS TRANSYNC CON CHATBOT INSTALADA EXITOSAMENTE!' as '✅ RESULTADO';
SELECT 'Características instaladas:' as Info;
SELECT '• Sistema completo de gestión de transporte' as Caracteristicas
UNION SELECT '• Gestión de empresas, usuarios y roles'
UNION SELECT '• Control de conductores y vehículos'
UNION SELECT '• Administración de rutas y viajes'
UNION SELECT '• Sistema de ChatBot inteligente'
UNION SELECT '• Respuestas predefinidas personalizables'
UNION SELECT '• Análisis y estadísticas de uso'
UNION SELECT '• Alertas automáticas de vencimientos'
UNION SELECT '• Vistas optimizadas para consultas'
UNION SELECT '• Procedimientos almacenados útiles';