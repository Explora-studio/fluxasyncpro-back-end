import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { JwtAuthGuard } from './auth/jwt.guard';
import { UtilisateurFluxasync } from './users/entities/utilisateur-fluxasync.entity';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuration de la base de données
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [UtilisateurFluxasync],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),

    // Rate limiting (protection contre les attaques)
    ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    throttlers: [
      {
        ttl: (configService.get<number>('THROTTLE_TTL') || 60) * 1000, // Conversion en millisecondes
        limit: configService.get<number>('THROTTLE_LIMIT') || 100,
      },
    ],
  }),
  inject: [ConfigService],
}),

    // Modules de l'application
    UsersModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard JWT global (toutes les routes sont protégées sauf celles marquées @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
