import 'dotenv/config';
import { buildNotifier } from './composition-root';
import { runMigrations, closeDb } from '@adapter/infra/database/client';

async function bootstrap(): Promise<void> {
  await runMigrations();
  const { app, amqp, requestedSubscriber, completedSubscriber, failedSubscriber } =
    buildNotifier();
  await amqp.connect();
  await requestedSubscriber.start();
  await completedSubscriber.start();
  await failedSubscriber.start();

  const port = Number(process.env.PORT) || 3002;
  const host = process.env.HOST?.trim() || '0.0.0.0';

  const server = app.listen(port, host, () => {
    console.log(`Notifier FIAP Videos rodando em http://${host}:${port}`);
    console.log(`Swagger em http://${host}:${port}/api/docs`);
  });

  const shutdown = async (): Promise<void> => {
    await requestedSubscriber.stop();
    await completedSubscriber.stop();
    await failedSubscriber.stop();
    server.close();
    await amqp.close();
    await closeDb();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });
  process.on('SIGTERM', () => {
    void shutdown();
  });
}

void bootstrap().catch((err: unknown) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
