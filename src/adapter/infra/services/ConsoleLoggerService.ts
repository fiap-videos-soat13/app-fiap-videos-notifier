import { LoggerService } from '@domain/services/NotifierServices';

const APP_NAME =
  process.env.METRICS_SERVICE_NAME?.trim() || 'app-fiap-videos-notifier';

export class ConsoleLoggerService extends LoggerService {
  constructor(private readonly app = APP_NAME) {
    super();
  }

  log(message: string, context?: Record<string, string>): void {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        app: this.app,
        message,
        ...context,
      }),
    );
  }

  error(message: string, context?: Record<string, string>): void {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        app: this.app,
        message,
        ...context,
      }),
    );
  }
}
