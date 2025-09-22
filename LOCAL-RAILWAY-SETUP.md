# 🏠 Configuración Local para Railway - TransSync Backend

Este documento explica cómo configurar y probar localmente las configuraciones de Railway antes del despliegue.

## 📋 **Objetivo**

Probar en local las mismas configuraciones que se usarán en producción para:
- ✅ Detectar problemas antes del despliegue
- ✅ Validar variables de entorno
- ✅ Probar health checks
- ✅ Verificar WebSocket
- ✅ Simular entorno de producción

## 🧪 **Ejecutar en Modo Producción Local**

### **1. Configurar Variables de Entorno**

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tu configuración local:

```bash
# Configuración básica
PORT=5000
NODE_ENV=production

# Base de datos (ajusta según tu configuración)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_DATABASE=transync
DB_PORT=3306  # 3307 si usas XAMPP

# JWT (genera claves seguras)
JWT_SECRET=tu_clave_secreta_muy_segura_min_32_caracteres
JWT_REFRESH_SECRET=tu_clave_refresh_diferente

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
FRONTEND_URL=http://localhost:3000
```

### **2. Configurar Base de Datos**

**Opción A: XAMPP (Windows)**
```bash
# 1. Iniciar XAMPP
# 2. Abrir phpMyAdmin: http://localhost/phpmyadmin
# 3. Crear base de datos "transync"
# 4. Importar Version_final.sql
```

**Opción B: MySQL Nativo**
```bash
# 1. Asegurar que MySQL esté ejecutándose
# 2. Crear base de datos:
mysql -u root -p
CREATE DATABASE transync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 3. Configurar la base de datos usando el script:
npm run db:setup
```

### **3. Ejecutar en Modo Producción**

```bash
# Configurar base de datos
npm run db:setup

# Iniciar servidor en modo producción
npm run prod
```

### **4. Verificar Funcionamiento**

```bash
# Health check
curl http://localhost:5000/api/health

# Información general
curl http://localhost:5000/
```

## 🔧 **Solución de Problemas Comunes**

### **Error: "Unknown suffix '$' used for variable"**

**Causa:** Los scripts npm no pueden usar variables de entorno con `$` en Windows cmd.

**Solución:** Se ha creado un script cross-platform `scripts/db-setup.js`

### **Error: "MySQL no está disponible"**

**Solución:**
1. Instalar MySQL o XAMPP
2. Agregar MySQL al PATH del sistema
3. Verificar que MySQL esté ejecutándose

### **Error: "Access denied for user"**

**Solución:**
1. Verificar credenciales en `.env`
2. Asegurar que el usuario MySQL exista
3. Probar conexión manual: `mysql -u root -p`

### **Error: "Unknown database"**

**Solución:**
1. Crear la base de datos manualmente
2. Ejecutar: `npm run db:setup`
3. Verificar que `Version_final.sql` exista

### **Logs de Debug (opcional)**

Si necesitas ver logs detallados para debugging:

```bash
# Agregar al archivo .env
LOG_REQUESTS=true          # Ver requests HTTP
LOG_REQUESTS=verbose       # Ver body de requests
LOG_DATABASE=true          # Ver queries SQL de MySQL2
```

**Nota:** Los logs de MySQL2 están deshabilitados por defecto para evitar spam.

## 📊 **Comandos Disponibles**

```bash
npm start          # Iniciar servidor (con db:setup automático)
npm run dev        # Modo desarrollo con nodemon
npm run prod       # Modo producción
npm run db:setup   # Configurar base de datos
npm run db:migrate # Migración (como root)
```

## 🌐 **URLs Locales**

- **API:** http://localhost:5000
- **Health Check General:** http://localhost:5000/api/health
- **Health Check Conductores:** http://localhost:5000/api/conductores/health
- **Health Check Vehículos:** http://localhost:5000/api/vehiculos/health
- **Health Check Viajes:** http://localhost:5000/api/viajes/health
- **WebSocket:** ws://localhost:5000
- **Documentación:** http://localhost:5000/

## 🔄 **WebSocket Local**

Para probar WebSocket localmente:

1. Iniciar el servidor: `npm run prod`
2. Conectar desde cliente: `ws://localhost:5000`
3. Autenticar con JWT token

## 📱 **Para React Native/Expo**

- **Android Emulator:** http://10.0.2.2:5000
- **iOS Simulator:** http://localhost:5000
- **Expo Web:** http://localhost:19006

## ⚡ **Configuración CORS Local**

El servidor acepta automáticamente orígenes locales:
- `http://localhost:3000`
- `http://localhost:8081`
- `http://10.0.2.2:8081`
- `http://127.0.0.1:3000`

Para agregar más orígenes, edita `ALLOWED_ORIGINS` en `.env`.

## 🚀 **Próximos Pasos**

Una vez que todo funcione localmente:

1. **Probar todas las funcionalidades**
2. **Verificar WebSocket**
3. **Probar autenticación JWT**
4. **Verificar base de datos**
5. **Desplegar en Railway** siguiendo `RAILWAY-DEPLOYMENT.md`