import { IParentalConsentRepository } from '../../domain/repositories/IParentalConsentRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ParentalConsent } from '../../domain/entities/ParentalConsent';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { injectable } from 'inversify';

export interface RequestParentalConsentCommand {
  minorUserId: string;
  parentEmail: string;
  parentName: string;
  relationship: 'father' | 'mother' | 'guardian';
}

import { inject } from 'inversify';
import { EmailServicePort } from '../ports/ouput/EmailServicePort';

@injectable()
export class RequestParentalConsentUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject('IParentalConsentRepository') private readonly consentRepository: IParentalConsentRepository,
    @inject('EmailServicePort') private readonly emailService: EmailServicePort
  ) {}

  async execute(command: RequestParentalConsentCommand): Promise<void> {
    const userId = new UserId(command.minorUserId);
    const parentEmail = new Email(command.parentEmail);

    // Verificar que el usuario existe y es menor
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.needsParentalConsent()) {
      throw new Error('User does not require parental consent');
    }

    // Verificar si ya existe un consentimiento pendiente
    const existingConsent = await this.consentRepository.findPendingByUserId(userId);
    if (existingConsent) {
      throw new Error('Parental consent already requested');
    }

    // Crear nuevo consentimiento
    const consent = ParentalConsent.create(
      userId,
      parentEmail,
      command.parentName,
      command.relationship
    );

    await this.consentRepository.save(consent);

    // Enviar email al padre/madre
    await this.emailService.sendParentalConsentEmail(
      command.parentEmail,
      consent.getConsentToken(),
      user.getFirstName() || 'su hijo/a'
    );
  }
}