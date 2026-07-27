import { Registry, collectDefaultMetrics } from 'prom-client';
import { createLogger } from '@adapter/infra/logging/loggerFactory';
import {
  SagaMetricsService,
  NotifierMetricsService,
} from '@adapter/infra/observability/MetricsServices';
import { registerHttpMetrics } from '../middleware/metrics.middleware';
import type { InfrastructureContext } from './types';

export function initializeInfrastructure(): InfrastructureContext {
  const logger = createLogger('app-fiap-videos-notifier');
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });
  const httpMetrics = registerHttpMetrics(registry);
  const sagaMetrics = new SagaMetricsService(registry);
  const notifierMetrics = new NotifierMetricsService(registry);

  return {
    logger,
    registry,
    httpMetrics,
    sagaMetrics,
    notifierMetrics,
  };
}
