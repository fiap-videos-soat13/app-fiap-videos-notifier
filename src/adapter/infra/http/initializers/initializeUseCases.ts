import { NotifyProcessingFailedUseCase } from '@use-cases/notification/NotifyProcessingFailedUseCase';
import { NotifyProcessingCompletedUseCase } from '@use-cases/notification/NotifyProcessingCompletedUseCase';
import { NotifyProcessingRequestedUseCase } from '@use-cases/notification/NotifyProcessingRequestedUseCase';
import { NodemailerEmailService } from '@adapter/infra/services/NodemailerEmailService';
import type { InfrastructureContext, UseCaseContext } from './types';

export function initializeUseCases(infra: InfrastructureContext): UseCaseContext {
  const email = new NodemailerEmailService();

  return {
    notifyRequested: new NotifyProcessingRequestedUseCase(email, infra.logger),
    notifyFailed: new NotifyProcessingFailedUseCase(email, infra.logger),
    notifyCompleted: new NotifyProcessingCompletedUseCase(email, infra.logger),
  };
}
