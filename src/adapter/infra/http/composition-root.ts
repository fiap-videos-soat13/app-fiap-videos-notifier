import { initializeInfrastructure } from './initializers/initializeInfrastructure';
import { initializeUseCases } from './initializers/initializeUseCases';
import { initializeMessaging } from './initializers/initializeMessaging';
import { initializeExpress } from './initializers/initializeExpress';
import { initializeInternalRoutes } from './initializers/initializeInternalRoutes';
import type { NotifierContext } from './initializers/types';

export type { NotifierContext } from './initializers/types';

export function buildNotifier(): NotifierContext {
  const infra = initializeInfrastructure();
  const useCases = initializeUseCases(infra);
  const messaging = initializeMessaging(infra, useCases);
  const app = initializeExpress(infra);

  initializeInternalRoutes(app, infra);

  return {
    app,
    amqp: messaging.amqp,
    requestedSubscriber: messaging.requestedSubscriber,
    completedSubscriber: messaging.completedSubscriber,
    failedSubscriber: messaging.failedSubscriber,
  };
}
