import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Endpoint de test - Hello World' })
  @ApiResponse({
    status: 200,
    description: 'Message de bienvenue FluxAsync',
  })
  getHello(): any {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Vérification de l\'état du serveur' })
  @ApiResponse({
    status: 200,
    description: 'Statut du serveur et de la base de données',
  })
  getHealth(): any {
    return this.appService.getHealth();
  }

  @Public()
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