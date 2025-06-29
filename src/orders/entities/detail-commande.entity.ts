import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Commande } from './commande.entity';
import { Produit } from 'src/products/entities/produitt.entity';

@Entity('details_commande')
export class DetailCommande {
  @PrimaryGeneratedColumn()
  id_detail_commande: number;

  @Column()
  id_commande: number;

  @Column()
  id_produit: number;

  @Column({ type: 'integer' })
  quantite_commandee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix_unitaire: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix_total_ligne: number;

  // Champs additionnels pour garder une trace des infos produit au moment de la commande
  @Column({ type: 'varchar', length: 255 })
  nom_produit_commande: string; // Nom du produit au moment de la commande

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference_produit_commande?: string; // Référence au moment de la commande

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prix_unitaire_catalogue?: number; // Prix catalogue au moment de la commande

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  remise_ligne?: number; // Remise appliquée sur cette ligne

  @Column({ type: 'varchar', length: 100, nullable: true })
  notes_ligne?: string; // Notes spécifiques à cette ligne

  // Relations
  @ManyToOne(() => Commande, commande => commande.details_commande, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_commande' })
  commande: Commande;

  @ManyToOne(() => Produit, produit => produit.details_commandes)
  @JoinColumn({ name: 'id_produit' })
  produit: Produit;

  // Méthodes utilitaires
  get montant_economise(): number {
    if (!this.prix_unitaire_catalogue) return 0;
    return (this.prix_unitaire_catalogue - this.prix_unitaire) * this.quantite_commandee;
  }

  get pourcentage_remise(): number {
    if (!this.prix_unitaire_catalogue || this.prix_unitaire_catalogue === 0) return 0;
    return Math.round(((this.prix_unitaire_catalogue - this.prix_unitaire) / this.prix_unitaire_catalogue) * 100);
  }

  get prix_unitaire_final(): number {
    let prixFinal = this.prix_unitaire;
    if (this.remise_ligne) {
      prixFinal -= this.remise_ligne;
    }
    return Math.max(prixFinal, 0); // Prix ne peut pas être négatif
  }

  get prix_total_final(): number {
    return this.prix_unitaire_final * this.quantite_commandee;
  }

  // Méthode pour appliquer une remise
  appliquerRemise(montantRemise: number): void {
    this.remise_ligne = montantRemise;
    this.recalculerPrixTotal();
  }

  // Méthode pour recalculer le prix total
  recalculerPrixTotal(): void {
    this.prix_total_ligne = this.prix_total_final;
  }

  // Hooks pour recalcul automatique
  @BeforeInsert()
  @BeforeUpdate()
  calculerPrixTotal(): void {
    this.prix_total_ligne = this.prix_unitaire_final * this.quantite_commandee;
  }

  // Méthode pour obtenir le résumé de la ligne
  get resume_ligne(): string {
    let resume = `${this.quantite_commandee}x ${this.nom_produit_commande}`;
    
    if (this.pourcentage_remise > 0) {
      resume += ` (-${this.pourcentage_remise}%)`;
    }
    
    resume += ` = ${this.prix_total_ligne.toLocaleString()} FCFA`;
    
    return resume;
  }

  // Méthode pour valider la quantité
  validerQuantite(): boolean {
    return this.quantite_commandee > 0;
  }

  // Méthode pour valider les prix
  validerPrix(): boolean {
    return this.prix_unitaire >= 0 && this.prix_total_ligne >= 0;
  }

  // Méthode de validation complète
  estValide(): boolean {
    return this.validerQuantite() && this.validerPrix() && !!this.nom_produit_commande;
  }

  // Méthode pour créer depuis un produit
  static creerDepuisProduit(produit: Produit, quantite: number): Partial<DetailCommande> {
    return {
      id_produit: produit.id_produit,
      quantite_commandee: quantite,
      prix_unitaire: produit.prix_actuel,
      prix_unitaire_catalogue: produit.prix_unitaire,
      nom_produit_commande: produit.nom_produit,
      reference_produit_commande: produit.reference_produit,
      prix_total_ligne: produit.prix_actuel * quantite,
    };
  }
}