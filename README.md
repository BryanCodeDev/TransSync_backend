# TransSync Backend

Sistema de gestión de transporte con funcionalidades de chatbot integrado.

## Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones locales
```

### 3. Configurar Base de Datos

#### Requisitos:
- MySQL 5.7 o superior
- Puerto por defecto 3306 (o 3307 en algunas instalaciones)

#### Crear la base de datos:
```sql
CREATE DATABASE transync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Ejecutar el script de creación:
- Importar el archivo `V2.sql` en tu cliente MySQL
- O ejecutar desde línea de comandos:
```bash
mysql -u root -p transync < V2.sql
```

### 4. Configuraciones importantes en .env

```bash
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_DATABASE=transync
DB_PORT=3306  # Cambiar a 3307 si usas XAMPP

# Servidor
PORT=5000

# JWT
JWT_SECRET=clave_secreta_fuerte

# Correo (opcional)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=password_de_aplicacion
```

## Ejecutar el proyecto

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## Endpoints principales

- **Health Check:** `GET /api/health`
- **Autenticación:** `POST /api/auth/login`
- **Conductores:** `GET/POST /api/conductores`
- **Vehículos:** `GET/POST /api/vehiculos`
- **Rutas:** `GET/POST /api/rutas`
- **Viajes:** `GET/POST /api/viajes`
- **Dashboard:** `GET /api/dashboard/*`
- **Chatbot:** `POST /api/chatbot/*`

## Estructura del proyecto

```
src/
├── config/
│   └── db.js              # Configuración de base de datos
├── controllers/           # Controladores de lógica de negocio
├── middleware/           # Middlewares de autenticación y roles
├── models/              # Modelos de datos
├── routes/              # Definición de rutas
├── services/            # Servicios externos (email, etc.)
└── utils/              # Utilidades y helpers
```

## Solución de problemas comunes

### Error de conexión a MySQL
- Verificar que MySQL esté corriendo
- Confirmar puerto (3306 o 3307)
- Validar credenciales en .env

### Puerto 500 en health check
- Verificar conexión a base de datos
- Confirmar que la BD 'transync' existe
- Revisar logs del servidor

### Warnings de MySQL2
- Son advertencias normales sobre configuraciones obsoletas
- No afectan el funcionamiento

## Equipo de desarrollo

Configuraciones locales comunes:
- **XAMPP:** Puerto MySQL 3307
- **WAMP:** Puerto MySQL 3306  
- **Instalación directa MySQL:** Puerto 3306