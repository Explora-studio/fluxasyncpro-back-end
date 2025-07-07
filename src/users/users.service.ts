import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UtilisateurFluxasync, StatutAbonnement } from './entities/utilisateur-fluxasync.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UtilisateurFluxasync)
    private usersRepository: Repository<UtilisateurFluxasync>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UtilisateurFluxasync> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { adresse_email: createUserDto.adresse_email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.mot_de_passe, 12);

    // Créer l'utilisateur
    const user = this.usersRepository.create({
      ...createUserDto,
      mot_de_passe: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<UtilisateurFluxasync[]> {
    return this.usersRepository.find({
      select: [
        'id_utilisateur',
        'nom',
        'prenom',
        'adresse_email',
        'numero_telephone',
        'pays',
        'secteur_activite',
        'nom_entreprise',
        'plan_abonnement',
        'statut_abonnement',
        'compte_verifie',
        'date_creation',
        'date_modification',
      ],
    });
  }

  async findOne(id: number): Promise<UtilisateurFluxasync> {
    const user = await this.usersRepository.findOne({
      where: { id_utilisateur: id },
      // relations: ['compte_whatsapp', 'comptes_email', 'abonnement'], // Commenté temporairement
      select: [
        'id_utilisateur',
        'nom',
        'prenom',
        'adresse_email',
        'numero_telephone',
        'pays',
        'secteur_activite',
        'nom_entreprise',
        'plan_abonnement',
        'statut_abonnement',
        'compte_verifie',
        'date_creation',
        'date_modification',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UtilisateurFluxasync> {
    const user = await this.usersRepository.findOne({
      where: { adresse_email: email },
      select: [
        'id_utilisateur',
        'nom',
        'prenom',
        'adresse_email',
        'numero_telephone',
        'pays',
        'secteur_activite',
        'nom_entreprise',
        'plan_abonnement',
        'statut_abonnement',
        'compte_verifie',
        'date_creation',
        'date_modification',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec email ${email} non trouvé`);
    }

    return user;
  }

  async findByEmailWithPassword(email: string): Promise<UtilisateurFluxasync | null> {
    return this.usersRepository.findOne({
      where: { adresse_email: email },
      select: [
        'id_utilisateur',
        'nom',
        'prenom',
        'adresse_email',
        'mot_de_passe',
        'plan_abonnement',
        'statut_abonnement',
        'compte_verifie',
      ],
    });
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.findOne(userId);

    // Version simplifiée des statistiques sans relations
    return {
      utilisateur: user,
      statistiques: {
        total_prospects: 0, // À implémenter plus tard avec les relations
        total_commandes: 0, // À implémenter plus tard avec les relations
        total_produits: 0, // À implémenter plus tard avec les relations
        chiffre_affaires_total: 0, // À implémenter plus tard avec les relations
        compte_cree_depuis: this.calculateDaysSinceCreation(user.date_creation),
        statut_compte: user.statut_abonnement,
        plan_actuel: user.plan_abonnement,
      },
    };
  }

  private calculateDaysSinceCreation(dateCreation: Date): number {
    const maintenant = new Date();
    const diffTime = Math.abs(maintenant.getTime() - dateCreation.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async verifyPassword(user: UtilisateurFluxasync, password: string): Promise<boolean> {
    if (!user.mot_de_passe) {
      return false;
    }
    return bcrypt.compare(password, user.mot_de_passe);
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      date_modification: new Date(),
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UtilisateurFluxasync> {
    const user = await this.findOne(id);

    // Si le mot de passe est fourni, le hasher
    if (updateUserDto.mot_de_passe) {
      updateUserDto.mot_de_passe = await bcrypt.hash(updateUserDto.mot_de_passe, 12);
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async validateUser(loginDto: LoginUserDto): Promise<UtilisateurFluxasync | null> {
    const user = await this.findByEmailWithPassword(loginDto.adresse_email);
    
    if (user && await this.verifyPassword(user, loginDto.mot_de_passe)) {
      return user;
    }
    
    return null;
  }

  async countUsers(): Promise<number> {
    return this.usersRepository.count();
  }

  async findActiveUsers(): Promise<UtilisateurFluxasync[]> {
    return this.usersRepository.find({
      where: { statut_abonnement: StatutAbonnement.ACTIF },
      select: [
        'id_utilisateur',
        'nom',
        'prenom',
        'adresse_email',
        'numero_telephone',
        'pays',
        'plan_abonnement',
        'date_creation',
      ],
    });
  }

  getRepository(): Repository<UtilisateurFluxasync> {
  return this.usersRepository;
}
}