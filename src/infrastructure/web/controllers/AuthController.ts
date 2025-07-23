import { Request, Response } from 'express';
import { AuthCommandPort } from '../../../application/ports/input/AuthCommandPort';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { CreateModeratorDto } from '../dto/CreateModeratorDto';
import { CreateAdministratorDto } from '../dto/CreateAdministratorDto';
import { LoginUserDto } from '../dto/LoginUserDto';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthController {
constructor(
    @inject('AuthCommandPort') private readonly authCommandPort: AuthCommandPort
  ) {}
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Registrar nuevo usuario
   *     description: Registra un nuevo usuario en la plataforma. Si es menor de 13 años, requiere consentimiento parental.
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *           examples:
   *             adult_user:
   *               summary: Usuario adulto
   *               value:
   *                 email: "juan.perez@email.com"
   *                 password: "MiPassword123"
   *                 confirmPassword: "MiPassword123"
   *                 age: 25
   *                 firstName: "Juan"
   *                 lastName: "Pérez"
   *             minor_user:
   *               summary: Usuario menor (requiere consentimiento)
   *               value:
   *                 email: "maria.lopez@email.com"
   *                 password: "Password123"
   *                 confirmPassword: "Password123"
   *                 age: 12
   *                 firstName: "María"
   *                 lastName: "López"
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
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
   *                       format: email
   *                     requiresParentalConsent:
   *                       type: boolean
   *                       description: "Si el usuario requiere consentimiento parental"
   *                     accountStatus:
   *                       type: string
   *                       enum: [pending_verification, active]
   *                 message:
   *                   type: string
   *                   example: "User registered successfully"
   *       400:
   *         description: Error de validación
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               weak_password:
   *                 summary: Contraseña débil
   *                 value:
   *                   success: false
   *                   error: "Password does not meet security requirements"
   *                   details: [
   *                     {
   *                       field: "password",
   *                       message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
   *                       code: "invalid_string"
   *                     }
   *                   ]
   *               duplicate_email:
   *                 summary: Email duplicado
   *                 value:
   *                   success: false
   *                   error: "Email already registered"
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const dto = RegisterUserDto.fromRequest(req.body);
      const result = await this.authCommandPort.registerUser({
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
        age: dto.age,
        firstName: dto.firstName,
        lastName: dto.lastName
      });
      console.log('User registration result:', result);
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
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
   * /api/auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     description: Autentica un usuario y genera tokens JWT para acceso a la API
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *           example:
   *             email: "juan.perez@email.com"
   *             password: "MiPassword123"
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Credenciales inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               invalid_credentials:
   *                 summary: Credenciales incorrectas
   *                 value:
   *                   success: false
   *                   error: "Invalid credentials"
   *               account_not_verified:
   *                 summary: Cuenta no verificada
   *                 value:
   *                   success: false
   *                   error: "Account not active or not verified"
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = LoginUserDto.fromRequest(req.body);
      
      const result = await this.authCommandPort.loginUser({
        email: dto.email,
        password: dto.password,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Cerrar sesión
   *     description: Invalida la sesión actual del usuario
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               logoutFromAllDevices:
   *                 type: boolean
   *                 description: "Si se debe cerrar sesión en todos los dispositivos"
   *                 default: false
   *     responses:
   *       200:
   *         description: Logout exitoso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Logout successful"
   *       400:
   *         description: Error en logout
   *       401:
   *         description: Token inválido o expirado
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Authorization token required'
        });
        return;
      }

      await this.authCommandPort.logoutUser({ 
        accessToken: token,
        logoutFromAllDevices: req.body.logoutFromAllDevices || false
      });

      res.status(200).json({
        success: true,
        message: 'Logout successful'
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
   * /api/auth/create-moderator:
   *   post:
   *     summary: Crear nuevo moderador
   *     description: Crea un nuevo usuario con rol de moderador. El moderador se crea con account_status activo y is_verified en true.
   *     tags: [Administración]
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
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: "ModeratorPass123"
   *               confirmPassword:
   *                 type: string
   *                 example: "ModeratorPass123"
   *               age:
   *                 type: integer
   *                 minimum: 18
   *                 example: 28
   *               firstName:
   *                 type: string
   *                 example: "Ana"
   *               lastName:
   *                 type: string
   *                 example: "García"
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
   *                     email:
   *                       type: string
   *                       format: email
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
   *       403:
   *         description: Sin permisos para crear moderadores
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
   * /api/auth/create-administrator:
   *   post:
   *     summary: Crear nuevo administrador
   *     description: Crea un nuevo usuario con rol de administrador. El administrador se crea con account_status activo y is_verified en true.
   *     tags: [Administración]
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
   *                       format: email
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
   *         description: Sin permisos para crear administradores
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
}