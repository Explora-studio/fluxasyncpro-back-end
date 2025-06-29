import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  getHello(): any {
    return {
      message: '🚀 Bienvenue sur FluxAsync API !',
      description: 'Plateforme d\'automatisation WhatsApp Business et Email intelligent',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      endpoints: {
        documentation: '/api',
        users: '/api/v1/users',
        health: '/api/v1/health',
      },
    };
  }

  async getHealth(): Promise<any> {
    let dbStatus = 'disconnected';
    let dbMessage = 'Base de données inaccessible';

    try {
      // Test de la connexion à la base de données
      await this.dataSource.query('SELECT 1');
      dbStatus = 'connected';
      dbMessage = 'Connexion Supabase PostgreSQL active';
    } catch (error) {
      dbMessage = `Erreur de connexion: ${error.message}`;
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        message: dbMessage,
        type: 'PostgreSQL',
        provider: 'Supabase',
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
      },
    };
  }

  getVersion(): any {
    return {
      name: 'FluxAsync Backend API',
      version: '1.0.0',
      description: 'API de la plateforme FluxAsync',
      author: 'Explora Studio',
      framework: 'NestJS',
      database: 'PostgreSQL (Supabase)',
      features: [
        'Gestion utilisateurs',
        'Intégration WhatsApp Business',
        'IA Gemini pour automatisation',
        'Analyse email intelligente',
        'Système de livraisons',
        'Analytics en temps réel',
      ],
      endpoints_count: 15,
      build_date: new Date().toISOString(),
    };
  }
}