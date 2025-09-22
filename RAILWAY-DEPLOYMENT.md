# 🚀 Despliegue en Railway - TransSync Backend

Este documento describe el proceso completo para desplegar el backend de TransSync en Railway.

## 📋 **Requisitos Previos**

- Cuenta en [Railway](https://railway.app/)
- Repositorio Git con el código del proyecto
- Variables de entorno configuradas

## 🚀 **Despliegue Automático**

### **1. Conectar Repositorio**

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Conecta tu repositorio que contiene el código de TransSync

### **2. Configuración Automática**

Railway detectará automáticamente:
- ✅ **Node.js** como runtime
- ✅ **MySQL** como base de datos
- ✅ **Archivos estáticos** en `/public`
- ✅ **Variables de entorno** desde `.env.railway.example`

### **3. Variables de Entorno**

Railway configurará automáticamente estas variables:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://username:password@host:port/database
```

**Variables adicionales que debes configurar manualmente:**

| Variable | Valor | Descripción |
|----------|--------|-------------|
| `JWT_SECRET` | `tu-clave-secreta-muy-fuerte` | Clave para tokens JWT |
| `JWT_REFRESH_SECRET` | `tu-clave-refresh-diferente` | Clave para refresh tokens |
| `ALLOWED_ORIGINS` | `https://tu-frontend.com` | URLs permitidas por CORS |
| `EMAIL_USER` | `tu-email@gmail.com` | Email para notificaciones |
| `EMAIL_PASS` | `tu-app-password` | Contraseña de aplicación Gmail |
| `GOOGLE_MAPS_API_KEY` | `tu-api-key` | API Key de Google Maps |

## ⚙️ **Configuración Manual**

### **Variables de Entorno en Railway:**

1. Ve a tu proyecto en Railway
2. Haz clic en **"Variables"** en el sidebar
3. Agrega las siguientes variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-token-secret-different-from-jwt

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com

# Maps API (Optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
MAP_PROVIDER=google

# Cache Configuration
CACHE_DEFAULT_TTL=300
CACHE_CHECK_PERIOD=60
CACHE_MAX_KEYS=1000

# ChatBot Configuration
CHATBOT_MEMORY_MAX_MESSAGES=50
CHATBOT_MEMORY_CLEANUP_HOURS=24
CHATBOT_CONFIDENCE_THRESHOLD=0.3
```

### **Base de Datos**

Railway provee MySQL automáticamente. El script `Version_final.sql` se ejecutará automáticamente durante el despliegue.

**Para verificar la base de datos:**
1. Ve a **"Data"** en el sidebar de Railway
2. Selecciona la base de datos MySQL
3. Ejecuta el script `Version_final.sql` si no se ejecutó automáticamente

## 🔍 **Verificación del Despliegue**

### **1. Health Check**

Una vez desplegado, verifica que el servicio esté funcionando:

```bash
curl https://your-app.railway.app/api/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "message": "TranSync Backend API está funcionando",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "version": "2.0.0",
  "environment": "production",
  "database": {
    "status": "Connected"
  },
  "websocket": {
    "enabled": true,
    "connections": 0
  }
}
```

### **2. Endpoints Disponibles**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check del servicio |
| `/api/auth/login` | POST | Inicio de sesión |
| `/api/auth/register` | POST | Registro de usuarios |
| `/api/chatbot/consulta` | POST | Consultas del chatbot |
| `/` | GET | Información general de la API |

### **3. WebSocket**

El WebSocket estará disponible en:
```
wss://your-app.railway.app
```

## 🐛 **Solución de Problemas**

### **Error de Base de Datos**

**Síntoma:** Health check muestra `"database": {"status": "Error"}`

**Solución:**
1. Verifica que la base de datos esté provisionada en Railway
2. Asegúrate de que `Version_final.sql` se haya ejecutado
3. Revisa las variables de entorno de la base de datos

### **Error de CORS**

**Síntoma:** Frontend no puede conectar con la API

**Solución:**
1. Agrega la URL de tu frontend en `ALLOWED_ORIGINS`
2. Asegúrate de que el protocolo (http/https) sea correcto
3. Verifica que no haya errores de certificado SSL

### **Error de JWT**

**Síntoma:** `"JsonWebTokenError: invalid signature"`

**Solución:**
1. Verifica que `JWT_SECRET` esté configurado correctamente
2. Asegúrate de que la clave tenga al menos 32 caracteres
3. Usa una clave diferente para `JWT_REFRESH_SECRET`

### **Error de Puerto**

**Síntoma:** Servicio no responde

**Solución:**
1. Verifica que `PORT` esté configurado como `$PORT` (variable de Railway)
2. Asegúrate de que el servicio esté escuchando en `0.0.0.0`

## 📊 **Monitoreo y Logs**

### **Logs en Railway:**

1. Ve a **"Logs"** en el sidebar de Railway
2. Selecciona tu servicio
3. Revisa los logs en tiempo real

### **Métricas:**

Railway proporciona métricas automáticas:
- CPU Usage
- Memory Usage
- Network I/O
- Response Times

### **Health Check Automático:**

Railway verifica automáticamente:
- `/api/health` cada 30 segundos
- Timeout de 5 segundos
- 3 reintentos antes de marcar como fallido

## 🔧 **Configuración Avanzada**

### **Escalado Horizontal**

Para aplicaciones con alto tráfico:

1. Ve a **"Settings"** → **"Scaling"**
2. Configura el número de instancias
3. Railway maneja el balanceo de carga automáticamente

### **Base de Datos Externa**

Si necesitas una base de datos más robusta:

1. Ve a **"Data"** → **"Add"**
2. Selecciona **"MySQL"** o **"PostgreSQL"**
3. Configura las variables de conexión

### **Dominio Personalizado**

1. Ve a **"Settings"** → **"Domains"**
2. Agrega tu dominio personalizado
3. Configura los registros DNS en tu proveedor

## 📞 **Soporte**

### **Recursos de Railway:**
- [Documentación Oficial](https://docs.railway.app/)
- [Comunidad Discord](https://discord.gg/railway)
- [Estado del Servicio](https://status.railway.app/)

### **Soporte TransSync:**
- 📧 Email: desarrollo@transync.com
- 🐛 [GitHub Issues](https://github.com/transync/backend/issues)
- 📚 [Wiki Interna](https://github.com/transync/backend/wiki)

## 🎉 **¡Despliegue Exitoso!**

Una vez que tu aplicación esté funcionando en Railway:

1. ✅ **Health check** responde con status "OK"
2. ✅ **Base de datos** conectada correctamente
3. ✅ **WebSocket** funcionando
4. ✅ **CORS** configurado para tu frontend
5. ✅ **Variables de entorno** configuradas

**Tu API estará disponible en:**
```
https://your-app.railway.app
```

**WebSocket en:**
```
wss://your-app.railway.app
```

---

**⭐ ¡Felicitaciones! Tu backend de TransSync está desplegado en Railway ⭐**

**Desarrollado con ❤️ por el equipo de TransSync**