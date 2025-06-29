import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
  BeforeInsert,
} from 'typeorm';
import { UtilisateurFluxasync } from '../../users/entities/utilisateur-fluxasync.entity';
import { Prospect } from '../../prospects/entities/prospect.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { DetailCommande } from './detail-commande.entity';

export enum StatutCommande {
  EN_ATTENTE = 'en_attente',
  CONFIRMEE = 'confirmee',
  EN_PREPARATION = 'en_preparation',
  EXPEDIEE = 'expediee',
  LIVREE = 'livree',
  ANNULEE = 'annulee',
  ECHEC = 'echec',
}

export enum MethodePaiement {
  PAIEMENT_LIVRAISON = 'paiement_livraison',
  ORANGE_MONEY = 'orange_money',
  MTN_MONEY = 'mtn_money',
  WAVE = 'wave',
  VIREMENT_BANCAIRE = 'virement_bancaire',
}

export enum StatutPaiement {
  EN_ATTENTE = 'en_attente',
  PAYE = 'paye',
  ECHEC = 'echec',
  REMBOURSE = 'rembourse',
}

@Entity('commandes')
export class Commande {
  @PrimaryGeneratedColumn()
  id_commande: number;

  @Column()
  id_prospect: number;

  @Column()
  id_utilisateur: number;

  @Column({ nullable: true })
  id_conversation?: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero_commande: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montant_total: number;

  @Column({ type: 'text' })
  adresse_livraison: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telephone_livraison?: string;

  @Column({
    type: 'enum',
    enum: StatutCommande,
    default: StatutCommande.EN_ATTENTE,
  })
  statut_commande: StatutCommande;

  @Column({
    type: 'enum',
    enum: MethodePaiement,
    default: MethodePaiement.PAIEMENT_LIVRAISON,
  })
  methode_paiement: MethodePaiement;

  @Column({
    type: 'enum',
    enum: StatutPaiement,
    default: StatutPaiement.EN_ATTENTE,
  })
  statut_paiement: StatutPaiement;

  @Column({ type: 'text', nullable: true })
  notes_commande?: string;

  @CreateDateColumn()
  date_creation: Date;

  @Column({ type: 'timestamp', nullable: true })
  date_confirmation?: Date;

  @Column({ type: 'timestamp', nullable: true })
  date_livraison?: Date;

  // Champs additionnels
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  frais_livraison: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  remise_appliquee: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  instructions_speciales?: string;

  @Column({ type: 'timestamp', nullable: true })
  date_livraison_souhaitee?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  code_promo?: string;

  @Column({ type: 'boolean', default: false })
  livraison_urgente: boolean;

  // Relations
  @ManyToOne(() => Prospect, prospect => prospect.commandes)
  @JoinColumn({ name: 'id_prospect' })
  prospect: Prospect;

  // @ManyToOne(() => UtilisateurFluxasync, utilisateur => utilisateur.commandes)
  // @JoinColumn({ name: 'id_utilisateur' })
  // utilisateur: UtilisateurFluxasync;

  @ManyToOne(() => Conversation, conversation => conversation.commandes, { nullable: true })
  @JoinColumn({ name: 'id_conversation' })
  conversation?: Conversation;

  @OneToMany(() => DetailCommande, detailCommande => detailCommande.commande, { cascade: true })
  details_commande: DetailCommande[];

  // @OneToOne(() => Livraison, livraison => livraison.commande)
  // livraison: Livraison;

  // Méthodes utilitaires
  get montant_avec_frais(): number {
    return this.montant_total + this.frais_livraison - this.remise_appliquee;
  }

  get est_confirmee(): boolean {
    return this.statut_commande !== StatutCommande.EN_ATTENTE && this.statut_commande !== StatutCommande.ANNULEE;
  }

  get est_livree(): boolean {
    return this.statut_commande === StatutCommande.LIVREE;
  }

  get est_annulee(): boolean {
    return this.statut_commande === StatutCommande.ANNULEE;
  }

  get peut_etre_annulee(): boolean {
    return [StatutCommande.EN_ATTENTE, StatutCommande.CONFIRMEE].includes(this.statut_commande);
  }

  get duree_traitement(): number | null {
    if (!this.date_confirmation) return null;
    
    const dateFin = this.date_livraison || new Date();
    return Math.floor((dateFin.getTime() - this.date_confirmation.getTime()) / (1000 * 60 * 60 * 24)); // en jours
  }

  get statut_affichage(): string {
    const statutsAffichage = {
      [StatutCommande.EN_ATTENTE]: 'En attente de confirmation',
      [StatutCommande.CONFIRMEE]: 'Confirmée',
      [StatutCommande.EN_PREPARATION]: 'En préparation',
      [StatutCommande.EXPEDIEE]: 'Expédiée',
      [StatutCommande.LIVREE]: 'Livrée',
      [StatutCommande.ANNULEE]: 'Annulée',
      [StatutCommande.ECHEC]: 'Échec de livraison',
    };
    
    return statutsAffichage[this.statut_commande];
  }

  // Méthodes de gestion du statut
  confirmer(): void {
    if (this.statut_commande === StatutCommande.EN_ATTENTE) {
      this.statut_commande = StatutCommande.CONFIRMEE;
      this.date_confirmation = new Date();
    }
  }

  marquerEnPreparation(): void {
    if (this.statut_commande === StatutCommande.CONFIRMEE) {
      this.statut_commande = StatutCommande.EN_PREPARATION;
    }
  }

  expedier(): void {
    if (this.statut_commande === StatutCommande.EN_PREPARATION) {
      this.statut_commande = StatutCommande.EXPEDIEE;
    }
  }

  marquerLivree(): void {
    if ([StatutCommande.EXPEDIEE, StatutCommande.EN_PREPARATION].includes(this.statut_commande)) {
      this.statut_commande = StatutCommande.LIVREE;
      this.date_livraison = new Date();
      this.statut_paiement = StatutPaiement.PAYE; // Si paiement à la livraison
    }
  }

  annuler(): void {
    if (this.peut_etre_annulee) {
      this.statut_commande = StatutCommande.ANNULEE;
    }
  }

  // Méthode pour calculer le total depuis les détails
  calculerMontantTotal(): number {
    if (!this.details_commande || this.details_commande.length === 0) {
      return 0;
    }
    
    return this.details_commande.reduce((total, detail) => total + detail.prix_total_ligne, 0);
  }

  // Génération automatique du numéro de commande
  @BeforeInsert()
  genererNumeroCommande(): void {
    if (!this.numero_commande) {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = Date.now().toString().slice(-6);
      this.numero_commande = `CMD-${dateStr}-${timeStr}`;
    }
  }

  // Méthode pour obtenir un résumé de la commande
  get resume_commande(): string {
    const nombreArticles = this.details_commande?.length || 0;
    return `${this.numero_commande} - ${nombreArticles} article(s) - ${this.montant_avec_frais.toLocaleString()} FCFA`;
  }
}