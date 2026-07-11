import { EmailService, LoggerService } from '@domain/services/NotifierServices';
import { buildVideoJobStatusUrl } from '@domain/services/StatusUrlService';

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
    const statusUrl = buildVideoJobStatusUrl(input.videoJobId);

    await this.email.sendProcessingFailedEmail({
      to: input.userEmail,
      videoJobId: input.videoJobId,
      errorMessage: input.errorMessage,
      statusUrl,
    });

    this.logger.log('Notificação de falha enviada', {
      videoJobId: input.videoJobId,
      to: input.userEmail,
    });
  }
}
