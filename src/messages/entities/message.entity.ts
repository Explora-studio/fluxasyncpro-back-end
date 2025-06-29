import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from '../../conversations/entities/conversation.entity';

export enum TypeMessage {
  TEXTE = 'texte',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCALISATION = 'localisation',
}

export enum DirectionMessage {
  ENTRANT = 'entrant',
  SORTANT = 'sortant',
}

export enum StatutLivraison {
  ENVOYE = 'envoye',
  LIVRE = 'livre',
  LU = 'lu',
  ECHEC = 'echec',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id_message: number;

  @Column()
  id_conversation: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  identifiant_message_whatsapp?: string;

  @Column({ type: 'text', nullable: true })
  contenu_message?: string;

  @Column({
    type: 'enum',
    enum: TypeMessage,
    default: TypeMessage.TEXTE,
  })
  type_message: TypeMessage;

  @Column({
    type: 'enum',
    enum: DirectionMessage,
  })
  direction_message: DirectionMessage;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nom_expediteur?: string;

  @Column({ type: 'boolean', default: false })
  genere_par_ia: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  score_confiance_ia?: number;

  @Column({
    type: 'enum',
    enum: StatutLivraison,
    default: StatutLivraison.ENVOYE,
  })
  statut_livraison: StatutLivraison;

  @CreateDateColumn()
  date_creation: Date;

  // Champs additionnels pour différents types de messages
  @Column({ type: 'text', nullable: true })
  url_media?: string; // Pour images, audios, vidéos, documents

  @Column({ type: 'varchar', length: 255, nullable: true })
  nom_fichier?: string; // Pour documents

  @Column({ type: 'varchar', length: 100, nullable: true })
  type_mime?: string; // Type de fichier

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number; // Pour localisation

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number; // Pour localisation

  @Column({ type: 'varchar', length: 500, nullable: true })
  adresse_localisation?: string; // Adresse formatée

  @Column({ type: 'text', nullable: true })
  contexte_ia?: string; // Contexte utilisé par l'IA pour générer la réponse

  // Relations
  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'id_conversation' })
  conversation: Conversation;

  // Méthodes utilitaires
  get est_message_entrant(): boolean {
    return this.direction_message === DirectionMessage.ENTRANT;
  }

  get est_message_sortant(): boolean {
    return this.direction_message === DirectionMessage.SORTANT;
  }

  get est_message_media(): boolean {
    return [TypeMessage.IMAGE, TypeMessage.AUDIO, TypeMessage.VIDEO, TypeMessage.DOCUMENT].includes(this.type_message);
  }

  get est_message_localisation(): boolean {
    return this.type_message === TypeMessage.LOCALISATION;
  }

  get est_livre(): boolean {
    return [StatutLivraison.LIVRE, StatutLivraison.LU].includes(this.statut_livraison);
  }

  get contenu_affichage(): string {
    switch (this.type_message) {
      case TypeMessage.IMAGE:
        return '📷 Image';
      case TypeMessage.AUDIO:
        return '🎵 Message vocal';
      case TypeMessage.VIDEO:
        return '🎥 Vidéo';
      case TypeMessage.DOCUMENT:
        return `📄 ${this.nom_fichier || 'Document'}`;
      case TypeMessage.LOCALISATION:
        return `📍 ${this.adresse_localisation || 'Localisation'}`;
      default:
        return this.contenu_message || '';
    }
  }

  // Méthode pour obtenir l'URL complète du média
  get url_media_complete(): string | null {
    if (!this.url_media) return null;
    
    // Si l'URL est déjà complète
    if (this.url_media.startsWith('http')) {
      return this.url_media;
    }
    
    // Sinon, construire l'URL complète (à adapter selon votre stockage)
    return `${process.env.MEDIA_BASE_URL}/${this.url_media}`;
  }

  // Méthode pour marquer comme lu
  marquerCommeLu(): void {
    if (this.statut_livraison === StatutLivraison.LIVRE) {
      this.statut_livraison = StatutLivraison.LU;
    }
  }
}