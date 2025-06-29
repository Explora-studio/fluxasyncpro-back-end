import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UtilisateurFluxasync } from './entities/utilisateur-fluxasync.entity';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau utilisateur FluxAsync' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Utilisateur créé avec succès',
    type: UtilisateurFluxasync,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email déjà utilisé',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UtilisateurFluxasync> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des utilisateurs récupérée',
    type: [UtilisateurFluxasync],
  })
  @ApiBearerAuth('JWT-auth')
  async findAll(): Promise<UtilisateurFluxasync[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur trouvé',
    type: UtilisateurFluxasync,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string): Promise<UtilisateurFluxasync> {
    return this.usersService.findOne(+id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Récupérer un utilisateur par email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur trouvé',
    type: UtilisateurFluxasync,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  async findByEmail(@Param('email') email: string): Promise<UtilisateurFluxasync> {
    return this.usersService.findByEmail(email);
  }

  @Get('stats/:id')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un utilisateur' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques utilisateur',
  })
  @ApiBearerAuth('JWT-auth')
  async getUserStats(@Param('id') id: string): Promise<any> {
    return this.usersService.getUserStats(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur mis à jour avec succès',
    type: UtilisateurFluxasync,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UtilisateurFluxasync> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Utilisateur supprimé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(+id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Valider les identifiants de connexion' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Identifiants valides',
    type: UtilisateurFluxasync,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Identifiants invalides',
  })
  async validateUser(@Body() loginDto: LoginUserDto): Promise<any> {
    const user = await this.usersService.validateUser(loginDto);
    
    if (!user) {
      return { valid: false, message: 'Identifiants invalides' };
    }

    return { 
      valid: true, 
      user: {
        id_utilisateur: user.id_utilisateur,
        nom_complet: user.nom_complet,
        adresse_email: user.adresse_email,
        plan_abonnement: user.plan_abonnement,
      }
    };
  }

  @Get('active/list')
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs actifs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des utilisateurs actifs',
    type: [UtilisateurFluxasync],
  })
  async findActiveUsers(): Promise<UtilisateurFluxasync[]> {
    return this.usersService.findActiveUsers();
  }

  @Get('count/total')
  @ApiOperation({ summary: 'Compter le nombre total d\'utilisateurs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nombre total d\'utilisateurs',
  })
  async countUsers(): Promise<{ total: number }> {
    const total = await this.usersService.countUsers();
    return { total };
  }
}