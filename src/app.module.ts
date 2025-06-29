import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import des modules métier
import { UsersModule } from './users/users.module';

// Import des entités principales
import { UtilisateurFluxasync } from './users/entities/utilisateur-fluxasync.entity';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuration TypeORM avec Supabase
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: {
        rejectUnauthorized: false, // Nécessaire pour Supabase
      },
      entities: [
        UtilisateurFluxasync,
        // Autres entités à ajouter progressivement
      ],
      synchronize: false, // Utiliser les migrations en production
      logging: process.env.NODE_ENV === 'development',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10) || 100,
      },
    ]),

    // Modules métier
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ThrottlerModule } from '@nestjs/throttler';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { UtilisateurFluxasync } from './users/entities/utilisateur-fluxasync.entity';
// import { CompteWhatsapp } from './whatsapp/entities/compte-whatsapp.entity';
// import { Conversation } from './conversations/entities/conversation.entity';
// import { Message } from './messages/entities/message.entity';
// import { Commande } from './orders/entities/commande.entity';
// import { DetailCommande } from './orders/entities/detail-commande.entity';
// import { Produit } from './products/entities/produitt.entity';
// import { Prospect } from './prospects/entities/prospect.entity';
// import { UsersModule } from './users/users.module';

// // Import des modules métier
// // import { AuthModule } from 'scr/auth/auth.module';
// // import { UsersModule } from 'scr/users/users.module';
// // import { WhatsappModule } from 'scr/whatsapp/whatsapp.module';
// // import { ProspectsModule } from 'scr/prospects/prospects.module';
// // import { ConversationsModule } from 'scr/conversations/conversations.module';
// // import { MessagesModule } from 'scr/messages/messages.module';
// // import { ProductsModule } from 'scr/products/products.module';
// // import { OrdersModule } from 'scr/orders/orders.module';
// // import { DeliveriesModule } from 'scr/deliveries/deliveries.module';
// // import { EmailsModule } from 'scr/emails/emails.module';
// // import { NotificationsModule } from 'scr/notifications/notifications.module';
// // import { AnalyticsModule } from 'scr/analytics/analytics.module';
// // import { CampaignsModule } from 'scr/campaigns/campaigns.module';

// // Import des entités
// // import { UtilisateurFluxasync } from 'scr/users/entities/utilisateur-fluxasync.entity';
// // import { CompteWhatsapp } from 'scr/whatsapp/entities/compte-whatsapp.entity';
// // import { CompteEmail } from 'scr/emails/entities/compte-email.entity';
// // import { Prospect } from 'scr/prospects/entities/prospect.entity';
// // import { Conversation } from 'scr/conversations/entities/conversation.entity';
// // import { Message } from 'scr/messages/entities/message.entity';
// // import { Produit } from 'scr/products/entities/produit.entity';
// // import { Commande } from 'scr/orders/entities/commande.entity';
// // import { DetailCommande } from 'scr/orders/entities/detail-commande.entity';
// // import { Livreur } from 'scr/deliveries/entities/livreur.entity';
// // import { Livraison } from 'scr/deliveries/entities/livraison.entity';
// // import { EmailRecu } from 'scr/emails/entities/email-recu.entity';
// // import { AnalyseEmail } from 'scr/emails/entities/analyse-email.entity';
// // import { Notification } from 'scr/notifications/entities/notification.entity';
// // import { SessionAnalytique } from 'scr/analytics/entities/session-analytique.entity';
// // import { CampagneMarketing } from 'scr/campaigns/entities/campagne-marketing.entity';
// // import { MetriqueCampagne } from 'scr/campaigns/entities/metrique-campagne.entity';
// // import { JournalSysteme } from 'scr/common/entities/journal-systeme.entity';
// // import { UtilisationApi } from 'scr/common/entities/utilisation-api.entity';
// // import { Abonnement } from 'scr/subscriptions/entities/abonnement.entity';
// // import { Facture } from 'scr/subscriptions/entities/facture.entity';

// @Module({
//   imports: [
//     // Configuration globale
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: '.env',
//     }),

//     // Configuration TypeORM avec Supabase
//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: process.env.DATABASE_HOST,
//       port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
//       username: process.env.DATABASE_USERNAME,
//       password: process.env.DATABASE_PASSWORD,
//       database: process.env.DATABASE_NAME,
//       ssl: {
//         rejectUnauthorized: false, // Nécessaire pour Supabase
//       },
//       entities: [
//         UtilisateurFluxasync,
//         CompteWhatsapp,
//         // CompteEmail,
//         Prospect,
//         Conversation,
//         Message,
//         Produit,
//         Commande,
//         DetailCommande,
//         // Livreur,
//         // Livraison,
//         // EmailRecu,
//         // AnalyseEmail,
//         Notification,
//         // SessionAnalytique,
//         // CampagneMarketing,
//         // MetriqueCampagne,
//         // JournalSysteme,
//         // UtilisationApi,
//         // Abonnement,
//         // Facture,
//       ],
//       synchronize: false, // Utiliser les migrations en production
//       logging: process.env.NODE_ENV === 'development',
//     }),

//     // Rate limiting
//     ThrottlerModule.forRoot([
//       {
//         ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
//         limit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
//       },
//     ]),

//     // Modules métier
//     // AuthModule,
//     UsersModule,
//     // WhatsappModule,
//     // ProspectsModule,
//     // ConversationsModule,
//     // MessagesModule,
//     // ProductsModule,
//     // OrdersModule,
//     // DeliveriesModule,
//     // EmailsModule,
//     // NotificationsModule,
//     // AnalyticsModule,
//     // CampaignsModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}