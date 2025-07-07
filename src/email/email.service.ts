import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Envoie un email avec code OTP de vérification
   */
  async sendOtpVerification(
    email: string,
    name: string,
    otpCode: string
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '🔐 Vérifiez votre compte FluxAsync',
        template: './otp-verification',
        context: {
          name,
          otpCode,
          expirationMinutes: this.configService.get('OTP_EXPIRATION_MINUTES', 10),
        },
      });

      this.logger.log(`OTP envoyé avec succès à ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'OTP à ${email}:`, error);
      return false;
    }
  }

  /**
   * Envoie un email de bienvenue après vérification
   */
  async sendWelcomeEmail(
    email: string,
    name: string,
    planAbonnement: string
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '🎉 Bienvenue sur FluxAsync !',
        template: './welcome',
        context: {
          name,
          planAbonnement,
          dashboardUrl: `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/dashboard`,
        },
      });

      this.logger.log(`Email de bienvenue envoyé à ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de bienvenue à ${email}:`, error);
      return false;
    }
  }

  /**
   * Envoie un nouvel OTP (renvoyer le code)
   */
  async resendOtp(
    email: string,
    name: string,
    otpCode: string
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '🔄 Nouveau code de vérification FluxAsync',
        template: './otp-verification',
        context: {
          name,
          otpCode,
          expirationMinutes: this.configService.get('OTP_EXPIRATION_MINUTES', 10),
          isResend: true,
        },
      });

      this.logger.log(`Nouvel OTP envoyé à ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors du renvoi de l'OTP à ${email}:`, error);
      return false;
    }
  }

  /**
   * Teste la configuration email
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: this.configService.get('MAIL_USER'),
        subject: '✅ Test de configuration FluxAsync',
        text: 'La configuration email fonctionne correctement !',
      });

      this.logger.log('Test email envoyé avec succès');
      return true;
    } catch (error) {
      this.logger.error('Erreur de configuration email:', error);
      return false;
    }
  }
}