import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';

import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { UtilisateurFluxasync } from '../users/entities/utilisateur-fluxasync.entity';

@Module({
  imports: [
    // Modules externes
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // Configuration JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    
    // Base de données
    // TypeOrmModule.forFeature([UtilisateurFluxasync]),
    
    // Modules internes
    UsersModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    OtpService,
    JwtAuthGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}