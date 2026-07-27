import { AmqpConnection } from '@adapter/infra/messaging/amqp/AmqpConnection';
import { Inbox } from '@adapter/infra/messaging/inbox/Inbox';
import { VideoProcessingFailedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingFailedSubscriber';
import { VideoProcessingCompletedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingCompletedSubscriber';
import { VideoProcessingRequestedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingRequestedSubscriber';
import type { InfrastructureContext, UseCaseContext, MessagingContext } from './types';

export function initializeMessaging(
  infra: InfrastructureContext,
  useCases: UseCaseContext,
): MessagingContext {
  const exchange =
    process.env.VIDEO_EVENTS_EXCHANGE?.trim() || 'fiap-videos.events';
  const dlx =
    process.env.VIDEO_EVENTS_DLX?.trim() || 'fiap-videos.events.dlx';
  const amqp = new AmqpConnection(
    infra.logger,
    exchange,
    dlx,
    process.env.RABBITMQ_CONNECTION_NAME?.trim() || 'notifier',
  );
  const inbox = new Inbox(infra.logger, infra.sagaMetrics);

  const requestedSubscriber = new VideoProcessingRequestedSubscriber(
    amqp,
    inbox,
    infra.logger,
    useCases.notifyRequested,
    infra.notifierMetrics,
  );
  const completedSubscriber = new VideoProcessingCompletedSubscriber(
    amqp,
    inbox,
    infra.logger,
    useCases.notifyCompleted,
    infra.notifierMetrics,
  );
  const failedSubscriber = new VideoProcessingFailedSubscriber(
    amqp,
    inbox,
    infra.logger,
    useCases.notifyFailed,
    infra.notifierMetrics,
  );

  return {
    amqp,
    inbox,
    requestedSubscriber,
    completedSubscriber,
    failedSubscriber,
  };
}
