import type { Express } from 'express';
import type { Registry } from 'prom-client';
import type { AmqpConnection } from '@adapter/infra/messaging/amqp/AmqpConnection';
import type { Inbox } from '@adapter/infra/messaging/inbox/Inbox';
import type { VideoProcessingRequestedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingRequestedSubscriber';
import type { VideoProcessingCompletedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingCompletedSubscriber';
import type { VideoProcessingFailedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingFailedSubscriber';
import type { NotifyProcessingFailedUseCase } from '@use-cases/notification/NotifyProcessingFailedUseCase';
import type { NotifyProcessingCompletedUseCase } from '@use-cases/notification/NotifyProcessingCompletedUseCase';
import type { NotifyProcessingRequestedUseCase } from '@use-cases/notification/NotifyProcessingRequestedUseCase';
import type {
  SagaMetricsService,
  NotifierMetricsService,
} from '@adapter/infra/observability/MetricsServices';
import type { LoggerPort } from '@domain/outboundPorts/LoggerPort';
import type { registerHttpMetrics } from '../middleware/metrics.middleware';

export type InfrastructureContext = {
  logger: LoggerPort;
  registry: Registry;
  httpMetrics: ReturnType<typeof registerHttpMetrics>;
  sagaMetrics: SagaMetricsService;
  notifierMetrics: NotifierMetricsService;
};

export type UseCaseContext = {
  notifyRequested: NotifyProcessingRequestedUseCase;
  notifyFailed: NotifyProcessingFailedUseCase;
  notifyCompleted: NotifyProcessingCompletedUseCase;
};

export type MessagingContext = {
  amqp: AmqpConnection;
  inbox: Inbox;
  requestedSubscriber: VideoProcessingRequestedSubscriber;
  completedSubscriber: VideoProcessingCompletedSubscriber;
  failedSubscriber: VideoProcessingFailedSubscriber;
};

export type NotifierContext = {
  app: Express;
  amqp: AmqpConnection;
  requestedSubscriber: VideoProcessingRequestedSubscriber;
  completedSubscriber: VideoProcessingCompletedSubscriber;
  failedSubscriber: VideoProcessingFailedSubscriber;
};
