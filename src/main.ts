import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS pour le frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuration Swagger pour documentation API
  const config = new DocumentBuilder()
    .setTitle('FluxAsync API')
    .setDescription('API de la plateforme FluxAsync - Automatisation WhatsApp Business et Email intelligent')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT pour authentification',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentification et autorisation')
    .addTag('users', 'Gestion des utilisateurs FluxAsync')
    .addTag('whatsapp', 'Intégration WhatsApp Business')
    .addTag('prospects', 'Gestion des prospects')
    .addTag('conversations', 'Gestion des conversations')
    .addTag('messages', 'Gestion des messages')
    .addTag('products', 'Catalogue de produits')
    .addTag('orders', 'Gestion des commandes')
    .addTag('deliveries', 'Gestion des livraisons')
    .addTag('emails', 'Automatisation email intelligente')
    .addTag('notifications', 'Système de notifications')
    .addTag('analytics', 'Analytics et métriques')
    .addTag('campaigns', 'Gestion des campagnes marketing')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Préfixe global pour toutes les routes API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 FluxAsync Backend démarré sur le port ${port}`);
  console.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api`);
}

bootstrap();