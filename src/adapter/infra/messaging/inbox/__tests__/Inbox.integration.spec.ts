import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { Inbox } from '../Inbox';
import { createLogger } from '@adapter/infra/logging/loggerFactory';
import { getDb } from '@adapter/infra/database/client';
import { processedEvents } from '@adapter/infra/database/schema';
import { VideoEventType } from '@validators/VideoEventEnvelopeValidator';
import type { VideoEventEnvelope } from '@validators/VideoEventEnvelopeValidator';

function buildEnvelope(eventId = randomUUID()): VideoEventEnvelope {
  return {
    eventId,
    correlationId: randomUUID(),
    workflowId: randomUUID(),
    videoJobId: randomUUID(),
    eventType: VideoEventType.VideoProcessingCompleted,
    occurredAt: new Date().toISOString(),
    schemaVersion: 1,
    payload: {
      userId: randomUUID(),
      userEmail: 'integration@fiap.local',
      originalFileName: 'video.mp4',
      zipStorageKey: 'zips/video.zip',
      completedAt: new Date().toISOString(),
    },
  };
}

async function countRows(eventId: string): Promise<number> {
  const rows = await getDb()
    .select()
    .from(processedEvents)
    .where(eq(processedEvents.eventId, eventId));
  return rows.length;
}

describe('Inbox integration', () => {
  const inbox = new Inbox(createLogger('inbox-integration-test'));

  it('handles an event the first time and records it', async () => {
    const envelope = buildEnvelope();
    const handler = jest.fn().mockResolvedValue(undefined);

    const handled = await inbox.runOnce(envelope, 'notifier.completed', handler);

    expect(handled).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(await countRows(envelope.eventId)).toBe(1);
  });

  it('skips a duplicate eventId for the same consumer', async () => {
    const envelope = buildEnvelope();
    const firstHandler = jest.fn().mockResolvedValue(undefined);
    const duplicateHandler = jest.fn().mockResolvedValue(undefined);

    const first = await inbox.runOnce(envelope, 'notifier.completed', firstHandler);
    const duplicate = await inbox.runOnce(
      envelope,
      'notifier.completed',
      duplicateHandler,
    );

    expect(first).toBe(true);
    expect(duplicate).toBe(false);
    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(duplicateHandler).not.toHaveBeenCalled();
    expect(await countRows(envelope.eventId)).toBe(1);
  });

  it('handles the same eventId for different consumers independently', async () => {
    const envelope = buildEnvelope();
    const completedHandler = jest.fn().mockResolvedValue(undefined);
    const failedHandler = jest.fn().mockResolvedValue(undefined);

    const completed = await inbox.runOnce(
      envelope,
      'notifier.completed',
      completedHandler,
    );
    const failed = await inbox.runOnce(
      envelope,
      'notifier.failed',
      failedHandler,
    );

    expect(completed).toBe(true);
    expect(failed).toBe(true);
    expect(completedHandler).toHaveBeenCalledTimes(1);
    expect(failedHandler).toHaveBeenCalledTimes(1);
    expect(await countRows(envelope.eventId)).toBe(2);
  });

  it('removes the inbox row and rethrows when the handler fails, allowing a retry', async () => {
    const envelope = buildEnvelope();
    const failingHandler = jest.fn().mockRejectedValue(new Error('smtp down'));

    await expect(
      inbox.runOnce(envelope, 'notifier.completed', failingHandler),
    ).rejects.toThrow('smtp down');
    expect(await countRows(envelope.eventId)).toBe(0);

    const retryHandler = jest.fn().mockResolvedValue(undefined);
    const retried = await inbox.runOnce(
      envelope,
      'notifier.completed',
      retryHandler,
    );

    expect(retried).toBe(true);
    expect(retryHandler).toHaveBeenCalledTimes(1);
    expect(await countRows(envelope.eventId)).toBe(1);
  });
});
