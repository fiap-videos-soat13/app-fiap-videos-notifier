import {
  VideoProcessingRequestedPayloadSchema,
  type VideoEventEnvelope,
} from '@validators/VideoEventEnvelopeValidator';
import { AmqpConnection } from '../amqp/AmqpConnection';
import { Inbox } from '../inbox/Inbox';
import { BaseEventSubscriber } from './BaseEventSubscriber';
import { SubscribersConfig } from './subscribersConfig';
import { NotifyProcessingRequestedUseCase } from '@use-cases/notification/NotifyProcessingRequestedUseCase';
import type { LoggerPort } from '@domain/outboundPorts/LoggerPort';
import type { NotifierMetricsService } from '@adapter/infra/observability/MetricsServices';
import type { z } from 'zod';

type RequestedPayload = z.infer<typeof VideoProcessingRequestedPayloadSchema>;

export class VideoProcessingRequestedSubscriber extends BaseEventSubscriber<RequestedPayload> {
  constructor(
    connection: AmqpConnection,
    inbox: Inbox,
    logger: LoggerPort,
    private readonly notify: NotifyProcessingRequestedUseCase,
    private readonly metrics: NotifierMetricsService,
  ) {
    super(connection, inbox, logger, {
      consumerName: SubscribersConfig.VideoProcessingRequested.consumerName,
      queueName: SubscribersConfig.VideoProcessingRequested.queueName,
      eventType: SubscribersConfig.VideoProcessingRequested.eventType,
      parsePayload: (payload) =>
        VideoProcessingRequestedPayloadSchema.parse(payload),
      onEvent: async (
        envelope: VideoEventEnvelope,
        payload: RequestedPayload,
      ) => {
        await notify.execute({
          userEmail: payload.userEmail,
          videoJobId: envelope.videoJobId,
          originalFileName: payload.originalFileName,
        });
        metrics.recordEmailSent('pending');
      },
    });
  }
}
