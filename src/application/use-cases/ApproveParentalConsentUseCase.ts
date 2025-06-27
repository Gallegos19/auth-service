import { IParentalConsentRepository } from '../../domain/repositories/IParentalConsentRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { EventPublisherPort } from '../ports/ouput/EventPublisherPort';
import { EmailServicePort } from '../ports/ouput/EmailServicePort';
import { ParentalConsentApprovedEvent } from '../../domain/events/ParentalConsentAprovvedEvent';

export interface ApproveParentalConsentCommand {
  consentToken: string;
  ipAddress?: string;
  userAgent?: string;
}

export class ApproveParentalConsentUseCase {
  constructor(
    private readonly consentRepository: IParentalConsentRepository,
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisherPort,
    private readonly emailService: EmailServicePort
  ) {}

  async execute(command: ApproveParentalConsentCommand): Promise<void> {
    // Buscar consentimiento por token
    const consent = await this.consentRepository.findByToken(command.consentToken);
    if (!consent) {
      throw new Error('Consent token not found');
    }

    if (consent.isExpired()) {
      throw new Error('Consent token has expired');
    }

    if (consent.getIsApproved()) {
      throw new Error('Consent has already been approved');
    }

    // Aprobar consentimiento
    consent.approve();
    await this.consentRepository.save(consent);

    // Activar cuenta del menor
    const minorUser = await this.userRepository.findById(consent.getMinorUserId());
    if (!minorUser) {
      throw new Error('Minor user not found');
    }

    minorUser.verifyEmail();
    await this.userRepository.save(minorUser);

    // Publicar evento
    const event = new ParentalConsentApprovedEvent(
      consent.getMinorUserId().value,
      consent.getParentEmail().value,
      consent.getConsentToken(),
      new Date()
    );
    await this.eventPublisher.publish(event);

    // Enviar email de bienvenida al menor
    await this.emailService.sendWelcomeEmail(
      minorUser.getEmail().value,
      minorUser.getFirstName()
    );
  }
}