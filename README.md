# 🚛 Heavy Truck Tracking API

API backend para el sistema de gestión de Heavy Truck Tracking, desarrollada con Node.js, TypeScript, Express y Prisma.

## 🚀 Características

- ✅ **Autenticación JWT** - Sistema seguro de tokens
- ✅ **OTP por Email** - Verificación de cuentas via Gmail
- ✅ **OTP por WhatsApp** - Recuperación de contraseñas via Twilio
- ✅ **Base de datos PostgreSQL** - Alojada en Supabase
- ✅ **API RESTful** - Endpoints bien documentados
- ✅ **Validación de datos** - Schemas con Joi
- ✅ **Logging** - Sistema de logs completo
- ✅ **Middleware de seguridad** - Rate limiting y CORS

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express.js** - Framework web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos (Supabase)
- **JWT** - Autenticación
- **Twilio** - WhatsApp/SMS
- **Nodemailer** - Emails
- **Joi** - Validación de datos

## 📱 Endpoints principales

### Autenticación
- `POST /api/v1/auth/signup-drivers` - Registro de conductores
- `POST /api/v1/auth/drivers` - Login de conductores
- `GET /api/v1/auth/me` - Perfil del usuario
- `POST /api/v1/auth/password-recovery-code` - Recuperación por WhatsApp
- `POST /api/v1/auth/verification-codes` - Verificar código
- `POST /api/v1/auth/verification-codes/resend` - Reenviar código

### Conductores
- `GET /api/v1/drivers/orders` - Órdenes del conductor
- `GET /api/v1/transport-divisions` - Divisiones de transporte

## 🔧 Configuración

### Variables de entorno requeridas

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="tu-clave-secreta-jwt"
JWT_EXPIRES_IN="7d"

# Email (Gmail)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASS="tu-contraseña-de-aplicacion"

# Twilio
TWILIO_ACCOUNT_SID="tu-account-sid"
TWILIO_AUTH_TOKEN="tu-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Server
PORT="3000"
NODE_ENV="production"
```

## 🚀 Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones
npm run migrate

# Poblar base de datos
npm run seed

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## 📊 Scripts disponibles

- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar en producción
- `npm run migrate` - Ejecutar migraciones
- `npm run seed` - Poblar base de datos
- `npm run lint` - Verificar código

## 🔐 Seguridad

- Autenticación JWT con tokens seguros
- Rate limiting para prevenir ataques
- Validación de datos de entrada
- CORS configurado
- Variables de entorno para datos sensibles

## 📱 Integración con Android

Esta API está diseñada para integrarse con la aplicación Android de Heavy Truck Tracking, proporcionando:

- Autenticación de usuarios
- Gestión de órdenes
- Notificaciones push
- Sincronización de datos

## 🌐 Deploy

La API está configurada para deploy en:
- Railway
- Render
- Vercel
- Heroku

## 📞 Soporte

Para soporte técnico o preguntas sobre la API, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para Heavy Truck Tracking**