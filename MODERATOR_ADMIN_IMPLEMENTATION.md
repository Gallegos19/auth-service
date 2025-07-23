# Implementación de Roles Moderador y Administrador

## Resumen

Se han implementado dos nuevos roles en el sistema de autenticación: **moderador** y **administrador**. Estos roles tienen privilegios especiales y se crean con `account_status: active` e `is_verified: true` automáticamente.

## Nuevos Roles

### Moderador (`moderator`)
- Se crea con cuenta activa y verificada
- Puede ser creado solo por administradores
- Edad mínima: 18 años
- No requiere verificación de email ni consentimiento parental

### Administrador (`administrator`)
- Se crea con cuenta activa y verificada
- Puede ser creado solo por otros administradores
- Edad mínima: 18 años
- No requiere verificación de email ni consentimiento parental
- Puede crear moderadores y otros administradores

## Endpoints Implementados

### POST `/api/auth/create-moderator`
Crea un nuevo usuario con rol de moderador.

**Autenticación:** Requerida (Bearer Token)
**Autorización:** Solo administradores
**Rate Limit:** 5 creaciones por hora

**Request Body:**
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

**Response (201):**
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
  "message": "Moderator created successfully"
}
```

### POST `/api/auth/create-administrator`
Crea un nuevo usuario con rol de administrador.

**Autenticación:** Requerida (Bearer Token)
**Autorización:** Solo administradores
**Rate Limit:** 3 creaciones por hora

**Request Body:**
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

**Response (201):**
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
  "message": "Administrator created successfully"
}
```

## Validaciones

### Contraseña
- Mínimo 8 caracteres
- Al menos una letra minúscula
- Al menos una letra mayúscula
- Al menos un número

### Edad
- Mínimo 18 años para moderadores y administradores

### Email
- Formato de email válido
- No debe existir previamente en el sistema

## Seguridad

### Autorización
- Solo usuarios con rol `administrator` pueden crear moderadores y administradores
- Se utiliza `roleMiddleware(['administrator'])` para verificar permisos

### Rate Limiting
- Creación de moderadores: 5 por hora
- Creación de administradores: 3 por hora

### Autenticación
- Todos los endpoints requieren token JWT válido
- Se utiliza `authMiddleware` para verificar autenticación

## Cambios en el Código

### 1. Entidad User
- Actualizado `UserRole` type para incluir `'moderator'` y `'administrator'`
- Agregado constructor con parámetro `role` opcional
- Nuevos métodos estáticos:
  - `User.createModerator()`
  - `User.createAdministrator()`
- Actualizado `getRole()` para manejar roles explícitos

### 2. Use Cases
- `CreateModeratorUseCase`: Lógica para crear moderadores
- `CreateAdministratorUseCase`: Lógica para crear administradores

### 3. DTOs
- `CreateModeratorDto`: Validación para creación de moderadores
- `CreateAdministratorDto`: Validación para creación de administradores

### 4. Controllers
- Nuevos métodos en `AuthController`:
  - `createModerator()`
  - `createAdministrator()`

### 5. Routes
- Nuevas rutas protegidas con autenticación y autorización
- Rate limiting específico para cada endpoint

### 6. Repository
- Actualizado `PrismaUserRepository.toDomain()` para manejar el campo `role`

### 7. Dependency Injection
- Registrados los nuevos use cases en el container
- Actualizados los puertos de aplicación

## Uso

### 1. Crear el primer administrador
Para crear el primer administrador del sistema, puedes usar directamente la base de datos o crear un script de migración:

```sql
INSERT INTO users (
  id, email, password_hash, age, role, 
  account_status, is_verified, created_at
) VALUES (
  gen_random_uuid(),
  'admin@xumaa.com',
  '$2b$10$hashedpassword', -- Hash de la contraseña
  30,
  'administrator',
  'active',
  true,
  NOW()
);
```

### 2. Crear moderadores y administradores
Una vez que tengas un administrador, puedes usar los endpoints para crear más usuarios con roles especiales.

## Testing

Para probar la implementación:

1. Crear un administrador inicial
2. Hacer login como administrador
3. Usar el token para crear moderadores y administradores
4. Verificar que los usuarios se crean con `account_status: active` e `is_verified: true`

## Consideraciones

- Los moderadores y administradores no necesitan verificación de email
- No requieren consentimiento parental independientemente de la edad
- Se crean directamente con cuenta activa
- Solo administradores pueden crear estos roles especiales
- La edad mínima es 18 años para ambos roles