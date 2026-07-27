export abstract class EmailService {
  abstract sendProcessingRequestedEmail(input: {
    to: string;
    videoJobId: string;
    originalFileName: string;
    statusUrl: string;
  }): Promise<void>;

  abstract sendProcessingFailedEmail(input: {
    to: string;
    videoJobId: string;
    errorMessage: string;
    statusUrl: string;
  }): Promise<void>;

  abstract sendProcessingCompletedEmail(input: {
    to: string;
    videoJobId: string;
    originalFileName: string;
    statusUrl: string;
  }): Promise<void>;
}

export { LoggerPort as LoggerService } from '@domain/outboundPorts/LoggerPort';
