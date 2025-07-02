// src/infrastructure/web/controllers/EmailVerificationController.ts
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ResendEmailVerificationUseCase, SendEmailVerificationUseCase, VerifyEmailUseCase } from '../../../application/use-cases/SendEmailVerificationUseCase';
import { VerificationStatusUseCase } from '../../../application/use-cases/VerificationStatusUseCase';

@injectable()
export class EmailVerificationController {
  constructor(
    @inject('SendEmailVerificationUseCase') private readonly sendEmailVerificationUseCase: SendEmailVerificationUseCase,
    @inject('VerifyEmailUseCase') private readonly verifyEmailUseCase: VerifyEmailUseCase,
    @inject('ResendEmailVerificationUseCase') private readonly resendEmailVerificationUseCase: ResendEmailVerificationUseCase,
    @inject('VerificationStatusUseCase') private readonly verificationStatusUseCase: VerificationStatusUseCase 
  ) {}

  /**
   * @swagger
   * /api/auth/send-verification:
   *   post:
   *     summary: Enviar email de verificación
   *     description: |
   *       Envía un email de verificación al usuario registrado. 
   *       Solo para usuarios mayores de 13 años (los menores se verifican con consentimiento parental).
   *     tags: [Verificación de Email]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [userId]
   *             properties:
   *               userId:
   *                 type: string
   *                 format: uuid
   *                 description: ID del usuario
   *     responses:
   *       200:
   *         description: Email de verificación enviado
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
   *                   example: "Verification email sent successfully"
   *       400:
   *         description: Error en la solicitud
   *       404:
   *         description: Usuario no encontrado
   */
  async sendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      await this.sendEmailVerificationUseCase.execute({ userId });

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  /**
   * @swagger
   * /api/auth/verify-email/{token}:
   *   post:
   *     summary: Verificar email con token
   *     description: |
   *       Verifica el email del usuario usando el token enviado por correo.
   *       Esto activa la cuenta y permite al usuario hacer login.
   *     tags: [Verificación de Email]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: Token de verificación enviado por email
   *     responses:
   *       200:
   *         description: Email verificado exitosamente
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
   *                     verified:
   *                       type: boolean
   *                       example: true
   *                     canLogin:
   *                       type: boolean
   *                       example: true
   *                 message:
   *                   type: string
   *                   example: "Email verified successfully"
   *       400:
   *         description: Token inválido o expirado
   *       404:
   *         description: Token no encontrado
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Verification token is required'
        });
        return;
      }

      const result = await this.verifyEmailUseCase.execute({ 
        verificationToken: token 
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Email verified successfully'
      });
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('Invalid')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  /**
   * @swagger
   * /api/auth/resend-verification:
   *   post:
   *     summary: Reenviar email de verificación
   *     description: |
   *       Reenvía el email de verificación al usuario. 
   *       Incluye rate limiting para evitar spam.
   *     tags: [Verificación de Email]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del usuario
   *     responses:
   *       200:
   *         description: Email reenviado (o ignorado por seguridad)
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
   *                   example: "If the email exists and needs verification, a new email has been sent"
   *       400:
   *         description: Error en la solicitud
   *       429:
   *         description: Demasiadas solicitudes
   */
  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required'
        });
        return;
      }

      await this.resendEmailVerificationUseCase.execute({ email });

      // Respuesta genérica por seguridad
      res.status(200).json({
        success: true,
        message: 'If the email exists and needs verification, a new email has been sent'
      });
    } catch (error: any) {
      if (error.message.includes('recently')) {
        res.status(429).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  /**
   * @swagger
   * /api/auth/verification-status/{userId}:
   *   get:
   *     summary: Consultar estado de verificación
   *     description: Consulta si un usuario tiene el email verificado
   *     tags: [Verificación de Email]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Estado de verificación
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                     isVerified:
   *                       type: boolean
   *                     canLogin:
   *                       type: boolean
   *                     hasPendingVerification:
   *                       type: boolean
   */
  async getVerificationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
        if (!userId) {
            res.status(400).json({
            success: false,
            error: 'User ID is required'
            });
            return;
        }
        const result = await this.verificationStatusUseCase.execute(userId);
        res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}