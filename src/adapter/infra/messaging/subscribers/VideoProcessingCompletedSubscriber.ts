import {
  VideoProcessingCompletedPayloadSchema,
  type VideoEventEnvelope,
} from '@validators/VideoEventEnvelopeValidator';
import { AmqpConnection } from '../amqp/AmqpConnection';
import { Inbox } from '../inbox/Inbox';
import { BaseEventSubscriber } from './BaseEventSubscriber';
import { SubscribersConfig } from './subscribersConfig';
import { NotifyProcessingCompletedUseCase } from '@use-cases/notification/NotifyProcessingCompletedUseCase';
import { ConsoleLoggerService } from '@adapter/infra/services/ConsoleLoggerService';
import type { NotifierMetricsService } from '@adapter/infra/observability/MetricsServices';
import type { z } from 'zod';

type CompletedPayload = z.infer<typeof VideoProcessingCompletedPayloadSchema>;

export class VideoProcessingCompletedSubscriber extends BaseEventSubscriber<CompletedPayload> {
  constructor(
    connection: AmqpConnection,
    inbox: Inbox,
    logger: ConsoleLoggerService,
    private readonly notify: NotifyProcessingCompletedUseCase,
    private readonly metrics: NotifierMetricsService,
  ) {
    super(connection, inbox, logger, {
      consumerName: SubscribersConfig.VideoProcessingCompleted.consumerName,
      queueName: SubscribersConfig.VideoProcessingCompleted.queueName,
      eventType: SubscribersConfig.VideoProcessingCompleted.eventType,
      parsePayload: (payload) =>
        VideoProcessingCompletedPayloadSchema.parse(payload),
      onEvent: async (
        envelope: VideoEventEnvelope,
        payload: CompletedPayload,
      ) => {
        await notify.execute({
          userEmail: payload.userEmail,
          videoJobId: envelope.videoJobId,
          originalFileName: payload.originalFileName,
        });
        metrics.recordEmailSent('completed');
      },
    });
  }
}
