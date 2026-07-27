import express from 'express';
import { Registry, collectDefaultMetrics } from 'prom-client';
import { NotifyProcessingFailedUseCase } from '@use-cases/notification/NotifyProcessingFailedUseCase';
import { NotifyProcessingCompletedUseCase } from '@use-cases/notification/NotifyProcessingCompletedUseCase';
import { NotifyProcessingRequestedUseCase } from '@use-cases/notification/NotifyProcessingRequestedUseCase';
import { NodemailerEmailService } from '@adapter/infra/services/NodemailerEmailService';
import { createLogger } from '@adapter/infra/logging/loggerFactory';
import { AmqpConnection } from '@adapter/infra/messaging/amqp/AmqpConnection';
import { Inbox } from '@adapter/infra/messaging/inbox/Inbox';
import { VideoProcessingFailedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingFailedSubscriber';
import { VideoProcessingCompletedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingCompletedSubscriber';
import { VideoProcessingRequestedSubscriber } from '@adapter/infra/messaging/subscribers/VideoProcessingRequestedSubscriber';
import { checkDatabaseConnectivity } from '@adapter/infra/database/client';
import {
  SagaMetricsService,
  NotifierMetricsService,
} from '@adapter/infra/observability/MetricsServices';
import {
  createOpsOpenApiDocument,
  setupOpsSwagger,
} from './swagger/setup';
import {
  createMetricsMiddleware,
  metricsHandler,
  registerHttpMetrics,
} from './middleware/metrics.middleware';

export type NotifierContext = {
  app: express.Express;
  amqp: AmqpConnection;
  requestedSubscriber: VideoProcessingRequestedSubscriber;
  completedSubscriber: VideoProcessingCompletedSubscriber;
  failedSubscriber: VideoProcessingFailedSubscriber;
};

export function buildNotifier(): NotifierContext {
  const logger = createLogger('app-fiap-videos-notifier');
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });
  const httpMetrics = registerHttpMetrics(registry);
  const sagaMetrics = new SagaMetricsService(registry);
  const notifierMetrics = new NotifierMetricsService(registry);

  const email = new NodemailerEmailService();
  const notifyRequested = new NotifyProcessingRequestedUseCase(email, logger);
  const notifyFailed = new NotifyProcessingFailedUseCase(email, logger);
  const notifyCompleted = new NotifyProcessingCompletedUseCase(email, logger);

  const exchange =
    process.env.VIDEO_EVENTS_EXCHANGE?.trim() || 'fiap-videos.events';
  const dlx =
    process.env.VIDEO_EVENTS_DLX?.trim() || 'fiap-videos.events.dlx';
  const amqp = new AmqpConnection(
    logger,
    exchange,
    dlx,
    process.env.RABBITMQ_CONNECTION_NAME?.trim() || 'notifier',
  );
  const inbox = new Inbox(logger, sagaMetrics);
  const requestedSubscriber = new VideoProcessingRequestedSubscriber(
    amqp,
    inbox,
    logger,
    notifyRequested,
    notifierMetrics,
  );
  const completedSubscriber = new VideoProcessingCompletedSubscriber(
    amqp,
    inbox,
    logger,
    notifyCompleted,
    notifierMetrics,
  );
  const failedSubscriber = new VideoProcessingFailedSubscriber(
    amqp,
    inbox,
    logger,
    notifyFailed,
    notifierMetrics,
  );

  const app = express();
  const port = Number(process.env.PORT) || 3002;
  const openApi = createOpsOpenApiDocument({
    title: 'FIAP Videos Notifier',
    description:
      'Envia e-mail em VideoProcessingRequested, VideoProcessingCompleted e VideoProcessingFailed.',
    port,
  });
  setupOpsSwagger(app, openApi);
  app.use(createMetricsMiddleware(registry, httpMetrics));

  app.get('/health/live', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  app.get('/health/ready', (_req, res) => {
    void checkDatabaseConnectivity().then((ok) => {
      res.status(ok ? 200 : 503).json({ database: ok ? 'up' : 'down' });
    });
  });
  app.get('/metrics', (req, res, next) => {
    void metricsHandler(
      req,
      res,
      registry,
      httpMetrics.databaseUp,
      checkDatabaseConnectivity,
    ).catch(next);
  });

  return { app, amqp, requestedSubscriber, completedSubscriber, failedSubscriber };
}
