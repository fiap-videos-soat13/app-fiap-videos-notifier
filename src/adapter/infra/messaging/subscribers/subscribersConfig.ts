import { VideoEventType } from '@validators/VideoEventEnvelopeValidator';
import { queueName } from '../amqp/AmqpTopology';

export const SubscribersConfig = Object.freeze({
  VideoProcessingRequested: {
    consumerName: 'notifier.on-video-processing-requested',
    queueName: queueName('notifier', VideoEventType.VideoProcessingRequested),
    eventType: VideoEventType.VideoProcessingRequested,
  },
  VideoProcessingCompleted: {
    consumerName: 'notifier.on-video-processing-completed',
    queueName: queueName('notifier', VideoEventType.VideoProcessingCompleted),
    eventType: VideoEventType.VideoProcessingCompleted,
  },
  VideoProcessingFailed: {
    consumerName: 'notifier.on-video-processing-failed',
    queueName: queueName('notifier', VideoEventType.VideoProcessingFailed),
    eventType: VideoEventType.VideoProcessingFailed,
  },
});
