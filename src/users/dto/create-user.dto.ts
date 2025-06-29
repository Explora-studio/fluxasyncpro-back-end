import { IsEmail, IsString, IsOptional, IsEnum, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlanAbonnement } from '../entities/utilisateur-fluxasync.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Kouadio', description: 'Nom de famille de l\'utilisateur' })
  @IsString()
  @Length(2, 100)
  nom: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom de l\'utilisateur' })
  @IsString()
  @Length(2, 100)
  prenom: string;

  @ApiProperty({ example: 'kouadio@gmail.com', description: 'Adresse email unique' })
  @IsEmail()
  adresse_email: string;

  @ApiProperty({ example: '+225 07 12 34 56 78', description: 'Numéro de téléphone' })
  @IsString()
  @Length(8, 20)
  numero_telephone: string;

  @ApiProperty({ example: 'Côte d\'Ivoire', description: 'Pays de résidence' })
  @IsString()
  @Length(2, 100)
  pays: string;

  @ApiProperty({ example: 'Vente de chaussures', description: 'Secteur d\'activité', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  secteur_activite?: string;

  @ApiProperty({ example: 'Kouadio Chaussures SARL', description: 'Nom de l\'entreprise', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  nom_entreprise?: string;

  @ApiProperty({ 
    example: PlanAbonnement.GRATUIT, 
    description: 'Plan d\'abonnement choisi',
    enum: PlanAbonnement,
    required: false 
  })
  @IsOptional()
  @IsEnum(PlanAbonnement)
  plan_abonnement?: PlanAbonnement;

  @ApiProperty({ example: 'motdepasse123', description: 'Mot de passe sécurisé' })
  @IsString()
  @Length(8, 255)
  mot_de_passe: string;
}