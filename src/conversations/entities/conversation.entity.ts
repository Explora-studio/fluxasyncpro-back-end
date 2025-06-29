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
import { Prospect } from '../../prospects/entities/prospect.entity';
import { CompteWhatsapp } from '../../whatsapp/entities/compte-whatsapp.entity';
import { UtilisateurFluxasync } from 'src/users/entities/utilisateur-fluxasync.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Commande } from 'src/orders/entities/commande.entity';

export enum StatutConversation {
  ACTIVE = 'active',
  EN_PAUSE = 'en_pause',
  TERMINEE = 'terminee',
  ARCHIVEE = 'archivee',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id_conversation: number;

  @Column()
  id_prospect: number;

  @Column()
  id_utilisateur: number;

  @Column()
  id_compte_whatsapp: number;

  @Column({
    type: 'enum',
    enum: StatutConversation,
    default: StatutConversation.ACTIVE,
  })
  statut_conversation: StatutConversation;

  @Column({ type: 'timestamp', nullable: true })
  dernier_message_recu?: Date;

  @Column({ type: 'boolean', default: true })
  ia_activee: boolean;

  @CreateDateColumn()
  date_debut: Date;

  @Column({ type: 'timestamp', nullable: true })
  date_fin?: Date;

  // Relations
  @ManyToOne(() => Prospect, prospect => prospect.conversations)
  @JoinColumn({ name: 'id_prospect' })
  prospect: Prospect;

  // @ManyToOne(() => UtilisateurFluxasync, utilisateur => utilisateur.prospects)
  // @JoinColumn({ name: 'id_utilisateur' })
  // utilisateur: UtilisateurFluxasync;

  @ManyToOne(() => CompteWhatsapp, compteWhatsapp => compteWhatsapp.conversations)
  @JoinColumn({ name: 'id_compte_whatsapp' })
  compte_whatsapp: CompteWhatsapp;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];

  @OneToMany(() => Commande, commande => commande.conversation)
  commandes: Commande[];

  // Méthodes utilitaires
  get est_active(): boolean {
    return this.statut_conversation === StatutConversation.ACTIVE;
  }

  get duree_conversation(): number {
    const fin = this.date_fin || new Date();
    return Math.floor((fin.getTime() - this.date_debut.getTime()) / (1000 * 60)); // en minutes
  }

  get derniere_activite(): Date {
    return this.dernier_message_recu || this.date_debut;
  }

  // Méthode pour déterminer si la conversation est inactive
  get est_inactive(): boolean {
    if (!this.dernier_message_recu) return false;
    
    const maintenant = new Date();
    const diffHeures = (maintenant.getTime() - this.dernier_message_recu.getTime()) / (1000 * 60 * 60);
    
    return diffHeures > 24; // Inactive si pas de message depuis 24h
  }

  // Méthode pour marquer comme terminée
  terminer(): void {
    this.statut_conversation = StatutConversation.TERMINEE;
    this.date_fin = new Date();
    this.ia_activee = false;
  }

  // Méthode pour réactiver
  reactiver(): void {
    this.statut_conversation = StatutConversation.ACTIVE;
    this.date_fin = undefined;
    this.ia_activee = true;
  }
}