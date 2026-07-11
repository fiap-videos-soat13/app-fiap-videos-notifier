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

  async sendProcessingRequestedEmail(input: {
    to: string;
    videoJobId: string;
    originalFileName: string;
    statusUrl: string;
  }): Promise<void> {
    const from =
      process.env.SMTP_FROM?.trim() || 'noreply@fiap-videos.local';

    await this.transporter.sendMail({
      from,
      to: input.to,
      subject: `[FIAP Videos] Upload recebido — processamento pendente`,
      text: [
        'Olá,',
        '',
        `Recebemos o upload do seu vídeo "${input.originalFileName}".`,
        '',
        `Status atual: pendente`,
        `Job: ${input.videoJobId}`,
        '',
        'Acompanhe o andamento do processamento no link abaixo:',
        input.statusUrl,
        '',
        'Você receberá novos e-mails quando o processamento iniciar, concluir ou falhar.',
      ].join('\n'),
    });
  }

  async sendProcessingFailedEmail(input: {
    to: string;
    videoJobId: string;
    errorMessage: string;
    statusUrl: string;
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
        `Status atual: falha`,
        `Motivo: ${input.errorMessage}`,
        '',
        'Consulte os detalhes e tente novamente no link abaixo:',
        input.statusUrl,
      ].join('\n'),
    });
  }

  async sendProcessingCompletedEmail(input: {
    to: string;
    videoJobId: string;
    originalFileName: string;
    statusUrl: string;
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
        `Seu vídeo "${input.originalFileName}" foi processado com sucesso.`,
        '',
        `Status atual: concluído`,
        `Job: ${input.videoJobId}`,
        '',
        'Acesse o link abaixo para conferir o status e baixar o arquivo ZIP com os frames:',
        input.statusUrl,
      ].join('\n'),
    });
  }
}
