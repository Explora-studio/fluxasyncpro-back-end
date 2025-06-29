import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum PlanAbonnement {
  GRATUIT = 'gratuit',
  PRO = 'pro',
  ENTREPRISE = 'entreprise',
}

export enum StatutAbonnement {
  ACTIF = 'actif',
  INACTIF = 'inactif',
  SUSPENDU = 'suspendu',
}

@Entity('utilisateurs_fluxasync')
export class UtilisateurFluxasync {
  @PrimaryGeneratedColumn()
  id_utilisateur: number;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  prenom: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  adresse_email: string;

  @Column({ type: 'varchar', length: 20 })
  numero_telephone: string;

  @Column({ type: 'varchar', length: 100 })
  pays: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secteur_activite?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nom_entreprise?: string;

  @Column({
    type: 'enum',
    enum: PlanAbonnement,
    default: PlanAbonnement.GRATUIT,
  })
  plan_abonnement: PlanAbonnement;

  @Column({
    type: 'enum',
    enum: StatutAbonnement,
    default: StatutAbonnement.ACTIF,
  })
  statut_abonnement: StatutAbonnement;

  @Column({ type: 'boolean', default: false })
  compte_verifie: boolean;

  @Column({ type: 'text', nullable: true, select: false })
  @Exclude() // Exclure le mot de passe des réponses API
  mot_de_passe?: string;

  @CreateDateColumn()
  date_creation: Date;

  @UpdateDateColumn()
  date_modification: Date;

  // Méthodes utilitaires (sans relations pour le moment)
  get nom_complet(): string {
    return `${this.prenom} ${this.nom}`;
  }

  get est_premium(): boolean {
    return this.plan_abonnement !== PlanAbonnement.GRATUIT;
  }
}