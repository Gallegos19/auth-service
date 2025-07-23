import { Request, Response } from 'express';
import { AuthCommandPort } from '../../../application/ports/input/AuthCommandPort';
import { AuthQueryPort } from '../../../application/ports/input/AuthQueryPort';
import { CreateModeratorDto } from '../dto/CreateModeratorDto';
import { CreateAdministratorDto } from '../dto/CreateAdministratorDto';
import { UpdateModeratorDto } from '../dto/UpdateModeratorDto';
import { UpdateAdministratorDto } from '../dto/UpdateAdministratorDto';
import { DeactivateUserDto } from '../dto/DeactivateUserDto';
import { inject, injectable } from 'inversify';

@injectable()
export class AdminUserController {
  constructor(
    @inject('AuthCommandPort') private readonly authCommandPort: AuthCommandPort,
    @inject('AuthQueryPort') private readonly authQueryPort: AuthQueryPort
  ) {}

  // ==================
  // MODERATOR CRUD
  // ==================

  /**
   * @swagger
   * /api/admin/moderators:
   *   post:
   *     summary: Crear nuevo moderador
   *     description: Crea un nuevo usuario con rol de moderador. El moderador se crea con account_status activo y is_verified en true.
   *     tags: [Administración - Moderadores]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - confirmPassword
   *               - age
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "moderador@xumaa.com"
   *                 description: "Email único del moderador"
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
   *                 example: "ModeratorPass123"
   *                 description: "Contraseña segura (min 8 chars, mayúscula, minúscula, número)"
   *               confirmPassword:
   *                 type: string
   *                 example: "ModeratorPass123"
   *                 description: "Confirmación de contraseña (debe coincidir)"
   *               age:
   *                 type: integer
   *                 minimum: 18
   *                 example: 28
   *                 description: "Edad del moderador (mínimo 18 años)"
   *               firstName:
   *                 type: string
   *                 example: "Ana"
   *                 description: "Nombre del moderador"
   *               lastName:
   *                 type: string
   *                 example: "García"
   *                 description: "Apellido del moderador"
   *     responses:
   *       201:
   *         description: Moderador creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                       example: "123e4567-e89b-12d3-a456-426614174000"
   *                     email:
   *                       type: string
   *                       format: email
   *                       example: "moderador@xumaa.com"
   *                     role:
   *                       type: string
   *                       example: "moderator"
   *                     accountStatus:
   *                       type: string
   *                       example: "active"
   *                     isVerified:
   *                       type: boolean
   *                       example: true
   *                 message:
   *                   type: string
   *                   example: "Moderator created successfully"
   *       400:
   *         description: Error de validación
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Email already registered"
   *             examples:
   *               email_exists:
   *                 summary: Email ya registrado
   *                 value:
   *                   success: false
   *                   error: "Email already registered"
   *               weak_password:
   *                 summary: Contraseña débil
   *                 value:
   *                   success: false
   *                   error: "Password must contain at least one lowercase letter, one uppercase letter, and one number"
   *               password_mismatch:
   *                 summary: Contraseñas no coinciden
   *                 value:
   *                   success: false
   *                   error: "Passwords do not match"
   *       403:
   *         description: Sin permisos suficientes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Insufficient permissions"
   */
  async createModerator(req: Request, res: Response): Promise<void> {
    try {
      const dto = CreateModeratorDto.fromRequest(req.body);
      const result = await this.authCommandPort.createModerator({
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
        age: dto.age,
        firstName: dto.firstName,
        lastName: dto.lastName
      });
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Moderator created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/admin/moderators:
   *   get:
   *     summary: Listar moderadores
   *     description: Obtiene una lista paginada de moderadores con filtros opcionales por estado
   *     tags: [Administración - Moderadores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: "Número de página para la paginación"
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: "Número de elementos por página"
   *         example: 10
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, suspended, deactivated]
   *         description: "Filtrar moderadores por estado de cuenta"
   *         example: "active"
   *     responses:
   *       200:
   *         description: Lista de moderadores obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     moderators:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           userId:
   *                             type: string
   *                             format: uuid
   *                             example: "123e4567-e89b-12d3-a456-426614174000"
   *                           email:
   *                             type: string
   *                             format: email
   *                             example: "moderador@xumaa.com"
   *                           firstName:
   *                             type: string
   *                             example: "Ana"
   *                           lastName:
   *                             type: string
   *                             example: "García"
   *                           accountStatus:
   *                             type: string
   *                             enum: [active, suspended, deactivated]
   *                             example: "active"
   *                           isVerified:
   *                             type: boolean
   *                             example: true
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:30:00.000Z"
   *                     total:
   *                       type: integer
   *                       example: 25
   *                       description: "Total de moderadores que coinciden con los filtros"
   *                     page:
   *                       type: integer
   *                       example: 1
   *                       description: "Página actual"
   *                     limit:
   *                       type: integer
   *                       example: 10
   *                       description: "Elementos por página"
   *                     totalPages:
   *                       type: integer
   *                       example: 3
   *                       description: "Total de páginas disponibles"
   *                 message:
   *                   type: string
   *                   example: "Moderators retrieved successfully"
   *       400:
   *         description: Error en los parámetros de consulta
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Invalid page parameter"
   *       403:
   *         description: Sin permisos suficientes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Insufficient permissions"
   */
  async listModerators(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await this.authQueryPort.listModerators({
        page,
        limit,
        status: status as 'active' | 'suspended' | 'deactivated'
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Moderators retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/admin/moderators/{id}:
   *   get:
   *     summary: Obtener moderador por ID
   *     description: Obtiene los detalles completos de un moderador específico por su ID único
   *     tags: [Administración - Moderadores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: "ID único del moderador"
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Detalles del moderador obtenidos exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                       example: "123e4567-e89b-12d3-a456-426614174000"
   *                     email:
   *                       type: string
   *                       format: email
   *                       example: "moderador@xumaa.com"
   *                     firstName:
   *                       type: string
   *                       example: "Ana"
   *                     lastName:
   *                       type: string
   *                       example: "García"
   *                     role:
   *                       type: string
   *                       example: "moderator"
   *                     accountStatus:
   *                       type: string
   *                       enum: [active, suspended, deactivated]
   *                       example: "active"
   *                     isVerified:
   *                       type: boolean
   *                       example: true
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     loginCount:
   *                       type: integer
   *                       example: 15
   *                       description: "Número de veces que ha iniciado sesión"
   *                 message:
   *                   type: string
   *                   example: "Moderator retrieved successfully"
   *       400:
   *         description: ID de moderador inválido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Invalid moderator ID format"
   *       404:
   *         description: Moderador no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Moderator not found"
   *       403:
   *         description: Sin permisos suficientes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Insufficient permissions"
   */
  async getModerator(req: Request, res: Response): Promise<void> {
    try {
      const moderatorId = req.params.id;
      
      const result = await this.authQueryPort.getModerator({
        moderatorId
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Moderator retrieved successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/admin/moderators/{id}:
   *   put:
   *     summary: Actualizar moderador
   *     description: Actualiza los datos de un moderador existente. Todos los campos son opcionales.
   *     tags: [Administración - Moderadores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: "ID único del moderador a actualizar"
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "nuevo-email@xumaa.com"
   *                 description: "Nuevo email del moderador (debe ser único)"
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
   *                 example: "NuevaPassword123"
   *                 description: "Nueva contraseña (requiere confirmPassword)"
   *               confirmPassword:
   *                 type: string
   *                 example: "NuevaPassword123"
   *                 description: "Confirmación de nueva contraseña"
   *               firstName:
   *                 type: string
   *                 example: "Ana María"
   *                 description: "Nuevo nombre del moderador"
   *               lastName:
   *                 type: string
   *                 example: "García López"
   *                 description: "Nuevo apellido del moderador"
   *               accountStatus:
   *                 type: string
   *                 enum: [active, suspended, deactivated]
   *                 example: "active"
   *                 description: "Nuevo estado de la cuenta"
   *               isVerified:
   *                 type: boolean
   *                 example: true
   *                 description: "Estado de verificación de email"
   *     responses:
   *       200:
   *         description: Moderador actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                       example: "123e4567-e89b-12d3-a456-426614174000"
   *                     email:
   *                       type: string
   *                       format: email
   *                       example: "nuevo-email@xumaa.com"
   *                     firstName:
   *                       type: string
   *                       example: "Ana María"
   *                     lastName:
   *                       type: string
   *                       example: "García López"
   *                     role:
   *                       type: string
   *                       example: "moderator"
   *                     accountStatus:
   *                       type: string
   *                       example: "active"
   *                     isVerified:
   *                       type: boolean
   *                       example: true
   *                 message:
   *                   type: string
   *                   example: "Moderator updated successfully"
   *       400:
   *         description: Error de validación
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Email already in use"
   *             examples:
   *               email_in_use:
   *                 summary: Email ya en uso
   *                 value:
   *                   success: false
   *                   error: "Email already in use"
   *               password_mismatch:
   *                 summary: Contraseñas no coinciden
   *                 value:
   *                   success: false
   *                   error: "Passwords do not match"
   *       404:
   *         description: Moderador no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Moderator not found"
   *       403:
   *         description: Sin permisos suficientes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Insufficient permissions"
   */
  async updateModerator(req: Request, res: Response): Promise<void> {
    try {
      const moderatorId = req.params.id;
      const dto = UpdateModeratorDto.fromRequest(req.body);
      
      const result = await this.authCommandPort.updateModerator({
        moderatorId,
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        accountStatus: dto.accountStatus,
        isVerified: dto.isVerified
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Moderator updated successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/admin/moderators/{id}/deactivate:
   *   post:
   *     summary: Desactivar moderador
   *     description: Desactiva un moderador del sistema con razón opcional
   *     tags: [Administración - Moderadores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: "ID único del moderador a desactivar"
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 500
   *                 example: "Violación de políticas internas"
   *                 description: "Razón de la desactivación"
   *               permanent:
   *                 type: boolean
   *                 default: false
   *                 example: false
   *                 description: "Si la desactivación es permanente"
   *     responses:
   *       200:
   *         description: Moderador desactivado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                     email:
   *                       type: string
   *                     role:
   *                       type: string
   *                       example: "moderator"
   *                     accountStatus:
   *                       type: string
   *                       example: "deactivated"
   *                 message:
   *                   type: string
   *                   example: "Moderator deactivated successfully"
   *       404:
   *         description: Moderador no encontrado
   *       403:
   *         description: Sin permisos suficientes
   */
  async deactivateModerator(req: Request, res: Response): Promise<void> {
    try {
      const moderatorId = req.params.id;
      const dto = DeactivateUserDto.fromRequest(req.body || {});
      
      const result = await this.authCommandPort.deactivateModerator({
        moderatorId,
        reason: dto.reason,
        permanent: dto.permanent
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Moderator deactivated successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ==================
  // ADMINISTRATOR CRUD
  // ==================

  /**
   * @swagger
   * /api/admin/administrators:
   *   post:
   *     summary: Crear nuevo administrador
   *     description: Crea un nuevo usuario con rol de administrador. El administrador se crea con account_status activo y is_verified en true.
   *     tags: [Administración - Administradores]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password, confirmPassword, age]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "admin@xumaa.com"
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: "AdminPass123"
   *               confirmPassword:
   *                 type: string
   *                 example: "AdminPass123"
   *               age:
   *                 type: integer
   *                 minimum: 18
   *                 example: 35
   *               firstName:
   *                 type: string
   *                 example: "Carlos"
   *               lastName:
   *                 type: string
   *                 example: "Rodríguez"
   *     responses:
   *       201:
   *         description: Administrador creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                     email:
   *                       type: string
   *                     role:
   *                       type: string
   *                       example: "administrator"
   *                     accountStatus:
   *                       type: string
   *                       example: "active"
   *                     isVerified:
   *                       type: boolean
   *                       example: true
   *                 message:
   *                   type: string
   *                   example: "Administrator created successfully"
   *       400:
   *         description: Error de validación
   *       403:
   *         description: Sin permisos suficientes
   */
  async createAdministrator(req: Request, res: Response): Promise<void> {
    try {
      const dto = CreateAdministratorDto.fromRequest(req.body);
      const result = await this.authCommandPort.createAdministrator({
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
        age: dto.age,
        firstName: dto.firstName,
        lastName: dto.lastName
      });
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Administrator created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/admin/administrators:
   *   get:
   *     summary: Listar administradores
   *     description: Obtiene una lista paginada de administradores con filtros opcionales
   *     tags: [Administración - Administradores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         example: 10
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, suspended, deactivated]
   *         example: "active"
   *     responses:
   *       200:
   *         description: Lista de administradores obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     administrators:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           userId:
   *                             type: string
   *                             format: uuid
   *                           email:
   *                             type: string
   *                             format: email
   *                           firstName:
   *                             type: string
   *                           lastName:
   *                             type: string
   *                           accountStatus:
   *                             type: string
   *                           isVerified:
   *                             type: boolean
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                 message:
   *                   type: string
   *                   example: "Administrators retrieved successfully"
   *       400:
   *         description: Error en parámetros
   *       403:
   *         description: Sin permisos suficientes
   */
  async listAdministrators(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await this.authQueryPort.listAdministrators({
        page,
        limit,
        status: status as 'active' | 'suspended' | 'deactivated'
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Administrators retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/admin/administrators/{id}:
   *   get:
   *     summary: Obtener administrador por ID
   *     description: Obtiene los detalles de un administrador específico
   *     tags: [Administración - Administradores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Detalles del administrador
   *       404:
   *         description: Administrador no encontrado
   *       403:
   *         description: Sin permisos
   */
  async getAdministrator(req: Request, res: Response): Promise<void> {
    try {
      const administratorId = req.params.id;
      
      const result = await this.authQueryPort.getAdministrator({
        administratorId
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Administrator retrieved successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/admin/administrators/{id}:
   *   put:
   *     summary: Actualizar administrador
   *     description: Actualiza los datos de un administrador
   *     tags: [Administración - Administradores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateAdministratorRequest'
   *     responses:
   *       200:
   *         description: Administrador actualizado exitosamente
   *       400:
   *         description: Error de validación
   *       404:
   *         description: Administrador no encontrado
   *       403:
   *         description: Sin permisos
   */
  async updateAdministrator(req: Request, res: Response): Promise<void> {
    try {
      const administratorId = req.params.id;
      const dto = UpdateAdministratorDto.fromRequest(req.body);
      
      const result = await this.authCommandPort.updateAdministrator({
        administratorId,
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        accountStatus: dto.accountStatus,
        isVerified: dto.isVerified
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Administrator updated successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/admin/administrators/{id}/deactivate:
   *   post:
   *     summary: Desactivar administrador
   *     description: Desactiva un administrador del sistema
   *     tags: [Administración - Administradores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DeactivateUserRequest'
   *     responses:
   *       200:
   *         description: Administrador desactivado exitosamente
   *       400:
   *         description: No se puede desactivar el último administrador
   *       404:
   *         description: Administrador no encontrado
   *       403:
   *         description: Sin permisos
   */
  async deactivateAdministrator(req: Request, res: Response): Promise<void> {
    try {
      const administratorId = req.params.id;
      const dto = DeactivateUserDto.fromRequest(req.body || {});
      
      const result = await this.authCommandPort.deactivateAdministrator({
        administratorId,
        reason: dto.reason,
        permanent: dto.permanent
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Administrator deactivated successfully'
      });
    } catch (error) {
      let statusCode = 400;
      if (error instanceof Error) {
        if (error.message.includes('not found')) statusCode = 404;
        if (error.message.includes('last active administrator')) statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}