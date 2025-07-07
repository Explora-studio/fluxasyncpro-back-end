import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  HttpStatus, 
  HttpCode,
  UseGuards,
  Req
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './jwt.guard';

import { 
  RegisterDto, 
  LoginDto, 
  VerifyOtpDto, 
  ResendOtpDto, 
  RefreshTokenDto,
  AuthResponseDto,
  RegisterResponseDto 
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard) // Protection contre les attaques par force brute
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Inscription d\'un nouvel utilisateur',
    description: 'Crée un compte utilisateur et envoie un code OTP par email pour la vérification'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Utilisateur créé avec succès, OTP envoyé par email',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un compte avec cet email existe déjà',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides ou erreur lors de l\'envoi de l\'email',
  })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Vérifier le code OTP',
    description: 'Valide le code OTP reçu par email et active le compte utilisateur'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Code OTP vérifié avec succès, compte activé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Code OTP invalide, expiré ou utilisateur non trouvé',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{ message: string; account_verified: boolean }> {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Renvoyer un code OTP',
    description: 'Génère et envoie un nouveau code OTP si le précédent a expiré'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nouveau code OTP envoyé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Utilisateur non trouvé ou compte déjà vérifié',
  })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto): Promise<{ message: string; otp_sent: boolean }> {
    return this.authService.resendOtp(resendOtpDto.adresse_email);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Connexion utilisateur',
    description: 'Authentifie un utilisateur et retourne les tokens JWT'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion réussie, tokens JWT générés',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Email/mot de passe incorrect ou compte non vérifié',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Renouveler l\'access token',
    description: 'Utilise le refresh token pour générer un nouvel access token'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens renouvelés avec succès',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token invalide ou expiré',
  })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Déconnexion utilisateur',
    description: 'Invalide le refresh token de l\'utilisateur connecté'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Déconnexion réussie',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token d\'accès invalide',
  })
  @ApiBearerAuth('JWT-auth')
  async logout(@CurrentUser() currentUser: CurrentUserData): Promise<{ message: string }> {
    return this.authService.logout(currentUser.id_utilisateur);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ 
    summary: 'Profil utilisateur connecté',
    description: 'Retourne les informations de l\'utilisateur actuellement connecté'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Informations utilisateur récupérées',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token d\'accès invalide',
  })
  @ApiBearerAuth('JWT-auth')
  async getProfile(@CurrentUser() currentUser: CurrentUserData) {
    // Récupérer les informations complètes de l'utilisateur
    const user = await this.usersService.findOne(currentUser.id_utilisateur);
    
    return {
      user: {
        id_utilisateur: user.id_utilisateur,
        nom_complet: user.nom_complet,
        nom: user.nom,
        prenom: user.prenom,
        adresse_email: user.adresse_email,
        numero_telephone: user.numero_telephone,
        pays: user.pays,
        secteur_activite: user.secteur_activite,
        nom_entreprise: user.nom_entreprise,
        plan_abonnement: user.plan_abonnement,
        statut_abonnement: user.statut_abonnement,
        compte_verifie: user.compte_verifie,
        otp_verified: user.otp_verified,
        date_creation: user.date_creation,
        last_login_at: user.last_login_at,
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Dashboard utilisateur',
    description: 'Retourne les statistiques et informations du tableau de bord personnel'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Données du dashboard récupérées',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token d\'accès invalide',
  })
  @ApiBearerAuth('JWT-auth')
  async getDashboard(@CurrentUser() currentUser: CurrentUserData) {
    // Récupérer les statistiques utilisateur
    const userStats = await this.usersService.getUserStats(currentUser.id_utilisateur);
    
    return {
      message: `Bienvenue ${currentUser.nom_complet} !`,
      dashboard: {
        utilisateur: userStats.utilisateur,
        statistiques: userStats.statistiques,
        actions_rapides: [
          {
            titre: 'Créer une campagne',
            description: 'Lancez votre première campagne marketing',
            url: '/campaigns/create',
            icon: '📧'
          },
          {
            titre: 'Gérer les contacts',
            description: 'Importez et organisez vos contacts',
            url: '/contacts',
            icon: '👥'
          },
          {
            titre: 'Configurer WhatsApp',
            description: 'Connectez votre compte WhatsApp Business',
            url: '/whatsapp/setup',
            icon: '💬'
          },
          {
            titre: 'Voir les analytics',
            description: 'Analysez vos performances',
            url: '/analytics',
            icon: '📊'
          }
        ],
        notifications: [
          {
            type: 'success',
            message: 'Votre compte est maintenant vérifié et actif !',
            timestamp: new Date().toISOString()
          }
        ]
      }
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ 
    summary: 'Vérification santé du service auth',
    description: 'Endpoint pour vérifier que le service d\'authentification fonctionne'
  })
  async healthCheck() {
    return {
      status: 'OK',
      service: 'Authentication Service',
      timestamp: new Date().toISOString(),
      endpoints: {
        register: 'POST /auth/register',
        verify_otp: 'POST /auth/verify-otp',
        login: 'POST /auth/login',
        refresh: 'POST /auth/refresh',
        logout: 'POST /auth/logout',
        profile: 'GET /auth/me',
        dashboard: 'GET /auth/dashboard'
      }
    };
  }
}

