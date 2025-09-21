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
    -- Nombre(s) del Usuario.
    nomUsuario VARCHAR(80) NOT NULL,
    -- Apellido(s) del Usuario.
    apeUsuario VARCHAR(80) NOT NULL,
    -- Número de documento del Usuario.
    numDocUsuario VARCHAR(10) NOT NULL,
    telUsuario VARCHAR(15) NOT NULL,
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
    -- Unicidad por Empresa.
    UNIQUE(idEmpresa, email),
    UNIQUE(idEmpresa, numDocUsuario),
    -- Llave foránea: Con la tabla de Roles
    CONSTRAINT Fk_Usuarios_Roles FOREIGN KEY (idRol) REFERENCES Roles(idRol),
    -- Llave foránea: Si se borra una empresa, se borran sus usuarios.
    CONSTRAINT Fk_Usuarios_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);


-- -----------------------------------------------------
-- Tabla: Conductores
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Conductores (
    -- Identificador único del Conductor.
    idConductor INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Vínculo opcional a Usuarios para el login en la app.
    idUsuario INT NULL UNIQUE,
    -- Tipo de licencia de conducción.
    tipLicConductor ENUM('B1', 'B2', 'B3', 'C1', 'C2', 'C3') NOT NULL,
    -- Fecha de vencimiento de la licencia.
    fecVenLicConductor DATE NOT NULL,
    -- Estado laboral del Conductor.
    estConductor ENUM('ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES') NOT NULL DEFAULT 'INACTIVO',
    -- Empresa a la que pertenece el Conductor.
    idEmpresa INT NOT NULL,
    -- Fecha de creación del registro.
    fecCreConductor TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación.
    fecUltModConductor TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Unicidad Conductores.
    UNIQUE(idEmpresa, idUsuario),
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

-- Insercion de datos en la tabla Roles.
INSERT INTO Roles (nomRol) VALUES
-- idRol 1.
('SUPERADMIN'),
-- idRol 2.
('CONDUCTOR');

INSERT INTO Empresas (nomEmpresa, nitEmpresa, dirEmpresa, emaEmpresa, telEmpresa)
VALUES
    -- idEmpresa 1.
    -- Nombre, nit, direccion, email y telefono de la Empresa.
    ('Transporte La Sabana S.A.S', '900123456', 'Cra 45 # 12-34, Bogotá', 'contacto@lasabana.com', '3011234567');


-- Insercion de Usuarios.
INSERT INTO Usuarios (email, nomUsuario, apeUsuario, numDocUsuario, telUsuario, passwordHash, idRol, idEmpresa, estActivo)
VALUES
    -- Password: admin123
    -- Email, nombre(s), apellido(s), numero de documento, telefono, contraseña hash, idRol, idEmpresa y estadoActivo (0=False, 1=True) del Usuario.
    ('admintransync@gmail.com', 'Admin', 'TranSync', '1073155311', '3001234561', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe ', 1, 1, 1),
    -- Password: admin124
    ('adminrapidotolima@gmail.com', 'Admin', 'Tolima', '1073155312', '3001234562', '$2b$12$stgc03guikB1o2NBOXTYm.G96erg712on6tYgnFWBmJ6trgKjm9cC', 1, 1, 1);


-- Insertar conductores de ejemplo
INSERT INTO Conductores (idUsuario, tipLicConductor, fecVenLicConductor, estConductor, idEmpresa)
VALUES
        -- idUsuario, tipo de licencia, fecha de vencimiento de la licencia, estado del Conductor y Empresa a la que pertencece de momento solo existe una empresa 1.
        (1,'B1','2026-05-15', 'ACTIVO', 1),
        (2,'B2','2027-09-01', 'DIA_DESCANSO', 1);

-- Insertar rutas de ejemplo
INSERT INTO Rutas (nomRuta, oriRuta, desRuta, idEmpresa) VALUES
('Ruta Norte-Centro', 'Terminal Norte Bogotá', 'Centro Internacional Bogotá', 1),
('Expreso Medellín-Rionegro', 'Terminal Sur Medellín', 'Aeropuerto José María Córdova', 1),
('Ruta Sur-Chapinero', 'Terminal Sur Bogotá', 'Zona Rosa Chapinero', 1),
('Ruta Envigado-Centro', 'Envigado', 'Centro Medellín', 1),
('Ruta Centro-Occidente', 'Centro Bogotá', 'Terminal de Transportes', 1),
('Ruta Norte-Sur', 'Portal Norte', 'Portal Sur', 1);

-- Insertar vehículos de ejemplo
INSERT INTO Vehiculos (numVehiculo, plaVehiculo, marVehiculo, modVehiculo, anioVehiculo, fecVenSOAT, fecVenTec, estVehiculo, idEmpresa) VALUES
('V001', 'ABC123', 'Chevrolet', 'Spark GT', 2020, '2025-06-15', '2025-08-20', 'DISPONIBLE', 1),
('V002', 'DEF456', 'Renault', 'Logan', 2019, '2025-03-10', '2025-05-15', 'EN_RUTA', 1),
('V003', 'GHI789', 'Toyota', 'Corolla', 2021, '2025-09-25', '2025-11-30', 'EN_MANTENIMIENTO', 1),
('V004', 'JKL012', 'Nissan', 'Sentra', 2020, '2025-04-18', '2025-06-22', 'DISPONIBLE', 1),
('V005', 'MNO345', 'Mazda', 'CX-5', 2022, '2025-12-01', '2026-02-05', 'DISPONIBLE', 1);

-- Insertar viajes de ejemplo
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
-- DATOS DE PRUEBA ADICIONALES PARA DASHBOARD VIVO
-- =====================================================

-- Insertar más empresas para pruebas
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

-- Insertar más usuarios para pruebas (10 usuarios)
INSERT INTO Usuarios (email, nomUsuario, apeUsuario, numDocUsuario, telUsuario, passwordHash, idRol, idEmpresa, estActivo) VALUES
('conductor3@transync.com', 'Pedro', 'García', '1234567892', '3003333333', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor4@transync.com', 'María', 'López', '1234567893', '3004444444', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor5@transync.com', 'Juan', 'Hernández', '1234567894', '3005555555', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('admin1@transync.com', 'Roberto', 'Sánchez', '1234567895', '3006666666', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 1, 1, 1),
('conductor6@transync.com', 'Diego', 'Ramírez', '1234567897', '3008888888', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor7@transync.com', 'Sofia', 'Torres', '1234567898', '3009999999', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor8@transync.com', 'Carlos', 'Rodríguez', '1234567890', '3001111111', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor9@transync.com', 'Ana', 'Martínez', '1234567891', '3002222222', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor10@transync.com', 'Laura', 'González', '1234567896', '3007777777', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1),
('conductor11@transync.com', 'Miguel', 'Vargas', '1234567899', '3010000000', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe', 2, 1, 1);


-- Insertar conductores para los usuarios conductores (10 conductores)
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

-- Insertar vehículos (10 vehículos)
INSERT INTO Vehiculos (numVehiculo, plaVehiculo, marVehiculo, modVehiculo, anioVehiculo, fecVenSOAT, fecVenTec, estVehiculo, idEmpresa) VALUES
('V006', 'PQR678', 'Ford', 'Ranger', 2021, '2025-07-14', '2025-09-18', 'EN_RUTA', 2),
('V007', 'STU901', 'Volkswagen', 'Gol', 2019, '2025-05-30', '2025-08-03', 'EN_MANTENIMIENTO', 2),
('V008', 'VWX234', 'Hyundai', 'Tucson', 2022, '2025-11-12', '2026-01-16', 'DISPONIBLE', 2),
('V009', 'YZA567', 'Kia', 'Sportage', 2020, '2025-08-28', '2025-10-31', 'DISPONIBLE', 3),
('V010', 'BCD890', 'Honda', 'Civic', 2021, '2025-06-20', '2025-08-25', 'EN_RUTA', 3),
('V011', 'EFG123', 'BMW', 'X3', 2021, '2025-12-01', '2026-01-10', 'DISPONIBLE', 1),
('V012', 'HIJ456', 'Mercedes', 'C-Class', 2020, '2025-08-15', '2025-09-20', 'EN_MANTENIMIENTO', 1),
('V013', 'KLM789', 'Audi', 'A4', 2022, '2025-09-05', '2025-11-08', 'DISPONIBLE', 2),
('V014', 'NOP012', 'Peugeot', '3008', 2021, '2025-07-22', '2025-09-25', 'EN_RUTA', 2),
('V015', 'QRS345', 'Citroën', 'C4', 2020, '2025-06-18', '2025-08-21', 'DISPONIBLE', 3);

-- Insertar rutas (10 rutas)
INSERT INTO Rutas (nomRuta, oriRuta, desRuta, idEmpresa) VALUES
('Ruta Cali-Buenaventura', 'Terminal Cali', 'Puerto Buenaventura', 2),
('Ruta Medellín-Cartagena', 'Terminal Norte Medellín', 'Terminal Cartagena', 2),
('Ruta Barranquilla-Santa Marta', 'Terminal Barranquilla', 'Terminal Santa Marta', 3),
('Ruta Pereira-Manizales', 'Terminal Pereira', 'Terminal Manizales', 3),
('Ruta Bogotá-Ibagué', 'Terminal Salitre Bogotá', 'Terminal Ibagué', 1),
('Ruta Medellín-Bogotá', 'Terminal Norte Medellín', 'Terminal Salitre Bogotá', 2),
('Ruta Cali-Popayán', 'Terminal Cali', 'Terminal Popayán', 2),
('Ruta Bucaramanga-Cúcuta', 'Terminal Bucaramanga', 'Terminal Cúcuta', 3),
('Ruta Pasto-Ipiales', 'Terminal Pasto', 'Terminal Ipiales', 3),
('Ruta Armenia-Pereira', 'Terminal Armenia', 'Terminal Pereira', 1);

-- Insertar interacciones del chatbot (10 ejemplos)
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

-- Insertar configuración del chatbot (para cada empresa)
INSERT INTO ConfiguracionChatbot (idEmpresa, mensajeBienvenida, mensajeNoComprendido, mensajeDespedida) VALUES
(1, '¡Hola! Soy tu asistente virtual de TransSync. ¿En qué puedo ayudarte hoy con tu flota de transporte?', 'Lo siento, no pude entender tu consulta. ¿Puedes ser más específico o reformular tu pregunta?', '¡Gracias por usar TransSync! Que tengas un excelente día.'),
(2, 'Bienvenido al asistente de Logística Andina. ¿Cómo puedo ayudarte con tus operaciones de transporte?', 'No logré comprender tu consulta. Intenta usar términos más específicos como "conductores", "vehículos" o "rutas".', '¡Hasta luego! Gracias por preferir Logística Andina.'),
(3, '¡Hola! Soy el asistente de Carga Pesada. ¿Qué necesitas saber sobre tus vehículos de carga?', 'Perdón, no entendí tu pregunta. Prueba con consultas sobre "conductores", "mantenimiento" o "horarios".', '¡Gracias por tu consulta! Que tengas un buen viaje con Carga Pesada.');

-- Insertar respuestas predefinidas (10 ejemplos)
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
-- TABLAS PARA GESTIÓN DE PERFIL DE USUARIO
-- =====================================================

-- -----------------------------------------------------
-- Tabla: UserPreferences
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS UserPreferences (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    idUsuario INT NOT NULL,
    preferences JSON NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (idUsuario)
);

-- -----------------------------------------------------
-- Tabla: NotificationSettings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS NotificationSettings (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    idUsuario INT NOT NULL,
    notificationSettings JSON NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notifications (idUsuario)
);

-- -----------------------------------------------------
-- Tabla: UserActivity
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS UserActivity (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    idUsuario INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    INDEX idx_user_timestamp (idUsuario, timestamp),
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE
);

-- =====================================================
-- DATOS DE PRUEBA PARA PERFIL DE USUARIO
-- =====================================================

-- Insertar preferencias de usuario para algunos usuarios
INSERT INTO UserPreferences (idUsuario, preferences) VALUES
(1, '{"theme": "dark", "language": "es", "notifications": {"email": true, "push": false, "sms": true}, "dashboard": {"defaultView": "overview", "itemsPerPage": 15, "autoRefresh": true}}'),
(2, '{"theme": "light", "language": "es", "notifications": {"email": true, "push": true, "sms": false}, "dashboard": {"defaultView": "analytics", "itemsPerPage": 20, "autoRefresh": false}}'),
(3, '{"theme": "dark", "language": "es", "notifications": {"email": true, "push": true, "sms": true}, "dashboard": {"defaultView": "overview", "itemsPerPage": 10, "autoRefresh": true}}');

-- Insertar configuración de notificaciones para algunos usuarios
INSERT INTO NotificationSettings (idUsuario, notificationSettings) VALUES
(1, '{"newMessages": true, "systemUpdates": true, "securityAlerts": true, "maintenanceReminders": false, "reportNotifications": true, "emailFrequency": "immediate"}'),
(2, '{"newMessages": true, "systemUpdates": false, "securityAlerts": true, "maintenanceReminders": true, "reportNotifications": false, "emailFrequency": "daily"}'),
(3, '{"newMessages": true, "systemUpdates": true, "securityAlerts": false, "maintenanceReminders": true, "reportNotifications": true, "emailFrequency": "weekly"}');

-- Insertar actividad de usuario para algunos usuarios
INSERT INTO UserActivity (idUsuario, type, description, ipAddress, userAgent) VALUES
(1, 'login', 'Inicio de sesión exitoso', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'profile_update', 'Actualización de perfil personal', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'password_change', 'Cambio de contraseña exitoso', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'login', 'Inicio de sesión exitoso', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(2, 'preferences_update', 'Actualización de preferencias', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(3, 'login', 'Inicio de sesión exitoso', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
(3, 'notifications_update', 'Actualización de configuración de notificaciones', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

-- Mostrar resumen de datos insertados
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
FROM RespuestasPredefinidas
UNION ALL
SELECT
    'UserPreferences',
    COUNT(*)
FROM UserPreferences
UNION ALL
SELECT
    'NotificationSettings',
    COUNT(*)
FROM NotificationSettings
UNION ALL
SELECT
    'UserActivity',
    COUNT(*)
FROM UserActivity;