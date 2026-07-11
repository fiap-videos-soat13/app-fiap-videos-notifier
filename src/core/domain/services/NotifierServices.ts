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

export abstract class LoggerService {
  abstract log(message: string, context?: Record<string, string>): void;
  abstract error(message: string, context?: Record<string, string>): void;
}
