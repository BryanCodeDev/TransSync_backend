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
-- Tabla: Gestores
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS  Gestores(
    -- Identificador único del Gestor.
    idGestor INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Vínculo con sus credenciales en la tabla Usuarios.
    idUsuario INT NOT NULL UNIQUE,
    -- Identificador de la Empresa a la que pertenece.
    idEmpresa INT NOT NULL,
    -- Fecha de creación del registro.
    fecCreGestor TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Unicidad por Gestor.
    UNIQUE(idEmpresa, idUsuario),
    -- Llave foránea: Si se borra una empresa, se borran sus perfiles de admin.
    CONSTRAINT Fk_Gestores_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE,
    -- Llave foránea: Si se borra un usuario, se borra su perfil de admin.
    CONSTRAINT Fk_Gestores_Usuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE
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
('GESTOR'),
-- idRol 3.
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
(3, 2, 1, '2025-01-17 10:00:00', NULL, 'PROGRAMADO', 'Pendiente de confirmación');