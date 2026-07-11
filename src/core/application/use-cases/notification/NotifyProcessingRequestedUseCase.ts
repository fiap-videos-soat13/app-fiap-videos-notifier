import { EmailService, LoggerService } from '@domain/services/NotifierServices';
import { buildVideoJobStatusUrl } from '@domain/services/StatusUrlService';

export class NotifyProcessingRequestedUseCase {
  constructor(
    private readonly email: EmailService,
    private readonly logger: LoggerService,
  ) {}

  async execute(input: {
    userEmail: string;
    videoJobId: string;
    originalFileName: string;
  }): Promise<void> {
    const statusUrl = buildVideoJobStatusUrl(input.videoJobId);

    await this.email.sendProcessingRequestedEmail({
      to: input.userEmail,
      videoJobId: input.videoJobId,
      originalFileName: input.originalFileName,
      statusUrl,
    });

    this.logger.log('Notificação de upload pendente enviada', {
      videoJobId: input.videoJobId,
      to: input.userEmail,
    });
  }
}
