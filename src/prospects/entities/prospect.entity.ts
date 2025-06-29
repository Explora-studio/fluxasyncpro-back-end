import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UtilisateurFluxasync } from '../../users/entities/utilisateur-fluxasync.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Commande } from 'src/orders/entities/commande.entity';

export enum SourceAcquisition {
  PUB_FACEBOOK = 'pub_facebook',
  PUB_INSTAGRAM = 'pub_instagram',
  PUB_WHATSAPP = 'pub_whatsapp',
  DIRECT = 'direct',
  RECOMMANDATION = 'recommandation',
}

export enum StatutProspect {
  PROSPECT = 'prospect',
  QUALIFIE = 'qualifie',
  CLIENT = 'client',
  INACTIF = 'inactif',
}

@Entity('prospects')
export class Prospect {
  @PrimaryGeneratedColumn()
  id_prospect: number;

  @Column()
  id_utilisateur: number;

  @Column({ type: 'varchar', length: 20 })
  numero_telephone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nom_complet?: string;

  @Column({
    type: 'enum',
    enum: SourceAcquisition,
    default: SourceAcquisition.DIRECT,
  })
  source_acquisition: SourceAcquisition;

  @Column({
    type: 'enum',
    enum: StatutProspect,
    default: StatutProspect.PROSPECT,
  })
  statut_prospect: StatutProspect;

  @Column({ type: 'varchar', length: 255, nullable: true })
  localisation?: string;

  @Column({ type: 'text', nullable: true })
  notes_personnelles?: string;

  @CreateDateColumn()
  date_premier_contact: Date;

  @UpdateDateColumn()
  derniere_activite: Date;

  @Column({ type: 'integer', default: 0 })
  nombre_commandes_total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montant_depense_total: number;

  // // Relations
  // @ManyToOne(() => UtilisateurFluxasync, utilisateur => utilisateur.prospects)
  // @JoinColumn({ name: 'id_utilisateur' })
  // utilisateur: UtilisateurFluxasync;

  @OneToMany(() => Conversation, conversation => conversation.prospect)
  conversations: Conversation[];

  @OneToMany(() => Commande, commande => commande.prospect)
  commandes: Commande[];

  // Méthodes utilitaires
  get est_client(): boolean {
    return this.statut_prospect === StatutProspect.CLIENT || this.nombre_commandes_total > 0;
  }

  get valeur_vie_client(): number {
    return this.montant_depense_total;
  }

  get nom_affichage(): string {
    return this.nom_complet || this.numero_telephone;
  }

  // Méthode pour calculer le score de qualification
  get score_qualification(): number {
    let score = 0;
    
    // Points basés sur l'activité
    if (this.nombre_commandes_total > 0) score += 30;
    if (this.montant_depense_total > 0) score += 20;
    if (this.nom_complet) score += 10;
    if (this.localisation) score += 5;
    
    // Points basés sur la source
    switch (this.source_acquisition) {
      case SourceAcquisition.PUB_FACEBOOK:
      case SourceAcquisition.PUB_INSTAGRAM:
        score += 15;
        break;
      case SourceAcquisition.RECOMMANDATION:
        score += 25;
        break;
      default:
        score += 5;
    }

    return Math.min(score, 100);
  }
}