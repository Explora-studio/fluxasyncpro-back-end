import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { UtilisateurFluxasync } from '../users/entities/utilisateur-fluxasync.entity';

@Injectable()
export class OtpService {
  private usersRepository: Repository<UtilisateurFluxasync>;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.usersRepository = this.usersService.getRepository();
  }

  /**
   * Génère un code OTP aléatoire à 6 chiffres
   */
  generateOtpCode(): string {
    const length = this.configService.get<number>('OTP_LENGTH', 6);
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    
    return otp;
  }

  /**
   * Calcule la date d'expiration de l'OTP
   */
  calculateOtpExpiration(): Date {
    const expirationMinutes = this.configService.get<number>('OTP_EXPIRATION_MINUTES', 10);
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + expirationMinutes);
    return expiration;
  }

  /**
   * Sauvegarde l'OTP pour un utilisateur
   */
  async saveOtpForUser(userId: number, otpCode: string): Promise<void> {
    const expirationDate = this.calculateOtpExpiration();
    
    await this.usersRepository.update(userId, {
      otp_code: otpCode,
      otp_expires_at: expirationDate,
      otp_verified: false,
    });
  }

  /**
   * Vérifie si un OTP est valide pour un utilisateur
   */
  async verifyOtp(email: string, otpCode: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { adresse_email: email },
      select: ['id_utilisateur', 'otp_code', 'otp_expires_at', 'otp_verified'],
    });

    if (!user || !user.otp_code || !user.otp_expires_at) {
      return false;
    }

    // Vérifier si l'OTP a expiré
    if (new Date() > user.otp_expires_at) {
      return false;
    }

    // Vérifier si le code correspond
    if (user.otp_code !== otpCode) {
      return false;
    }

    return true;
  }

  /**
   * Marque l'OTP comme vérifié et active le compte
   */
  async markOtpAsVerified(email: string): Promise<void> {
    await this.usersRepository.update(
      { adresse_email: email },
      {
        otp_verified: true,
        compte_verifie: true,
        otp_code: undefined,
        otp_expires_at: undefined,
      }
    );
  }

  
  /**
   * Supprime l'OTP d'un utilisateur (nettoyage)
   */
  async clearOtp(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      otp_code: undefined,
      otp_expires_at: undefined,
    });
  }

  /**
   * Vérifie si un utilisateur a un OTP expiré
   */
  async hasExpiredOtp(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { adresse_email: email },
      select: ['otp_expires_at'],
    });

    if (!user || !user.otp_expires_at) {
      return false;
    }

    return new Date() > user.otp_expires_at;
  }
}