// src/infrastructure/external/GmailEmailService.ts
import { EmailServicePort } from '../../application/ports/ouput/EmailServicePort';
import { injectable } from 'inversify';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@injectable()
export class GmailEmailService implements EmailServicePort {
  private transporter: nodemailer.Transporter | null = null;
  private oauth2Client: any;

  constructor() {
    this.initializeOAuth2Client();
  }

  private initializeOAuth2Client() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground' // Redirect URL
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });
  }

  private async createTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    try {
      const accessToken = await this.oauth2Client.getAccessToken();

      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token
        }
      } as any);

      console.log('✅ Gmail transporter creado exitosamente');
      return this.transporter;
    } catch (error) {
      console.error('❌ Error creando Gmail transporter:', error);
      throw new Error('Failed to create Gmail transporter');
    }
  }

  async sendParentalConsentEmail(parentEmail: string, consentToken: string, minorName: string): Promise<void> {
    const template = this.getParentalConsentTemplate(consentToken, minorName);
    
    await this.sendEmail({
      to: parentEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    console.log(`📧 Email de consentimiento parental enviado a ${parentEmail} para ${minorName}`);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const template = this.getPasswordResetTemplate(resetToken);
    
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    console.log(`📧 Email de reset de password enviado a ${email}`);
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const template = this.getWelcomeTemplate(firstName);
    
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    console.log(`📧 Email de bienvenida enviado a ${email}`);
  }

  async sendAccountVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const template = this.getVerificationTemplate(verificationToken);
    
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    console.log(`📧 Email de verificación enviado a ${email}`);
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    try {
      const transporter = await this.createTransporter();
      
      const mailOptions = {
        from: `"Xuma'a 🌱" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente:', result.messageId);
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getParentalConsentTemplate(consentToken: string, minorName: string): EmailTemplate {
    const consentUrl = `${process.env.FRONTEND_URL || 'https://xumaa.app'}/parental-consent/${consentToken}`;
    
    return {
      subject: `🌱 Consentimiento Parental Requerido - Xuma'a`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 Xuma'a</h1>
              <h2>Consentimiento Parental Requerido</h2>
            </div>
            <div class="content">
              <p>Estimado padre/madre/tutor,</p>
              
              <p><strong>${minorName}</strong> desea registrarse en Xuma'a, nuestra plataforma educativa de conciencia ambiental para jóvenes.</p>
              
              <p>Como ${minorName} es menor de 13 años, necesitamos su consentimiento parental para cumplir con las regulaciones de protección de menores.</p>
              
              <p><strong>¿Qué es Xuma'a?</strong></p>
              <ul>
                <li>🌍 Plataforma educativa sobre medio ambiente</li>
                <li>🎮 Aprendizaje gamificado seguro</li>
                <li>🛡️ Protección especial para menores</li>
                <li>📚 Contenido alineado con programas educativos</li>
              </ul>
              
              <p>Para aprobar el registro de ${minorName}, haga clic en el siguiente botón:</p>
              
              <center>
                <a href="${consentUrl}" class="button">✅ Aprobar Registro</a>
              </center>
              
              <p><strong>Este enlace expira en 7 días.</strong></p>
              
              <p>Si no autorizó este registro, puede ignorar este email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Xuma'a - Universidad Politécnica de Chiapas</p>
              <p>Este email fue enviado por el sistema de consentimiento parental.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Consentimiento Parental Requerido - Xuma'a
        
        Estimado padre/madre/tutor,
        
        ${minorName} desea registrarse en Xuma'a, nuestra plataforma educativa de conciencia ambiental.
        
        Como es menor de 13 años, necesitamos su consentimiento parental.
        
        Para aprobar el registro, visite: ${consentUrl}
        
        Este enlace expira en 7 días.
        
        Si no autorizó este registro, puede ignorar este email.
        
        © 2025 Xuma'a - Universidad Politécnica de Chiapas
      `
    };
  }

  private getPasswordResetTemplate(resetToken: string): EmailTemplate {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://xumaa.app'}/reset-password/${resetToken}`;
    
    return {
      subject: `🔒 Restablecer Contraseña - Xuma'a`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2196F3, #1565C0); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 Xuma'a</h1>
              <h2>Restablecer Contraseña</h2>
            </div>
            <div class="content">
              <p>Hola,</p>
              
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Xuma'a.</p>
              
              <center>
                <a href="${resetUrl}" class="button">🔒 Restablecer Contraseña</a>
              </center>
              
              <div class="alert">
                <strong>⚠️ Importante:</strong> Este enlace expira en 1 hora por seguridad.
              </div>
              
              <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.</p>
              
              <p>Por tu seguridad, nunca compartas este enlace con nadie.</p>
            </div>
            <div class="footer">
              <p>© 2025 Xuma'a - Universidad Politécnica de Chiapas</p>
              <p>Este email fue enviado por el sistema de seguridad.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Restablecer Contraseña - Xuma'a
        
        Hola,
        
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        
        Para restablecer tu contraseña, visite: ${resetUrl}
        
        Este enlace expira en 1 hora.
        
        Si no solicitaste esto, puedes ignorar este email.
        
        © 2025 Xuma'a
      `
    };
  }

  private getWelcomeTemplate(firstName?: string): EmailTemplate {
    const name = firstName || 'Eco-warrior';
    
    return {
      subject: `🌱 ¡Bienvenido a Xuma'a, ${name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50, #8BC34A); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 ¡Bienvenido a Xuma'a!</h1>
              <h2>Hola ${name}, ¡Ya eres parte de nuestra comunidad!</h2>
            </div>
            <div class="content">
              <p>¡Estamos emocionados de tenerte en Xuma'a! 🎉</p>
              
              <p>Tu cuenta ha sido creada exitosamente y ya puedes empezar tu aventura hacia un futuro más verde.</p>
              
              <div class="feature">
                <h3>🎮 ¿Qué puedes hacer ahora?</h3>
                <ul>
                  <li>Completa trivias sobre medio ambiente</li>
                  <li>Participa en desafíos ecológicos</li>
                  <li>Colecciona mascotas virtuales mexicanas</li>
                  <li>Gana badges por tu impacto ambiental</li>
                </ul>
              </div>
              
              <div class="feature">
                <h3>🏆 Primeros pasos recomendados:</h3>
                <ol>
                  <li>Completa tu primera trivia sobre biodiversidad</li>
                  <li>Adopta tu primer EcoPet (¡te recomendamos el ajolote!)</li>
                  <li>Únete a tu primer desafío ecológico semanal</li>
                </ol>
              </div>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'https://xumaa.app'}/dashboard" class="button">🚀 Comenzar mi aventura</a>
              </center>
              
              <p>¡Que tengas una excelente experiencia aprendiendo y protegiendo nuestro planeta! 🌍</p>
            </div>
            <div class="footer">
              <p>© 2025 Xuma'a - Universidad Politécnica de Chiapas</p>
              <p>¡Juntos por un futuro más verde! 🌱</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        ¡Bienvenido a Xuma'a, ${name}!
        
        ¡Estamos emocionados de tenerte en nuestra comunidad!
        
        Tu cuenta ha sido creada exitosamente.
        
        ¿Qué puedes hacer ahora?
        - Completa trivias sobre medio ambiente
        - Participa en desafíos ecológicos  
        - Colecciona mascotas virtuales mexicanas
        - Gana badges por tu impacto ambiental
        
        Visita: ${process.env.FRONTEND_URL || 'https://xumaa.app'}/dashboard
        
        ¡Que tengas una excelente experiencia!
        
        © 2025 Xuma'a
      `
    };
  }

  private getVerificationTemplate(verificationToken: string): EmailTemplate {
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://xumaa.app'}/verify-email/${verificationToken}`;
    
    return {
      subject: `📧 Verifica tu cuenta - Xuma'a`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9800, #F57C00); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 Xuma'a</h1>
              <h2>Verifica tu Email</h2>
            </div>
            <div class="content">
              <p>¡Hola!</p>
              
              <p>Gracias por registrarte en Xuma'a. Para completar tu registro, necesitamos verificar tu dirección de email.</p>
              
              <center>
                <a href="${verificationUrl}" class="button">📧 Verificar Email</a>
              </center>
              
              <p>Una vez verificado tu email, podrás acceder a todas las funciones de Xuma'a.</p>
              
              <p>Si no te registraste en Xuma'a, puedes ignorar este email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Xuma'a - Universidad Politécnica de Chiapas</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Verifica tu Email - Xuma'a
        
        ¡Hola!
        
        Gracias por registrarte en Xuma'a.
        
        Para completar tu registro, verifica tu email visitando: ${verificationUrl}
        
        © 2025 Xuma'a
      `
    };
  }
}