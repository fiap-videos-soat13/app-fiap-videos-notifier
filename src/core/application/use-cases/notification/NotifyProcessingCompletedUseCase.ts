import { EmailService, LoggerService } from '@domain/services/NotifierServices';

export class NotifyProcessingCompletedUseCase {
  constructor(
    private readonly email: EmailService,
    private readonly logger: LoggerService,
  ) {}

  async execute(input: {
    userEmail: string;
    videoJobId: string;
    originalFileName: string;
  }): Promise<void> {
    await this.email.sendProcessingCompletedEmail({
      to: input.userEmail,
      videoJobId: input.videoJobId,
      originalFileName: input.originalFileName,
    });

    this.logger.log('Notificação de sucesso enviada', {
      videoJobId: input.videoJobId,
      to: input.userEmail,
    });
  }
}
