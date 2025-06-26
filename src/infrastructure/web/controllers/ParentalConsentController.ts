import { Request, Response } from 'express';
import { AuthCommandPort } from '../../../application/ports/input/AuthCommandPort';

export class ParentalConsentController {
  constructor(private readonly authCommandPort: AuthCommandPort) {}

  async requestConsent(req: Request, res: Response): Promise<void> {
    try {
      const { minorUserId, parentEmail, parentName, relationship } = req.body;

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

  async approveConsent(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      await this.authCommandPort.approveParentalConsent({
        consentToken: token
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
}