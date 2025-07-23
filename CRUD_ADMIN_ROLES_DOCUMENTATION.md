# Documentación CRUD - Roles Administrativos

## Resumen

Esta documentación describe todos los endpoints disponibles para realizar operaciones CRUD (Create, Read, Update, Delete) sobre usuarios con roles de **moderador** y **administrador** en el sistema de autenticación de Xuma'a.

## Autenticación y Autorización

### Requisitos Generales
- **Autenticación**: Todos los endpoints requieren un token JWT válido
- **Autorización**: Solo usuarios con rol `administrator` pueden acceder a estos endpoints
- **Rate Limiting**: Cada endpoint tiene límites específicos de tasa de peticiones

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Endpoints para Moderadores

### 1. Crear Moderador

**POST** `/api/auth/create-moderator`

Crea un nuevo usuario con rol de moderador. El moderador se crea automáticamente con `account_status: active` e `is_verified: true`.

#### Request Body
```json
{
  "email": "moderador@xumaa.com",
  "password": "ModeratorPass123",
  "confirmPassword": "ModeratorPass123",
  "age": 28,
  "firstName": "Ana",
  "lastName": "García"
}
```

#### Validaciones
- **email**: Formato de email válido, no debe existir previamente
- **password**: Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
- **confirmPassword**: Debe coincidir con password
- **age**: Mínimo 18 años
- **firstName/lastName**: Opcionales

