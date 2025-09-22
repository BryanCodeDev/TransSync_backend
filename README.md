# 🚀 TransSync Backend - Sistema Avanzado de Gestión de Transporte

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-blue.svg)](https://mysql.com/)
[![Express](https://img.shields.io/badge/Express-5.1+-lightgrey.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-blue.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 **Tabla de Contenidos**
- [🚀 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características Principales](#-características-principales)
- [🔐 Jerarquía de Permisos](#-jerarquía-de-permisos)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📦 Instalación y Configuración](#-instalación-y-configuración)
- [🏗️ Estructura del Proyecto](#️-estructura-del-proyecto)
- [📖 API Endpoints Completos](#-api-endpoints-completos)
- [🗄️ Base de Datos](#️-base-de-datos)
- [⚙️ Variables de Entorno](#️-variables-de-entorno)
- [🚀 Comandos Disponibles](#-comandos-disponibles)
- [🔧 Configuración de Desarrollo](#-configuración-de-desarrollo)
- [🐛 Solución de Problemas](#-solución-de-problemas)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## 🚀 **Descripción del Proyecto**

**TransSync** es un sistema backend completo de gestión de transporte empresarial con un **chatbot inteligente avanzado** impulsado por IA. El sistema incluye procesamiento de lenguaje natural, memoria conversacional, cache inteligente, generación automática de consultas SQL, y un sistema completo de gestión de flota con control de acceso basado en roles.

### 🎯 **Propósito**
- **Gestión Integral de Flota**: Control total de vehículos, conductores, rutas y viajes
- **IA Conversacional**: Chatbot que entiende y responde consultas en lenguaje natural
- **Tiempo Real**: WebSocket para notificaciones y actualizaciones en vivo
- **Seguridad Robusta**: Autenticación JWT con control granular de permisos
- **Escalabilidad**: Arquitectura modular y optimizada para alto rendimiento

---

## ✨ **Características Principales**

### 🤖 **ChatBot Inteligente Avanzado**
- **🧠 Procesamiento de Lenguaje Natural (NLP)**: Comprende consultas en español natural
- **💬 Memoria Conversacional**: Recuerda el contexto de conversaciones anteriores
- **⚡ Cache Inteligente**: Acelera respuestas con sistema de cache optimizado
- **🔍 Generación Automática de SQL**: Convierte preguntas en consultas optimizadas
- **📊 Análisis de Sentimientos**: Detecta el tono y contexto de las consultas
- **🎯 Sugerencias Proactivas**: Ofrece consultas relacionadas basadas en patrones de uso

### 🚗 **Gestión Completa de Flota**
- **👨‍💼 Conductores**: Gestión de licencias, asignaciones y estado
- **🚐 Vehículos**: Control de mantenimiento, disponibilidad y ubicación
- **🛣️ Rutas**: Programación y seguimiento de recorridos
- **⏰ Viajes**: Gestión de horarios y programaciones
- **📈 Dashboard**: Métricas en tiempo real y reportes

### 🔐 **Seguridad y Autenticación**
- **JWT Authentication**: Tokens seguros con expiración configurable
- **Role-Based Access Control**: Control granular de permisos por roles
- **Password Hashing**: Encriptación segura con bcryptjs
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS Configurado**: Soporte multi-origen seguro

### 📊 **Inteligencia de Datos**
- **Real-time Analytics**: Estadísticas actualizadas en tiempo real
- **Automated Reports**: Generación automática de reportes
- **Data Export**: Exportación de datos en múltiples formatos
- **Performance Monitoring**: Monitoreo de rendimiento del sistema
- **Cache Inteligente**: Sistema de cache con TTL configurable

### 🔄 **Comunicación en Tiempo Real**
- **WebSocket Server**: Notificaciones push automáticas
- **Event System**: Sistema de eventos para actualizaciones en vivo
- **Real-time Dashboard**: Actualizaciones automáticas de métricas
- **Live Notifications**: Alertas y notificaciones instantáneas

---

## 🔐 **Jerarquía de Permisos**

### **SUPERADMIN** - Acceso TOTAL
**Puede acceder a:**
- ✅ **Dashboard Admin** (estadísticas completas, configuración del sistema)
- ✅ **Gestión de Conductores** (crear, editar, eliminar, listar)
- ✅ **Gestión de Vehículos** (crear, editar, eliminar, asignar conductores)
- ✅ **Gestión de Rutas** (crear, editar, eliminar)
- ✅ **Gestión de Viajes** (crear, editar, eliminar)
- ✅ **ChatBot** (consultas, estadísticas, configuración, SQL directo)
- ✅ **Perfil de Usuario** (gestión completa)
- ✅ **WebSocket** (todas las notificaciones)
- ✅ **Configuración del Sistema** (roles, permisos, logs)

### **GESTOR** - Acceso Operativo Completo
**Puede acceder a:**
- ❌ **Dashboard Admin** (bloqueado)
- ✅ **Gestión de Conductores** (crear, editar, eliminar, listar)
- ✅ **Gestión de Vehículos** (crear, editar, eliminar, asignar conductores)
- ✅ **Gestión de Rutas** (crear, editar, eliminar)
- ✅ **Gestión de Viajes** (crear, editar, eliminar)
- ✅ **ChatBot** (consultas, estadísticas básicas)
- ✅ **Perfil de Usuario** (gestión completa)
- ✅ **WebSocket** (notificaciones de operaciones)
- ❌ **Configuración del Sistema** (bloqueado)

### **CONDUCTOR** - Acceso Limitado
**Puede acceder a:**
- ❌ **Dashboard Admin** (bloqueado)
- ❌ **Gestión de Conductores** (bloqueado)
- ❌ **Gestión de Vehículos** (bloqueado)
- ❌ **Gestión de Rutas** (bloqueado)
- ❌ **Gestión de Viajes** (bloqueado)
- ✅ **ChatBot** (solo consultas básicas)
- ✅ **Perfil de Usuario** (solo ver y editar propio)
- ✅ **WebSocket** (solo notificaciones personales)
- ❌ **Configuración del Sistema** (bloqueado)

---

## 🛠️ **Tecnologías Utilizadas**

### **Backend Core**
- **Node.js** 18+ - Entorno de ejecución JavaScript
- **Express.js** 5.1+ - Framework web minimalista
- **MySQL2** 3.14+ - Cliente MySQL con soporte de promesas

### **Autenticación y Seguridad**
- **JSON Web Token (JWT)** 9.0+ - Autenticación stateless
- **bcryptjs** 3.0+ - Hashing seguro de contraseñas
- **CORS** 2.8+ - Configuración de orígenes cruzados

### **Inteligencia Artificial**
- **Natural** 8.1+ - Procesamiento de lenguaje natural
- **Compromise** 14.14+ - Análisis sintáctico avanzado
- **Node-Cache** 5.1+ - Sistema de cache en memoria

### **Tiempo Real**
- **Socket.IO** 4.8+ - WebSocket para comunicación bidireccional
- **HTTP Server** - Servidor HTTP integrado

### **Utilidades**
- **Dotenv** 16.4+ - Variables de entorno
- **Nodemailer** 7.0+ - Envío de correos electrónicos
- **Express Rate Limit** 8.0+ - Protección contra ataques

### **Desarrollo**
- **Nodemon** 3.1+ - Reinicio automático en desarrollo
- **MySQL** 5.7+ - Base de datos relacional

---

## 📦 **Instalación y Configuración**

### **Prerrequisitos**
- **Node.js** 18.0 o superior
- **MySQL** 5.7 o superior
- **npm** o **yarn**
- **Git** (para clonar el repositorio)

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/transync-backend.git
cd transync-backend
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus configuraciones
nano .env  # o code .env
```

### **4. Configurar Base de Datos**

#### **Crear la Base de Datos:**
```sql
-- Conectar a MySQL
mysql -u root -p

-- Crear base de datos
CREATE DATABASE transync
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Salir de MySQL
EXIT;
```

#### **Ejecutar Script de Inicialización:**
```bash
# Opción 1: Usando mysql client
mysql -u root -p transync < Version_final.sql

# Opción 2: Importar desde phpMyAdmin
# - Abrir phpMyAdmin en el navegador
# - Seleccionar base de datos 'transync'
# - Importar el archivo Version_final.sql
```

### **5. Configurar Variables de Entorno (.env)**

```bash
# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_DATABASE=transync
DB_PORT=3306

# ===========================================
# CONFIGURACIÓN DEL SERVIDOR
# ===========================================
PORT=5000
NODE_ENV=development

# ===========================================
# AUTENTICACIÓN JWT
# ===========================================
JWT_SECRET=genera_una_clave_secreta_muy_segura_de_al_menos_32_caracteres
JWT_EXPIRE=24h

# ===========================================
# CONFIGURACIÓN DE CORREO (OPCIONAL)
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion_gmail
EMAIL_FROM=tu_email@gmail.com

# ===========================================
# CONFIGURACIÓN DE CACHE
# ===========================================
CACHE_DEFAULT_TTL=300
CACHE_CHECK_PERIOD=60
CACHE_MAX_KEYS=1000

# ===========================================
# CONFIGURACIÓN DE CHATBOT
# ===========================================
CHATBOT_MEMORY_MAX_MESSAGES=50
CHATBOT_MEMORY_CLEANUP_HOURS=24
CHATBOT_CONFIDENCE_THRESHOLD=0.3

# ===========================================
# CONFIGURACIÓN DE WEBSOCKET
# ===========================================
WEBSOCKET_CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

### **6. Verificar Instalación**
```bash
# Configurar base de datos (cross-platform)
npm run db:setup

# Iniciar el servidor
npm run dev

# Verificar health check
curl http://localhost:5000/api/health

# Verificar conexión a base de datos
curl http://localhost:5000/api/health
```

**⚠️ NOTA:** Se ha solucionado el problema de variables de entorno en Windows. Ahora usa un script cross-platform.

---

## 🏗️ **Estructura del Proyecto**

```
transync-backend/
├── 📁 src/
│   ├── 📁 config/
│   │   └── db.js                    # Configuración de base de datos MySQL
│   ├── 📁 controllers/
│   │   ├── authController.js       # 🔐 Autenticación y autorización
│   │   ├── chatbotController.js    # 🤖 Controlador del chatbot inteligente
│   │   ├── conductoresController.js # 👨‍💼 Gestión de conductores
│   │   ├── vehiculosController.js   # 🚐 Gestión de vehículos
│   │   ├── rutasController.js      # 🛣️ Gestión de rutas
│   │   ├── viajesController.js     # ⏰ Gestión de viajes
│   │   ├── dashboardController.js  # 📊 Dashboard y reportes
│   │   └── profileController.js    # 👤 Gestión de perfiles
│   ├── 📁 middleware/
│   │   ├── authMiddleware.js       # 🛡️ Middleware de autenticación JWT
│   │   ├── roleMiddleware.js       # 🔐 Control de roles y permisos
│   │   └── profileValidation.js    # ✅ Validaciones de perfil
│   ├── 📁 models/
│   │   └── User.js                 # 👤 Modelo de usuario
│   ├── 📁 routes/
│   │   ├── index.js                # 🏠 Rutas principales
│   │   ├── authRoutes.js          # 🔐 Rutas de autenticación
│   │   ├── chatbotRoutes.js       # 🤖 Rutas del chatbot avanzado
│   │   ├── conductoresRoutes.js   # 👨‍💼 Rutas de conductores
│   │   ├── vehiculosRoutes.js     # 🚐 Rutas de vehículos
│   │   ├── rutasRoutes.js         # 🛣️ Rutas de rutas
│   │   ├── viajesRoutes.js        # ⏰ Rutas de viajes
│   │   ├── dashboardRoutes.js     # 📊 Rutas del dashboard
│   │   ├── profileRoutes.js       # 👤 Rutas de perfil
│   │   └── websocketRoutes.js     # 🔄 Rutas WebSocket
│   ├── 📁 services/
│   │   ├── dashboardEventService.js    # 📡 Servicio de eventos dashboard
│   │   ├── dashboardPushService.js     # 📤 Servicio de notificaciones push
│   │   ├── dashboardRealTimeService.js # ⚡ Servicio de tiempo real dashboard
│   │   ├── schedulerService.js         # ⏰ Servicio de tareas programadas
│   │   └── mapService.js               # 🗺️ Servicio de mapas
│   ├── 📁 utilidades/
│   │   └── realTimeService.js      # 🔄 Servicio de tiempo real
│   └── 📁 utils/
│       ├── nlpProcessor.js        # 🧠 Procesador de lenguaje natural
│       ├── conversationMemory.js  # 💬 Sistema de memoria conversacional
│       ├── queryEngine.js         # 🔍 Motor de consultas inteligentes
│       ├── cacheService.js        # ⚡ Sistema de cache inteligente
│       ├── emailService.js        # 📧 Servicio de correo electrónico
│       ├── passwordHasher.js      # 🔒 Hashing de contraseñas
│       └── dashboardQueries.js    # 📊 Consultas optimizadas dashboard
├── 📁 public/
│   └── favicon.ico                # 🎨 Icono de la aplicación
├── 📁 database/
│   └── Version_final.sql          # 🗄️ Script completo de base de datos
├── 📄 server.js                   # 🚀 Punto de entrada del servidor
├── 📄 package.json                # 📦 Configuración del proyecto
├── 📄 .env.example               # ⚙️ Ejemplo de variables de entorno
├── 📄 .gitignore                 # 🚫 Archivos ignorados por Git
└── 📄 README.md                  # 📖 Esta documentación
```

---

## 📖 **API Endpoints Completos**

### **🔐 Autenticación**
```http
POST /api/auth/login                    # 🔑 Iniciar sesión
POST /api/auth/register                 # 📝 Registrar usuario
GET  /api/auth/verify                   # ✅ Verificar token
GET  /api/auth/profile                  # 👤 Obtener perfil
```

### **👨‍💼 Gestión de Conductores**
```http
GET    /api/conductores/                # 📋 Listar conductores
GET    /api/conductores/disponibles     # ✅ Conductores disponibles
POST   /api/conductores/                # ➕ Crear conductor
PUT    /api/conductores/:id             # ✏️ Actualizar conductor
DELETE /api/conductores/:id             # 🗑️ Eliminar conductor
```

### **🚐 Gestión de Vehículos**
```http
GET    /api/vehiculos/                  # 📋 Listar vehículos
GET    /api/vehiculos/:id               # 🔍 Obtener vehículo por ID
POST   /api/vehiculos/                  # ➕ Crear vehículo
PUT    /api/vehiculos/:id               # ✏️ Actualizar vehículo
DELETE /api/vehiculos/:id               # 🗑️ Eliminar vehículo
PATCH  /api/vehiculos/:id/estado        # 🔄 Cambiar estado
PATCH  /api/vehiculos/:id/asignar-conductor  # 👨‍💼 Asignar conductor
PATCH  /api/vehiculos/:id/desasignar-conductor # 🚫 Desasignar conductor
GET    /api/vehiculos/estadisticas      # 📊 Estadísticas
GET    /api/vehiculos/vencimientos      # ⚠️ Vencimientos próximos
GET    /api/vehiculos/utils/select      # 📝 Para selects
```

### **🛣️ Gestión de Rutas**
```http
GET    /api/rutas/                      # 📋 Listar rutas
GET    /api/rutas/:id                   # 🔍 Obtener ruta por ID
POST   /api/rutas/                      # ➕ Crear ruta
PUT    /api/rutas/:id                   # ✏️ Actualizar ruta
DELETE /api/rutas/:id                   # 🗑️ Eliminar ruta
```

### **⏰ Gestión de Viajes**
```http
GET    /api/viajes/                     # 📋 Listar viajes
GET    /api/viajes/:id                  # 🔍 Obtener viaje por ID
POST   /api/viajes/                     # ➕ Crear viaje
PUT    /api/viajes/:id                  # ✏️ Actualizar viaje
DELETE /api/viajes/:id                  # 🗑️ Eliminar viaje
GET    /api/viajes/estadisticas         # 📊 Estadísticas de viajes
```

### **🤖 ChatBot Inteligente**
```http
POST   /api/chatbot/consulta            # 💬 Procesar consulta
GET    /api/chatbot/estadisticas        # 📊 Estadísticas de uso
POST   /api/chatbot/query               # 🔍 Consultas SQL directas
GET    /api/chatbot/cache/stats         # 📈 Estadísticas de cache
POST   /api/chatbot/cache/clear         # 🧹 Limpiar cache
GET    /api/chatbot/health              # ❤️ Health check
```

### **👤 Gestión de Perfiles**
```http
GET    /api/user/profile                # 👤 Obtener perfil
PUT    /api/user/profile                # ✏️ Actualizar perfil
PUT    /api/user/change-password        # 🔒 Cambiar contraseña
GET    /api/user/preferences            # ⚙️ Obtener preferencias
PUT    /api/user/preferences            # ✏️ Actualizar preferencias
GET    /api/user/notifications/settings # 🔔 Configuración notificaciones
PUT    /api/user/notifications/settings # ✏️ Actualizar notificaciones
GET    /api/user/company                # 🏢 Información empresa
GET    /api/user/activity               # 📈 Historial de actividad
GET    /api/user/account-status         # 📊 Estado de cuenta
```

### **📊 Dashboard y Analytics**
```http
GET    /api/dashboard/estadisticas      # 📊 Estadísticas generales
GET    /api/dashboard/graficos          # 📈 Datos para gráficos
GET    /api/dashboard/alertas           # ⚠️ Alertas activas
GET    /api/dashboard/actividad         # 📝 Actividad reciente
GET    /api/dashboard/kpis              # 🎯 KPIs del sistema
GET    /api/dashboard/resumen-ejecutivo # 📋 Resumen ejecutivo
GET    /api/dashboard/tiempo-real       # ⚡ Datos en tiempo real
POST   /api/dashboard/start-updates     # ▶️ Iniciar actualizaciones
POST   /api/dashboard/stop-updates      # ⏹️ Detener actualizaciones
GET    /api/dashboard/update-stats      # 📈 Estadísticas actualizaciones
POST   /api/dashboard/cache/clear       # 🧹 Limpiar cache dashboard
POST   /api/dashboard/cache/preload     # ⚡ Precargar cache
GET    /api/dashboard/cache/stats       # 📊 Estadísticas cache
GET    /api/dashboard/events/stats      # 📡 Estadísticas eventos
GET    /api/dashboard/events/history    # 📜 Historial eventos
POST   /api/dashboard/events/emit       # 📤 Emitir evento manual
POST   /api/dashboard/force-update      # 🔄 Forzar actualización
GET    /api/dashboard/auto-update/config # ⚙️ Configuración auto-update
GET    /api/dashboard/performance       # 📈 Métricas rendimiento
GET    /api/dashboard/notifications/stats    # 📬 Estadísticas notificaciones
GET    /api/dashboard/notifications/history  # 📜 Historial notificaciones
PUT    /api/dashboard/notifications/:id/read     # ✅ Marcar como leída
PUT    /api/dashboard/notifications/:id/acknowledge # ✅ Reconocer notificación
GET    /api/dashboard/test              # 🧪 Test de conectividad
```

### **🔄 WebSocket y Tiempo Real**
```http
WS /                                    # 🌐 Conexión WebSocket
GET /api/realtime/stats                 # 📊 Estadísticas tiempo real
GET /api/realtime/clients               # 👥 Clientes conectados
POST /api/realtime/notifications        # 📤 Enviar notificación
GET /api/websocket/stats                # 📈 Estadísticas WebSocket
GET /api/websocket/clients              # 👥 Clientes WebSocket
```

### **⚙️ Configuración del Sistema**
```http
GET /api/admin/users                    # 👥 Gestión de usuarios
GET /api/admin/conductores-gestores     # 👨‍💼 Conductores y gestores
DELETE /api/admin/users/:id             # 🗑️ Eliminar usuario
PUT /api/admin/users/:id/role           # 🔄 Cambiar rol
GET /api/admin/roles                    # 📋 Lista de roles
POST /api/admin/roles                   # ➕ Crear rol
PUT /api/admin/roles/:id                # ✏️ Actualizar rol
DELETE /api/admin/roles/:id             # 🗑️ Eliminar rol
GET /api/admin/stats                    # 📊 Estadísticas generales
GET /api/admin/stats/users              # 👥 Estadísticas usuarios
GET /api/admin/stats/system             # 💻 Estadísticas sistema
GET /api/admin/config                   # ⚙️ Configuración sistema
PUT /api/admin/config                   # ✏️ Actualizar configuración
GET /api/admin/logs                     # 📜 Logs del sistema
GET /api/admin/audit                    # 📋 Logs de auditoría
GET /api/admin/access-check             # ✅ Verificar permisos
GET /api/admin/health                   # ❤️ Health check admin
```

### **🗺️ Mapas y Ubicación**
```http
GET /api/map/routes                     # 🛣️ Rutas para mapas
GET /api/map/vehicles                   # 🚐 Vehículos en mapa
GET /api/map/trips                      # ⏰ Viajes activos
POST /api/map/geocode                   # 📍 Geocodificar dirección
GET /api/map/config                     # ⚙️ Configuración mapas
```

---

## 🗄️ **Base de Datos**

### **Estructura de Tablas**

#### **Tablas Principales:**
1. **Roles** - Gestión de roles del sistema
2. **Empresas** - Información de empresas
3. **Usuarios** - Usuarios del sistema
4. **Conductores** - Información de conductores
5. **Vehiculos** - Flota de vehículos
6. **Rutas** - Rutas de transporte
7. **Viajes** - Viajes programados

#### **Tablas del ChatBot:**
8. **InteraccionesChatbot** - Historial de consultas
9. **ConfiguracionChatbot** - Configuración por empresa
10. **RespuestasPredefinidas** - Respuestas automáticas

#### **Tablas de Perfil:**
11. **UserPreferences** - Preferencias de usuario
12. **NotificationSettings** - Configuración de notificaciones
13. **UserActivity** - Historial de actividad

### **Características de la BD:**
- **MySQL 5.7+** con soporte UTF-8 completo
- **Índices optimizados** para consultas frecuentes
- **Claves foráneas** con integridad referencial
- **Triggers** para timestamps automáticos
- **Datos de prueba** incluidos

### **Script de Inicialización:**
```bash
# Ejecutar el script completo
mysql -u root -p transync < Version_final.sql

# El script incluye:
# - Creación de todas las tablas
# - Inserción de datos de prueba
# - Configuración de índices
# - Datos de ejemplo realistas
```

---

## ⚙️ **Variables de Entorno**

### **Configuración de Base de Datos:**
```bash
DB_HOST=localhost              # Host de la base de datos
DB_USER=root                  # Usuario de MySQL
DB_PASSWORD=tu_password       # Contraseña de MySQL
DB_DATABASE=transync          # Nombre de la base de datos
DB_PORT=3306                  # Puerto de MySQL
```

### **Configuración del Servidor:**
```bash
PORT=5000                     # Puerto del servidor
NODE_ENV=development           # Entorno (development/production)
```

### **Configuración JWT:**
```bash
JWT_SECRET=tu_clave_secreta   # Clave secreta para JWT (mínimo 32 caracteres)
JWT_EXPIRE=24h                # Tiempo de expiración del token
```

### **Configuración de Correo:**
```bash
EMAIL_HOST=smtp.gmail.com     # Host SMTP
EMAIL_PORT=587                # Puerto SMTP
EMAIL_USER=tu_email@gmail.com # Email remitente
EMAIL_PASS=tu_app_password    # Contraseña de aplicación
EMAIL_FROM=tu_email@gmail.com # Email remitente
```

### **Configuración de Cache:**
```bash
CACHE_DEFAULT_TTL=300         # TTL por defecto (segundos)
CACHE_CHECK_PERIOD=60         # Período de limpieza (segundos)
CACHE_MAX_KEYS=1000           # Máximo número de keys
```

### **Configuración de ChatBot:**
```bash
CHATBOT_MEMORY_MAX_MESSAGES=50      # Máximo mensajes en memoria
CHATBOT_MEMORY_CLEANUP_HOURS=24     # Horas para limpiar memoria
CHATBOT_CONFIDENCE_THRESHOLD=0.3    # Umbral de confianza
```

---

## 🚀 **Comandos Disponibles**

### **Desarrollo:**
```bash
npm run dev          # 🚀 Iniciar servidor en modo desarrollo (con nodemon)
npm start            # 🚀 Iniciar servidor en modo producción
npm run prod         # 🚀 Iniciar servidor en modo producción optimizado
```

### **Base de Datos:**
```bash
npm run db:setup     # 🗄️ Configurar base de datos (cross-platform)
npm run db:migrate   # 🗄️ Ejecutar migraciones de base de datos
```

### **Testing:**
```bash
npm test             # 🧪 Ejecutar tests
npm run test:coverage # 📊 Tests con reporte de cobertura
npm run test:integration # 🔗 Tests de integración
```

### **Utilidades:**
```bash
npm run lint         # 🔍 Ejecutar linter
npm run format       # 💅 Formatear código
npm run build        # 📦 Construir para producción
```

### **Monitoreo:**
```bash
# Health check básico
curl http://localhost:5000/api/health

# Health check del chatbot
curl http://localhost:5000/api/chatbot/health

# Verificar conexión WebSocket
curl http://localhost:5000/api/realtime/stats
```

## 🚀 **Despliegue en Railway**

### **Configuración Rápida:**
1. **Conectar repositorio** a Railway
2. **Configurar variables** en Railway dashboard:
   ```bash
   JWT_SECRET=tu-clave-secreta-muy-fuerte
   JWT_REFRESH_SECRET=tu-clave-refresh-diferente
   ALLOWED_ORIGINS=https://tu-frontend.com
   ```
3. **Railway** configura automáticamente:
   - ✅ Base de datos MySQL
   - ✅ Variables de entorno
   - ✅ Health checks
   - ✅ Archivos estáticos

### **Documentación Completa:**
Ver `RAILWAY-DEPLOYMENT.md` para instrucciones detalladas de despliegue en Railway.

### **Configuración Local para Railway:**
Ver `LOCAL-RAILWAY-SETUP.md` para probar configuraciones de Railway en local.

---

## 🔧 **Configuración de Desarrollo**

### **Entornos Soportados:**

#### **Desarrollo Local:**
```bash
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
```

#### **XAMPP (Windows):**
```bash
DB_HOST=localhost
DB_PORT=3307          # Puerto típico de XAMPP
DB_USER=root
DB_PASSWORD=           # Vacío por defecto en XAMPP
```

#### **WAMP (Windows):**
```bash
DB_HOST=localhost
DB_PORT=3306          # Puerto estándar
DB_USER=root
DB_PASSWORD=           # Configurar según instalación
```

#### **MAMP (macOS):**
```bash
DB_HOST=localhost
DB_PORT=3306          # O 8889 según configuración
DB_USER=root
DB_PASSWORD=root       # Contraseña por defecto de MAMP
```

#### **Docker:**
```bash
DB_HOST=db           # Nombre del contenedor
DB_PORT=3306
DB_USER=root
DB_PASSWORD=my-secret-pw
```

### **Configuración CORS:**
El sistema soporta múltiples orígenes:
- `http://localhost:3000` - Frontend React/Vue/Angular
- `http://localhost:8081` - Expo/React Native
- `http://10.0.2.2:8081` - Emulador Android
- `http://localhost:19006` - Expo Web

### **Configuración SSL (Producción):**
```bash
# Variables para HTTPS
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
PORT=443
```

---

## 🐛 **Solución de Problemas**

### **Problemas Comunes:**

#### **1. Error de Conexión MySQL:**
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql

# Verificar puerto
netstat -tlnp | grep :3306

# Probar conexión manual
mysql -u root -p -h localhost -P 3306

# Solución: Reiniciar MySQL
sudo systemctl restart mysql
```

#### **2. Error de Autenticación JWT:**
```bash
# Verificar que el token no haya expirado
# Los tokens expiran en 24h por defecto

# Verificar header Authorization
# Debe ser: Authorization: Bearer <token>

# Verificar formato del token
# Debe ser un JWT válido
```

#### **3. Problemas de Cache:**
```bash
# Limpiar cache manualmente
curl -X POST http://localhost:5000/api/chatbot/cache/clear \
  -H "Authorization: Bearer <token>"

# Ver estadísticas de cache
curl http://localhost:5000/api/chatbot/cache/stats \
  -H "Authorization: Bearer <token>"
```

#### **4. Consultas del ChatBot con Baja Confianza:**
```bash
# Reformular la consulta
# Usar términos más específicos
# Evitar ambigüedades

# Ejemplos de consultas efectivas:
"¿Cuántos conductores activos hay?"
"Muéstrame los vehículos disponibles"
"¿Qué rutas están programadas para hoy?"
```

#### **5. Error de WebSocket:**
```bash
# Verificar que el servidor esté ejecutándose
curl http://localhost:5000/api/health

# Verificar estadísticas WebSocket
curl http://localhost:5000/api/realtime/stats

# Verificar clientes conectados
curl http://localhost:5000/api/realtime/clients
```

### **Logs y Debugging:**

#### **Ver Logs del Servidor:**
```bash
# En modo desarrollo
npm run dev

# Los logs se muestran en consola con colores:
# 🔴 Errores (rojo)
# 🟡 Warnings (amarillo)
# 🔵 Info (azul)
# 🟢 Success (verde)
```

#### **Ver Logs del ChatBot:**
```bash
# Consultas procesadas
curl "http://localhost:5000/api/chatbot/estadisticas?idEmpresa=1" \
  -H "Authorization: Bearer <token>"

# Estadísticas de uso incluyen:
# - Consultas por día
# - Tiempo promedio de respuesta
# - Tasa de éxito
# - Entidades detectadas
```

#### **Ver Logs de WebSocket:**
```bash
# Estadísticas de conexiones
curl http://localhost:5000/api/realtime/stats

# Clientes conectados
curl http://localhost:5000/api/realtime/clients
```

### **Configuración de Logs:**

#### **Niveles de Log:**
- **ERROR**: Errores que impiden el funcionamiento
- **WARN**: Advertencias de posibles problemas
- **INFO**: Información general del sistema
- **DEBUG**: Información detallada para debugging

#### **Archivos de Log (Producción):**
```bash
# Configurar en producción para guardar logs en archivos
LOG_LEVEL=info
LOG_FILE=/var/log/transync/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
```

---

## 🤝 **Contribución**

### **Guía para Desarrolladores:**

1. **Fork** el repositorio
2. **Crear** una rama para tu feature:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Commit** tus cambios:
   ```bash
   git commit -m 'feat: agregar nueva funcionalidad'
   ```
4. **Push** a la rama:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Crear** un Pull Request

### **Estándares de Código:**

#### **JavaScript/Node.js:**
- ✅ Usar **ES6+** features (async/await, destructuring, etc.)
- ✅ **Async/await** para operaciones asíncronas
- ✅ **JSDoc** para documentación de funciones
- ✅ **CamelCase** para variables y funciones
- ✅ **PascalCase** para clases y constructores
- ✅ **CONST** para variables que no cambian
- ✅ **LET** para variables que cambian

#### **Estructura de Commits:**
```
tipo: descripción breve

- Detalle del cambio
- Otro detalle si es necesario

Fixes #123
```

#### **Tipos de Commit:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato/código
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Cambios en herramientas/configuración

### **Flujo de Trabajo:**

#### **Antes de Comenzar:**
```bash
# Actualizar repositorio
git fetch origin
git pull origin main

# Crear rama descriptiva
git checkout -b feature/nombre-descriptivo
```

#### **Durante el Desarrollo:**
```bash
# Commits pequeños y frecuentes
git add .
git commit -m "feat: agregar validación de email"

# Mantener rama actualizada
git rebase origin/main
```

#### **Antes de Push:**
```bash
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Push a rama
git push origin feature/nombre-descriptivo
```

### **Revisión de Código:**

#### **Criterios de Aceptación:**
- ✅ **Funcionalidad**: El código debe funcionar correctamente
- ✅ **Tests**: Debe incluir tests apropiados
- ✅ **Documentación**: Debe estar documentado
- ✅ **Performance**: No debe afectar el rendimiento
- ✅ **Seguridad**: No debe introducir vulnerabilidades
- ✅ **Estándares**: Debe seguir los estándares del proyecto

#### **Checklist de PR:**
- [ ] **Funcionalidad implementada**
- [ ] **Tests agregados/modificados**
- [ ] **Documentación actualizada**
- [ ] **Código revisado**
- [ ] **Performance verificada**
- [ ] **Seguridad evaluada**

---

## 📄 **Licencia**

Este proyecto está bajo la **Licencia MIT**.

### **Términos de la Licencia:**
- ✅ **Uso libre**: Puedes usar este software para cualquier propósito
- ✅ **Modificación**: Puedes modificar el código fuente
- ✅ **Distribución**: Puedes distribuir copias del software
- ✅ **Sublicencia**: Puedes sublicenciar el software
- ✅ **Comercial**: Puedes usarlo para fines comerciales

### **Limitaciones:**
- ⚠️ **Sin garantía**: El software se proporciona "tal cual"
- ⚠️ **Sin responsabilidad**: Los autores no son responsables de daños
- ⚠️ **Atribución**: Debes mantener la atribución original

### **Archivo de Licencia:**
Ver el archivo `LICENSE` para los términos completos de la licencia MIT.

---

## 👥 **Equipo de Desarrollo**

### **Configuraciones Locales Recomendadas:**

| Entorno | MySQL Port | Recomendación | Instalación |
|---------|------------|---------------|-------------|
| **XAMPP** | 3307 | 🪟 Ideal para Windows | Fácil instalación |
| **WAMP** | 3306 | 🪟 Servidor completo Windows | Más completo |
| **MySQL Directo** | 3306 | 💻 Instalación nativa | Mejor rendimiento |
| **Docker** | 3306 | 🐳 Contenedorizado | Portabilidad |
| **MAMP** | 3306/8889 | 🍎 Para macOS | Fácil en Mac |

### **Contacto:**

- **📧 Email**: desarrollo@transync.com
- **🐛 Issues**: [GitHub Issues](https://github.com/transync/backend/issues)
- **📚 Wiki**: [Documentación Interna](https://github.com/transync/backend/wiki)
- **💬 Discord**: [Servidor de Discord](https://discord.gg/transync)
- **📱 LinkedIn**: [Grupo de LinkedIn](https://linkedin.com/company/transync)

---

## 🎉 **¡Gracias por usar TransSync!**

**TransSync Backend v2.0** - Sistema de gestión de transporte con IA integrada 🤖

### **Características Destacadas:**
- 🚀 **Alto Rendimiento**: Optimizado para miles de usuarios
- 🤖 **IA Avanzada**: ChatBot con comprensión del lenguaje natural
- 🔐 **Seguridad Robusta**: Autenticación JWT y control de roles
- 📊 **Analytics en Tiempo Real**: Dashboard con métricas en vivo
- 🔄 **WebSocket**: Notificaciones push automáticas
- 📱 **Multiplataforma**: Soporte para web y móvil

### **Soporte:**
- 📖 **Documentación completa** en este README
- 🐛 **Sistema de issues** en GitHub
- 💬 **Comunidad activa** en Discord
- 📧 **Soporte técnico** por email

---

**⭐ ¡No olvides darle una estrella al repositorio si te resulta útil! ⭐**

**Desarrollado con ❤️ por el equipo de TransSync**