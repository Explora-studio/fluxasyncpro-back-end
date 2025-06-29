import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint de test - Hello World' })
  @ApiResponse({
    status: 200,
    description: 'Message de bienvenue FluxAsync',
  })
  getHello(): any {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Vérification de l\'état du serveur' })
  @ApiResponse({
    status: 200,
    description: 'Statut du serveur et de la base de données',
  })
  getHealth(): any {
    return this.appService.getHealth();
  }

  @Get('version')
  @ApiOperation({ summary: 'Version de l\'API FluxAsync' })
  @ApiResponse({
    status: 200,
    description: 'Informations sur la version',
  })
  getVersion(): any {
    return this.appService.getVersion();
  }
}