#### Response (201)
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "moderador@xumaa.com",
    "role": "moderator",
    "accountStatus": "active",
    "isVerified": true
  },
  "message": "Moderator created successfully with active status and verified email"
}
```

#### Rate Limit
- 5 creaciones por hora

---

### 2. Listar Moderadores

**GET** `/api/auth/moderators`

Obtiene una lista paginada de todos los moderadores del sistema.

#### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, máximo: 100)

#### Ejemplo de Request
```http
GET /api/auth/moderators?page=1&limit=10
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "moderators": [
      {
        "userId": "uuid",
        "email": "moderador1@xumaa.com",
        "firstName": "Ana",
        "lastName": "García",
        "accountStatus": "active",
        "isVerified": true,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "userId": "uuid",
        "email": "moderador2@xumaa.com",
        "firstName": "Luis",
        "lastName": "Martínez",
        "accountStatus": "active",
        "isVerified": true,
        "createdAt": "2024-01-14T15:45:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

#### Rate Limit
- 50 consultas por 15 minutos

---

### 3. Obtener Moderador por ID

**GET** `/api/auth/moderators/{id}`

Obtiene los detalles completos de un moderador específico.

#### Path Parameters
- `id`: UUID del moderador

#### Ejemplo de Request
```http
GET /api/auth/moderators/123e4567-e89b-12d3-a456-426614174000
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "moderador@xumaa.com",
    "firstName": "Ana",
    "lastName": "García",
    "role": "moderator",
    "accountStatus": "active",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Errores Comunes
- **404**: Moderador no encontrado o el usuario no es un moderador
- **403**: Sin permisos suficientes

#### Rate Limit
- 100 consultas por 15 minutos

---

### 4. Actualizar Moderador

**PUT** `/api/auth/moderators/{id}`

Actualiza los datos de un moderador existente.

#### Path Parameters
- `id`: UUID del moderador

#### Request Body
```json
{
  "firstName": "Ana María",
  "lastName": "García López",
  "accountStatus": "active",
  "isVerified": true
}
```

#### Campos Actualizables
- `firstName` (opcional): Nuevo nombre
- `lastName` (opcional): Nuevo apellido
- `accountStatus` (opcional): `active`, `suspended`, `deactivated`
- `isVerified` (opcional): `true` o `false`

#### Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "moderador@xumaa.com",
    "firstName": "Ana María",
    "lastName": "García López",
    "role": "moderator",
    "accountStatus": "active",
    "isVerified": true,
    "message": "Moderator updated successfully"
  },
  "message": "Moderator updated successfully"
}
```

#### Rate Limit
- 20 actualizaciones por hora

---

### 5. Desactivar Moderador

**DELETE** `/api/auth/moderators/{id}/deactivate`

Desactiva un moderador (soft delete). El moderador no se elimina físicamente, solo se marca como desactivado.

#### Path Parameters
- `id`: UUID del moderador

#### Ejemplo de Request
```http
DELETE /api/auth/moderators/123e4567-e89b-12d3-a456-426614174000/deactivate
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "moderador@xumaa.com",
    "role": "moderator",
    "accountStatus": "deactivated",
    "message": "Moderator deactivated successfully"
  },
  "message": "Moderator deactivated successfully"
}
```

#### Rate Limit
- 10 desactivaciones por hora

---

## Endpoints para Administradores

### 1. Crear Administrador

**POST** `/api/auth/create-administrator`

Crea un nuevo usuario con rol de administrador. El administrador se crea automáticamente con `account_status: active` e `is_verified: true`.

#### Request Body
```json
{
  "email": "admin@xumaa.com",
  "password": "AdminPass123",
  "confirmPassword": "AdminPass123",
  "age": 35,
  "firstName": "Carlos",
  "lastName": "Rodríguez"
}
```

#### Validaciones
- **email**: Formato de email válido, no debe existir previamente
- **password**: Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
- **confirmPassword**: Debe coincidir con password
- **age**: Mínimo 18 años
- **firstName/lastName**: Opcionales

#### Response (201)
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "admin@xumaa.com",
    "role": "administrator",
    "accountStatus": "active",
    "isVerified": true
  },
  "message": "Administrator created successfully with active status and verified email"
}
```

#### Rate Limit
- 3 creaciones por hora

---

### 2. Listar Administradores

**GET** `/api/auth/administrators`

Obtiene una lista paginada de todos los administradores del sistema.

#### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, máximo: 100)

#### Ejemplo de Request
```http
GET /api/auth/administrators?page=1&limit=10
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "administrators": [
      {
        "userId": "uuid",
        "email": "admin1@xumaa.com",
        "firstName": "Carlos",
        "lastName": "Rodríguez",
        "accountStatus": "active",
        "isVerified": true,
        "createdAt": "2024-01-10T08:00:00Z"
      },
      {
        "userId": "uuid",
        "email": "admin2@xumaa.com",
        "firstName": "María",
        "lastName": "González",
        "accountStatus": "active",
        "isVerified": true,
        "createdAt": "2024-01-12T14:20:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

#### Rate Limit
- 50 consultas por 15 minutos

---

### 3. Obtener Administrador por ID

**GET** `/api/auth/administrators/{id}`

Obtiene los detalles completos de un administrador específico.

#### Path Parameters
- `id`: UUID del administrador

#### Ejemplo de Request
```http
GET /api/auth/administrators/123e4567-e89b-12d3-a456-426614174000
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@xumaa.com",
    "firstName": "Carlos",
    "lastName": "Rodríguez",
    "role": "administrator",
    "accountStatus": "active",
    "isVerified": true,
    "createdAt": "2024-01-10T08:00:00Z"
  }
}
```

#### Errores Comunes
- **404**: Administrador no encontrado o el usuario no es un administrador
- **403**: Sin permisos suficientes

#### Rate Limit
- 100 consultas por 15 minutos

---

### 4. Actualizar Administrador

**PUT** `/api/auth/administrators/{id}`

Actualiza los datos de un administrador existente.

#### Path Parameters
- `id`: UUID del administrador

#### Request Body
```json
{
  "firstName": "Carlos Alberto",
  "lastName": "Rodríguez Pérez",
  "accountStatus": "active",
  "isVerified": true
}
```

#### Campos Actualizables
- `firstName` (opcional): Nuevo nombre
- `lastName` (opcional): Nuevo apellido
- `accountStatus` (opcional): `active`, `suspended`, `deactivated`
- `isVerified` (opcional): `true` o `false`

#### Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@xumaa.com",
    "firstName": "Carlos Alberto",
    "lastName": "Rodríguez Pérez",
    "role": "administrator",
    "accountStatus": "active",
    "isVerified": true,
    "message": "Administrator updated successfully"
  },
  "message": "Administrator updated successfully"
}
```

#### Rate Limit
- 20 actualizaciones por hora

---

### 5. Desactivar Administrador

**DELETE** `/api/auth/administrators/{id}/deactivate`

Desactiva un administrador (soft delete). **IMPORTANTE**: No se puede desactivar el último administrador activo del sistema.

#### Path Parameters
- `id`: UUID del administrador

#### Ejemplo de Request
```http
DELETE /api/auth/administrators/123e4567-e89b-12d3-a456-426614174000/deactivate
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@xumaa.com",
    "role": "administrator",
    "accountStatus": "deactivated",
    "message": "Administrator deactivated successfully"
  },
  "message": "Administrator deactivated successfully"
}
```

#### Errores Especiales
- **409 Conflict**: No se puede desactivar el último administrador activo

#### Rate Limit
- 5 desactivaciones por hora (más restrictivo que moderadores)

---

## Códigos de Estado HTTP

### Códigos de Éxito
- **200 OK**: Operación exitosa (GET, PUT, DELETE)
- **201 Created**: Recurso creado exitosamente (POST)

### Códigos de Error
- **400 Bad Request**: Error de validación o datos incorrectos
- **401 Unauthorized**: Token JWT faltante o inválido
- **403 Forbidden**: Sin permisos suficientes para la operación
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto en la operación (ej. último administrador)
- **429 Too Many Requests**: Límite de tasa excedido
- **500 Internal Server Error**: Error interno del servidor

---

## Ejemplos de Uso con cURL

### Crear un Moderador
```bash
curl -X POST http://localhost:3007/api/auth/create-moderator \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo.moderador@xumaa.com",
    "password": "ModeratorPass123",
    "confirmPassword": "ModeratorPass123",
    "age": 28,
    "firstName": "Ana",
    "lastName": "García"
  }'
