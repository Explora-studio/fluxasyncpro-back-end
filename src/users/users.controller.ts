import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, HttpCode, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UtilisateurFluxasync } from './entities/utilisateur-fluxasync.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ 
    summary: 'Créer un nouveau utilisateur FluxAsync (DEPRECATED)',
    description: 'Utilisez /auth/register à la place'
  })
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs (Admin seulement)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des utilisateurs récupérée',
    type: [UtilisateurFluxasync],
  })
  @ApiBearerAuth('JWT-auth')
  async findAll(@CurrentUser() currentUser: CurrentUserData): Promise<UtilisateurFluxasync[]> {
    // TODO: Ajouter vérification des permissions admin
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès non autorisé',
  })
  @ApiBearerAuth('JWT-auth')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<UtilisateurFluxasync> {
    const userId = +id;
    
    // Vérifier que l'utilisateur peut accéder à ces données
    if (currentUser.id_utilisateur !== userId) {
      throw new ForbiddenException('Vous ne pouvez accéder qu\'à vos propres données');
    }
    
    return this.usersService.findOne(userId);
  }

  @Public()
  @Get('email/:email')
  @ApiOperation({ summary: 'Récupérer un utilisateur par email (Public pour reset password)' })
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un utilisateur' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques utilisateur',
  })
  @ApiBearerAuth('JWT-auth')
  async getUserStats(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    const userId = +id;
    
    // Vérifier que l'utilisateur peut accéder à ces statistiques
    if (currentUser.id_utilisateur !== userId) {
      throw new ForbiddenException('Vous ne pouvez accéder qu\'à vos propres statistiques');
    }
    
    return this.usersService.getUserStats(userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
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
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès non autorisé',
  })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<UtilisateurFluxasync> {
    const userId = +id;
    
    // Vérifier que l'utilisateur peut modifier ces données
    if (currentUser.id_utilisateur !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres données');
    }
    
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Utilisateur supprimé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès non autorisé',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  async delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<void> {
    const userId = +id;
    
    // Vérifier que l'utilisateur peut supprimer son compte
    if (currentUser.id_utilisateur !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que votre propre compte');
    }
    
    return this.usersService.delete(userId);
  }

  @Public()
  @Post('validate')
  @ApiOperation({ 
    summary: 'Valider les identifiants de connexion (DEPRECATED)',
    description: 'Utilisez /auth/login à la place'
  })
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

  @Public()
  @Get('active/list')
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs actifs (Public pour stats)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des utilisateurs actifs',
    type: [UtilisateurFluxasync],
  })
  async findActiveUsers(): Promise<UtilisateurFluxasync[]> {
    return this.usersService.findActiveUsers();
  }

  @Public()
  @Get('count/total')
  @ApiOperation({ summary: 'Compter le nombre total d\'utilisateurs (Public pour stats)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nombre total d\'utilisateurs',
  })
  async countUsers(): Promise<{ total: number }> {
    const total = await this.usersService.countUsers();
    return { total };
  }
}
