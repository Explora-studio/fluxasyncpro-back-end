import { IsEmail, IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  // Hérite de tous les champs de CreateUserDto
}

export class LoginDto {
  @ApiProperty({ example: 'kouadio@gmail.com', description: 'Adresse email de connexion' })
  @IsEmail()
  adresse_email: string;

  @ApiProperty({ example: 'motdepasse123', description: 'Mot de passe' })
  @IsString()
  @Length(1, 255)
  mot_de_passe: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'kouadio@gmail.com', description: 'Adresse email' })
  @IsEmail()
  adresse_email: string;

  @ApiProperty({ example: '123456', description: 'Code OTP à 6 chiffres' })
  @IsString()
  @Length(6, 6)
  otp_code: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'kouadio@gmail.com', description: 'Adresse email' })
  @IsEmail()
  adresse_email: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_jwt_string', description: 'Token de rafraîchissement' })
  @IsString()
  refresh_token: string;
}

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  user: {
    id_utilisateur: number;
    nom_complet: string;
    adresse_email: string;
    plan_abonnement: string;
    compte_verifie: boolean;
    otp_verified: boolean;
  };

  @ApiProperty()
  expires_in: number;
}

export class RegisterResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  user: {
    id_utilisateur: number;
    nom_complet: string;
    adresse_email: string;
  };

  @ApiProperty()
  otp_sent: boolean;
}