```

### Listar Moderadores
```bash
curl -X GET "http://localhost:3007/api/auth/moderators?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Actualizar un Moderador
```bash
curl -X PUT http://localhost:3007/api/auth/moderators/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ana María",
    "accountStatus": "active"
  }'
```

### Desactivar un Moderador
```bash
curl -X DELETE http://localhost:3007/api/auth/moderators/USER_ID/deactivate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Consideraciones de Seguridad

### Validaciones Implementadas
1. **Autenticación JWT**: Todos los endpoints requieren token válido
2. **Autorización por Roles**: Solo administradores pueden acceder
3. **Rate Limiting**: Previene abuso de endpoints
4. **Validación de Datos**: Esquemas Zod para validar entrada
5. **Protección del Último Admin**: No se puede desactivar el último administrador

### Buenas Prácticas
1. **Tokens JWT**: Usar tokens con expiración corta y refresh tokens
2. **HTTPS**: Usar siempre HTTPS en producción
3. **Logging**: Todas las operaciones se registran para auditoría
4. **Monitoreo**: Supervisar intentos de acceso no autorizado

---

## Swagger/OpenAPI

La documentación interactiva está disponible en:
- **Desarrollo**: `http://localhost:3007/api/docs`
- **Producción**: `https://your-domain.com/api/docs`

En Swagger puedes:
- Probar todos los endpoints directamente
- Ver esquemas de request/response
- Autorizar con tu token JWT
- Generar código cliente automáticamente

---

## Troubleshooting

### Errores Comunes

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```
**Solución**: Verificar que el token JWT esté incluido en el header Authorization.

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```
**Solución**: Verificar que el usuario tenga rol de administrador.

#### 409 Conflict (Último Administrador)
```json
{
  "success": false,
  "error": "Cannot deactivate the last active administrator"
}
```
**Solución**: Crear otro administrador antes de desactivar el actual.

#### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Rate limit exceeded"
}
```
**Solución**: Esperar antes de hacer más peticiones o revisar los límites de tasa.

---

## Changelog

### v1.0.0 (Actual)
- ✅ CRUD completo para moderadores
- ✅ CRUD completo para administradores
- ✅ Autenticación y autorización por roles
- ✅ Rate limiting por endpoint
- ✅ Validación de datos con Zod
- ✅ Documentación Swagger
- ✅ Protección del último administrador
- ✅ Soft delete (desactivación)

### Próximas Funcionalidades
- 🔄 Historial de cambios (audit log)
- 🔄 Reactivación de usuarios desactivados
- 🔄 Cambio de contraseña para administradores
- 🔄 Notificaciones por email en cambios críticos
- 🔄 Exportación de datos en CSV/Excel