// src/infrastructure/external/NotificationEmailService.ts
import { EmailServicePort } from "../../application/ports/ouput/EmailServicePort";
import { injectable } from "inversify";

@injectable()
export class NotificationEmailService implements EmailServicePort {
  private readonly notificationServiceUrl: string;
  private readonly serviceKey: string;
  private readonly serviceName: string;

  constructor() {
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007';
    this.serviceKey = process.env.AUTH_SERVICE_KEY || '';
    this.serviceName = 'auth-service';

    if (!this.serviceKey) {
      console.warn('⚠️ AUTH_SERVICE_KEY not configured. Notification service calls may fail.');
    }
  }

  async sendAccountVerificationEmail(email: string, verificationToken: string): Promise<void> {
    try {
      console.log(`📧 Enviando email de verificación a ${email} via notification-service`);
      
      const response = await fetch(`${this.notificationServiceUrl}/api/notifications/email/confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': this.serviceKey,
          'x-service-name': this.serviceName
        },
        body: JSON.stringify({
          to: email,
          userName: email.split('@')[0], // Usar parte del email como nombre por defecto
          token: verificationToken,
          baseUrl: process.env.FRONTEND_URL || 'https://front-xuma-a.vercel.app',
          expirationHours: 24
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notification service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Email de verificación enviado exitosamente:', result.notificationId);
      
    } catch (error) {
      console.error('❌ Error enviando email de verificación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send verification email: ${errorMessage}`);
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    try {
      console.log(`📧 Enviando email de bienvenida a ${email} via notification-service`);
      
      const response = await fetch(`${this.notificationServiceUrl}/api/notifications/email/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': this.serviceKey,
          'x-service-name': this.serviceName
        },
        body: JSON.stringify({
          to: email,
          userName: firstName || email.split('@')[0],
          appUrl: process.env.FRONTEND_URL || 'https://xumaa.com'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notification service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Email de bienvenida enviado exitosamente:', result.notificationId);
      
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send welcome email: ${errorMessage}`);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      console.log(`📧 Enviando email de reset de password a ${email} via notification-service`);
      
      // Usar el endpoint genérico de email con template personalizado
      const response = await fetch(`${this.notificationServiceUrl}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': this.serviceKey,
          'x-service-name': this.serviceName
        },
        body: JSON.stringify({
          to: email,
          subject: "🔐 Restablecer tu contraseña - Xuma'a",
          templateName: "general",
          templateData: {
            content: `
              <h2>🔐 Restablecer contraseña</h2>
              <p>Hola,</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Xuma'a.</p>
              <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
              <p>
                <a href="${process.env.FRONTEND_URL || 'https://xumaa.com'}/reset-password?token=${resetToken}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Restablecer Contraseña
                </a>
              </p>
              <p>Este enlace expirará en 1 hora por seguridad.</p>
              <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
              <p>¡Gracias por ser parte de Xuma'a! 🌱</p>
            `
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notification service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Email de reset de password enviado exitosamente:', result.notificationId);
      
    } catch (error) {
      console.error('❌ Error enviando email de reset de password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send password reset email: ${errorMessage}`);
    }
  }

  async sendParentalConsentEmail(parentEmail: string, consentToken: string, minorName: string): Promise<void> {
    try {
      console.log(`📧 Enviando email de consentimiento parental a ${parentEmail} via notification-service`);
      
      // Usar el endpoint genérico de email con template personalizado
      const response = await fetch(`${this.notificationServiceUrl}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': this.serviceKey,
          'x-service-name': this.serviceName
        },
        body: JSON.stringify({
          to: parentEmail,
          subject: "👨‍👩‍👧‍👦 Consentimiento parental requerido - Xuma'a",
          templateName: "general",
          templateData: {
            content: `
              <h2>👨‍👩‍👧‍👦 Consentimiento Parental Requerido</h2>
              <p>Estimado padre/madre/tutor,</p>
              <p><strong>${minorName}</strong> ha solicitado crear una cuenta en Xuma'a, nuestra plataforma educativa sobre sostenibilidad.</p>
              <p>Como ${minorName} es menor de 13 años, necesitamos su consentimiento para proceder con la creación de la cuenta.</p>
              <p>
                <a href="${process.env.FRONTEND_URL || 'https://xumaa.com'}/parental-consent?token=${consentToken}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Dar Consentimiento
                </a>
              </p>
              <p><strong>¿Qué es Xuma'a?</strong></p>
              <ul>
                <li>🌱 Plataforma educativa sobre sostenibilidad</li>
                <li>🎮 Juegos y desafíos apropiados para la edad</li>
                <li>🏆 Sistema de logros y recompensas</li>
                <li>🔒 Ambiente seguro y supervisado</li>
              </ul>
              <p>Este enlace expirará en 7 días.</p>
              <p>Si tiene preguntas, no dude en contactarnos.</p>
              <p>Atentamente,<br>El equipo de Xuma'a 🌍</p>
            `
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notification service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Email de consentimiento parental enviado exitosamente:', result.notificationId);
      
    } catch (error) {
      console.error('❌ Error enviando email de consentimiento parental:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send parental consent email: ${errorMessage}`);
    }
  }
}