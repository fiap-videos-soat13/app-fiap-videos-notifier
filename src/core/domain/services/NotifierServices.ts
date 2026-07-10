export abstract class EmailService {
  abstract sendProcessingFailedEmail(input: {
    to: string;
    videoJobId: string;
    errorMessage: string;
  }): Promise<void>;

  abstract sendProcessingCompletedEmail(input: {
    to: string;
    videoJobId: string;
    originalFileName: string;
  }): Promise<void>;
}

export abstract class LoggerService {
  abstract log(message: string, context?: Record<string, string>): void;
  abstract error(message: string, context?: Record<string, string>): void;
}
