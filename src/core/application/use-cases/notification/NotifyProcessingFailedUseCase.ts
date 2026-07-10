import { EmailService, LoggerService } from '@domain/services/NotifierServices';

export class NotifyProcessingFailedUseCase {
  constructor(
    private readonly email: EmailService,
    private readonly logger: LoggerService,
  ) {}

  async execute(input: {
    userEmail: string;
    videoJobId: string;
    errorMessage: string;
  }): Promise<void> {
    await this.email.sendProcessingFailedEmail({
      to: input.userEmail,
      videoJobId: input.videoJobId,
      errorMessage: input.errorMessage,
    });

    this.logger.log('Notificação de falha enviada', {
      videoJobId: input.videoJobId,
      to: input.userEmail,
    });
  }
}
