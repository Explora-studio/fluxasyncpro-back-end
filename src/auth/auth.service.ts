import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { UtilisateurFluxasync } from '../users/entities/utilisateur-fluxasync.entity';

import { RegisterDto, LoginDto, VerifyOtpDto, AuthResponseDto, RegisterResponseDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UtilisateurFluxasync)
    private usersRepository: Repository<UtilisateurFluxasync>,
    private usersService: UsersService,
    private emailService: EmailService,
    private otpService: OtpService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Inscription d'un nouvel utilisateur avec envoi d'OTP
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { adresse_email: registerDto.adresse_email },
    });

    if (existingUser) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    try {
      // Créer l'utilisateur (compte non vérifié)
      const user = await this.usersService.create({
        ...registerDto,
        // Le compte sera vérifié après validation OTP
      });

      // Générer et sauvegarder l'OTP
      const otpCode = this.otpService.generateOtpCode();
      await this.otpService.saveOtpForUser(user.id_utilisateur, otpCode);

      // Envoyer l'email avec OTP
      const emailSent = await this.emailService.sendOtpVerification(
        user.adresse_email,
        user.nom_complet,
        otpCode
      );

      if (!emailSent) {
        throw new BadRequestException('Erreur lors de l\'envoi de l\'email de vérification');
      }

      return {
        message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
        user: {
          id_utilisateur: user.id_utilisateur,
          nom_complet: user.nom_complet,
          adresse_email: user.adresse_email,
        },
        otp_sent: true,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de l\'inscription');
    }
  }

  /**
   * Vérification du code OTP
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string; account_verified: boolean }> {
    const { adresse_email, otp_code } = verifyOtpDto;

    // Vérifier que l'utilisateur existe
    const user = await this.usersRepository.findOne({
      where: { adresse_email },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    // Vérifier l'OTP
    const isValidOtp = await this.otpService.verifyOtp(adresse_email, otp_code);
    
    if (!isValidOtp) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    // Marquer l'OTP comme vérifié et activer le compte
    await this.otpService.markOtpAsVerified(adresse_email);

    // Envoyer l'email de bienvenue
    await this.emailService.sendWelcomeEmail(
      user.adresse_email,
      user.nom_complet,
      user.plan_abonnement
    );

    return {
      message: 'Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.',
      account_verified: true,
    };
  }

  /**
   * Renvoyer un code OTP
   */
  async resendOtp(email: string): Promise<{ message: string; otp_sent: boolean }> {
    const user = await this.usersRepository.findOne({
      where: { adresse_email: email },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.compte_verifie && user.otp_verified) {
      throw new BadRequestException('Ce compte est déjà vérifié');
    }

    // Générer un nouveau code OTP
    const otpCode = this.otpService.generateOtpCode();
    await this.otpService.saveOtpForUser(user.id_utilisateur, otpCode);

    // Renvoyer l'email
    const emailSent = await this.emailService.resendOtp(
      user.adresse_email,
      user.nom_complet,
      otpCode
    );

    if (!emailSent) {
      throw new BadRequestException('Erreur lors de l\'envoi du nouveau code');
    }

    return {
      message: 'Nouveau code OTP envoyé avec succès',
      otp_sent: true,
    };
  }

  /**
   * Connexion avec email/password
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { adresse_email, mot_de_passe } = loginDto;

    // Trouver l'utilisateur avec son mot de passe
    const user = await this.usersRepository.findOne({
      where: { adresse_email },
      select: [
        'id_utilisateur',
        'nom',
        'prenom',
        'adresse_email',
        'mot_de_passe',
        'plan_abonnement',
        'compte_verifie',
        'otp_verified',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    // const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Email ou mot de passe incorrect');
    // }

    if (!user.mot_de_passe) {
  throw new UnauthorizedException('Email ou mot de passe incorrect');
}
const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    // Vérifier que le compte est vérifié
    if (!user.compte_verifie || !user.otp_verified) {
      throw new UnauthorizedException('Veuillez vérifier votre compte avant de vous connecter');
    }

    // Générer les tokens JWT
    const tokens = await this.generateTokens({
      sub: user.id_utilisateur,
      email: user.adresse_email,
    });

    // Sauvegarder le refresh token
    await this.saveRefreshToken(user.id_utilisateur, tokens.refresh_token);

    // Mettre à jour la dernière connexion
    await this.usersRepository.update(user.id_utilisateur, {
      last_login_at: new Date(),
    });

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id_utilisateur: user.id_utilisateur,
        nom_complet: user.nom_complet,
        adresse_email: user.adresse_email,
        plan_abonnement: user.plan_abonnement,
        compte_verifie: user.compte_verifie,
        otp_verified: user.otp_verified,
      },
      expires_in: 15 * 60, // 15 minutes en secondes
    };
  }

  /**
   * Renouveler l'access token avec le refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersRepository.findOne({
        where: { 
          id_utilisateur: payload.sub,
          refresh_token: refreshToken,
        },
        select: [
          'id_utilisateur',
          'nom',
          'prenom',
          'adresse_email',
          'plan_abonnement',
          'compte_verifie',
          'otp_verified',
        ],
      });

      if (!user) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      // Générer de nouveaux tokens
      const tokens = await this.generateTokens({
        sub: user.id_utilisateur,
        email: user.adresse_email,
      });

      // Sauvegarder le nouveau refresh token
      await this.saveRefreshToken(user.id_utilisateur, tokens.refresh_token);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id_utilisateur: user.id_utilisateur,
          nom_complet: user.nom_complet,
          adresse_email: user.adresse_email,
          plan_abonnement: user.plan_abonnement,
          compte_verifie: user.compte_verifie,
          otp_verified: user.otp_verified,
        },
        expires_in: 15 * 60,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  /**
   * Déconnexion (invalider le refresh token)
   */
  async logout(userId: number): Promise<{ message: string }> {
    await this.usersRepository.update(userId, {
      refresh_token: undefined,
    });

    return { message: 'Déconnexion réussie' };
  }

  /**
   * Générer les tokens JWT (access + refresh)
   */
  private async generateTokens(payload: JwtPayload): Promise<{ access_token: string; refresh_token: string }> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return { access_token, refresh_token };
  }

  /**
   * Sauvegarder le refresh token en base
   */
  private async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      refresh_token: hashedRefreshToken,
    });
  }
}