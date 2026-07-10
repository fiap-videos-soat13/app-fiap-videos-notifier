import {
  VideoProcessingFailedPayloadSchema,
  type VideoEventEnvelope,
} from '@validators/VideoEventEnvelopeValidator';
import { AmqpConnection } from '../amqp/AmqpConnection';
import { Inbox } from '../inbox/Inbox';
import { BaseEventSubscriber } from './BaseEventSubscriber';
import { SubscribersConfig } from './subscribersConfig';
import { NotifyProcessingFailedUseCase } from '@use-cases/notification/NotifyProcessingFailedUseCase';
import { ConsoleLoggerService } from '@adapter/infra/services/ConsoleLoggerService';
import type { NotifierMetricsService } from '@adapter/infra/observability/MetricsServices';
import type { z } from 'zod';

type FailedPayload = z.infer<typeof VideoProcessingFailedPayloadSchema>;

export class VideoProcessingFailedSubscriber extends BaseEventSubscriber<FailedPayload> {
  constructor(
    connection: AmqpConnection,
    inbox: Inbox,
    logger: ConsoleLoggerService,
    private readonly notify: NotifyProcessingFailedUseCase,
    private readonly metrics: NotifierMetricsService,
  ) {
    super(connection, inbox, logger, {
      consumerName: SubscribersConfig.VideoProcessingFailed.consumerName,
      queueName: SubscribersConfig.VideoProcessingFailed.queueName,
      eventType: SubscribersConfig.VideoProcessingFailed.eventType,
      parsePayload: (payload) =>
        VideoProcessingFailedPayloadSchema.parse(payload),
      onEvent: async (
        _envelope: VideoEventEnvelope,
        payload: FailedPayload,
      ) => {
        await notify.execute({
          userEmail: payload.userEmail,
          videoJobId: _envelope.videoJobId,
          errorMessage: payload.errorMessage,
        });
        metrics.recordEmailSent('failed');
      },
    });
  }
}
