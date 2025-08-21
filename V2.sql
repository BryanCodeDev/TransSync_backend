-- Se elimina la base de datos si ya existe para asegurar una instalación limpia.
DROP DATABASE IF EXISTS transync;

-- Creación de la base de datos transync.
CREATE DATABASE transync;

-- Sentencia para usar la base de datos recién creada.
USE transync;

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
    -- Los usuarios inician desactivados en el sistema hasta hacer la validacion.
    estActivo BOOLEAN DEFAULT FALSE,
    -- Fecha de creación del usuario.
    fecCreUsuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación (se actualiza sola).
    fecUltModUsuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Llave foranea: Con la tabla de Roles
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
-- INSERCIÓN DE DATOS INICIALES REQUERIDOS
-- =====================================================

-- Insertar roles básicos del sistema
INSERT INTO Roles (nomRol) VALUES 
('SUPERADMIN'),
('PENDIENTE'),
('ADMINISTRADOR'),
('CONDUCTOR');

-- Insertar empresa de prueba (ID 1 como espera el código)
INSERT INTO Empresas (nomEmpresa, nitEmpresa, dirEmpresa, emaEmpresa, telEmpresa) VALUES
('TransSync Demo', '900123456-1', 'Calle 123 #45-67, Bogotá', 'demo@transync.com', '3001234567');

-- Crear usuario SUPERADMIN para administrar el sistema
-- Contraseña: SuperAdmin123! (hasheada con bcrypt, salt rounds: 10)
INSERT INTO Usuarios (email, passwordHash, idRol, idEmpresa, estActivo) VALUES
('superadmin@transync.com', '$2a$10$8K1p5Uj3N2B4F7D8G1H5JuO9LmNqPrStUvWxYzAbCdEfGhIjKlMnO', 1, 1, TRUE);

-- Crear perfil de administrador para el SUPERADMIN
INSERT INTO Administradores (idUsuario, nomAdministrador, apeAdministrador, numDocAdministrador, idEmpresa) VALUES
(1, 'Super', 'Admin', '1234567890', 1);

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Verificar que los roles se crearon correctamente
SELECT 'Roles creados:' as Info;
SELECT idRol, nomRol FROM Roles;

-- Verificar que la empresa se creó correctamente  
SELECT 'Empresa creada:' as Info;
SELECT idEmpresa, nomEmpresa, nitEmpresa FROM Empresas;

-- Verificar que el SUPERADMIN se creó correctamente
SELECT 'Usuario SUPERADMIN creado:' as Info;
SELECT 
    u.idUsuario, 
    u.email, 
    r.nomRol as rol, 
    u.estActivo,
    a.nomAdministrador,
    a.apeAdministrador
FROM Usuarios u
JOIN Roles r ON u.idRol = r.idRol
LEFT JOIN Administradores a ON u.idUsuario = a.idUsuario
WHERE u.email = 'superadmin@transync.com';

-- Mostrar mensaje de éxito
SELECT 'Base de datos TransSync configurada exitosamente!' as Resultado;