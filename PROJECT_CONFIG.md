# Florida Sand & Gravel API - Configuración del Proyecto

## 📁 Estructura del Proyecto

```
florida-sand-gravel-api/
├── src/                          # Código fuente TypeScript
│   ├── config/                   # Configuración de la aplicación
│   │   ├── database.ts          # Configuración de Prisma
│   │   └── index.ts             # Variables de entorno
│   ├── controllers/              # Controladores de rutas
│   │   ├── authController.ts    # Autenticación
│   │   ├── homeController.ts    # Dashboard/Home
│   │   ├── orderDetailsController.ts # Detalles de órdenes
│   │   ├── routesController.ts  # Rutas y plantas
│   │   └── transportDivisionsController.ts # Divisiones
│   ├── middleware/               # Middleware personalizado
│   │   └── index.ts             # Auth, error handling, etc.
│   ├── services/                 # Servicios externos
│   │   └── index.ts             # Email, SMS
│   ├── types/                    # Interfaces TypeScript
│   │   └── index.ts             # Tipos de datos
│   ├── utils/                    # Utilidades
│   │   ├── index.ts             # Funciones helper
│   │   └── logger.ts            # Configuración de logs
│   ├── validation/               # Esquemas de validación
│   │   └── schemas.ts           # Joi schemas
│   └── index.ts                  # Punto de entrada
├── prisma/                       # Base de datos
│   ├── migrations/              # Migraciones SQL
│   ├── schema.prisma            # Esquema de BD
│   └── seed.ts                  # Datos de prueba
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración TypeScript
├── .eslintrc.json               # Configuración ESLint
├── jest.config.js               # Configuración Jest
├── .gitignore                   # Archivos ignorados
├── env.example                  # Variables de entorno
├── README.md                    # Documentación principal
└── API_DOCUMENTATION.md         # Documentación de API
```

## 🚀 Comandos de Desarrollo

### Instalación
```bash
cd florida-sand-gravel-api
npm install
```

### Desarrollo
```bash
npm run dev          # Servidor con hot reload
npm run build        # Compilar TypeScript
npm start            # Servidor de producción
```

### Base de Datos
```bash
npm run generate     # Generar cliente Prisma
npm run migrate      # Ejecutar migraciones
npm run seed         # Poblar con datos de prueba
npm run studio       # Abrir Prisma Studio
```

### Testing y Calidad
```bash
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run lint         # Verificar código
npm run lint:fix     # Corregir errores
```

## 🔧 Configuración

### Variables de Entorno Requeridas

Copiar `env.example` a `.env` y configurar:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DATABASE_URL="postgresql://user:pass@localhost:5432/florida_sand_gravel"

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Email (verificación)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Base de Datos

### Esquema Principal
- **Users**: Cuentas de usuarios/conductores
- **Drivers**: Perfiles de conductores con camiones
- **Orders**: Órdenes de transporte con estado
- **Routes**: Rutas entre plantas de trabajo
- **WorkPlants**: Ubicaciones físicas
- **TransportDivisions**: Divisiones organizacionales
- **DeliveryConfirmations**: Confirmaciones con imágenes

### Migraciones
```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Resetear base de datos
npx prisma migrate reset
```

## 🔒 Seguridad

### Autenticación
- JWT tokens con expiración
- Hash de contraseñas con bcrypt
- Verificación de email/SMS

### Validación
- Esquemas Joi para todas las entradas
- Sanitización de datos
- Validación de archivos

### Protección
- Rate limiting por IP
- CORS configurado
- Headers de seguridad
- Validación de tipos de archivo

## 📱 Integración con Flutter

### Endpoints Principales
- `POST /api/v1/auth/drivers` - Login
- `POST /api/v1/auth/signup-drivers` - Registro
- `GET /api/v1/auth/me` - Perfil
- `GET /api/v1/drivers/orders` - Órdenes del conductor
- `POST /api/v1/orders/:id/confirm-delivery` - Confirmar entrega

### Respuestas Consistentes
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

## 🧪 Testing

### Estructura de Tests
```
src/
├── __tests__/
│   ├── controllers/
│   ├── services/
│   └── utils/
```

### Ejecutar Tests
```bash
npm test                    # Todos los tests
npm run test:watch         # Modo watch
npm test -- --coverage    # Con coverage
```

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
# Servidor en http://localhost:3000
```

### Producción
```bash
npm run build
npm start
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Logs

### Configuración Winston
- Logs de error en `logs/error.log`
- Logs combinados en `logs/combined.log`
- Console output en desarrollo

### Niveles de Log
- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `debug`: Debug (solo desarrollo)

## 🔄 Flujo de Desarrollo

1. **Feature Branch**: Crear branch desde `main`
2. **Desarrollo**: Implementar feature con tests
3. **Testing**: Ejecutar tests y linting
4. **Commit**: Commit con mensaje descriptivo
5. **Pull Request**: Crear PR para revisión
6. **Merge**: Merge a `main` después de aprobación

## 📞 Soporte

- **Issues**: GitHub Issues para bugs
- **Documentación**: Ver `API_DOCUMENTATION.md`
- **Logs**: Revisar logs para debugging
- **Base de Datos**: Usar Prisma Studio para inspección

---

**Proyecto independiente de la aplicación Flutter** 🚛
