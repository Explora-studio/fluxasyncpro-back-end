import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'kouadio@gmail.com', description: 'Adresse email de connexion' })
  @IsEmail()
  adresse_email: string;

  @ApiProperty({ example: 'motdepasse123', description: 'Mot de passe' })
  @IsString()
  @Length(1, 255)
  mot_de_passe: string;
}