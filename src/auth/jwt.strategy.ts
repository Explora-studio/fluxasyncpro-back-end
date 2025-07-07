import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CurrentUserData } from './decorators/current-user.decorator';

export interface JwtPayload {
  sub: number; // id_utilisateur
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
constructor(
  private configService: ConfigService,
  private usersService: UsersService,
) {
  const jwtSecret = configService.get<string>('JWT_SECRET');
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be defined in environment variables');
  }

  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: jwtSecret,
  });
}

  
  async validate(payload: JwtPayload): Promise<CurrentUserData> {
    try {
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      if (!user.compte_verifie) {
        throw new UnauthorizedException('Compte non vérifié');
      }

      if (!user.otp_verified) {
        throw new UnauthorizedException('Email non vérifié');
      }

      return {
        id_utilisateur: user.id_utilisateur,
        adresse_email: user.adresse_email,
        nom_complet: user.nom_complet,
        plan_abonnement: user.plan_abonnement,
        compte_verifie: user.compte_verifie,
        otp_verified: user.otp_verified,
      };
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}