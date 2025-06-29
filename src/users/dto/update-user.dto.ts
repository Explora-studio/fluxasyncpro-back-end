import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, Length, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlanAbonnement, StatutAbonnement } from '../entities/utilisateur-fluxasync.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'Nouveau secteur d\'activité', description: 'Secteur d\'activité mis à jour', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  secteur_activite?: string;

  @ApiProperty({ example: 'Nouvelle Entreprise SARL', description: 'Nom de l\'entreprise mis à jour', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  nom_entreprise?: string;

  @ApiProperty({ 
    example: PlanAbonnement.PRO, 
    description: 'Plan d\'abonnement mis à jour',
    enum: PlanAbonnement,
    required: false 
  })
  @IsOptional()
  @IsEnum(PlanAbonnement)
  plan_abonnement?: PlanAbonnement;

  @ApiProperty({ 
    example: StatutAbonnement.ACTIF, 
    description: 'Statut de l\'abonnement',
    enum: StatutAbonnement,
    required: false 
  })
  @IsOptional()
  @IsEnum(StatutAbonnement)
  statut_abonnement?: StatutAbonnement;

  @ApiProperty({ example: true, description: 'Statut de vérification du compte', required: false })
  @IsOptional()
  @IsBoolean()
  compte_verifie?: boolean;
}