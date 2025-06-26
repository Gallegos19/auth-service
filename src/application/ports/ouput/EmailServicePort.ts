export interface EmailServicePort {
  sendParentalConsentEmail(parentEmail: string, consentToken: string, minorName: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
  sendWelcomeEmail(email: string, firstName?: string): Promise<void>;
  sendAccountVerificationEmail(email: string, verificationToken: string): Promise<void>;
}