import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UtilisateurFluxasync } from '../../users/entities/utilisateur-fluxasync.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Entity('comptes_whatsapp')
export class CompteWhatsapp {
  @PrimaryGeneratedColumn()
  id_compte_whatsapp: number;

  @Column()
  id_utilisateur: number;

  @Column({ type: 'varchar', length: 255 })
  identifiant_compte_business: string;

  @Column({ type: 'varchar', length: 255 })
  identifiant_numero_telephone: string;

  @Column({ type: 'varchar', length: 20 })
  numero_telephone_whatsapp: string;

  @Column({ type: 'text' })
  jeton_acces: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url_webhook?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jeton_verification_webhook?: string;

  @Column({ type: 'boolean', default: true })
  compte_actif: boolean;

  @CreateDateColumn()
  date_connexion: Date;

  @UpdateDateColumn()
  derniere_synchronisation: Date;

  // // Relations
  // @OneToOne(() => UtilisateurFluxasync, utilisateur => utilisateur.compte_whatsapp)
  // @JoinColumn({ name: 'id_utilisateur' })
  // utilisateur: UtilisateurFluxasync;

  @OneToMany(() => Conversation, conversation => conversation.compte_whatsapp)
  conversations: Conversation[];

  // Méthodes utilitaires
  get est_connecte(): boolean {
    return this.compte_actif && !!this.jeton_acces;
  }

  get webhook_configure(): boolean {
    return !!this.url_webhook && !!this.jeton_verification_webhook;
  }
}