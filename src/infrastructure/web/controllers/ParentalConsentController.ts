import { Request, Response } from 'express';
import { AuthCommandPort } from '../../../application/ports/input/AuthCommandPort';

export class ParentalConsentController {
  constructor(private readonly authCommandPort: AuthCommandPort) {}

  /**
   * @swagger
   * /api/auth/parental-consent/request:
   *   post:
   *     summary: Solicitar consentimiento parental
   *     description: |
   *       Envía una solicitud de consentimiento parental por email para usuarios menores de 13 años.
   *       El padre/madre/tutor recibirá un email con un enlace para aprobar el registro.
   *     tags: [Consentimiento Parental]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ParentalConsentRequest'
   *           example:
   *             minorUserId: "123e4567-e89b-12d3-a456-426614174000"
   *             parentEmail: "padre@email.com"
   *             parentName: "José Pérez González"
   *             relationship: "father"
   *     responses:
   *       200:
   *         description: Solicitud enviada exitosamente
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
   *                   example: "Parental consent request sent successfully"
   *       400:
   *         description: Error en la solicitud
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               user_not_found:
   *                 summary: Usuario no encontrado
   *                 value:
   *                   success: false
   *                   error: "User not found"
   *               already_requested:
   *                 summary: Ya existe solicitud pendiente
   *                 value:
   *                   success: false
   *                   error: "Parental consent already requested"
   *               not_required:
   *                 summary: Usuario no requiere consentimiento
   *                 value:
   *                   success: false
   *                   error: "User does not require parental consent"
   */
  async requestConsent(req: Request, res: Response): Promise<void> {
    try {
      const { minorUserId, parentEmail, parentName, relationship } = req.body;

      // Validación básica
      if (!minorUserId || !parentEmail || !parentName || !relationship) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: minorUserId, parentEmail, parentName, relationship'
        });
        return;
      }

      await this.authCommandPort.requestParentalConsent({
        minorUserId,
        parentEmail,
        parentName,
        relationship
      });

      res.status(200).json({
        success: true,
        message: 'Parental consent request sent successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/auth/parental-consent/approve/{token}:
   *   post:
   *     summary: Aprobar consentimiento parental
   *     description: |
   *       Aprueba el consentimiento parental usando el token enviado por email.
   *       Esto activa la cuenta del menor y le permite usar la plataforma.
   *     tags: [Consentimiento Parental]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: Token de consentimiento enviado por email
   *         example: "abc123def456ghi789"
   *     responses:
   *       200:
   *         description: Consentimiento aprobado exitosamente
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
   *                   example: "Parental consent approved successfully"
   *       400:
   *         description: Error en la aprobación
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               token_not_found:
   *                 summary: Token no encontrado
   *                 value:
   *                   success: false
   *                   error: "Consent token not found"
   *               token_expired:
   *                 summary: Token expirado
   *                 value:
   *                   success: false
   *                   error: "Consent token has expired"
   *               already_approved:
   *                 summary: Ya aprobado
   *                 value:
   *                   success: false
   *                   error: "Consent has already been approved"
   */
  async approveConsent(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Consent token is required'
        });
        return;
      }

      await this.authCommandPort.approveParentalConsent({
        consentToken: token,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      res.status(200).json({
        success: true,
        message: 'Parental consent approved successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/auth/parental-consent/status/{userId}:
   *   get:
   *     summary: Verificar estado del consentimiento parental
   *     description: Consulta el estado del consentimiento parental para un usuario menor
   *     tags: [Consentimiento Parental]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID del usuario menor
   *     responses:
   *       200:
   *         description: Estado del consentimiento
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
   *                     requiresConsent:
   *                       type: boolean
   *                       description: Si el usuario requiere consentimiento
   *                     hasConsent:
   *                       type: boolean
   *                       description: Si tiene consentimiento aprobado
   *                     pendingRequest:
   *                       type: boolean
   *                       description: Si hay solicitud pendiente
   *                     expiresAt:
   *                       type: string
   *                       format: date-time
   *                       description: Fecha de expiración de solicitud pendiente
   *       404:
   *         description: Usuario no encontrado
   */
  async getConsentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Esta funcionalidad requiere implementar el caso de uso correspondiente
      // const status = await this.authQueryPort.getParentalConsentStatus({ userId });

      res.status(200).json({
        success: true,
        data: {
          requiresConsent: true, // placeholder
          hasConsent: false,
          pendingRequest: true,
          expiresAt: new Date()
        }
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
}