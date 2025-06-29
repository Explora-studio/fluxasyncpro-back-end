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
import { DetailCommande } from 'src/orders/entities/detail-commande.entity';

@Entity('produits')
export class Produit {
  @PrimaryGeneratedColumn()
  id_produit: number;

  @Column()
  id_utilisateur: number;

  @Column({ type: 'varchar', length: 255 })
  nom_produit: string;

  @Column({ type: 'text', nullable: true })
  description_produit?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix_unitaire: number;

  @Column({ type: 'integer', default: 0 })
  quantite_stock: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categorie_produit?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference_produit?: string;

  @Column({ type: 'text', nullable: true })
  urls_images?: string; // JSON array d'URLs d'images

  @Column({ type: 'boolean', default: true })
  produit_actif: boolean;

  @CreateDateColumn()
  date_creation: Date;

  @UpdateDateColumn()
  date_modification: Date;

  // Champs additionnels pour améliorer la gestion
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prix_promotion?: number;

  @Column({ type: 'timestamp', nullable: true })
  date_debut_promotion?: Date;

  @Column({ type: 'timestamp', nullable: true })
  date_fin_promotion?: Date;

  @Column({ type: 'integer', default: 0 })
  seuil_alerte_stock: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unite_mesure?: string; // kg, pièce, mètre, etc.

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  poids?: number; // en kg

  @Column({ type: 'text', nullable: true })
  mots_cles?: string; // Pour recherche et IA

  @Column({ type: 'integer', default: 0 })
  nombre_ventes_total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  chiffre_affaires_total: number;

  // // Relations
  // @ManyToOne(() => UtilisateurFluxasync, utilisateur => utilisateur.produits)
  // @JoinColumn({ name: 'id_utilisateur' })
  // utilisateur: UtilisateurFluxasync;

  @OneToMany(() => DetailCommande, detailCommande => detailCommande.produit)
  details_commandes: DetailCommande[];

  // Méthodes utilitaires
  get est_en_stock(): boolean {
    return this.quantite_stock > 0;
  }

  get stock_critique(): boolean {
    return this.quantite_stock <= this.seuil_alerte_stock;
  }

  get prix_actuel(): number {
    if (this.est_en_promotion) {
      return this.prix_promotion || this.prix_unitaire;
    }
    return this.prix_unitaire;
  }

  get est_en_promotion(): boolean {
    if (!this.prix_promotion || !this.date_debut_promotion || !this.date_fin_promotion) {
      return false;
    }

    const maintenant = new Date();
    return maintenant >= this.date_debut_promotion && maintenant <= this.date_fin_promotion;
  }

  get pourcentage_reduction(): number {
    if (!this.est_en_promotion || !this.prix_promotion) return 0;
    
    return Math.round(((this.prix_unitaire - this.prix_promotion) / this.prix_unitaire) * 100);
  }

  get images(): string[] {
    if (!this.urls_images) return [];
    
    try {
      return JSON.parse(this.urls_images);
    } catch {
      return [];
    }
  }

  get image_principale(): string | null {
    const images = this.images;
    return images.length > 0 ? images[0] : null;
  }

  get mots_cles_array(): string[] {
    if (!this.mots_cles) return [];
    return this.mots_cles.split(',').map(mot => mot.trim());
  }

  // Méthodes de gestion du stock
  reduireStock(quantite: number): boolean {
    if (this.quantite_stock >= quantite) {
      this.quantite_stock -= quantite;
      return true;
    }
    return false;
  }

  augmenterStock(quantite: number): void {
    this.quantite_stock += quantite;
  }

  // Méthode pour ajouter une vente
  enregistrerVente(quantite: number, montant: number): void {
    this.nombre_ventes_total += quantite;
    this.chiffre_affaires_total += montant;
  }

  // Méthode pour définir une promotion
  definirPromotion(prixPromo: number, dateDebut: Date, dateFin: Date): void {
    this.prix_promotion = prixPromo;
    this.date_debut_promotion = dateDebut;
    this.date_fin_promotion = dateFin;
  }

  // Méthode pour annuler une promotion
  annulerPromotion(): void {
    this.prix_promotion = undefined;
    this.date_debut_promotion = undefined;
    this.date_fin_promotion = undefined;
  }

  // Méthode pour obtenir le nom formaté pour l'IA
  get description_pour_ia(): string {
    let description = `${this.nom_produit}`;
    
    if (this.description_produit) {
      description += ` - ${this.description_produit}`;
    }
    
    description += ` - Prix: ${this.prix_actuel.toLocaleString()} FCFA`;
    
    if (this.categorie_produit) {
      description += ` - Catégorie: ${this.categorie_produit}`;
    }
    
    if (this.est_en_stock) {
      description += ` - En stock (${this.quantite_stock})`;
    } else {
      description += ` - Rupture de stock`;
    }
    
    if (this.est_en_promotion) {
      description += ` - PROMOTION ${this.pourcentage_reduction}%`;
    }
    
    return description;
  }
}