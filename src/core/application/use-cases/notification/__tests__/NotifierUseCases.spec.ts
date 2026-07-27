import { NotifyProcessingRequestedUseCase } from '@use-cases/notification/NotifyProcessingRequestedUseCase';
import { NotifyProcessingCompletedUseCase } from '@use-cases/notification/NotifyProcessingCompletedUseCase';
import { NotifyProcessingFailedUseCase } from '@use-cases/notification/NotifyProcessingFailedUseCase';
import type { EmailService, LoggerService } from '@domain/services/NotifierServices';

describe('Notifier use cases', () => {
  let email: jest.Mocked<EmailService>;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    email = {
      sendProcessingRequestedEmail: jest.fn().mockResolvedValue(undefined),
      sendProcessingCompletedEmail: jest.fn().mockResolvedValue(undefined),
      sendProcessingFailedEmail: jest.fn().mockResolvedValue(undefined),
    };
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  });

  describe('NotifyProcessingRequestedUseCase', () => {
    it('sends requested email and logs', async () => {
      const useCase = new NotifyProcessingRequestedUseCase(email, logger);

      await useCase.execute({
        userEmail: 'user@fiap.com',
        videoJobId: 'job-id',
        originalFileName: 'video.mp4',
      });

      expect(email.sendProcessingRequestedEmail).toHaveBeenCalledWith({
        to: 'user@fiap.com',
        videoJobId: 'job-id',
        originalFileName: 'video.mp4',
        statusUrl: 'http://localhost:3000/status/job-id',
      });
      expect(logger.log).toHaveBeenCalledWith(
        'Notificação de upload pendente enviada',
        { videoJobId: 'job-id', to: 'user@fiap.com' },
      );
    });
  });

  describe('NotifyProcessingCompletedUseCase', () => {
    it('sends completed email and logs', async () => {
      const useCase = new NotifyProcessingCompletedUseCase(email, logger);

      await useCase.execute({
        userEmail: 'user@fiap.com',
        videoJobId: 'job-id',
        originalFileName: 'video.mp4',
      });

      expect(email.sendProcessingCompletedEmail).toHaveBeenCalledWith({
        to: 'user@fiap.com',
        videoJobId: 'job-id',
        originalFileName: 'video.mp4',
        statusUrl: 'http://localhost:3000/status/job-id',
      });
      expect(logger.log).toHaveBeenCalledWith('Notificação de sucesso enviada', {
        videoJobId: 'job-id',
        to: 'user@fiap.com',
      });
    });
  });

  describe('NotifyProcessingFailedUseCase', () => {
    it('sends failed email and logs', async () => {
      const useCase = new NotifyProcessingFailedUseCase(email, logger);

      await useCase.execute({
        userEmail: 'user@fiap.com',
        videoJobId: 'job-id',
        errorMessage: 'ffmpeg error',
      });

      expect(email.sendProcessingFailedEmail).toHaveBeenCalledWith({
        to: 'user@fiap.com',
        videoJobId: 'job-id',
        errorMessage: 'ffmpeg error',
        statusUrl: 'http://localhost:3000/status/job-id',
      });
      expect(logger.log).toHaveBeenCalledWith('Notificação de falha enviada', {
        videoJobId: 'job-id',
        to: 'user@fiap.com',
      });
    });
  });
});
