import { EmailServicePort } from "../../application/ports/ouput/EmailServicePort";

export class EmailService implements EmailServicePort {
  constructor(
    private readonly emailProvider: any, // Implementación específica (SendGrid, AWS SES, etc.)
    private readonly frontendUrl: string
  ) {}

  async sendParentalConsentEmail(parentEmail: string, consentToken: string, minorName: string): Promise<void> {
    const consentUrl = `${this.frontendUrl}/parental-consent/${consentToken}`;
    
    const emailContent = {
      to: parentEmail,
      subject: 'Consentimiento Parental Requerido - Xuma\'a',
      template: 'parental-consent',
      data: {
        minorName,
        consentUrl,
        expirationDays: 7
      }
    };

    await this.emailProvider.send(emailContent);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password/${resetToken}`;
    
    const emailContent = {
      to: email,
      subject: 'Restablecer Contraseña - Xuma\'a',
      template: 'password-reset',
      data: {
        resetUrl,
        expirationMinutes: 60
      }
    };

    await this.emailProvider.send(emailContent);
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const emailContent = {
      to: email,
      subject: '¡Bienvenido a Xuma\'a! 🌱',
      template: 'welcome',
      data: {
        firstName: firstName || 'Eco-warrior'
      }
    };

    await this.emailProvider.send(emailContent);
  }

  async sendAccountVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email/${verificationToken}`;
    
    const emailContent = {
      to: email,
      subject: 'Verifica tu cuenta - Xuma\'a',
      template: 'email-verification',
      data: {
        verificationUrl
      }
    };

    await this.emailProvider.send(emailContent);
  }
}