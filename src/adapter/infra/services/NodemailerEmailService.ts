import nodemailer from 'nodemailer';
import { EmailService } from '@domain/services/NotifierServices';

export class NodemailerEmailService extends EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    super();
    const host = process.env.SMTP_HOST?.trim() || 'localhost';
    const port = Number(process.env.SMTP_PORT) || 1025;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });
  }

  async sendProcessingFailedEmail(input: {
    to: string;
    videoJobId: string;
    errorMessage: string;
  }): Promise<void> {
    const from =
      process.env.SMTP_FROM?.trim() || 'noreply@fiap-videos.local';

    await this.transporter.sendMail({
      from,
      to: input.to,
      subject: `[FIAP Videos] Falha no processamento do vídeo`,
      text: [
        'Olá,',
        '',
        `O processamento do seu vídeo (job ${input.videoJobId}) falhou.`,
        '',
        `Motivo: ${input.errorMessage}`,
        '',
        'Acesse o portal para tentar novamente.',
      ].join('\n'),
    });
  }

  async sendProcessingCompletedEmail(input: {
    to: string;
    videoJobId: string;
    originalFileName: string;
  }): Promise<void> {
    const from =
      process.env.SMTP_FROM?.trim() || 'noreply@fiap-videos.local';

    await this.transporter.sendMail({
      from,
      to: input.to,
      subject: `[FIAP Videos] Vídeo processado com sucesso`,
      text: [
        'Olá,',
        '',
        `Seu vídeo "${input.originalFileName}" foi processado.`,
        '',
        `Job: ${input.videoJobId}`,
        '',
        'Acesse o portal para baixar o arquivo ZIP com os frames.',
      ].join('\n'),
    });
  }
}
